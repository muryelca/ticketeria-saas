# Guia de Desenvolvimento - Ticketeria

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** e **Docker Compose** ([Download](https://docs.docker.com/get-docker/))
- **Git** ([Download](https://git-scm.com/))
- **Visual Studio Code** (recomendado) ([Download](https://code.visualstudio.com/))

### Extensões Recomendadas para VS Code

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.docker",
    "hashicorp.terraform"
  ]
}
```

### Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/ticketeria-saas.git
cd ticketeria-saas
```

### Configuração Inicial

#### 1. Configurar Infraestrutura Local

```bash
# Inicializar serviços de infraestrutura
./scripts/dev-setup.sh
```

Este script irá:
- Inicializar PostgreSQL na porta 5432
- Inicializar RabbitMQ na porta 5672 (Management: 15672)
- Inicializar Redis na porta 6379

#### 2. Configurar Backend

```bash
cd backend/ticketeria-api

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

**Configuração do .env:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticketeria?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="1d"

# RabbitMQ
RABBITMQ_URL="amqp://admin:admin@localhost:5672"

# Redis
REDIS_URL="redis://localhost:6379"

# Sqala API
SQALA_API_KEY="your-sqala-api-key"
SQALA_API_URL="https://api.sqala.tech"

# Email (opcional para desenvolvimento)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Environment
NODE_ENV="development"
PORT="3001"
```

#### 3. Configurar Banco de Dados

```bash
# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Seed do banco com dados de teste
npx prisma db seed
```

#### 4. Iniciar Backend

```bash
# Modo desenvolvimento (hot reload)
npm run start:dev

# Ou modo debug
npm run start:debug
```

#### 5. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Editar variáveis de ambiente
nano .env.local
```

**Configuração do .env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Ticketeria
NEXT_PUBLIC_APP_DESCRIPTION=Sistema de venda de ingressos para eventos
```

#### 6. Iniciar Frontend

```bash
# Modo desenvolvimento
npm run dev
```

### Acessando a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **Prisma Studio**: `npx prisma studio` (http://localhost:5555)

## Estrutura do Projeto

```
ticketeria-saas/
├── backend/
│   └── ticketeria-api/
│       ├── src/
│       │   ├── auth/              # Módulo de autenticação
│       │   ├── users/             # Módulo de usuários
│       │   ├── events/            # Módulo de eventos
│       │   ├── tickets/           # Módulo de ingressos
│       │   ├── orders/            # Módulo de pedidos
│       │   ├── payments/          # Módulo de pagamentos
│       │   ├── promoter-codes/    # Módulo de códigos promocionais
│       │   ├── reports/           # Módulo de relatórios
│       │   ├── dashboard/         # Módulo de dashboard
│       │   ├── messaging/         # Módulo de mensageria
│       │   ├── common/            # Utilitários e CQRS
│       │   └── prisma/            # Configuração do Prisma
│       ├── prisma/
│       │   ├── schema.prisma      # Schema do banco
│       │   └── migrations/        # Migrações
│       └── test/                  # Testes
├── frontend/
│   ├── src/
│   │   ├── app/                   # App Router (Next.js 14)
│   │   ├── components/            # Componentes React
│   │   ├── contexts/              # Contextos React
│   │   ├── hooks/                 # Custom hooks
│   │   ├── services/              # Serviços de API
│   │   ├── types/                 # Tipos TypeScript
│   │   └── utils/                 # Utilitários
│   └── public/                    # Arquivos estáticos
├── terraform/                     # Infraestrutura como código
├── scripts/                       # Scripts de automação
├── docs/                          # Documentação
└── docker-compose.yml             # Orquestração Docker
```

## Padrões de Desenvolvimento

### Backend (NestJS)

#### Estrutura de Módulos

Cada módulo segue a estrutura:

```
module-name/
├── dto/                    # Data Transfer Objects
├── entities/              # Entidades do Prisma
├── commands/              # CQRS Commands
├── queries/               # CQRS Queries
├── events/                # Domain Events
├── handlers/              # Command/Query/Event Handlers
├── module-name.controller.ts
├── module-name.service.ts
└── module-name.module.ts
```

#### Exemplo de Controller

```typescript
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  async findAll(@Query() query: GetEventsDto) {
    return this.queryBus.execute(new GetEventsQuery(query));
  }

  @Post()
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createEventDto: CreateEventDto, @User() user) {
    return this.commandBus.execute(
      new CreateEventCommand(createEventDto, user.id)
    );
  }
}
```

#### Exemplo de Service

```typescript
@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: EventFilters): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: this.buildWhereClause(filters),
      include: {
        organizer: true,
        ticketTypes: true
      },
      orderBy: { startDate: 'asc' }
    });
  }

  private buildWhereClause(filters: EventFilters) {
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    
    return where;
  }
}
```

#### Exemplo de CQRS Command

```typescript
// Command
export class CreateEventCommand {
  constructor(
    public readonly eventData: CreateEventDto,
    public readonly organizerId: string
  ) {}
}

// Handler
@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const event = await this.prisma.event.create({
      data: {
        ...command.eventData,
        organizerId: command.organizerId
      }
    });

    // Publicar evento de domínio
    this.eventBus.publish(new EventCreatedEvent(event));

    return event;
  }
}
```

### Frontend (Next.js + React)

#### Estrutura de Componentes

```typescript
// components/EventCard.tsx
interface EventCardProps {
  event: Event;
  onSelect?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  return (
    <Card>
      <CardMedia image={event.bannerUrl} />
      <CardContent>
        <Typography variant="h6">{event.title}</Typography>
        <Typography variant="body2">{event.description}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => onSelect?.(event)}>
          Ver Detalhes
        </Button>
      </CardActions>
    </Card>
  );
};
```

#### Custom Hooks

```typescript
// hooks/useEvents.ts
export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEvents(filters);
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  return { events, loading, error, refetch: fetchEvents };
};
```

#### Contextos

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Implementação...

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Testes

### Backend - Testes Unitários

```typescript
// events.service.spec.ts
describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ]
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create an event', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      startDate: new Date()
    };

    const expectedEvent = { id: '1', ...eventData };
    jest.spyOn(prisma.event, 'create').mockResolvedValue(expectedEvent);

    const result = await service.create(eventData);
    expect(result).toEqual(expectedEvent);
  });
});
```

### Backend - Testes de Integração

```typescript
// events.controller.e2e-spec.ts
describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  it('/events (GET)', () => {
    return request(app.getHttpServer())
      .get('/events')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/events (POST)', () => {
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      startDate: new Date().toISOString()
    };

    return request(app.getHttpServer())
      .post('/events')
      .send(eventData)
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe(eventData.title);
      });
  });
});
```

### Frontend - Testes com Jest e Testing Library

```typescript
// components/EventCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from './EventCard';

const mockEvent = {
  id: '1',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  startDate: '2024-12-25T20:00:00Z',
  status: 'PUBLISHED'
};

describe('EventCard', () => {
  it('renders event information', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
  });

  it('calls onSelect when button is clicked', () => {
    const onSelect = jest.fn();
    render(<EventCard event={mockEvent} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByText('Ver Detalhes'));
    expect(onSelect).toHaveBeenCalledWith(mockEvent);
  });
});
```

## Debugging

### Backend Debugging

#### VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/ticketeria-api/src/main.ts",
      "outFiles": ["${workspaceFolder}/backend/ticketeria-api/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### Logs Estruturados

```typescript
// Usar o logger do NestJS
this.logger.log('Event created', {
  eventId: event.id,
  organizerId: event.organizerId,
  title: event.title
});

this.logger.error('Failed to create event', {
  error: error.message,
  stack: error.stack,
  eventData
});
```

### Frontend Debugging

#### React Developer Tools

Instale a extensão React Developer Tools no seu navegador para inspecionar componentes e estado.

#### Debug com Console

```typescript
// Usar console.log estrategicamente
useEffect(() => {
  console.log('Events updated:', events);
}, [events]);

// Usar debugger
const handleSubmit = (data) => {
  debugger; // Pausa execução aqui
  onSubmit(data);
};
```

## Performance

### Backend Optimizations

#### Database Queries

```typescript
// ❌ N+1 Problem
const events = await prisma.event.findMany();
for (const event of events) {
  event.organizer = await prisma.user.findUnique({
    where: { id: event.organizerId }
  });
}

// ✅ Include relacionamentos
const events = await prisma.event.findMany({
  include: {
    organizer: true,
    ticketTypes: true
  }
});
```

#### Caching

```typescript
@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  async findById(id: string): Promise<Event> {
    // Tentar cache primeiro
    const cached = await this.redis.get(`event:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar no banco
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { organizer: true, ticketTypes: true }
    });

    // Cachear resultado
    await this.redis.setex(`event:${id}`, 3600, JSON.stringify(event));

    return event;
  }
}
```

### Frontend Optimizations

#### Lazy Loading

```typescript
// Lazy load de componentes
const EventDetails = lazy(() => import('./EventDetails'));

// Lazy load de rotas
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
```

#### Memoização

```typescript
// useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return events.reduce((total, event) => total + event.price, 0);
}, [events]);

