const fs = require('fs');
const path = require('path');

// Função para corrigir problemas comuns de ESLint
function fixEslintIssues() {
  const srcDir = path.join(__dirname, 'src');
  
  // Lista de correções a serem aplicadas
  const fixes = [
    {
      file: 'src/files/files.service.ts',
      search: "import { extname } from 'path';",
      replace: "// import { extname } from 'path'; // Removido - não utilizado"
    },
    {
      file: 'src/notifications/notifications.controller.ts',
      search: "import { Controller, Get, Post, Body } from '@nestjs/common';",
      replace: "import { Controller, Get } from '@nestjs/common';"
    },
    {
      file: 'src/notifications/notifications.gateway.ts',
      search: "import { UseGuards } from '@nestjs/common';",
      replace: "// import { UseGuards } from '@nestjs/common'; // Removido - não utilizado"
    },
    {
      file: 'src/notifications/notifications.gateway.ts',
      search: "import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';",
      replace: "// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Removido - não utilizado"
    },
    {
      file: 'src/payments/payments.controller.ts',
      search: "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';",
      replace: "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';"
    },
    {
      file: 'src/users/users.controller.ts',
      search: "import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request } from '@nestjs/common';",
      replace: "import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';"
    },
    {
      file: 'src/core/guards/validation.guard.ts',
      search: "  private getValidationClass(obj: any, type: any): any {",
      replace: "  private getValidationClass(_obj: any, _type: any): any {"
    },
    {
      file: 'src/core/guards/validation.guard.ts',
      search: "    const validationMap = new Map();",
      replace: "    // const validationMap = new Map(); // Removido - não utilizado"
    },
    {
      file: 'src/core/health/health.service.ts',
      search: "    const stats = await fs.promises.stat('/');",
      replace: "    // const stats = await fs.promises.stat('/'); // Removido - não utilizado"
    },
    {
      file: 'src/core/interceptors/logging.interceptor.ts',
      search: "    const userAgent = request.headers['user-agent'] || 'unknown';",
      replace: "    // const userAgent = request.headers['user-agent'] || 'unknown'; // Removido - não utilizado"
    },
    {
      file: 'src/core/interceptors/rate-limit.interceptor.ts',
      search: "    const method = request.method;",
      replace: "    // const method = request.method; // Removido - não utilizado"
    },
    {
      file: 'src/core/rate-limit/rate-limit.service.spec.ts',
      search: "    const now = Date.now();",
      replace: "    // const now = Date.now(); // Removido - não utilizado"
    },
    {
      file: 'src/notifications/notifications.gateway.ts',
      search: "  async sendToUser(userId: string, message: any, excludeUserId?: string) {",
      replace: "  async sendToUser(userId: string, message: any, _excludeUserId?: string) {"
    },
    {
      file: 'test/setup.ts',
      search: "import { TypeOrmModule } from '@nestjs/typeorm';",
      replace: "// import { TypeOrmModule } from '@nestjs/typeorm'; // Removido - não utilizado"
    },
    {
      file: 'test/auth.integration.spec.ts',
      search: "import { Test, TestingModule } from '@nestjs/testing';",
      replace: "// import { Test, TestingModule } from '@nestjs/testing'; // Removido - não utilizado"
    },
    {
      file: 'test/auth.integration.spec.ts',
      search: "    const usersService = module.get<UsersService>(UsersService);",
      replace: "    // const usersService = module.get<UsersService>(UsersService); // Removido - não utilizado"
    }
  ];

  fixes.forEach(fix => {
    const filePath = path.join(__dirname, fix.file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${fix.file}`);
      }
    }
  });
}

fixEslintIssues();
console.log('ESLint fixes applied!');
