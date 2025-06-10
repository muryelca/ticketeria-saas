# Configuração de Pagamentos - Sqala.tech Integration

## Visão Geral

O sistema Ticketeria utiliza a API da Sqala.tech como gateway de pagamentos, oferecendo suporte completo aos principais métodos de pagamento do Brasil. A integração foi desenvolvida seguindo as melhores práticas de segurança e experiência do usuário.

## Métodos de Pagamento Suportados

### 1. PIX
- **PIX Não Identificado**: Sem necessidade de CPF/CNPJ
- **PIX Identificado**: Com validação de CPF/CNPJ
- **PIX Restrito**: Apenas um CPF específico pode pagar
- **PIX com Split**: Divisão automática entre beneficiários

### 2. Cartão de Crédito
- **À Vista**: Pagamento em uma parcela
- **Parcelado**: Até 12x sem juros (configurável)
- **Bandeiras**: Visa, Mastercard, Elo, Amex, Hipercard

### 3. Boleto Bancário
- **Vencimento**: Configurável (padrão 3 dias)
- **Juros e Multa**: Configuráveis
- **Desconto**: Para pagamento antecipado

### 4. Transferência Bancária (TED)
- **Bancos**: Principais bancos brasileiros
- **Confirmação**: Automática via API

### 5. ITP (Open Finance)
- **Débito em Conta**: Via Open Banking
- **Bancos Participantes**: Conforme regulamentação

## Configuração da API Sqala

### Credenciais

```env
# .env
SQALA_API_KEY=your-api-key-here
SQALA_API_URL=https://api.sqala.tech
SQALA_WEBHOOK_SECRET=your-webhook-secret
```

### Configuração no Backend

```typescript
// src/payments/sqala.service.ts
@Injectable()
export class SqualaService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly httpService: HttpService;

  constructor() {
    this.apiKey = process.env.SQALA_API_KEY;
    this.apiUrl = process.env.SQALA_API_URL;
    this.httpService = new HttpService();
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}
```

## Implementação dos Métodos de Pagamento

### PIX

#### PIX Não Identificado

```typescript
async createPixPayment(data: CreatePixPaymentDto): Promise<PixPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    expires_in: 3600, // 1 hora
    callback_url: `${process.env.API_URL}/webhooks/payment-confirmation`
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/pix/deposits`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    pixCode: response.data.pix_code,
    qrCode: response.data.qr_code,
    expiresAt: response.data.expires_at,
    status: response.data.status
  };
}
```

#### PIX Identificado

```typescript
async createIdentifiedPixPayment(data: CreateIdentifiedPixDto): Promise<PixPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    customer: {
      name: data.customerName,
      document: data.customerDocument,
      email: data.customerEmail
    },
    expires_in: 3600
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/pix/deposits/identified`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return this.mapPixResponse(response.data);
}
```

#### PIX Restrito por CPF

```typescript
async createRestrictedPixPayment(data: CreateRestrictedPixDto): Promise<PixPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    allowed_document: data.allowedDocument,
    expires_in: 3600
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/pix/deposits/restricted`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return this.mapPixResponse(response.data);
}
```

#### PIX com Split

```typescript
async createPixWithSplit(data: CreatePixSplitDto): Promise<PixPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    split_rules: data.splitRules.map(rule => ({
      recipient_id: rule.recipientId,
      amount: rule.amount,
      percentage: rule.percentage
    })),
    expires_in: 3600
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/pix/deposits/split`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return this.mapPixResponse(response.data);
}
```

### Cartão de Crédito

#### Pagamento à Vista

