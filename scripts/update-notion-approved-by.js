import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;
const prTitle = process.env.PR_TITLE;
const prAuthor = process.env.PR_AUTHOR;

console.log('PR TITLE', prTitle);
console.log('PR AUTHOR', prAuthor);

async function main() {
  // const taskId = taskIdMatch[1];
  const taskId = 'sampleTask'; // mocked for now

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Task ID',
      rich_text: {
        equals: taskId
      }
    }
  });

  if (response.results.length === 0) {
    console.error(`❌ No Notion page found with taskId: ${taskId}`);
    process.exit(1);
  }

  const pageId = response.results[0].id;

  await notion.pages.update({
    page_id: pageId,
    properties: {
      'Approved by': {
        rich_text: [
          {
            text: {
              content: prAuthor
            }
          }
        ]
      }
    }
  });

  console.log(`✅ Updated "Approved by" for tasks ${taskId} with user ${prAuthor}`);
}

main().catch((err) => {
  console.error('🔥 Error updating Notion:', err.message);
  process.exit(1);
});
