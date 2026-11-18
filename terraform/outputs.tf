output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "alb_dns_name" {
  description = "Public URL for the Application Load Balancer"
  value       = "http://${aws_lb.main.dns_name}"
}

output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "s3_documents_bucket" {
  description = "Name of the S3 bucket storing legal documents"
  value       = aws_s3_bucket.documents.id
}

output "ecr_backend_url" {
  description = "ECR Repository URL for Backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR Repository URL for Frontend"
  value       = aws_ecr_repository.frontend.repository_url
}
