// Global test setup - KISS approach
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock Redis - Simple and effective
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    flushall: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
    on: jest.fn(),
    once: jest.fn(),
    connected: true,
    status: 'ready',
  }));
});

// Mock TypeORM DataSource - Simple and effective
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  DataSource: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue([{ result: 1 }]),
    options: { type: 'postgres' },
  })),
}));

// Global setup
beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});