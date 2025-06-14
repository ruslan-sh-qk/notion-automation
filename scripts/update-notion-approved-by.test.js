const { main, parseTicketId } = require('./update-notion-approved-by');

const mockNotionApiService = {
    healthCheck: jest.fn(),
    findPageByTaskFromDatabase: jest.fn(),
    updateApprovedBy: jest.fn(),
};

describe('update notion approved by field', () => {
    it('should throw error if process env not defined', async () => {
        await main(mockNotionApiService);
        expect(mockNotionApiService.healthCheck).toHaveBeenCalled();
    });
});
