# GitHub App Setup Guide for Organizations

This guide covers creating and configuring a GitHub App at the organization level for repo-crafter deployment.

## Prerequisites

- Organization owner or admin permissions
- Azure subscription for deployment
- Access to organization's GitHub repository secrets

## Step 1: Create Organization GitHub App

1. **Navigate to organization GitHub Apps**
   - Go to your GitHub organization
   - Settings > Developer settings > GitHub Apps
   - Click "New GitHub App"

2. **Basic Information**
   - **App name**: `{org-name}-repo-crafter` (must be globally unique)
   - **Homepage URL**: `https://github.com/{org-name}/repo-crafter`
   - **Description**: "Organization repository creation and management tool"
   - **User authorization callback URL**: `https://{org-name}-repo-crafter.azurewebsites.net/auth/callback`

3. **Webhook Configuration**
   - **Webhook URL**: `https://{org-name}-repo-crafter.azurewebsites.net/api/github/webhooks`
   - **Webhook secret**: Generate with `openssl rand -hex 32` (save as `REPOCRAFTER_WEBHOOK_SECRET`)
   - **SSL verification**: Enabled

4. **Organization Permissions**
   - **Administration**: Read & write (create repositories)
   - **Members**: Read (verify user membership)
   - **Metadata**: Read (access organization info)

5. **Repository Permissions**
   - **Administration**: Read & write (manage repository settings)
   - **Contents**: Read (access repository content)
   - **Issues**: Write (create setup issues)
   - **Pull requests**: Read (for future features)

7. **Where can this GitHub App be installed?**
   - Select "Only on this account" for organization-specific use

8. **Create the app** and save the **App ID** (use as `REPOCRAFTER_APP_ID`)

## Step 2: Configure App Authentication

1. **Generate Private Key**
   - In GitHub App settings, scroll to "Private keys"
   - Click "Generate a private key"
   - Download the `.pem` file
   - Store entire file content as `REPOCRAFTER_PRIVATE_KEY` secret

2. **Client Credentials**
   - Copy **Client ID** (use as `REPOCRAFTER_CLIENT_ID`)
   - Generate **Client Secret** (use as `REPOCRAFTER_CLIENT_SECRET`)

## Step 3: Install App on Organization

1. **Install the App**
   - In GitHub App settings, click "Install App"
   - Select your organization
   - Choose "All repositories" or select specific repositories
   - Grant permissions when prompted

2. **Verify Installation**
   - Go to Organization Settings > Third-party access
   - Confirm the app appears in "GitHub Apps"

## Step 4: Configure Organization Repository Secrets

Add these secrets to your organization's repo-crafter repository:

### GitHub App Configuration
```
REPOCRAFTER_APP_ID          - App ID from Step 1
REPOCRAFTER_PRIVATE_KEY     - Private key content (.pem file)
REPOCRAFTER_WEBHOOK_SECRET  - Webhook verification secret
REPOCRAFTER_CLIENT_ID       - Client ID from App settings
REPOCRAFTER_CLIENT_SECRET   - Generated client secret
```

### Application Configuration
```
REPO_CRAFTER_API_KEY   - Generate: openssl rand -hex 32
```

### Azure Deployment
```
AZURE_CREDENTIALS      - Service principal JSON (see Step 5)
```

## Step 5: Azure Service Principal for Organization

1. **Create Organization-Specific Service Principal**
   ```bash
   az ad sp create-for-rbac \
     --name "{org-name}-repo-crafter-deployment" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rg-{org-name}-* \
     --sdk-auth
   ```

2. **Configure Resource Group Permissions**
   ```bash
   # Grant permissions to manage resource groups with org prefix
   az role assignment create \
     --assignee {service-principal-id} \
     --role "Resource Group Contributor" \
     --scope /subscriptions/{subscription-id}
   ```

3. **Store Azure Credentials**
   ```json
   {
     "clientId": "service-principal-client-id",
     "clientSecret": "service-principal-secret",
     "subscriptionId": "azure-subscription-id",
     "tenantId": "azure-tenant-id"
   }
   ```

## Step 6: Organization Access Control

1. **Member Access**
   - Only organization members can use the repository creation API
   - App automatically validates membership before creating repositories

2. **Admin Users**
   - Repository admin assignment requires target user to be organization member
   - Validates membership before granting admin access

3. **Repository Naming**
   - Repositories created under organization namespace
   - Follows organization naming conventions

## Step 7: Test Organization Setup

1. **Test with Organization Member**
   ```bash
   curl -X POST https://{org-name}-repo-crafter.azurewebsites.net/repo-crafter/create-repository \
     -H "Content-Type: application/json" \
     -H "X-API-Key: {org-api-key}" \
     -d '{
       "organization": "{org-name}",
       "repositoryName": "test-new-repo",
       "repositoryAdmin": "{org-member-username}",
       "visibility": "private"
     }'
   ```

2. **Verify Repository Creation**
   - Check that repository appears in organization
   - Verify admin user has correct permissions
   - Confirm setup issue is created (if enabled).,2. **Verify Setup Issue Creation**
   - Check that setup issue appears in the designated repository
   - Confirm issue is assigned to the correct user
   - Validate issue contains all necessary information

## Troubleshooting Organization Issues

- **App not appearing in organization**: Check installation scope and permissions
- **Member validation failures**: Verify organization membership visibility settings
- **Permission denied errors**: Confirm service principal has correct Azure permissions
- **Webhook delivery failures**: Check organization firewall and webhook URL accessibility

## Multi-Environment Setup

For organizations with multiple environments:

```bash
# Development
AZURE_CREDENTIALS_DEV
REPO_CRAFTER_API_KEY_DEV

# Staging  
AZURE_CREDENTIALS_STAGING
REPO_CRAFTER_API_KEY_STAGING

# Production
AZURE_CREDENTIALS_PROD
REPO_CRAFTER_API_KEY_PROD
```
