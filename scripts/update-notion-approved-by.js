const NotionApi = require("./notion.api");
const utils = require("./utils");

/**
 *
 * @param env
 * @param run
 * @param NotionApi
 * @returns {Promise<void>}
 */
async function main(env, { run, NotionApi }) {
    const { getEnvOrThrow } = utils;

    const credentials = {
        mergeRequestLogin: getEnvOrThrow(env, 'MR_AUTHOR'),
        databaseId: getEnvOrThrow(env, 'NOTION_DATABASE_ID'),
        mergeRequestTitle: getEnvOrThrow(env, 'MR_TITLE')
    };
    const notionToken = getEnvOrThrow(env, 'NOTION_SECRET');
    const notionApi = new NotionApi(notionToken);

    await run({ notionApi, credentials });
}

/**
 *
 * @param notionApi
 * @param credentials
 * @returns {Promise<void>}
 */
async function run({ notionApi, credentials }) {
    const { mergeRequestLogin, databaseId, mergeRequestTitle } = credentials;
    await notionApi.healthCheck();

    const taskId = utils.parseTicketId(mergeRequestTitle);

    const pageId = await notionApi.findPageByTaskFromDatabase(taskId, databaseId);
    const updateNotionProperty = 'Approved by';

    await notionApi.updatePageWithProperty(pageId, updateNotionProperty, mergeRequestLogin);
}

if ( require.main === module ) {
    main(process.env, { run, NotionApi })
        .then(() => {
            console.log(`✅ Notion page is updated`)
        })
        .catch((err) => {
            console.error(`❌ Script failed: ${ err.message }, stack: ${ err.stack }`);
        });
}

module.exports = { main, run };
