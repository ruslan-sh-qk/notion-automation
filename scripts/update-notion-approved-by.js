const NotionApiService = require("./notion-api.service");

function parseTicketId(commitMessage) {
    const match = commitMessage.match(/\((\w+-\d+)\)/); // Matches (LMD-1234) or (BUG-5678)
    if (!match) {
        throw new Error(`No ticket ID found in: "${commitMessage}"`);
    }
    return match[1];
}

async function main() {
    const mergeRequestTitle = process.env.MR_TITLE;
    const author = process.env.MR_AUTHOR;

    const notionToken = process.env.NOTION_SECRET;
    const databaseId = process.env.NOTION_DATABASE_ID;

    const notionApiService = new NotionApiService(notionToken);

    await run({notionApiService, author, databaseId, mergeRequestTitle})
}

async function run({notionApiService, mergeRequestTitle, author, databaseId}) {
    await notionApiService.healthCheck();
    const taskId = parseTicketId(mergeRequestTitle);

    const pageId = await notionApiService.findPageByTaskFromDatabase(taskId, databaseId);
    await notionApiService.updateApprovedBy(pageId, author);
    console.log(`Updated Notion page ${pageId} with author "${author}" for task "${taskId}".`);
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Script failed:', err.message);
    });
}

module.exports = {parseTicketId, main, run};