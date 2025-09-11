#  SkillLink - Plataforma de Gestão de Freelancers e Contratos

Uma plataforma full stack completa para conectar empresas e freelancers, facilitando a gestão de contratos, negociações, entregas e pagamentos. Sistema profissional com notificações em tempo real e múltiplos métodos de pagamento.

##  Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js robusto e escalável
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Multer** - Upload de arquivos
- **Class-validator** - Validação de DTOs
- **Stripe** - Sistema de pagamentos
- **Socket.io** - Notificações em tempo real
- **Swagger** - Documentação da API

### Frontend
- **Flutter** - Framework mobile-first
- **Riverpod** - Gerenciamento de estado
- **HTTP** - Comunicação com API
- **Shared Preferences** - Armazenamento local
- **GoRouter** - Navegação avançada
- **Socket.io Client** - Notificações em tempo real
- **PWA** - Progressive Web App

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de serviços
- **PostgreSQL** - Banco de dados containerizado
- **Nginx** - Servidor web para Flutter

##  Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   NestJS API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   PWA + Mobile  │    │   + Stripe      │    │   + Notifications│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │  Files  │            │  Files  │            │  Data   │
    │ Storage │            │ Upload  │            │ Volume  │
    └─────────┘            └─────────┘            └─────────┘
         │                       │
         │                       │
    ┌─────────┐            ┌─────────┐
    │ Socket  │            │ Stripe  │
    │  Real-  │            │Payment  │
    │  time   │            │ Gateway │
    └─────────┘            └─────────┘
```

##  Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/SSilvestreS/SkillLink.git
cd SkillLink
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skilllink

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=7d

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_sua_chave_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
```

### 3. Execute com Docker Compose
```bash
docker-compose up --build
```

### 4. Acesse a aplicação
- **API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api
- **Flutter Web**: http://localhost:8080 (após build)
- **PostgreSQL**: localhost:5432

##  Funcionalidades

### Para Freelancers
- ✅ Cadastro e login
- ✅ Criação de perfil profissional
- ✅ Cadastro de serviços
- ✅ Visualização de propostas
- ✅ Negociação de contratos
- ✅ Upload de entregas
- ✅ Avaliação de empresas
- ✅ Recebimento de pagamentos
- ✅ Notificações em tempo real
- ✅ Estatísticas financeiras

### Para Empresas
- ✅ Cadastro e login
- ✅ Busca de freelancers
- ✅ Solicitação de orçamentos
- ✅ Criação de contratos
- ✅ Acompanhamento de entregas
- ✅ Avaliação de freelancers
- ✅ Pagamento de contratos
- ✅ Notificações em tempo real
- ✅ Controle financeiro

### Funcionalidades Gerais
- ✅ Sistema de mensagens
- ✅ Histórico de contratos
- ✅ Upload de arquivos
- ✅ Controle de acesso por roles
- ✅ Notificações em tempo real (WebSocket)
- ✅ Sistema de pagamentos completo
- ✅ Múltiplos métodos de pagamento
- ✅ PWA (Progressive Web App)
- ✅ Documentação da API (Swagger)

##  Estrutura do Projeto

```
projeto/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── services/       # Módulo de serviços
│   │   ├── contracts/      # Módulo de contratos
│   │   ├── messages/       # Módulo de mensagens
│   │   ├── files/          # Módulo de arquivos
│   │   ├── reviews/        # Módulo de avaliações
│   │   ├── notifications/  # Módulo de notificações
│   │   ├── payments/       # Módulo de pagamentos
│   │   └── common/         # Utilitários comuns
│   ├── uploads/            # Arquivos enviados
│   └── Dockerfile
├── frontend/               # App Flutter
│   ├── lib/
│   │   ├── core/           # Configurações e utilitários
│   │   ├── features/       # Módulos de funcionalidades
│   │   │   ├── auth/       # Autenticação
│   │   │   ├── home/       # Página inicial
│   │   │   ├── profile/    # Perfil do usuário
│   │   │   ├── services/   # Serviços
│   │   │   ├── contracts/  # Contratos
│   │   │   ├── messages/   # Mensagens
│   │   │   ├── notifications/ # Notificações
│   │   │   └── payments/   # Pagamentos
│   │   └── main.dart
│   ├── web/                # Configurações PWA
│   └── Dockerfile
├── docker-compose.yml      # Orquestração dos serviços
├── .env.example           # Variáveis de ambiente
├── ROADMAP.md             # Roadmap de desenvolvimento
├── LICENSE                # Licença MIT
└── README.md              # Este arquivo
```

