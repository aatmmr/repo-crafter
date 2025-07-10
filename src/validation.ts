// Validation functions for request parameters

import { ApiError } from './types.js';

/**
 * Validates that required parameters (organization and repositoryName) are provided
 */
export function validateRequiredParameters(organization?: string, repositoryName?: string): ApiError | null {
  if (!organization || !repositoryName) {
    return {
      success: false,
      errorCode: "MISSING_REQUIRED_PARAMETERS",
      message: "Missing required parameters: organization and repositoryName",
      timestamp: new Date().toISOString()
    };
  }
  return null;
}

/**
 * Validates that the visibility parameter is one of the allowed values
 */
export function validateVisibility(visibility?: string): ApiError | null {
  if (visibility && !['public', 'private', 'internal'].includes(visibility)) {
    return {
      success: false,
      errorCode: "INVALID_VISIBILITY",
      message: "Invalid visibility parameter. Must be 'public', 'private', or 'internal'",
      timestamp: new Date().toISOString()
    };
  }
  return null;
}
