@echo off
REM ==============================================================================
REM WIRA SATYA 96 - MINIO LOCAL BUCKET SETUP SCRIPT (WINDOWS)
REM ==============================================================================

echo [WS96-STORAGE] Menghubungkan client MinIO ke localhost:9000...
if "%MINIO_ACCESS_KEY%"=="" set MINIO_ACCESS_KEY=minioadmin
if "%MINIO_SECRET_KEY%"=="" set MINIO_SECRET_KEY=change_me_minio_password
mc alias set localminio http://localhost:9000 %MINIO_ACCESS_KEY% %MINIO_SECRET_KEY%

echo [WS96-STORAGE] Membuat bucket penyimpanan...
mc mb --ignore-existing localminio/wirasatya-avatars
mc mb --ignore-existing localminio/wirasatya-posts
mc mb --ignore-existing localminio/wirasatya-documents

echo [WS96-STORAGE] Mengatur kebijakan akses bucket...
mc anonymous set download localminio/wirasatya-avatars
mc anonymous set download localminio/wirasatya-posts
mc anonymous set none localminio/wirasatya-documents

echo [WS96-STORAGE] Inisialisasi MinIO berhasil!
mc ls localminio/
pause
