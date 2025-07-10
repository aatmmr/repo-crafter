# repo-crafter

> A GitHub App built with [Probot](https://github.com/probot/probot) that creates repositories upon request with API key authentication

## Features

- 🏗️ **Repository Creation**: Create repositories in GitHub organizations via API
- 🔒 **API Key Authentication**: Secure access with configurable authentication
- 👥 **Admin Assignment**: Automatically assign users as repository admins
- � **Setup Issue Creation**: Automatically creates an issue with best practices and setup checklist
- �🔍 **Validation**: Comprehensive validation for organization membership and repository availability
- 📊 **Structured Responses**: Consistent error codes and response formats
- ⚙️ **Configurable Visibility**: Support for public, private, and internal repositories

## Quick Start

```sh
# Install dependencies
npm install

# Set up authentication (optional for development)
export REPO_CRAFTER_API_KEY="your-secret-api-key-here"
export REPO_CRAFTER_REQUIRE_AUTH=true

# Run the bot
npm start
```

## API Usage

### Create Repository
```bash
curl -X POST http://localhost:3000/repo-crafter/create-repository \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{
    "organization": "my-org",
    "repositoryName": "new-repo",
    "repositoryAdmin": "username",
    "visibility": "private"
  }'
```

## Configuration

### Environment Variables
- `REPO_CRAFTER_API_KEY` - API key for authentication (required in production)
- `REPO_CRAFTER_REQUIRE_AUTH` - Enable/disable authentication (default: true)
- `REPO_CRAFTER_CREATE_SETUP_ISSUE` - Enable/disable automatic setup issue creation (default: true)

### Authentication
See [AUTH_SETUP.md](AUTH_SETUP.md) for detailed authentication setup and usage.

### API Documentation
See [API_USAGE.md](API_USAGE.md) for complete API documentation.

## Docker

```sh
# 1. Build container
docker build -t repo-crafter .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> repo-crafter
```

## Contributing

If you have suggestions for how repo-crafter could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 Maik Müller
