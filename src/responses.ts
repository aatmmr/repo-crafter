// Response formatting utilities

import { ApiError, ApiSuccess } from './types.js';

/**
 * Creates a standardized success response for repository creation
 */
export function createSuccessResponse(
  fullName: string,
  repositoryName: string,
  organization: string,
  htmlUrl: string,
  repositoryAdmin?: string,
  visibility: string = 'private'
): ApiSuccess {
  return {
    success: true,
    message: `Repository ${fullName} created successfully${repositoryAdmin ? ` with ${repositoryAdmin} as admin` : ''}`,
    timestamp: new Date().toISOString(),
    repository: {
      name: repositoryName,
      organization: organization,
      fullName: fullName,
      url: htmlUrl,
      admin: repositoryAdmin,
      visibility: visibility
    }
  };
}

/**
 * Creates a standardized error response for repository creation failures
 */
export function createErrorResponse(error: any): ApiError {
  const message = error.response?.data?.message || error.message || "Unknown error";
  
  return {
    success: false,
    errorCode: "REPOSITORY_CREATION_FAILED",
    message: `Failed to create repository: ${message}`,
    timestamp: new Date().toISOString()
  };
}
