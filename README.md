# SkillLink Platform

> Professional freelancer management platform built with NestJS and Flutter

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd skilllink

# Start services
docker-compose up -d

# Install backend dependencies
cd backend
npm install

# Run development server
npm run start:dev
```

### Production Deployment

```bash
# Build and deploy
docker-compose up -d --build
```

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript
- **Frontend**: Flutter
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker

## 📝 API Documentation

API documentation is available at `/api/docs` when running the development server.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run start:dev` - Start development server
- `npm run build` - Build application
- `npm test` - Run tests
- `npm run lint` - Run linting

## 🔒 Security

See [SECURITY.md](SECURITY.md) for security guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.