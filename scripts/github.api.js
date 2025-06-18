class GitHubApi {
    GITHUB_API = 'https://api.github.com/'
 
    async #fetchAPI(method, endpoint, body = null) {
        const response = await fetch(`${ this.GITHUB_API }/${ endpoint }`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });

        if ( !response.ok ) {
            const errorBody = await response.text();
            throw new Error(`GitHub API error: ${ response.status } ${ response.statusText } — ${ errorBody }`);
        }

        return response.json();
    }

    async getUser(username) {
        return this.#fetchAPI('GET', 'users/' + username);
    }
}

module.exports = GitHubApi;