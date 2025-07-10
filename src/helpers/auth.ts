// Simple API key authentication

import { ApiError } from './types.js';

/**
 * Validates API key from request headers
 * Supports both X-API-Key header and Authorization Bearer token
 */
export function validateApiKey(req: any, expectedApiKey: string): ApiError | null {
  // Try to get API key from different header formats
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['X-API-Key'] ||
                 (req.headers['authorization']?.startsWith('Bearer ') ? 
                  req.headers['authorization'].slice(7) : null);
  
  if (!apiKey) {
    return {
      success: false,
      errorCode: "MISSING_API_KEY",
      message: "API key is required. Provide it in 'X-API-Key' header or 'Authorization: Bearer <key>' header",
      timestamp: new Date().toISOString()
    };
  }

  if (apiKey !== expectedApiKey) {
    return {
      success: false,
      errorCode: "INVALID_API_KEY", 
      message: "Invalid API key provided",
      timestamp: new Date().toISOString()
    };
  }

  return null; // Authentication successful
}
