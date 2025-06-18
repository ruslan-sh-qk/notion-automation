const NotionApiService = require("./notion-api.service");
const utils = require("./utils");

async function main(env, { runFunc, NotionApiService }) {
    const { getEnvOrThrow } = utils;
    const credentials = {
        author: getEnvOrThrow(env, 'MR_AUTHOR'),
        databaseId: getEnvOrThrow(env, 'NOTION_DATABASE_ID'),
        mergeRequestTitle: getEnvOrThrow(env, 'MR_TITLE')
    }

    const notionToken = getEnvOrThrow(env, 'NOTION_SECRET');
    const notionApiService = new NotionApiService(notionToken);

    await runFunc({ notionApiService, credentials });
}

async function run({ notionApiService, credentials }) {
    const { author, databaseId, mergeRequestTitle } = credentials;
    await notionApiService.healthCheck();
    const taskId = utils.parseTicketId(mergeRequestTitle);

    const pageId = await notionApiService.findPageByTaskFromDatabase(taskId, databaseId);
    await notionApiService.updateApprovedBy(pageId, author);
    console.log(`Updated Notion page ${ pageId } with author "${ author }" for task "${ taskId }".`); // cover with tests
}

if ( require.main === module ) {
    main(process.env, { runFunc: run, NotionApiService }).catch((err) => {
        console.error('Script failed:', err.message);
    });
}

module.exports = { main, run };
