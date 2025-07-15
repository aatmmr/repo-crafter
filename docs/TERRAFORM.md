# Terraform Azure Deployment

This directory contains Terraform configuration to deploy the repo-crafter application to Azure Web App as a container.

## Prerequisites

1. **Azure Subscription** - You need an active Azure subscription
2. **Azure Service Principal** - For GitHub Actions authentication
3. **GitHub Secrets** - Required secrets configured in your repository

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Azure Authentication
- `AZURE_CREDENTIALS` - JSON object containing Azure service principal credentials

### GitHub App Configuration
- `REPOCRAFTER_APP_ID` - Your GitHub App ID
- `REPOCRAFTER_PRIVATE_KEY` - Your GitHub App private key (PEM format)
- `REPOCRAFTER_WEBHOOK_SECRET` - Secret for webhook verification
- `REPOCRAFTER_CLIENT_ID` - GitHub App client ID
- `REPOCRAFTER_CLIENT_SECRET` - GitHub App client secret

### Application Configuration
- `REPO_CRAFTER_API_KEY` - API key for repository creation endpoints

## Setting up Azure Service Principal

1. **Create Service Principal:**
   ```bash
   az ad sp create-for-rbac \
     --name "repo-crafter-github-actions" \
     --role contributor \
     --scopes /subscriptions/{subscription-id} \
     --sdk-auth
   ```

2. **Copy the JSON output** and save it as the `AZURE_CREDENTIALS` secret:
   ```json
   {
     "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   }
   ```

## Deployment

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Process**: Build → Test → Docker Build & Push → Terraform Deploy
- **Environment**: Production

### Manual Destruction
- **Trigger**: Manual workflow dispatch
- **Safety**: Requires typing "DESTROY" to confirm
- **Environments**: Choose dev, staging, or prod

## Terraform Configuration

### Files
- `main.tf` - Main infrastructure resources
- `variables.tf` - Input variables
- `outputs.tf` - Output values
- `terraform.tfvars.example` - Example configuration

### Resources Created
- **Resource Group** - `rg-repo-crafter-{environment}`
- **App Service Plan** - `asp-repo-crafter-{environment}` (Linux, B1 SKU)
- **Web App** - `app-repo-crafter-{environment}-{random-suffix}`

### Environment Variables
The following environment variables are automatically configured in the Web App:
- Probot configuration (APP_ID, PRIVATE_KEY, etc.)
- Repo Crafter settings (API key, auth requirements)
- Container settings (PORT, NODE_ENV)

## Local Development

1. **Copy example configuration:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Fill in your values** (don't commit this file!)

3. **Run Terraform locally:**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

4. **Destroy resources:**
   ```bash
   terraform destroy
   ```

## Environments

- **dev** - Development environment (B1 SKU, latest container)
- **staging** - Staging environment (B1 SKU, branch-specific container)
- **prod** - Production environment (B1 SKU, SHA-tagged container)

## Security Notes

- All secrets are managed via GitHub repository secrets
- No sensitive values are stored in code
- Azure Web App uses HTTPS by default
- Container registry authentication via GitHub token

## Troubleshooting

### Common Issues

1. **Azure authentication failure**
   - Verify `AZURE_CREDENTIALS` secret is correctly formatted
   - Ensure service principal has contributor role

2. **Container pull failure**
   - Check GitHub token has packages read permission
   - Verify container image exists in GitHub Container Registry

3. **Terraform state conflicts**
   - Each environment uses the same state file (simplicity over best practices)
   - For production use, consider remote state storage

### Viewing Logs
- Azure Portal > App Service > Log stream
- Or use Azure CLI: `az webapp log tail --name {app-name} --resource-group {rg-name}`
