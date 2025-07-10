// GitHub App installation related functions

import { Probot } from "probot";
import { ApiError } from './types.js';

/**
 * Finds the GitHub App installation for the given organization
 */
export async function findInstallation(app: Probot, organization: string): Promise<any> {
  const appAuth = await app.auth();
  const installations = await appAuth.apps.listInstallations();
  return installations.data.find(inst => inst.account?.login === organization);
}

/**
 * Creates a standardized error response when the GitHub App is not installed for an organization
 */
export function createInstallationNotFoundError(organization: string): ApiError {
  return {
    success: false,
    errorCode: "APP_NOT_INSTALLED",
    message: `GitHub App is not installed for organization: ${organization}`,
    timestamp: new Date().toISOString()
  };
}
