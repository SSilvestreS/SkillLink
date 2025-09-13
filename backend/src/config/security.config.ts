import { ConfigService } from '@nestjs/config';

export const securityConfig = (configService: ConfigService) => ({
  // JWT Configuration
  jwt: {
    secret: configService.get('JWT_SECRET', 'default-secret-change-in-production'),
    expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
    issuer: configService.get('JWT_ISSUER', 'skilllink'),
    audience: configService.get('JWT_AUDIENCE', 'skilllink-users'),
  },

  // Password Configuration
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },

  // CORS Configuration
  cors: {
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },

  // Security Headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'",
  },

  // File Upload Security
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadPath: configService.get('UPLOAD_PATH', './uploads'),
  },

  // Database Security
  database: {
    ssl: configService.get('NODE_ENV') === 'production',
    logging: configService.get('NODE_ENV') === 'development',
    synchronize: configService.get('NODE_ENV') === 'development',
  },

  // Redis Security
  redis: {
    password: configService.get('REDIS_PASSWORD'),
    tls: configService.get('NODE_ENV') === 'production',
  },
});
