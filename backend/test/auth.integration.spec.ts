import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth Integration (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Limpar dados de teste antes de cada teste
    await dataSource.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@test.com',
          password: 'password123',
          name: 'Test User',
          role: 'freelancer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'test@test.com');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('role', 'freelancer');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should not register user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          role: 'freelancer',
        })
        .expect(400);
    });

    it('should not register user with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@test.com',
          password: '123',
          name: 'Test User',
          role: 'freelancer',
        })
        .expect(400);
    });

    it('should not register user with duplicate email', async () => {
      // Primeiro registro
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          name: 'Test User',
          role: 'freelancer',
        })
        .expect(201);

      // Segundo registro com mesmo email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          name: 'Test User 2',
          role: 'company',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Criar usuário para teste de login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@test.com',
          password: 'password123',
          name: 'Login User',
          role: 'freelancer',
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email', 'login@test.com');
        });
    });

    it('should not login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should not login with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Criar usuário e fazer login
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'profile@test.com',
          password: 'password123',
          name: 'Profile User',
          role: 'freelancer',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile@test.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', 'profile@test.com');
          expect(res.body).toHaveProperty('name', 'Profile User');
          expect(res.body).toHaveProperty('role', 'freelancer');
        });
    });

    it('should not get profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should not get profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
