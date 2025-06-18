const { run, main } = require('./update-notion-approved-by');
const utils = require('./utils');

const runFunc = jest.fn();
const mockNotionApiServiceInstance = {
    healthCheck: jest.fn(),
    findPageByTaskFromDatabase: jest.fn(),
    updatePageWithProperty: jest.fn()
};
const mockNotionApiService = jest.fn().mockImplementation(() => mockNotionApiServiceInstance);

const mockedEnvs = {
    MR_TITLE: 'feat(TT-123): test',
    MR_AUTHOR: 'john.doe',
    NOTION_SECRET: 'secret',
    NOTION_DATABASE_ID: 'mock_db'
};

const mockedCredentials = {
    author: 'john.doe',
    databaseId: 'mock_db',
    mergeRequestTitle: 'feat(TT-123): test'
};

describe('update notion `approval to production` field', () => {

    describe('Error first cases', () => {

        describe('`main` function', () => {

            beforeEach(() => {
                jest.clearAllMocks();
            })

            const requiredEnvs = [ 'MR_TITLE', 'MR_AUTHOR', 'NOTION_SECRET', 'NOTION_DATABASE_ID' ];

            requiredEnvs.forEach((key) => {
                it(`should throw error if ${ key } is not defined`, async () => {
                    const envs = { ...mockedEnvs, [key]: undefined };

                    await expect(main(envs, { runFunc, NotionApiService: mockNotionApiService }))
                        .rejects
                        .toThrow(`Missing required ENV variable: ${ key }`);
                });
            });


        })

        describe('`run` function', () => {
            it('should throw error on healthCheck reject', async () => {
                mockNotionApiServiceInstance.healthCheck = jest.fn().mockRejectedValue(new Error('Notion API is down'));

                await expect(run({
                    notionApi: mockNotionApiServiceInstance,
                    credentials: mockedCredentials
                })).rejects.toThrow('Notion API is down');

                mockNotionApiServiceInstance.healthCheck.mockReset();
            })

            it('should throw error when findPageByTaskFromDatabase rejects', async () => {
                mockNotionApiServiceInstance.findPageByTaskFromDatabase = jest.fn().mockRejectedValue(new Error('Notion API is down'));

                await expect(run({
                    notionApi: mockNotionApiServiceInstance,
                    credentials: mockedCredentials
                })).rejects.toThrow('Notion API is down');
                mockNotionApiServiceInstance.findPageByTaskFromDatabase.mockReset();
            })

            it('should throw error where updateApprovedBy rejects', async () => {
                mockNotionApiServiceInstance.updatePageWithProperty = jest.fn().mockRejectedValue(new Error('Notion API is down'));

                await expect(run({
                    notionApi: mockNotionApiServiceInstance,
                    credentials: mockedCredentials
                })).rejects.toThrow('Notion API is down');

                mockNotionApiServiceInstance.updatePageWithProperty.mockReset();
            })
        })
    });

    describe('Success cases', () => {
        describe('`main` function', () => {
            it('should get ENV variables for each', async () => {
                const getEnvOrThrowSpy = jest.spyOn(utils, 'getEnvOrThrow').mockImplementation((env, key) => {
                    return {
                        MR_TITLE: 'feat(PROJ-123): update',
                        MR_AUTHOR: 'alice',
                        NOTION_SECRET: 'token',
                        NOTION_DATABASE_ID: 'db123',
                    }[key];
                });
                await main(mockedEnvs, { run: runFunc, NotionApi: mockNotionApiService });
                expect(getEnvOrThrowSpy).toHaveBeenCalledWith(mockedEnvs, 'MR_TITLE');
            })
        })

        describe('`run` function', () => {

            // it('')

            it('should call console message as final step', async () => {
                jest.spyOn(utils, 'parseTicketId').mockReturnValue('ticketMock');
                const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {
                });
                await run({ notionApi: mockNotionApiServiceInstance, credentials: mockedEnvs });
                expect(logSpy).toHaveBeenCalled();
            });
        })
    })
});
