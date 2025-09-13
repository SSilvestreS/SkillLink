# Política de Segurança - SkillLink

## Relatório de Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança, por favor, **NÃO** abra um issue público. Em vez disso, envie um email para [sauloxl31@gmail.com] com os detalhes.

## Configuração de Segurança

### Variáveis de Ambiente Obrigatórias

Certifique-se de definir as seguintes variáveis de ambiente em produção:

```bash
# JWT - OBRIGATÓRIO: Use uma chave forte e única
JWT_SECRET=your-very-strong-random-secret-key-here

# Database - OBRIGATÓRIO: Use senhas fortes
DB_PASSWORD=your-strong-database-password

# CORS - OBRIGATÓRIO: Especifique origens permitidas
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

### Configurações de Segurança Implementadas

1. **Validação de JWT Secret**: O sistema falha se `JWT_SECRET` não estiver definido
2. **CORS Restritivo**: Apenas origens específicas são permitidas
3. **Rate Limiting**: Proteção contra ataques de força bruta
4. **Validação de Senhas**: Políticas de senha forte obrigatórias
5. **Headers de Segurança**: Headers HTTP de segurança configurados
6. **Validação de Upload**: Tipos de arquivo e tamanho limitados

### Checklist de Segurança para Produção

- [ ] Alterar todas as senhas padrão
- [ ] Definir `JWT_SECRET` forte e único
- [ ] Configurar `CORS_ORIGIN` com domínios específicos
- [ ] Usar HTTPS em produção
- [ ] Configurar firewall adequado
- [ ] Implementar monitoramento de segurança
- [ ] Fazer backup regular dos dados
- [ ] Manter dependências atualizadas

### Dependências de Segurança

Execute regularmente:
```bash
npm audit
npm audit fix
```

### Contato

Para questões de segurança, entre em contato através de:
- Email: [sauloxl31@gmail.com]
- GitHub: [SSilvestreS]

## Histórico de Vulnerabilidades

### v1.0.0 - 2025-09-13
- Corrigido: Senhas hardcoded em docker-compose.yml
- Corrigido: JWT secret padrão inseguro
- Corrigido: CORS configurado para aceitar qualquer origem
- Adicionado: Validação obrigatória de variáveis de ambiente
- Adicionado: Headers de segurança HTTP
