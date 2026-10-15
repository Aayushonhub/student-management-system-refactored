output "website_url" {
  description = "HTTP endpoint of the deployed static website"
  value       = "http://${aws_s3_bucket_website_configuration.website.website_endpoint}"
}

output "bucket_name" {
  description = "Name of the S3 website bucket"
  value       = aws_s3_bucket.website.id
}

output "aws_region" {
  description = "AWS region used for deployment"
  value       = var.aws_region
}