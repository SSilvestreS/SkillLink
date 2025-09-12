# SkillLink API Documentation

## Visão Geral

A API do SkillLink é uma API RESTful construída com NestJS que fornece endpoints para gerenciamento de freelancers, contratos, pagamentos e notificações em tempo real.

## Base URL

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://api.skilllink.com`

## Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization`:

```
Authorization: Bearer <seu-token-jwt>
```

## Rate Limiting

A API implementa rate limiting para proteger contra abuso:

- **API Geral**: 1000 requests/15min (usuários autenticados), 100 requests/15min (anônimos)
- **Login**: 5 tentativas/15min por IP
- **Registro**: 3 registros/hora por IP
- **Upload**: 50 uploads/hora (usuários autenticados), 10 uploads/hora (anônimos)
- **Pagamentos**: 20 pagamentos/hora por usuário

## Endpoints

### Autenticação

#### POST /auth/register
Registrar novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nome do Usuário",
  "role": "freelancer" | "company"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "role": "freelancer",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### POST /auth/login
Fazer login.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "role": "freelancer"
  }
}
```

#### GET /auth/profile
Obter perfil do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "role": "freelancer",
  "profile": {
    "bio": "Descrição do usuário",
    "skills": ["React", "Node.js"],
    "hourlyRate": 50
  }
}
```

### Usuários

#### GET /users
Listar usuários (com paginação e filtros).

**Query Parameters:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `role`: Filtrar por role (freelancer, company)
- `search`: Buscar por nome ou email

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "user@example.com",
      "role": "freelancer",
      "profile": {
        "bio": "Descrição",
        "skills": ["React", "Node.js"],
        "hourlyRate": 50
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /users/:id
Obter usuário específico.

**Response:**
```json
{
  "id": "uuid",
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "role": "freelancer",
  "profile": {
    "bio": "Descrição",
    "skills": ["React", "Node.js"],
    "hourlyRate": 50,
    "portfolio": [
      {
        "id": "uuid",
        "title": "Projeto Exemplo",
        "description": "Descrição do projeto",
        "imageUrl": "https://example.com/image.jpg"
      }
    ]
  }
}
```

### Serviços

#### GET /services
Listar serviços (com filtros).

**Query Parameters:**
- `page`: Número da página
- `limit`: Itens por página
- `category`: Categoria do serviço
- `minPrice`: Preço mínimo
- `maxPrice`: Preço máximo
- `search`: Buscar por título ou descrição

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Desenvolvimento Web",
      "description": "Crio sites responsivos e modernos",
      "category": "Web Development",
      "price": 100,
      "deliveryTime": 7,
      "freelancer": {
        "id": "uuid",
        "name": "Nome do Freelancer",
        "rating": 4.8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /services
Criar novo serviço.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Desenvolvimento Web",
  "description": "Crio sites responsivos e modernos",
  "category": "Web Development",
  "price": 100,
  "deliveryTime": 7,
  "tags": ["React", "Node.js", "MongoDB"]
}
```

#### GET /services/:id
Obter serviço específico.

#### PUT /services/:id
Atualizar serviço.

#### DELETE /services/:id
Deletar serviço.

### Contratos

#### GET /contracts
Listar contratos do usuário.

**Query Parameters:**
- `status`: Filtrar por status (pending, active, completed, cancelled)
- `page`: Número da página
- `limit`: Itens por página

#### POST /contracts
Criar novo contrato.

**Body:**
```json
{
  "serviceId": "uuid",
  "freelancerId": "uuid",
  "description": "Descrição do projeto",
  "budget": 1000,
  "deliveryDate": "2025-02-01T00:00:00.000Z",
  "terms": "Termos e condições do contrato"
}
```

#### GET /contracts/:id
Obter contrato específico.

#### PUT /contracts/:id/status
Atualizar status do contrato.

**Body:**
```json
{
  "status": "accepted" | "rejected" | "in_progress" | "completed" | "cancelled"
}
```

### Pagamentos

#### POST /payments/create-intent
Criar payment intent (Stripe).

**Body:**
```json
{
  "contractId": "uuid",
  "amount": 1000,
  "currency": "BRL",
  "method": "card" | "pix"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST /payments/webhook
Webhook do Stripe (não usar diretamente).

#### GET /payments
Listar pagamentos do usuário.

#### GET /payments/:id
Obter pagamento específico.

### Notificações

#### GET /notifications
Listar notificações do usuário.

**Query Parameters:**
- `page`: Número da página
- `limit`: Itens por página
- `unread`: Filtrar apenas não lidas

#### PUT /notifications/:id/read
Marcar notificação como lida.

#### GET /notifications/unread-count
Obter contagem de notificações não lidas.

### Arquivos

#### POST /upload
Upload de arquivo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body:**
```
file: <arquivo>
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "arquivo.pdf",
  "originalName": "documento.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "url": "https://api.skilllink.com/uploads/arquivo.pdf"
}
```

### Health Check

#### GET /health
Verificar saúde do sistema.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600000,
  "version": "1.4.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "message": "Database connection is healthy"
    },
    "redis": {
      "status": "ok",
      "message": "Redis connection is healthy"
    },
    "memory": {
      "status": "ok",
      "message": "Memory usage: 150MB / 512MB (29.3%)"
    }
  }
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autenticado
- `403` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: email já existe)
- `429` - Rate limit excedido
- `500` - Erro interno do servidor

## Tratamento de Erros

A API retorna erros em formato JSON:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    "Email deve ser um endereço válido",
    "Senha deve ter pelo menos 8 caracteres"
  ]
}
```

## WebSocket (Notificações em Tempo Real)

Conecte-se ao WebSocket para receber notificações em tempo real:

```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'seu-jwt-token'
  }
});

socket.on('notification', (notification) => {
  console.log('Nova notificação:', notification);
});
```

## Exemplos de Uso

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': 'Bearer seu-jwt-token'
  }
});

// Listar serviços
const services = await api.get('/services?page=1&limit=10');

// Criar contrato
const contract = await api.post('/contracts', {
  serviceId: 'uuid',
  freelancerId: 'uuid',
  description: 'Projeto de website',
  budget: 2000,
  deliveryDate: '2025-02-01T00:00:00.000Z'
});
```

### Python

```python
import requests

headers = {
    'Authorization': 'Bearer seu-jwt-token'
}

# Listar usuários
response = requests.get(
    'http://localhost:3000/users',
    headers=headers,
    params={'page': 1, 'limit': 10}
)

users = response.json()
```

### cURL

```bash
# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Listar serviços
curl -X GET http://localhost:3000/services \
  -H "Authorization: Bearer seu-jwt-token"
```

## Changelog

### v1.4.0 (2025-01-01)
- Adicionado sistema de pagamentos com Stripe
- Implementado notificações em tempo real
- Adicionado rate limiting
- Implementado sistema de cache com Redis
- Adicionado health checks
- Melhorado sistema de logging

### v1.3.0 (2024-12-15)
- Adicionado sistema de mensagens
- Implementado upload de arquivos
- Adicionado sistema de avaliações

### v1.2.0 (2024-12-01)
- Implementado sistema de contratos
- Adicionado gerenciamento de serviços
- Melhorado sistema de autenticação

### v1.1.0 (2024-11-15)
- Implementado sistema de usuários
- Adicionado autenticação JWT
- Criado sistema de perfis

### v1.0.0 (2024-11-01)
- Lançamento inicial da API
- Sistema básico de autenticação
- Estrutura inicial do projeto
