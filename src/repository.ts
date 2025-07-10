// Repository-related operations and validations

import { ApiError } from './types.js';

/**
 * Validates that a user is a member of the specified organization
 */
export async function validateOrganizationMembership(
  octokit: any,
  organization: string,
  repositoryAdmin: string
): Promise<ApiError | null> {
  try {
    await octokit.orgs.getMembershipForUser({
      org: organization,
      username: repositoryAdmin
    });
    return null; // Success - user is a member
  } catch (membershipError: any) {
    const status = membershipError.response?.status;
    let errorMessage = `User ${repositoryAdmin} is not a member of organization ${organization}`;
    let errorCode = "USER_NOT_ORGANIZATION_MEMBER";
    
    if (status === 404) {
      errorMessage = `User ${repositoryAdmin} is not a member of organization ${organization}`;
      errorCode = "USER_NOT_ORGANIZATION_MEMBER";
    } else if (status === 403) {
      errorMessage = `Cannot verify membership for ${repositoryAdmin} in ${organization} - insufficient permissions`;
      errorCode = "MEMBERSHIP_VERIFICATION_FORBIDDEN";
    } else {
      errorMessage = `Failed to verify membership for ${repositoryAdmin}: ${membershipError.message}`;
      errorCode = "MEMBERSHIP_VERIFICATION_FAILED";
    }
    
    return {
      success: false,
      errorCode: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Checks if a repository with the given name already exists in the organization
 */
export async function validateRepositoryAvailability(
  octokit: any,
  organization: string,
  repositoryName: string
): Promise<ApiError | null> {
  try {
    await octokit.repos.get({
      owner: organization,
      repo: repositoryName
    });
    
    // If we get here, the repository exists
    return {
      success: false,
      errorCode: "REPOSITORY_ALREADY_EXISTS",
      message: `Repository ${organization}/${repositoryName} already exists`,
      timestamp: new Date().toISOString()
    };
  } catch (repoCheckError: any) {
    // 404 means repository doesn't exist, which is what we want
    if (repoCheckError.response?.status !== 404) {
      // Some other error occurred while checking
      return {
        success: false,
        errorCode: "REPOSITORY_AVAILABILITY_CHECK_FAILED",
        message: `Failed to verify repository availability: ${repoCheckError.message}`,
        timestamp: new Date().toISOString()
      };
    }
    // Repository doesn't exist, we can proceed
    return null;
  }
}

/**
 * Creates the parameters object for repository creation
 */
export function createRepositoryParams(
  organization: string,
  repositoryName: string,
  repositoryAdmin?: string,
  visibility: string = 'private'
): any {
  const createRepoParams: any = {
    org: organization,
    name: repositoryName,
    description: `Repository created via API${repositoryAdmin ? ` by ${repositoryAdmin}` : ''}`,
    auto_init: true
  };

  // Handle visibility - use both private and visibility parameters for compatibility
  if (visibility === 'private') {
    createRepoParams.private = true;
  } else if (visibility === 'public') {
    createRepoParams.private = false;
    createRepoParams.visibility = 'public';
  } else if (visibility === 'internal') {
    createRepoParams.private = false;
    createRepoParams.visibility = 'internal';
  }

  return createRepoParams;
}

/**
 * Adds a user as an admin collaborator to the repository
 */
export async function addRepositoryAdmin(
  octokit: any,
  organization: string,
  repositoryName: string,
  repositoryAdmin: string,
  fullName: string,
  logger: any
): Promise<void> {
  try {
    await octokit.repos.addCollaborator({
      owner: organization,
      repo: repositoryName,
      username: repositoryAdmin,
      permission: 'admin'
    });
    logger.info(`Added ${repositoryAdmin} as admin to ${fullName}`);
  } catch (collaboratorError: any) {
    logger.warn(`Failed to add ${repositoryAdmin} as admin: ${collaboratorError.message}`);
    // Continue execution - repository was created successfully
  }
}
