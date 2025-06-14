const NotionApiService = require("./notion-api.service");

const mergeRequestTitle = process.env.MR_TITLE;
const author = process.env.MR_AUTHOR;

const notionToken = process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

function parseTicketId(commitMessage) {
    const match = commitMessage.match(/\((\w+-\d+)\)/); // Matches (LMD-1234) or (BUG-5678)
    if (!match) {
        throw new Error(`No ticket ID found in: "${commitMessage}"`);
    }
    return match[1];
}

async function main() {
    const notionApiService = new NotionApiService(notionToken);

    await notionApiService.healthcheck();
    const taskId = parseTicketId(mergeRequestTitle);
    const pageId = await notionApiService.findPageByTaskFromDatabase(taskId, databaseId);
    await notionApiService.updateApprovedBy(pageId, author);

    console.log(`Updated Notion page ${pageId} with author "${author}" for task "${taskId}".`);
}

main().catch((err) => {
    console.error('Script failed:', err.message);
});


// workflow reject on internal error

// ifelse cover with unit tests