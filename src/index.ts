import { Probot } from "probot";

export default (app: Probot) => {
  
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("issues.edited", async (context) => {
    context.log.info(`Installation ID: ${context.payload.installation?.id}`);

    try {
      const response = await context.octokit.repos.createInOrg({
        org: "demos-aatmmr",
        name: "probot-repo",
      });

      const fullName = response.data.full_name;

      const issueComment = context.issue({
        body:
          "Thanks for editing this issue! Here is your new repository: " +
          fullName,
      });

      await context.octokit.issues.createComment(issueComment);
    } catch (error: any) {
      const status = error.response?.status || error.status || "Unknown status";
      const message =
        error.response?.data?.message || error.message || "Unknown error";
      error.response?.data?.errors?.forEach((error: any) => {
        console.log(`Error: ${error.message}`);
      });
      console.log(
        `Failed to create repository - Status: ${status}, Error: ${message}`
      );
    }
  });
};