```typescript
async createCreditCardPayment(data: CreateCreditCardDto): Promise<CreditCardPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    installments: 1,
    card: {
      number: data.card.number,
      holder_name: data.card.holderName,
      expiry_month: data.card.expiryMonth,
      expiry_year: data.card.expiryYear,
      cvv: data.card.cvv
    },
    customer: {
      name: data.customer.name,
      document: data.customer.document,
      email: data.customer.email,
      phone: data.customer.phone
    },
    billing_address: data.billingAddress
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/credit-card/charges`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    status: response.data.status,
    authorizationCode: response.data.authorization_code,
    transactionId: response.data.transaction_id
  };
}
```

#### Pagamento Parcelado

```typescript
async createInstallmentPayment(data: CreateInstallmentDto): Promise<CreditCardPaymentResponse> {
  const payload = {
    ...data,
    installments: data.installments,
    installment_fee: data.installmentFee || 0
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/credit-card/charges/installments`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return this.mapCreditCardResponse(response.data);
}
```

### Boleto Bancário

```typescript
async createBoletoPayment(data: CreateBoletoDto): Promise<BoletoPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    due_date: data.dueDate,
    customer: {
      name: data.customer.name,
      document: data.customer.document,
      email: data.customer.email,
      address: data.customer.address
    },
    fine: {
      days: data.fine?.days || 1,
      percentage: data.fine?.percentage || 2
    },
    interest: {
      percentage: data.interest?.percentage || 1
    }
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/boleto/charges`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    barcodeNumber: response.data.barcode_number,
    digitableLine: response.data.digitable_line,
    boletoUrl: response.data.boleto_url,
    dueDate: response.data.due_date,
    status: response.data.status
  };
}
```

### Transferência Bancária

```typescript
async createBankTransferPayment(data: CreateBankTransferDto): Promise<BankTransferResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    bank_code: data.bankCode,
    customer: data.customer
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/bank-transfer/deposits`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    bankCode: response.data.bank_code,
    bankName: response.data.bank_name,
    accountNumber: response.data.account_number,
    agency: response.data.agency,
    status: response.data.status
  };
}
```

### ITP (Open Finance)

```typescript
async createITPPayment(data: CreateITPDto): Promise<ITPPaymentResponse> {
  const payload = {
    amount: data.amount,
    description: data.description,
    external_id: data.orderId,
    customer: data.customer,
    redirect_url: data.redirectUrl
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/itp/deposits`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    authorizationUrl: response.data.authorization_url,
    status: response.data.status
  };
}
```

## Webhooks

### Configuração do Endpoint

```typescript
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment-confirmation')
  async handlePaymentConfirmation(
    @Body() payload: any,
    @Headers('x-sqala-signature') signature: string
  ) {
    // Verificar assinatura
    if (!this.verifySignature(payload, signature)) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Processar confirmação
    await this.paymentsService.handlePaymentConfirmation(payload);

    return { status: 'ok' };
  }

  private verifySignature(payload: any, signature: string): boolean {
    const secret = process.env.SQALA_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }
}
```

### Processamento de Confirmações

```typescript
async handlePaymentConfirmation(payload: WebhookPayload): Promise<void> {
  const { event, data } = payload;

  switch (event) {
    case 'payment.confirmed':
      await this.confirmPayment(data);
      break;
    case 'payment.failed':
      await this.failPayment(data);
      break;
    case 'payment.refunded':
      await this.refundPayment(data);
      break;
    default:
      this.logger.warn(`Unknown webhook event: ${event}`);
  }
}

