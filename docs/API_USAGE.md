# Repository Creation API

This Probot app provides a custom HTTP endpoint for creating GitHub repositories programmatically.

## Prerequisites

- The GitHub App must be installed on the target organization
- The app must have repository creation permissions

## Available Endpoints

All endpoints are prefixed with `/repo-crafter/`

### 1. POST /repo-crafter/create-repository
Create a new GitHub repository.

**Example:**
```bash
curl -X POST http://localhost:3000/repo-crafter/create-repository \
  -H "Content-Type: application/json" \
  -d '{
    "organization": "your-org",
    "repositoryName": "new-repo",
    "repositoryAdmin": "admin-username",
    "visibility": "public"
  }'
```

**Request Body:**
- `organization` (required): The GitHub organization where the repository will be created
- `repositoryName` (required): The name of the new repository
- `repositoryAdmin` (optional): GitHub username to add as admin collaborator after repository creation (must be a member of the organization)
- `visibility` (optional): Repository visibility - "public", "private", or "internal" (defaults to "private")
  - **public**: Visible to everyone
  - **private**: Only visible to repository collaborators
  - **internal**: Visible to all organization members (GitHub Enterprise only)

**Success Response:**
```json
{
  "success": true,
  "message": "Repository your-org/new-repo created successfully with admin-username as admin",
  "timestamp": "2025-07-10T12:00:00.000Z",
  "repository": {
    "name": "new-repo",
    "organization": "your-org",
    "fullName": "your-org/new-repo",
    "url": "https://github.com/your-org/new-repo",
    "admin": "admin-username",
    "visibility": "public"
  }
}
```

