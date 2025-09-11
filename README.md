#  SkillLink - Plataforma de Gestão de Freelancers e Contratos

Uma plataforma full stack completa para conectar empresas e freelancers, facilitando a gestão de contratos, negociações e entregas.

##  Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js robusto e escalável
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Multer** - Upload de arquivos
- **Class-validator** - Validação de DTOs

### Frontend
- **Flutter** - Framework mobile-first
- **Riverpod** - Gerenciamento de estado
- **HTTP** - Comunicação com API
- **Shared Preferences** - Armazenamento local

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de serviços
- **PostgreSQL** - Banco de dados containerizado

##  Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   NestJS API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │  Files  │            │  Files  │            │  Data   │
    │ Storage │            │ Upload  │            │ Volume  │
    └─────────┘            └─────────┘            └─────────┘
```

##  Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Git

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd projeto
```

### 2. Execute com Docker Compose
```bash
docker-compose up --build
```

### 3. Acesse a aplicação
- **API**: http://localhost:3000
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

### Para Empresas
- ✅ Cadastro e login
- ✅ Busca de freelancers
- ✅ Solicitação de orçamentos
- ✅ Criação de contratos
- ✅ Acompanhamento de entregas
- ✅ Avaliação de freelancers

### Funcionalidades Gerais
- ✅ Sistema de mensagens
- ✅ Histórico de contratos
- ✅ Upload de arquivos
- ✅ Controle de acesso por roles

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
│   │   └── common/         # Utilitários comuns
│   ├── uploads/            # Arquivos enviados
│   └── Dockerfile
├── frontend/               # App Flutter
│   ├── lib/
│   │   ├── core/           # Configurações e utilitários
│   │   ├── features/       # Módulos de funcionalidades
│   │   ├── shared/         # Componentes compartilhados
│   │   └── main.dart
│   └── Dockerfile
├── docker-compose.yml      # Orquestração dos serviços
├── .env.example           # Variáveis de ambiente
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

##  Próximos Passos

- [ ] Implementar notificações em tempo real
- [ ] Adicionar testes automatizados
- [ ] Implementar paginação nas listagens
- [ ] Adicionar filtros avançados de busca
- [ ] Implementar sistema de notificações push

##  Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
