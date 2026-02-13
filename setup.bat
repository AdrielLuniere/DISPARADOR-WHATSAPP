@echo off
echo [SETUP] Instalando dependencias...
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo [SETUP] Gerando Client do Prisma...
call npx prisma generate
if %errorlevel% neq 0 exit /b %errorlevel%

echo [SETUP] Tentando subir Docker (docker compose)...
docker compose up -d
if %errorlevel% neq 0 (
    echo [SETUP] docker compose falhou, tentando docker-compose...
    docker-compose up -d
)

echo [SETUP] Concluido! Agora rode: npm run start:api
pause
