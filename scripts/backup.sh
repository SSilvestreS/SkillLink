#!/bin/bash

# Script de backup automático para SkillLink
# Uso: ./backup.sh [database|files|all]

set -e

# Configurações
BACKUP_DIR="/backups"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-skilllink}"
DB_USER="${DB_USER:-postgres}"
UPLOADS_DIR="/app/uploads"
LOG_FILE="/var/log/backup.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Função para backup do banco de dados
backup_database() {
    log "Iniciando backup do banco de dados..."
    
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_file="${BACKUP_DIR}/db_backup_${timestamp}.sql"
    
    # Criar backup do banco
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file"; then
        log "Backup do banco criado: $backup_file"
        
        # Comprimir backup
        gzip "$backup_file"
        log "Backup comprimido: ${backup_file}.gz"
        
        # Verificar tamanho do backup
        local size=$(du -h "${backup_file}.gz" | cut -f1)
        log "Tamanho do backup: $size"
        
    else
        error "Falha ao criar backup do banco de dados"
        return 1
    fi
}

# Função para backup de arquivos
backup_files() {
    log "Iniciando backup de arquivos..."
    
    local timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_file="${BACKUP_DIR}/files_backup_${timestamp}.tar.gz"
    
    # Verificar se diretório de uploads existe
    if [ ! -d "$UPLOADS_DIR" ]; then
        warn "Diretório de uploads não encontrado: $UPLOADS_DIR"
        return 0
    fi
    
    # Criar backup dos arquivos
    if tar -czf "$backup_file" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"; then
        log "Backup de arquivos criado: $backup_file"
        
        # Verificar tamanho do backup
        local size=$(du -h "$backup_file" | cut -f1)
        log "Tamanho do backup: $size"
        
    else
        error "Falha ao criar backup de arquivos"
        return 1
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos..."
    
    # Manter backups dos últimos 30 dias
    local days_to_keep=30
    
    # Limpar backups de banco antigos
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$days_to_keep -delete 2>/dev/null || true
    
    # Limpar backups de arquivos antigos
    find "$BACKUP_DIR" -name "files_backup_*.tar.gz" -mtime +$days_to_keep -delete 2>/dev/null || true
    
    log "Limpeza de backups antigos concluída"
}

# Função para verificar espaço em disco
check_disk_space() {
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=1048576 # 1GB em KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        error "Espaço insuficiente em disco para backup"
        return 1
    fi
    
    log "Espaço em disco disponível: $(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}')"
}

# Função para enviar notificação (opcional)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Aqui você pode adicionar integração com Slack, Discord, email, etc.
    # Exemplo com webhook do Slack:
    # if [ -n "$SLACK_WEBHOOK_URL" ]; then
    #     curl -X POST -H 'Content-type: application/json' \
    #          --data "{\"text\":\"Backup $status: $message\"}" \
    #          "$SLACK_WEBHOOK_URL"
    # fi
    
    log "Notificação: $status - $message"
}

# Função principal
main() {
    local backup_type="${1:-all}"
    
    log "=== Iniciando processo de backup ==="
    log "Tipo de backup: $backup_type"
    
    # Verificar se diretório de backup existe
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Diretório de backup não encontrado: $BACKUP_DIR"
        exit 1
    fi
    
    # Verificar espaço em disco
    if ! check_disk_space; then
        exit 1
    fi
    
    local success=true
    
    # Executar backup baseado no tipo
    case "$backup_type" in
        "database")
            if ! backup_database; then
                success=false
            fi
            ;;
        "files")
            if ! backup_files; then
                success=false
            fi
            ;;
        "all")
            if ! backup_database; then
                success=false
            fi
            if ! backup_files; then
                success=false
            fi
            ;;
        *)
            error "Tipo de backup inválido: $backup_type"
            error "Use: database, files ou all"
            exit 1
            ;;
    esac
    
    # Limpeza de backups antigos
    cleanup_old_backups
    
    # Enviar notificação
    if [ "$success" = true ]; then
        log "=== Backup concluído com sucesso ==="
        send_notification "SUCCESS" "Backup $backup_type concluído com sucesso"
    else
        error "=== Backup concluído com erros ==="
        send_notification "ERROR" "Backup $backup_type concluído com erros"
        exit 1
    fi
}

# Executar função principal
main "$@"
