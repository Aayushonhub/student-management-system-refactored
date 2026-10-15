# Identify the AWS account used by Terraform.
data "aws_caller_identity" "current" {}

# Create an S3 bucket for the static website.
resource "aws_s3_bucket" "website" {
  bucket        = var.bucket_name
  force_destroy = false

  tags = {
    Project     = "Student Management System"
    Environment = "DevSecOps CIAP"
    ManagedBy   = "Terraform"
  }
}

# Configure S3 static website hosting.
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }
}

# Configure bucket-level public access settings.
# Public website hosting requires public reads.
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

# Allow visitors to read website objects.
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  depends_on = [
    aws_s3_bucket_public_access_block.website
  ]

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid       = "PublicReadWebsiteFiles"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })
}

# Upload only the website's HTML, CSS and JavaScript.
locals {
  website_files = setunion(
    fileset(path.module, "index.html"),
    fileset(path.module, "style.css"),
    fileset(path.module, "js/*.js")
  )
}

resource "aws_s3_object" "website_files" {
  for_each = local.website_files

  bucket = aws_s3_bucket.website.id
  key    = each.value
  source = "${path.module}/${each.value}"
  etag   = filemd5("${path.module}/${each.value}")

  content_type = (
    endswith(each.value, ".html") ? "text/html" :
    endswith(each.value, ".css") ? "text/css" :
    "application/javascript"
  )
}