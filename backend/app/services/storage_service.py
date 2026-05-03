import boto3
from botocore.exceptions import ClientError

from app.config import settings


def get_s3_client():
    scheme = "https" if settings.minio_use_ssl else "http"
    return boto3.client(
        "s3",
        endpoint_url=f"{scheme}://{settings.minio_endpoint}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
    )


def ensure_bucket(client=None):
    """Create the bucket if it doesn't exist."""
    client = client or get_s3_client()
    try:
        client.head_bucket(Bucket=settings.minio_bucket)
    except ClientError:
        client.create_bucket(Bucket=settings.minio_bucket)


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
