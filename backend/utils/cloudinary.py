import cloudinary
import cloudinary.uploader
import os
import logging

logger = logging.getLogger(__name__)

cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key = os.getenv("CLOUDINARY_API_KEY"),
  api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

def upload_file(file, folder):
  try:
    result = cloudinary.uploader.upload(file, folder=folder)
    logger.info(f"Cloudinary upload successful: {result.get('secure_url')}")
    return result
  except Exception as e:
    logger.error(f"Cloudinary upload failed: {e}")
    raise