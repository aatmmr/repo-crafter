# Terraform configuration for web app deployment only
# Infrastructure (RG and ASP) are created by create-azure.yml workflow

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Data sources for existing infrastructure
data "azurerm_resource_group" "repo_crafter" {
  name = "rg-repo-crafter-${var.environment}"
}

data "azurerm_service_plan" "repo_crafter" {
  name                = "asp-repo-crafter-${var.environment}"
  resource_group_name = data.azurerm_resource_group.repo_crafter.name
}

# Random string for unique web app naming
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Azure Web App (Container) - This is what Terraform manages
resource "azurerm_linux_web_app" "repo_crafter" {
  name                = "app-repo-crafter-${var.environment}-${random_string.suffix.result}"
  resource_group_name = data.azurerm_resource_group.repo_crafter.name
  location            = data.azurerm_resource_group.repo_crafter.location
  service_plan_id     = data.azurerm_service_plan.repo_crafter.id
  
  site_config {
    always_on = var.environment == "production" ? true : false
    
    application_stack {
      docker_image     = "ghcr.io/${var.github_repository}"
      docker_image_tag = var.container_tag
    }
  }
  
  app_settings = {
    # Probot Configuration
    APP_ID           = var.github_app_id
    PRIVATE_KEY      = var.github_private_key
    WEBHOOK_SECRET   = var.github_webhook_secret
    GITHUB_CLIENT_ID = var.github_client_id
    GITHUB_CLIENT_SECRET = var.github_client_secret
    
    # Repo Crafter Configuration
    REPO_CRAFTER_API_KEY            = var.repo_crafter_api_key
    REPO_CRAFTER_REQUIRE_AUTH       = var.require_auth
    REPO_CRAFTER_CREATE_SETUP_ISSUE = var.create_setup_issue
    
    # Container Configuration
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    WEBSITES_PORT = "3000"
    NODE_ENV      = var.environment
    PORT          = "3000"
    LOG_LEVEL     = "debug"
  }
  
  tags = {
    Environment = var.environment
    Project     = "repo-crafter"
    ManagedBy   = "terraform"
  }
}
