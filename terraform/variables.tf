variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Germany North"
}

variable "azure_owner" {
  description = "Owner/creator of Azure resources for tagging"
  type        = string
  default     = "aatmmr"
}

variable "app_service_sku" {
  description = "App Service Plan SKU"
  type        = string
  default     = "B1"
}

variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "aatmmr/repo-crafter"
}

variable "container_tag" {
  description = "Container tag to deploy"
  type        = string
  default     = "latest"
}

variable "require_auth" {
  description = "Require API authentication"
  type        = string
  default     = "true"
}

variable "create_setup_issue" {
  description = "Create setup issue in new repositories"
  type        = string
  default     = "true"
}

# Sensitive variables (passed via environment or GitHub secrets)
variable "github_app_id" {
  description = "GitHub App ID"
  type        = string
  sensitive   = true
}

variable "github_private_key" {
  description = "GitHub App Private Key"
  type        = string
  sensitive   = true
}

variable "github_webhook_secret" {
  description = "GitHub Webhook Secret"
  type        = string
  sensitive   = true
}

variable "github_client_id" {
  description = "GitHub Client ID"
  type        = string
  sensitive   = true
}

variable "github_client_secret" {
  description = "GitHub Client Secret"
  type        = string
  sensitive   = true
}

variable "repo_crafter_api_key" {
  description = "API key for repo crafter endpoints"
  type        = string
  sensitive   = true
}
