const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

class NotionApiService {

    constructor(notionToken) {
        this.notionToken = notionToken;

        if (!this.notionToken ) {
            throw new Error('Notion token must be provided.');
        }
    }

     async #fetchNotionAPI(method, endpoint, body = null) {
        const response = await fetch(`${NOTION_API_BASE}/${endpoint}`, {
            method,
            headers: {
                'Authorization': `Bearer ${this.notionToken}`,
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

    async findPageByTaskFromDatabase(taskId, databaseId) {
        const filter = {filter: {property: 'Task ID', rich_text: {equals: taskId}}};
        const response = await this.#fetchNotionAPI(
            'POST',
            `databases/${databaseId}/query`,
            filter
        );

        const pageId = response?.results?.[0]?.id;
        if (!pageId) {
            throw new Error(`No pages found for task ID "${taskId}". Full response: ${JSON.stringify(response)}`);
        }

        return pageId;
    }

     async updateApprovedBy(pageId, author) {
        const payload ={properties: {"Approved by": {rich_text: [{text: {content: author}}]}}}
        await this.#fetchNotionAPI('PATCH', `pages/${pageId}`, payload);
    }

    async healthcheck() {
        await this.#fetchNotionAPI('GET', 'users/me');
    }
}

module.exports = NotionApiService;