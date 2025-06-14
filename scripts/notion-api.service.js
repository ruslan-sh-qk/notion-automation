const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const notionToken = process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

class NotionApiService {

    #buildUpdatePayload(author) {
        return {properties: {"Approved by": {rich_text: [{text: {content: author}}]}}}
    }

    #buildTaskIdFilter(taskID){
        return {filter: {property: 'Task ID', rich_text: {equals: taskID}}}
    }

     async #fetchNotionAPI(method, endpoint, body = null) {
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

    async findPageIdByTaskId(taskId) {
        const response = await this.#fetchNotionAPI(
            'POST',
            `databases/${databaseId}/query`,
            this.#buildTaskIdFilter(taskId)
        );

        const pageId = response?.results?.[0]?.id;
        if (!pageId) {
            throw new Error(`No pages found for task ID "${taskId}". Full response: ${JSON.stringify(response)}`);
        }

        return pageId;
    }

     async updateApprovedBy(pageId, author) {
        await this.#fetchNotionAPI('PATCH', `pages/${pageId}`, this.#buildUpdatePayload(author));
    }

    async healthcheck() {
        await this.#fetchNotionAPI('GET', 'users/me');
    }
}

export default NotionApiService;