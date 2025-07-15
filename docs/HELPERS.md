# Helper Modules Documentation

This directory contains modular helper functions organized by functionality for the repo-crafter application.

## File Structure

```
src/helpers/
├── index.ts          # Central export file
├── types.ts          # TypeScript type definitions
├── validation.ts     # Request parameter validation
├── github-app.ts     # GitHub App installation functions
├── repository.ts     # Repository operations and validations
└── responses.ts      # Response formatting utilities
```

## Module Overview

### `types.ts`
Contains all TypeScript interface definitions used across the application:
- `RepositoryRequest` - API request structure
- `Response` - Express response interface
- `ApiError` - Standardized error response format
- `ApiSuccess` - Standardized success response format

### `validation.ts`
Input validation functions:
- `validateRequiredParameters()` - Validates organization and repositoryName
- `validateVisibility()` - Validates repository visibility parameter

### `github-app.ts`
GitHub App installation management:
- `findInstallation()` - Finds GitHub App installation for organization
- `createInstallationNotFoundError()` - Creates installation error response

### `repository.ts`
Repository operations and validations:
- `validateOrganizationMembership()` - Checks if user is organization member
- `validateRepositoryAvailability()` - Checks if repository name is available
- `createRepositoryParams()` - Builds repository creation parameters
- `addRepositoryAdmin()` - Adds user as repository admin

### `responses.ts`
Response formatting utilities:
- `createSuccessResponse()` - Creates standardized success responses
- `createErrorResponse()` - Creates standardized error responses

## Usage

### Individual Imports
```typescript
import { validateRequiredParameters } from './helpers/validation.js';
import { findInstallation } from './helpers/github-app.js';
```

### Bulk Import
```typescript
import {
  RepositoryRequest,
  validateRequiredParameters,
  findInstallation,
  createSuccessResponse
} from './helpers/index.js';
```

## Benefits

1. **Modularity**: Each file has a single responsibility
2. **Maintainability**: Easy to locate and modify specific functionality
3. **Testability**: Individual functions can be easily unit tested
4. **Reusability**: Functions can be imported and used in other parts of the application
5. **Type Safety**: Centralized type definitions ensure consistency
6. **Documentation**: Each module is focused and self-documenting
