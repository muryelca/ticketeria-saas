# Análise de Requisitos e Planejamento da Arquitetura

## Funcionalidades Observadas (Sympla e Requisitos do Usuário)

Com base na análise inicial da Sympla e nos requisitos fornecidos, as principais funcionalidades a serem implementadas incluem:

*   **Gestão de Eventos:** Criação, edição e publicação de eventos com diferentes tipos de ingressos.
*   **Venda de Ingressos:** Processo de compra online para o público geral.
*   **Gestão de Ingressos Cortesia:** Funcionalidade para envio de ingressos em lote por nome e e-mail.
*   **Gestão de Cupons para Promoters:** Criação e gerenciamento de cupons de desconto associados a promoters.
*   **Painel Administrativo:**
    *   Dashboard com métricas de vendas (valor total, ingressos vendidos, etc.).
    *   Gerenciamento completo de eventos, usuários, ingressos e cupons.
    *   Controle de acesso para diferentes tipos de usuários (admin, organizador, promoter).
*   **Painel do Organizador:** Gerenciamento dos seus próprios eventos, visualização de vendas e relatórios.
*   **Painel do Promoter:** Acompanhamento do uso dos seus cupons e vendas associadas.
*   **Página de Vendas (Frontend):** Interface pública para busca e compra de ingressos.
*   **Processamento de Pagamentos:** Integração com Sqala.tech para Pix e listagem de pagamentos.
*   **Relatórios:** Endpoint para geração de relatórios detalhados de vendas, incluindo uso de cupons por promoter.
*   **Autenticação e Autorização:** Sistema de criação de conta com nome, telefone e CPF, e controle de acesso baseado em papéis (admin, organizador, promoter, público).
*   **Mensageria:** Utilização de RabbitMQ para comunicação assíncrona (ex: envio de e-mails de cortesia).
*   **Banco de Dados:** PostgreSQL para armazenamento de dados.
*   **ORM:** PrismaJs para interação com o banco de dados.
*   **Infraestrutura:** Docker para conteinerização e Terraform para deploy no Google Cloud.

## Arquitetura CQRS

O padrão CQRS (Command Query Responsibility Segregation) será aplicado para separar as operações de escrita (Comandos) das operações de leitura (Consultas). Isso trará benefícios como escalabilidade, flexibilidade e otimização para cada tipo de operação. No backend NestJS, teremos:

*   **Camada de Comandos:** Responsável por receber e processar requisições que alteram o estado da aplicação (ex: criar evento, comprar ingresso, enviar cortesia, criar cupom).
*   **Camada de Consultas:** Responsável por receber e processar requisições que apenas buscam dados (ex: listar eventos, visualizar dashboard, gerar relatório).

Essa separação permitirá o uso de modelos de dados otimizados para escrita e leitura, além de facilitar a futura transição para microserviços, onde cada serviço pode ser responsável por um conjunto específico de Comandos ou Consultas.

## Estrutura de Módulos (Backend - NestJS)

O backend será dividido em módulos, seguindo a estrutura do NestJS e a segregação de responsabilidades do CQRS:

*   **Módulo de Autenticação e Usuários:** Gerencia a criação de contas, login e informações de usuário (nome, telefone, CPF).
*   **Módulo de Eventos:** Gerencia a criação, edição e listagem de eventos.
*   **Módulo de Ingressos:** Gerencia a criação, distribuição (venda e cortesia) e validação de ingressos.
*   **Módulo de Cupons:** Gerencia a criação e aplicação de cupons de desconto, associados a promoters.
*   **Módulo de Vendas:** Orquestra o processo de compra, integrando com o módulo de pagamentos e ingressos.
*   **Módulo de Pagamentos:** Integração com a API da Sqala.tech para processamento de pagamentos (Pix e listagem).
*   **Módulo de Relatórios:** Fornece endpoints para gerar relatórios de vendas e uso de cupons.
*   **Módulo de Dashboard:** Agrega dados para visualização no painel administrativo.
*   **Módulo de Administração:** Contém a lógica para as funcionalidades exclusivas do painel administrativo (gerenciamento geral).
*   **Módulo de Organizador:** Contém a lógica para as funcionalidades do painel do organizador.
*   **Módulo de Promoter:** Contém a lógica para as funcionalidades do painel do promoter.
*   **Módulo de Mensageria:** Integração com RabbitMQ para comunicação assíncrona.

## Estrutura de Módulos (Frontend - NextJS/React)

O frontend será estruturado em páginas e componentes reutilizáveis, utilizando NextJS para renderização do lado do servidor e React com Material UI para a interface do usuário. O design será minimalista, inspirado na Apple. Os principais módulos/páginas incluirão:

*   **Página Inicial:** Listagem de eventos em destaque ou próximos.
*   **Página de Evento:** Detalhes do evento e opções de compra de ingresso.
*   **Página de Login/Cadastro:** Formulários para autenticação e criação de conta.
*   **Painel do Usuário:** Área para visualizar ingressos comprados.
*   **Painel Administrativo:** Interfaces para gerenciar eventos, usuários, ingressos, cupons e visualizar o dashboard e relatórios.
*   **Painel do Organizador:** Interfaces para gerenciar seus eventos e visualizar relatórios.
*   **Painel do Promoter:** Interfaces para gerenciar cupons e visualizar relatórios de uso.
*   **Página de Checkout:** Processo de pagamento integrado com Sqala.

## Tecnologias e Ferramentas

*   **Backend:** NestJS (TypeScript), PrismaJs (ORM), PostgreSQL (Database), RabbitMQ (Mensageria), Sqala.tech (Pagamentos), Google Cloud Email Service (Envio de Email).
*   **Frontend:** NextJS (TypeScript), React, Material UI (Component Library).
*   **Infraestrutura:** Docker, Terraform, Google Cloud Platform.

## Próximos Passos

1.  Detalhar a arquitetura CQRS para cada módulo do backend.
2.  Definir os modelos de dados com PrismaJs.
3.  Configurar o ambiente de desenvolvimento com Docker.
4.  Iniciar o desenvolvimento do backend, focando nos módulos de autenticação e usuários, eventos e ingressos.
5.  Implementar a integração com RabbitMQ e Sqala.
6.  Desenvolver o frontend, começando pelas páginas públicas e autenticação.
7.  Implementar os painéis administrativo, organizador e promoter.
8.  Desenvolver a funcionalidade de relatórios.
9.  Criar os scripts Terraform para deploy no Google Cloud.
10. Escrever a documentação completa do projeto.