// useCallback para funções
const handleEventSelect = useCallback((event: Event) => {
  onEventSelect(event);
}, [onEventSelect]);

// React.memo para componentes
export const EventCard = React.memo<EventCardProps>(({ event }) => {
  return <Card>...</Card>;
});
```

## Convenções de Código

### Nomenclatura

- **Variáveis e funções**: camelCase
- **Classes e interfaces**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Arquivos**: kebab-case
- **Componentes React**: PascalCase

### Estrutura de Commits

```
type(scope): description

feat(auth): add JWT refresh token functionality
fix(payments): resolve PIX payment confirmation issue
docs(api): update authentication endpoints documentation
refactor(events): extract event validation logic
test(orders): add unit tests for order service
```

### ESLint e Prettier

```json
// .eslintrc.js
module.exports = {
  extends: [
    '@nestjs/eslint-config',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
```

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80
}
```

## Scripts Úteis

### Backend

```bash
# Desenvolvimento
npm run start:dev          # Iniciar com hot reload
npm run start:debug        # Iniciar com debug
npm run build              # Build para produção
npm run start:prod         # Iniciar produção

# Banco de dados
npx prisma migrate dev     # Executar migrações
npx prisma generate        # Gerar cliente
npx prisma studio          # Interface visual
npx prisma db seed         # Executar seeds

# Testes
npm run test               # Testes unitários
npm run test:e2e           # Testes de integração
npm run test:cov           # Coverage

# Linting
npm run lint               # Verificar código
npm run lint:fix           # Corrigir automaticamente
```

### Frontend

```bash
# Desenvolvimento
npm run dev                # Iniciar desenvolvimento
npm run build              # Build para produção
npm run start              # Iniciar produção
npm run lint               # Verificar código

# Testes
npm run test               # Testes unitários
npm run test:watch         # Testes em watch mode
npm run test:coverage      # Coverage

# Análise
npm run analyze            # Analisar bundle
```

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.dev.yml ps

# Reiniciar serviços
docker-compose -f docker-compose.dev.yml restart postgres
```

#### 2. Erro de Migração Prisma

```bash
# Reset do banco (CUIDADO: apaga dados)
npx prisma migrate reset

# Aplicar migrações manualmente
npx prisma db push
```

#### 3. Erro de Dependências

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 4. Erro de CORS

Verificar configuração no backend:

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
});
```

### Logs e Monitoramento

#### Verificar Logs do Backend

```bash
# Logs em tempo real
docker-compose logs -f backend

# Logs específicos
docker-compose logs backend | grep ERROR
```

#### Verificar Performance

```bash
# Monitorar recursos
docker stats

# Verificar conexões do banco
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## Contribuição

### Fluxo de Desenvolvimento

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** seguindo os padrões
5. **Teste** suas alterações
6. **Commit** com mensagens descritivas
7. **Push** para seu fork
8. **Abra** um Pull Request

### Code Review

Antes de abrir um PR, certifique-se de:

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passam (unitários e integração)
- [ ] Documentação foi atualizada
- [ ] Não há conflitos com a branch main
- [ ] Performance não foi degradada

### Configuração de Hooks

```bash
# Instalar husky para git hooks
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Configurar commit-msg
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

Este guia deve cobrir a maioria das situações de desenvolvimento. Para dúvidas específicas, consulte a documentação dos frameworks utilizados ou abra uma issue no repositório.

