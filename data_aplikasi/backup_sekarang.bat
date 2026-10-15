@echo off
setlocal enabledelayedexpansion

REM ==============================================================================
REM WIRA SATYA 96 - SCRIPT BACKUP DATABASE OTOMATIS
REM ==============================================================================

echo =======================================================
echo [WS96] MEMULAI PROSES BACKUP DATABASE WIRA SATYA 96...
echo =======================================================

REM Ambil timestamp tanggal dan jam sekarang
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

set BACKUP_DIR=%~dp0backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set BACKUP_FILE=%BACKUP_DIR%\wirasatya96_backup_%TIMESTAMP%.sql
set LATEST_FILE=%BACKUP_DIR%\wirasatya96_terbaru.sql

echo [1/3] Mengecek container PostgreSQL wirasatya96-postgres...
docker ps | findstr "wirasatya96-postgres" >nul
if errorlevel 1 (
    echo [ERROR] Container database PostgreSQL sedang tidak aktif!
    echo Silakan jalankan 'docker-compose up -d' terlebih dahulu.
    pause
    exit /b 1
)

echo [2/3] Mengekspor database ke file SQL...
docker exec -t wirasatya96-postgres pg_dump -U postgres wirasatya96 > "%BACKUP_FILE%"

if errorlevel 1 (
    echo [ERROR] Gagal mengekspor database.
    pause
    exit /b 1
)

echo [3/3] Memperbarui file backup terbaru (wirasatya96_terbaru.sql)...
copy /y "%BACKUP_FILE%" "%LATEST_FILE%" >nul

echo =======================================================
echo [SUKSES] DATABASE BERHASIL DI-BACKUP!
echo =======================================================
echo Lokasi File Backup:
echo -> %BACKUP_FILE%
echo -> %LATEST_FILE%
echo.
echo Kalau mau pindah PC, cukup copy file 'wirasatya96_terbaru.sql' 
echo dan folder 'data_aplikasi/minio' ke PC baru!
echo =======================================================
pause
