import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

// Configuração global para testes E2E
beforeAll(async () => {
  // Configurar variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USERNAME = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DB_DATABASE = 'skilllink_test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.REDIS_HOST = 'localhost';
  process.env.REDIS_PORT = '6379';
});

afterAll(async () => {
  // Limpeza após todos os testes
  process.env.NODE_ENV = 'development';
});

// Função helper para criar aplicação de teste
export async function createTestApp(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [AppModule],
  }).compile();
}

// Função helper para limpar banco de dados
export async function clearDatabase(dataSource: DataSource) {
  const entities = dataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName}`);
  }
}

// Função helper para criar usuário de teste
export async function createTestUser(app: any, userData: any = {}) {
  const defaultUser = {
    email: 'test@test.com',
    password: 'password123',
    name: 'Test User',
    role: 'freelancer',
    ...userData,
  };

  const response = await app
    .post('/auth/register')
    .send(defaultUser);

  return response.body;
}

// Função helper para fazer login
export async function loginUser(app: any, email: string, password: string) {
  const response = await app
    .post('/auth/login')
    .send({ email, password });

  return response.body.access_token;
}
