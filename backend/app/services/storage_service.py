import os

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import settings

# Suppress SSL warnings when skipping verification
if settings.minio_skip_ssl_verify:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    os.environ["PYTHONHTTPSVERIFY"] = "0"


_logged = False


def get_s3_client():
    global _logged
    scheme = "https" if settings.minio_use_ssl else "http"
    verify = False if settings.minio_skip_ssl_verify else True
    endpoint = f"{scheme}://{settings.minio_endpoint}"

    if not _logged:
        print(f"[MinIO] Endpoint: {endpoint}")
        print(f"[MinIO] Bucket: {settings.minio_bucket}")
        print(f"[MinIO] SSL: {settings.minio_use_ssl}, Skip verify: {settings.minio_skip_ssl_verify}")
        try:
            client = boto3.client(
                "s3",
                endpoint_url=endpoint,
                aws_access_key_id=settings.minio_access_key,
                aws_secret_access_key=settings.minio_secret_key,
                verify=verify,
                config=Config(
                    signature_version="s3v4",
                    retries={"max_attempts": 3, "mode": "standard"},
                ),
            )
            client.list_buckets()
            print("[MinIO] ✓ Connected successfully")
        except Exception as e:
            print(f"[MinIO] ✗ Connection failed: {e}")
        _logged = True

    return boto3.client(
        "s3",
        endpoint_url=f"{scheme}://{settings.minio_endpoint}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        verify=verify,
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        ),
    )


_bucket_verified = False


def ensure_bucket(client=None):
    """Create the bucket if it doesn't exist."""
    global _bucket_verified
    if _bucket_verified:
        return

    client = client or get_s3_client()
    try:
        # Try listing objects as a lighter check than head_bucket
        client.list_objects_v2(Bucket=settings.minio_bucket, MaxKeys=1)
        _bucket_verified = True
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        if error_code in ("NoSuchBucket",):
            try:
                client.create_bucket(Bucket=settings.minio_bucket)
                print(f"[MinIO] Created bucket: {settings.minio_bucket}")
                _bucket_verified = True
            except ClientError as ce:
                print(f"[MinIO] Failed to create bucket: {ce}")
        else:
            # Assume bucket exists (might be permissions issue)
            print(f"[MinIO] Bucket check returned {error_code}, proceeding anyway")
            _bucket_verified = True


def upload_file(
    file_bytes: bytes, object_key: str, content_type: str
) -> None:
    client = get_s3_client()
    ensure_bucket(client)
    client.put_object(
        Bucket=settings.minio_bucket,
        Key=object_key,
        Body=file_bytes,
        ContentType=content_type,
    )


def generate_download_url(object_key: str, expires_in: int = 3600) -> str:
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.minio_bucket, "Key": object_key},
        ExpiresIn=expires_in,
    )


def delete_file(object_key: str) -> None:
    client = get_s3_client()
    client.delete_object(Bucket=settings.minio_bucket, Key=object_key)
