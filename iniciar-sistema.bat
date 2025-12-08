@echo off
TITLE Batiendo con Amor - Sistema
COLOR F5
CLS

ECHO ==========================================
ECHO    BATIENDO CON AMOR - INICIANDO SISTEMA
ECHO ==========================================
ECHO.

:: 1. Verificar si MySQL esta corriendo (Opcional, asume que ya lo tienes como servicio)
:: Si no, aqui podrias poner el comando para iniciar MySQL.

:: 2. Iniciar Backend (Spring Boot) en segundo plano
ECHO [1/3] Iniciando Servidor Backend...
CD backend
:: El 'start /B' ejecuta en la misma ventana o fondo. Usamos una ventana minimizada para evitar desorden.
START "Backend SpringBoot" /MIN java -jar target/backend-0.0.1-SNAPSHOT.jar
CD ..

:: Esperar unos segundos para que el backend arranque antes del front
ECHO Esperando que el servidor cargue...
TIMEOUT /T 10 /NOBREAK > NUL

:: 3. Iniciar Frontend (Next.js)
ECHO [2/3] Iniciando Interfaz Frontend...
CD frontend
:: 'npm start' corre la version productiva construida en el paso anterior
START "Frontend NextJS" /MIN npm start
CD ..

:: 4. Abrir el navegador automaticamente
ECHO [3/3] Abriendo navegador...
TIMEOUT /T 5 /NOBREAK > NUL
START http://localhost:3000

ECHO.
ECHO ==========================================
ECHO    SISTEMA CORRIENDO EXITOSAMENTE
ECHO ==========================================
ECHO.
ECHO Para cerrar el sistema, cierra las ventanas minimizadas de Java y Node.
PAUSE