##  Sistema de Autenticação

### Roles de Usuário
- **ADMIN**: Acesso total ao sistema
- **FREELANCER**: Pode criar serviços e negociar contratos
- **COMPANY**: Pode contratar freelancers e criar contratos

### Fluxo de Autenticação
1. Usuário faz login/registro
2. Backend valida credenciais
3. JWT é gerado com role do usuário
4. Token é armazenado no Flutter
5. Requisições incluem token no header Authorization

##  Modelo de Dados

### Principais Entidades
- **User**: Dados básicos e autenticação
- **Profile**: Perfil detalhado (freelancer/empresa)
- **Service**: Serviços oferecidos por freelancers
- **Contract**: Contratos entre empresas e freelancers
- **Message**: Mensagens do chat
- **Review**: Avaliações mútuas
- **File**: Arquivos enviados
- **Notification**: Notificações em tempo real
- **Payment**: Pagamentos e transações financeiras

##  Sistema de Pagamentos

### Métodos de Pagamento Suportados
- 📱 **PIX (Stripe)** - Integração oficial com Stripe
- 📱 **PIX Direto** - Geração de código QR nativo
- 💳 **Cartão de Crédito** - Via Stripe
- 🏦 **Transferência Bancária**
- ₿ **Bitcoin** - Criptomoeda
- Ξ **Ethereum** - Criptomoeda

### Funcionalidades de Pagamento
- ✅ **Cálculo automático** de taxas da plataforma (5%)
- ✅ **Confirmação automática** de pagamentos
- ✅ **Histórico completo** de transações
- ✅ **Estatísticas financeiras** em tempo real
- ✅ **Notificações** de pagamentos recebidos
- ✅ **Suporte a reembolsos** e estornos
- ✅ **Integração com Stripe** para segurança

### Status de Pagamento
- ⏳ **Pendente** - Aguardando processamento
- ⏳ **Processando** - Em andamento
- ✅ **Concluído** - Pagamento confirmado
- ❌ **Falhou** - Erro no processamento
- 🚫 **Cancelado** - Cancelado pelo usuário
- 🔄 **Reembolsado** - Valor devolvido

##  Configuração Docker

### Serviços
- **api**: Backend NestJS (porta 3000)
- **db**: PostgreSQL (porta 5432)
- **app**: Flutter Web (porta 8080)

### Volumes
- **postgres_data**: Dados do PostgreSQL
- **uploads**: Arquivos enviados pelos usuários

##  Desenvolvimento

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
flutter pub get
flutter run -d chrome
```

##  Status do Projeto

### ✅ Implementado (v1.4.0)
- [x] **MVP Completo** - Sistema básico de freelancers
- [x] **Notificações em Tempo Real** - WebSocket + Socket.io
- [x] **Sistema de Pagamentos** - Stripe + PIX + Criptomoedas
- [x] **PWA** - Progressive Web App
- [x] **Documentação da API** - Swagger

### 🚧 Em Desenvolvimento
- [ ] **Mobile Nativo** - App Android/iOS
- [ ] **Notificações Push** - Firebase Cloud Messaging
- [ ] **Câmera Integrada** - Upload de fotos
- [ ] **Geolocalização** - Freelancers próximos

### 📋 Próximos Passos
- [ ] **IA e Automação** - Chatbot + Matching automático
- [ ] **Analytics** - Business Intelligence
- [ ] **Segurança Avançada** - 2FA + Biometria
- [ ] **Internacionalização** - Multi-idiomas
- [ ] **Testes Automatizados** - E2E + Unit Tests

##  Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
