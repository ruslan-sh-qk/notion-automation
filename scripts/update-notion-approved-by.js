const NotionApi = require("./notion.api");
const utils = require("./utils");

async function main(env, { run, NotionApi }) {
    const { getEnvOrThrow } = utils;

    const credentials = {
        mergeRequestLogin: getEnvOrThrow(env, 'MR_AUTHOR'),
        databaseId: getEnvOrThrow(env, 'NOTION_DATABASE_ID'),
        mergeRequestTitle: getEnvOrThrow(env, 'MR_TITLE')
    };
    const notionToken = getEnvOrThrow(env, 'NOTION_SECRET');
    const notionApi = new NotionApi(notionToken);

    await run({ notionApi, credentials, gitHubApi });
}

async function run({ notionApi, credentials }) {
    const { mergeRequestLogin, databaseId, mergeRequestTitle } = credentials;
    await notionApi.healthCheck();

    const taskId = utils.parseTicketId(mergeRequestTitle);

    const pageId = await notionApi.findPageByTaskFromDatabase(taskId, databaseId);
    await notionApi.updateApprovedBy(pageId, mergeRequestLogin);
    console.log(`Updated Notion page ${ pageId } with author "${ mergeRequestLogin }" for task "${ taskId }".`); // cover with tests
}

if ( require.main === module ) {
    main(process.env, { run, NotionApi }).catch((err) => {
        console.error('Script failed:', err.message);
    });
}

module.exports = { main, run };
