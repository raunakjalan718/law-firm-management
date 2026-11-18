variable "aws_region" {
  description = "AWS Region to deploy resources into"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "lawfirm-management"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "db_instance_class" {
  description = "RDS instance size class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "lawfirmdb"
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "lawfirm_admin"
}

variable "backend_container_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 8081
}

variable "frontend_container_port" {
  description = "Port exposed by the frontend container"
  type        = number
  default     = 5173
}
