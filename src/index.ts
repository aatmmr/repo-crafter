import { Probot } from "probot";
import { RepositoryRequest, Response } from './helpers/types.js';
import { validateRequiredParameters, validateVisibility } from './helpers/validation.js';
import { findInstallation, createInstallationNotFoundError } from './helpers/github-app.js';
import { 
  validateOrganizationMembership, 
  validateRepositoryAvailability, 
  createRepositoryParams, 
  addRepositoryAdmin 
} from './helpers/repository.js';
import { createSuccessResponse, createErrorResponse } from './helpers/responses.js';

export default (app: Probot, { getRouter }: { getRouter: (prefix: string) => any }) => {
  // Get an express router to expose new HTTP endpoints
  const router = getRouter("/repo-crafter");

  // Add JSON body parsing middleware
  router.use((req: any, _res: any, next: any) => {
    if (req.method === 'POST' && req.headers['content-type']?.includes('application/json')) {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
        next();
      });
    } else {
      next();
    }
  });

  // Repository creation endpoint
  router.post("/create-repository", async (req: RepositoryRequest, res: Response) => {
    const { organization, repositoryName, repositoryAdmin, visibility = 'private' } = req.body;
    
    app.log.info("Repository creation API called", { organization, repositoryName, repositoryAdmin, visibility });
    
    try {
      // Validate required parameters
      const paramError = validateRequiredParameters(organization, repositoryName);
      if (paramError) {
        return res.json(paramError);
      }

      // At this point, organization and repositoryName are guaranteed to be strings
      const orgName = organization!;
      const repoName = repositoryName!;

      // Validate visibility parameter
      const visibilityError = validateVisibility(visibility);
      if (visibilityError) {
        return res.json(visibilityError);
      }

      app.log.info(`Creating ${visibility} repository: ${orgName}/${repoName}`);
      
      // Find GitHub App installation for the organization
      const installation = await findInstallation(app, orgName);
      if (!installation) {
        return res.json(createInstallationNotFoundError(orgName));
      }

      // Create authenticated octokit instance for the installation
      const octokit = await app.auth(installation.id);

      // Validate repository admin is a member of the organization if specified
      if (repositoryAdmin) {
        const membershipError = await validateOrganizationMembership(octokit, orgName, repositoryAdmin);
        if (membershipError) {
          return res.json(membershipError);
        }
        app.log.info(`Verified ${repositoryAdmin} is a member of ${orgName}`);
      }

      // Check if repository already exists
      const availabilityError = await validateRepositoryAvailability(octokit, orgName, repoName);
      if (availabilityError) {
        return res.json(availabilityError);
      }
      app.log.info(`Verified repository ${orgName}/${repoName} is available`);

      // Create repository
      const createRepoParams = createRepositoryParams(orgName, repoName, repositoryAdmin, visibility);
      const response = await octokit.repos.createInOrg(createRepoParams);

      const fullName = response.data.full_name;
      const htmlUrl = response.data.html_url;

      // Add repository admin as collaborator if specified
      if (repositoryAdmin) {
        await addRepositoryAdmin(octokit, orgName, repoName, repositoryAdmin, fullName, app.log);
      }

      const successResponse = createSuccessResponse(fullName, repoName, orgName, htmlUrl, repositoryAdmin, visibility);
      res.json(successResponse);
    } catch (error: any) {
      app.log.error("Error creating repository", error);
      res.json(createErrorResponse(error));
    }
  });

  // Add a route to get app status
  router.get("/status", (_req: any, res: Response) => {
    res.json({
      status: "running",
      app: "repo-crafter",
      timestamp: new Date().toISOString()
    });
  });
};