**Error Response (Missing Parameters):**
```json
{
  "success": false,
  "errorCode": "MISSING_REQUIRED_PARAMETERS",
  "message": "Missing required parameters: organization and repositoryName",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (App Not Installed):**
```json
{
  "success": false,
  "errorCode": "APP_NOT_INSTALLED",
  "message": "GitHub App is not installed for organization: your-org",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (Admin Not Organization Member):**
```json
{
  "success": false,
  "errorCode": "USER_NOT_ORGANIZATION_MEMBER",
  "message": "User admin-username is not a member of organization your-org",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (Repository Already Exists):**
```json
{
  "success": false,
  "errorCode": "REPOSITORY_ALREADY_EXISTS",
  "message": "Repository your-org/repo-name already exists",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (Invalid Visibility):**
```json
{
  "success": false,
  "errorCode": "INVALID_VISIBILITY",
  "message": "Invalid visibility parameter. Must be 'public', 'private', or 'internal'",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (Invalid Visibility):**
```json
{
  "success": false,
  "message": "Invalid visibility parameter. Must be 'public', 'private', or 'internal'",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

### 2. GET /repo-crafter/status
Check the app status.

**Example:**
```bash
curl "http://localhost:3000/repo-crafter/status"
```

**Response:**
```json
{
  "status": "running",
  "app": "repo-crafter",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

## Running the App

1. Start the app in development mode:
   ```bash
   npm run build
   npm start
   ```

2. The repository creation endpoint will be available at `http://localhost:3000/repo-crafter/create-repository`

## Repository Settings

The created repository will have the following default settings:
- **Visibility**: Private by default (can be set to "public", "private", or "internal" via the `visibility` parameter)
- **Auto-initialize**: True (creates with initial README)
- **Description**: Includes information about who requested the repository

**Note**: The "internal" visibility option is only available for GitHub Enterprise Cloud and GitHub Enterprise Server organizations.

## Repository Administration

When you specify a `repositoryAdmin` parameter:

1. **Organization Membership Check**: The API first verifies that the specified user is a member of the target organization
2. **Repository Name Availability**: The API checks that the repository name is not already used in the organization
3. **Repository Creation**: The repository is created under the organization
4. **Admin Assignment**: The specified user is automatically added as an admin collaborator
5. **Permissions**: The admin user gets full administrative access to the repository

**Requirements for Repository Admin:**
- Must be a valid GitHub username
- Must be a member of the target organization
- Organization membership must be public or the GitHub App must have sufficient permissions to check private memberships

**Admin Permissions Include:**
- Read, write, and delete access to the repository
- Ability to manage repository settings
- Ability to add/remove other collaborators
- Ability to manage repository webhooks and integrations

## Error Codes

All error responses include an `errorCode` field for programmatic error handling. Here are the possible error codes:

| Error Code | Description | HTTP Context |
|------------|-------------|--------------|
| `MISSING_REQUIRED_PARAMETERS` | Required fields `organization` or `repositoryName` are missing | 400 |
| `INVALID_VISIBILITY` | Visibility parameter is not "public", "private", or "internal" | 400 |
| `APP_NOT_INSTALLED` | GitHub App is not installed on the target organization | 403 |
| `USER_NOT_ORGANIZATION_MEMBER` | Specified repository admin is not a member of the organization | 403 |
| `MEMBERSHIP_VERIFICATION_FORBIDDEN` | Cannot verify user membership due to insufficient permissions | 403 |
| `MEMBERSHIP_VERIFICATION_FAILED` | Failed to verify user membership for other reasons | 500 |
| `REPOSITORY_ALREADY_EXISTS` | Repository with the same name already exists in the organization | 409 |
| `REPOSITORY_AVAILABILITY_CHECK_FAILED` | Failed to verify if repository name is available | 500 |
| `REPOSITORY_CREATION_FAILED` | General repository creation failure | 500 |

**Example Error Handling in Code:**
```javascript
const response = await fetch('/repo-crafter/create-repository', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ organization: 'my-org', repositoryName: 'my-repo' })
});

const result = await response.json();

if (!result.success) {
  switch (result.errorCode) {
    case 'MISSING_REQUIRED_PARAMETERS':
      console.log('Please provide both organization and repository name');
      break;
    case 'REPOSITORY_ALREADY_EXISTS':
      console.log('Repository name is already taken');
      break;
    case 'APP_NOT_INSTALLED':
      console.log('GitHub App needs to be installed on this organization');
      break;
    case 'USER_NOT_ORGANIZATION_MEMBER':
      console.log('Specified admin is not a member of the organization');
      break;
    default:
      console.log('Unexpected error:', result.message);
  }
}
```

## Error Handling

The API handles various error scenarios:
- Missing required parameters (`organization` and `repositoryName`)
- Invalid visibility parameter (must be "public", "private", or "internal")
- GitHub App not installed on the target organization
- Repository admin not being a member of the organization
- Repository name already exists in the organization
- GitHub API errors (permissions, organization not found, etc.)
- Invalid repository names
- Authentication issues
- Enterprise feature limitations (internal visibility on non-Enterprise accounts)

## Security Considerations

- Ensure proper GitHub App authentication is configured
- The app automatically checks if it's installed on the target organization
- Validate that the requesting user has permission to create repositories in the organization
- Consider adding rate limiting for production use
- Add input validation for repository names and organization names
- Use HTTPS in production

## GitHub App Setup

To use this API, make sure your GitHub App has the following permissions:
- **Repository permissions**: Administration (to create repositories and add collaborators)
- **Organization permissions**: Read (to list installations)

The app must be installed on each organization where you want to create repositories.

**Error Response (Invalid Visibility):**
```json
{
  "success": false,
  "message": "Invalid visibility parameter. Must be 'public', 'private', or 'internal'",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```
```json
{
  "success": true,
  "message": "Repository your-org/new-repo created successfully",
  "timestamp": "2025-07-10T12:00:00.000Z",
  "repository": {
    "name": "new-repo",
    "organization": "your-org",
    "fullName": "your-org/new-repo",
    "url": "https://github.com/your-org/new-repo",
    "admin": "admin-username",
    "visibility": "public"
  }
}
```

**Error Response (Missing Parameters):**
```json
{
  "success": false,
  "message": "Missing required parameters: organization and repositoryName",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

**Error Response (Invalid Visibility):**
```json
{
  "success": false,
  "message": "Invalid visibility parameter. Must be 'public', 'private', or 'internal'",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

### 2. GET /repo-crafter/status
Check the app status.

**Example:**
```bash
curl "http://localhost:3000/repo-crafter/status"
```

**Response:**
```json
{
  "status": "running",
  "app": "repo-crafter",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

## Running the App

1. Start the app in development mode:
   ```bash
   npm run build
   npm start
   ```

2. The repository creation endpoint will be available at `http://localhost:3000/repo-crafter/create-repository`

## Repository Settings

The created repository will have the following default settings:
- **Visibility**: Private by default (can be set to "public" via the `visibility` parameter)
- **Auto-initialize**: True (creates with initial README)
- **Description**: Includes information about who requested the repository

## Error Handling

The API handles various error scenarios:
- Missing required parameters (`organization` and `repositoryName`)
- Invalid visibility parameter (must be "public" or "private")
- GitHub API errors (permissions, organization not found, etc.)
- Invalid repository names
- Authentication issues

## Security Considerations

- Ensure proper GitHub App authentication is configured
- Validate that the requesting user has permission to create repositories in the organization
- Consider adding rate limiting for production use
- Add input validation for repository names and organization names
- Use HTTPS in production
