const NotionApi = require("./notion.api");
const GitHubApi = require("./github.api");
const utils = require("./utils");

async function main(env, { run, NotionApi, GitHubApi }) {
    const { getEnvOrThrow } = utils;

    const credentials = {
        mergeRequestLogin: getEnvOrThrow(env, 'MR_AUTHOR'),
        databaseId: getEnvOrThrow(env, 'NOTION_DATABASE_ID'),
        mergeRequestTitle: getEnvOrThrow(env, 'MR_TITLE')
    };
    const notionToken = getEnvOrThrow(env, 'NOTION_SECRET');

    const gitHubApi = new GitHubApi();
    const notionApi = new NotionApi(notionToken);

    await run({ notionApi, credentials, gitHubApi });
}

async function run({ notionApi, credentials, gitHubApi }) {
    const { mergeRequestLogin, databaseId, mergeRequestTitle } = credentials;
    await notionApi.healthCheck();

    const { name: githubUserName } = await gitHubApi.getUser(mergeRequestLogin);

    const taskId = utils.parseTicketId(mergeRequestTitle);

    const pageId = await notionApi.findPageByTaskFromDatabase(taskId, databaseId);
    await notionApi.updateApprovedBy(pageId, githubUserName);
    console.log(`Updated Notion page ${ pageId } with author "${ githubUserName }" for task "${ taskId }".`); // cover with tests
}

if ( require.main === module ) {
    main(process.env, { run, NotionApi, GitHubApi }).catch((err) => {
        console.error('Script failed:', err.message);
    });
}

module.exports = { main, run };
