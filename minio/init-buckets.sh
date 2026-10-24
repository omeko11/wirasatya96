#!/bin/sh
# ==============================================================================
# WIRA SATYA 96 - MINIO OBJECT STORAGE BUCKET INITIALIZER
# Automatically creates required buckets and applies appropriate access policies.
# ==============================================================================

echo "Menghubungkan ke MinIO S3 Server..."
/usr/bin/mc alias set myminio http://minio:9000 "${MINIO_ACCESS_KEY:-minioadmin}" "${MINIO_SECRET_KEY:-change_me_minio_password}"

echo "Membuat bucket-bucket penyimpanan Wira Satya 96..."
/usr/bin/mc mb --ignore-existing myminio/wirasatya-avatars
/usr/bin/mc mb --ignore-existing myminio/wirasatya-posts
/usr/bin/mc mb --ignore-existing myminio/wirasatya-documents

echo "Mengatur kebijakan akses..."
# Avatars dan posting media bersifat download publik agar avatar perwira tampil instan
/usr/bin/mc anonymous set download myminio/wirasatya-avatars
/usr/bin/mc anonymous set download myminio/wirasatya-posts

# Dokumen dinas / TR dan bukti transfer kas bersifat privat (hanya via presigned URL)
/usr/bin/mc anonymous set none myminio/wirasatya-documents

echo "Inisialisasi MinIO S3 selesai. Status bucket:"
/usr/bin/mc ls myminio/
