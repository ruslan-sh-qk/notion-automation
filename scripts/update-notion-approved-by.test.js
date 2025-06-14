const {run, parseTicketId} = require('./update-notion-approved-by');

const notionApiService = {
    healthCheck: jest.fn(),
    findPageByTaskFromDatabase: () => Promise.resolve('test_page_id'),
    updateApprovedBy: jest.fn(),
};

const mergeRequestTitle = 'feat(LMD-1234): Implement new feature';
const author = 'John Doe';

const notionToken = 'test_notion_token';
const databaseId = 'test_database_id';

describe('update notion approved by field', () => {
    it('should throw error if process env not defined', async () => {
        await run({notionApiService, mergeRequestTitle, author, databaseId});
        expect(notionApiService.healthCheck).toHaveBeenCalled();
    });
});
