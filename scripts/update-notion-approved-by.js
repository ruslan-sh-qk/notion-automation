const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;
const mergeRequestTitle = process.env.MR_TITLE;
const mrAuthor = process.env.MR_AUTHOR;

const buildUpdatePayload = (author) => ({ properties: { "Approved by": { rich_text: [{ text: { content: author } } ] } } })
const buildTaskIdFilter  = (taskID) => ({ filter: { property: 'Task ID', rich_text: { equals: taskID } } })

async function fetchNotionAPI(method, endpoint, body = null) {
    const response = await fetch(`${NOTION_API_BASE}/${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Notion API error: ${response.status} ${response.statusText} — ${errorBody}`);
    }

    return response.json();
}

async function findPageIdByTaskId(taskId) {
  const response = await fetchNotionAPI(
      'POST',
      `databases/${databaseId}/query`,
      buildTaskIdFilter(taskId)
  );

  const pageId = response?.results?.[0]?.id;
  if (!pageId) {
    throw new Error(`No pages found for task ID "${taskId}". Full response: ${JSON.stringify(response)}`);
  }

  return pageId;
}

async function updateApprovedBy(pageId, author) {
  await fetchNotionAPI('PATCH', `pages/${pageId}`, buildUpdatePayload(author));
}

function parseTicketId(input) {
  const match = input.match(/[a-z]+-\d+/i);
  if (!match) {
    throw new Error(`No valid ticket ID found in "${input}"`);
  }
  return match[0];
}

async function main() {
  const taskId = parseTicketId(mergeRequestTitle);
  console.log(`Output log for taskId:${taskId}`);
  const pageId = await findPageIdByTaskId(taskId);
  await updateApprovedBy(pageId, mrAuthor);

  console.log(`Updated Notion page ${pageId} with author "${mrAuthor}" for task "${taskId}".`);
}

main().catch((err) => {
  console.error('Script failed:', err.message);
});