private async confirmPayment(data: PaymentData): Promise<void> {
  const order = await this.ordersService.findByExternalId(data.external_id);
  
  if (!order) {
    this.logger.error(`Order not found: ${data.external_id}`);
    return;
  }

  // Atualizar status do pedido
  await this.ordersService.updateStatus(order.id, OrderStatus.PAID);

  // Gerar ingressos
  await this.ticketsService.generateTickets(order.id);

  // Enviar confirmação por email
  await this.emailService.sendPaymentConfirmation(order);

  // Publicar evento
  this.eventBus.publish(new PaymentConfirmedEvent(order));
}
```

## Consulta de Status

### Verificar Status de Pagamento

```typescript
async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const response = await this.httpService.get(
    `${this.apiUrl}/payments/${paymentId}`,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    status: response.data.status,
    amount: response.data.amount,
    paidAt: response.data.paid_at,
    method: response.data.method
  };
}
```

### Listar Pagamentos

```typescript
async listPayments(filters: PaymentFilters): Promise<PaymentList> {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  if (filters.method) params.append('method', filters.method);

  const response = await this.httpService.get(
    `${this.apiUrl}/payments?${params.toString()}`,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
}
```

## Refunds (Estornos)

### Estorno Total

```typescript
async refundPayment(paymentId: string, reason?: string): Promise<RefundResponse> {
  const payload = {
    reason: reason || 'Solicitação do cliente'
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/payments/${paymentId}/refund`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return {
    id: response.data.id,
    status: response.data.status,
    refundedAmount: response.data.refunded_amount,
    refundedAt: response.data.refunded_at
  };
}
```

### Estorno Parcial

```typescript
async partialRefund(
  paymentId: string, 
  amount: number, 
  reason?: string
): Promise<RefundResponse> {
  const payload = {
    amount,
    reason: reason || 'Estorno parcial'
  };

  const response = await this.httpService.post(
    `${this.apiUrl}/payments/${paymentId}/refund/partial`,
    payload,
    { headers: this.getHeaders() }
  ).toPromise();

  return this.mapRefundResponse(response.data);
}
```

## Frontend Integration

### Componente de Pagamento PIX

```typescript
// components/PaymentPix.tsx
export const PaymentPix: React.FC<PaymentPixProps> = ({ order, onSuccess }) => {
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePix = async () => {
    setLoading(true);
    try {
      const response = await paymentService.createPixPayment({
        orderId: order.id,
        amount: order.totalAmount,
        description: `Ingressos - ${order.event.title}`
      });
      setPixData(response);
    } catch (error) {
      toast.error('Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Pagamento via PIX</Typography>
        
        {!pixData ? (
          <Button 
            onClick={generatePix} 
            loading={loading}
            fullWidth
          >
            Gerar PIX
          </Button>
        ) : (
          <Box>
            <QRCodeDisplay value={pixData.pixCode} />
            <TextField
              label="Código PIX"
              value={pixData.pixCode}
              fullWidth
              InputProps={{
                endAdornment: (
                  <CopyButton text={pixData.pixCode} />
                )
              }}
            />
            <Typography variant="body2" color="textSecondary">
              Expira em: {formatDate(pixData.expiresAt)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
```

### Componente de Cartão de Crédito

```typescript
// components/PaymentCreditCard.tsx
export const PaymentCreditCard: React.FC<PaymentCreditCardProps> = ({ 
  order, 
  onSuccess 
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreditCardFormData) => {
    setLoading(true);
    try {
      const response = await paymentService.createCreditCardPayment({
        orderId: order.id,
        amount: order.totalAmount,
        installments: data.installments,
        card: {
          number: data.cardNumber.replace(/\s/g, ''),
          holderName: data.holderName,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          cvv: data.cvv
        },
        customer: {
          name: data.customerName,
          document: data.customerDocument,
          email: data.customerEmail
        }
      });

      if (response.status === 'approved') {
        onSuccess(response);
      } else {
        toast.error('Pagamento não aprovado');
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="cardNumber"
                control={control}
                rules={{ required: 'Número do cartão é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número do Cartão"
                    fullWidth
                    inputProps={{ maxLength: 19 }}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={8}>
              <Controller
                name="holderName"
                control={control}
                rules={{ required: 'Nome do titular é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Titular"
                    fullWidth
                    error={!!errors.holderName}
                    helperText={errors.holderName?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={4}>
              <Controller
                name="cvv"
                control={control}
                rules={{ required: 'CVV é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CVV"
                    fullWidth
                    inputProps={{ maxLength: 4 }}
                    error={!!errors.cvv}
                    helperText={errors.cvv?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
              >
                Pagar R$ {order.totalAmount.toFixed(2)}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
```

## Monitoramento e Logs

### Logs de Pagamento

```typescript
@Injectable()
export class PaymentLogger {
  private readonly logger = new Logger(PaymentLogger.name);

  logPaymentAttempt(data: PaymentAttemptData): void {
    this.logger.log({
      action: 'payment.attempt',
      orderId: data.orderId,
      method: data.method,
      amount: data.amount,
      timestamp: new Date().toISOString()
    });
  }

  logPaymentSuccess(data: PaymentSuccessData): void {
    this.logger.log({
      action: 'payment.success',
      orderId: data.orderId,
      paymentId: data.paymentId,
      method: data.method,
      amount: data.amount,
      timestamp: new Date().toISOString()
    });
  }

  logPaymentFailure(data: PaymentFailureData): void {
    this.logger.error({
      action: 'payment.failure',
      orderId: data.orderId,
      method: data.method,
      error: data.error,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Métricas de Pagamento

```typescript
@Injectable()
export class PaymentMetrics {
  constructor(private readonly metricsService: MetricsService) {}

  recordPaymentAttempt(method: string): void {
    this.metricsService.increment('payment.attempts', {
      method
    });
  }

  recordPaymentSuccess(method: string, amount: number): void {
    this.metricsService.increment('payment.success', { method });
    this.metricsService.histogram('payment.amount', amount, { method });
  }

  recordPaymentFailure(method: string, reason: string): void {
    this.metricsService.increment('payment.failures', {
      method,
      reason
    });
  }
}
```

## Testes

### Testes Unitários

```typescript
describe('SqualaService', () => {
  let service: SqualaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqualaService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<SqualaService>(SqualaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should create PIX payment', async () => {
    const mockResponse = {
      data: {
        id: 'pix_123',
        pix_code: '00020126...',
        qr_code: 'data:image/png...',
        status: 'pending'
      }
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const result = await service.createPixPayment({
      orderId: 'order_123',
      amount: 100,
      description: 'Test payment'
    });

    expect(result.id).toBe('pix_123');
    expect(result.status).toBe('pending');
  });
});
```

### Testes de Integração

```typescript
describe('Payments Integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should process PIX payment end-to-end', async () => {
    // Criar pedido
    const order = await request(app.getHttpServer())
      .post('/orders')
      .send({
        items: [{ ticketTypeId: 'ticket_123', quantity: 1 }]
      })
      .expect(201);

    // Processar pagamento PIX
    const payment = await request(app.getHttpServer())
      .post('/payments/pix')
      .send({
        orderId: order.body.id,
        amount: order.body.totalAmount
      })
      .expect(201);

    expect(payment.body.pixCode).toBeDefined();
    expect(payment.body.qrCode).toBeDefined();
  });
});
```

## Ambiente de Sandbox

### Configuração para Testes

```env
# .env.test
SQALA_API_KEY=test_key_here
SQALA_API_URL=https://sandbox.sqala.tech
SQALA_WEBHOOK_SECRET=test_webhook_secret
```

### Dados de Teste

```typescript
// test/fixtures/payment-data.ts
export const testCreditCard = {
  number: '4111111111111111', // Visa de teste
  holderName: 'TESTE APROVADO',
  expiryMonth: '12',
  expiryYear: '2025',
  cvv: '123'
};

export const testCustomer = {
  name: 'João da Silva',
  document: '12345678901',
  email: 'joao@teste.com',
  phone: '+5511999999999'
};
```

## Segurança

### Validação de Dados

```typescript
// dto/create-payment.dto.ts
export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  @Max(999999.99)
  amount: number;

  @IsString()
  @MaxLength(255)
  description: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
```

### Sanitização

```typescript
private sanitizeCardData(card: CreditCardData): CreditCardData {
  return {
    ...card,
    number: card.number.replace(/\D/g, ''),
    holderName: card.holderName.toUpperCase().trim(),
    cvv: card.cvv.replace(/\D/g, '')
  };
}
```

### Rate Limiting

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 tentativas por minuto
@Post('payments/credit-card')
async createCreditCardPayment(@Body() data: CreateCreditCardDto) {
  return this.paymentsService.createCreditCardPayment(data);
}
```

Esta documentação cobre todos os aspectos da integração com a Sqala.tech, desde a configuração básica até implementações avançadas de segurança e monitoramento. Para dúvidas específicas sobre a API da Sqala, consulte a [documentação oficial](https://sqala.readme.io/reference/getting-started-with-your-api).

