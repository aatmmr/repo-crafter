# API Key Authentication

The repo-crafter API now supports simple API key authentication for secure access to the repository creation endpoint.

## Configuration

### Environment Variables

Set these environment variables to configure authentication and features:

```bash
# Required: Your secret API key
REPO_CRAFTER_API_KEY=your-super-secret-api-key-here

# Optional: Disable authentication for development (default is true)
REPO_CRAFTER_REQUIRE_AUTH=false

# Optional: Disable automatic setup issue creation (default is true)
REPO_CRAFTER_CREATE_SETUP_ISSUE=false
```

### Default Behavior

- **Authentication is enabled by default** - all requests require a valid API key
- If no `REPO_CRAFTER_API_KEY` is set, it defaults to `"your-secret-api-key-here"`
- Set `REPO_CRAFTER_REQUIRE_AUTH=false` to disable authentication during development

## Usage

### Option 1: X-API-Key Header

```bash
curl -X POST http://localhost:3000/repo-crafter/create-repository \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-super-secret-api-key-here" \
  -d '{
    "organization": "my-org",
    "repositoryName": "new-repo",
    "visibility": "private"
  }'
```

### Option 2: Authorization Bearer Header

```bash
curl -X POST http://localhost:3000/repo-crafter/create-repository \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-super-secret-api-key-here" \
  -d '{
    "organization": "my-org",
    "repositoryName": "new-repo",
    "visibility": "private"
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3000/repo-crafter/create-repository', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-super-secret-api-key-here'
  },
  body: JSON.stringify({
    organization: 'my-org',
    repositoryName: 'new-repo',
    visibility: 'private'
  })
});

const result = await response.json();
console.log(result);
```

## Error Responses

### Missing API Key

```json
{
  "success": false,
  "errorCode": "MISSING_API_KEY",
  "message": "API key is required. Provide it in 'X-API-Key' header or 'Authorization: Bearer <key>' header",
  "timestamp": "2025-07-10T12:34:56.789Z"
}
```

### Invalid API Key

```json
{
  "success": false,
  "errorCode": "INVALID_API_KEY",
  "message": "Invalid API key provided",
  "timestamp": "2025-07-10T12:34:56.789Z"
}
```

## Security Best Practices

1. **Use strong, random API keys** - Generate with `openssl rand -hex 32`
2. **Store keys securely** - Use environment variables, never commit keys to code
3. **Rotate keys regularly** - Change your API key periodically
4. **Use HTTPS in production** - Never send API keys over unencrypted connections
5. **Monitor access** - Check logs for authentication failures

## Testing

Create a test script to verify authentication:

```bash
#!/bin/bash

API_KEY="your-super-secret-api-key-here"
BASE_URL="http://localhost:3000/repo-crafter"

echo "Testing without API key (should fail):"
curl -X POST "$BASE_URL/create-repository" \
  -H "Content-Type: application/json" \
  -d '{"organization": "test-org", "repositoryName": "test-repo"}' \
  -w "\nStatus: %{http_code}\n\n"

echo "Testing with valid API key:"
curl -X POST "$BASE_URL/create-repository" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"organization": "test-org", "repositoryName": "test-repo"}' \
  -w "\nStatus: %{http_code}\n\n"
```

## Disabling Authentication

For development or testing, you can disable authentication:

```bash
export REPO_CRAFTER_REQUIRE_AUTH=false
npm start
```

When disabled, all requests will be processed without authentication checks.
