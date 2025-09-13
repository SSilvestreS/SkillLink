@echo off
echo Fazendo commit da limpeza completa...
git add -A
git commit -m "refactor: limpeza completa do repositorio aplicando principio KISS - Remover arquivos desnecessarios, criar estrutura profissional, aplicar KISS em tudo"
git push origin main
echo Commit finalizado!
pause
