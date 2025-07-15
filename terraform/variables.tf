variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Germany West Central"
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

# Variable to control whether to use existing resource group
variable "use_existing_rg" {
  description = "Whether to use an existing resource group"
  type        = bool
  default     = true
}

# Data source for existing resource group
data "azurerm_resource_group" "existing" {
  count = var.use_existing_rg ? 1 : 0
  name  = "rg-repo-crafter-${var.environment}"
}

# Create resource group only if not using existing one
resource "azurerm_resource_group" "repo_crafter" {
  count    = var.use_existing_rg ? 0 : 1
  name     = "rg-repo-crafter-${var.environment}"
  location = var.location
  
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      tags["CreatedDate"],
      tags["LastModified"]
    ]
  }
  
  tags = {
    Environment = var.environment
    Project     = "repo-crafter"
    ManagedBy   = var.azure_owner
  }
}

# Local values to reference the correct resource group
locals {
  resource_group_name = var.use_existing_rg ? data.azurerm_resource_group.existing[0].name : azurerm_resource_group.repo_crafter[0].name
  resource_group_location = var.use_existing_rg ? data.azurerm_resource_group.existing[0].location : azurerm_resource_group.repo_crafter[0].location
}
