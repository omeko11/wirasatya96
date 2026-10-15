@echo off
setlocal enabledelayedexpansion

REM ==============================================================================
REM WIRA SATYA 96 - SCRIPT RESTORE DATABASE DI PC BARU
REM ==============================================================================

echo =======================================================
echo [WS96] RESTORE DATA DATABASE WIRA SATYA 96 KE PC INI
echo =======================================================

set BACKUP_DIR=%~dp0backups
set LATEST_FILE=%BACKUP_DIR%\wirasatya96_terbaru.sql
set SEED_FILE=%BACKUP_DIR%\wirasatya96_initial_seed.sql

if not exist "%LATEST_FILE%" (
    if exist "%SEED_FILE%" (
        echo File 'wirasatya96_terbaru.sql' tidak ditemukan.
        echo Menggunakan file bawaan 'wirasatya96_initial_seed.sql'...
        set TARGET_FILE=%SEED_FILE%
    ) else (
        echo [ERROR] Tidak ada file backup database (.sql) di folder %BACKUP_DIR%!
        pause
        exit /b 1
    )
) else (
    set TARGET_FILE=%LATEST_FILE%
)

echo [1/2] Mengecek container PostgreSQL wirasatya96-postgres...
docker ps | findstr "wirasatya96-postgres" >nul
if errorlevel 1 (
    echo [ERROR] Container database PostgreSQL sedang tidak aktif!
    echo Silakan jalankan 'docker-compose up -d' terlebih dahulu.
    pause
    exit /b 1
)

echo [2/2] Memasukkan data dari %TARGET_FILE% ke database...
docker exec -i wirasatya96-postgres psql -U postgres -d wirasatya96 < "%TARGET_FILE%"

if errorlevel 1 (
    echo [ERROR] Terjadi kendala saat merestore data.
    pause
    exit /b 1
)

echo =======================================================
echo [SUKSES] SELURUH DATA DATABASE BERHASIL DI-RESTORE!
echo =======================================================
echo Buka browser di http://localhost:3000 untuk melihat data.
echo =======================================================
pause
