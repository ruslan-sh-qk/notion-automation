function parseTicketId(commitMessage) {
    const match = commitMessage.match(/\((\w+-\d+)\)/); // Matches (LMD-1234) or (BUG-5678)
    if ( !match ) {
        throw new Error(`No ticket ID found in: "${ commitMessage }"`);
    }
    return match[1];
}

function getEnvOrThrow(env, key) {
    const val = env[key];
    if ( !val ) {
        throw new Error(`Missing required ENV variable: ${ key }`);
    }
    return val;
}

module.exports = { parseTicketId, getEnvOrThrow }