const replaceInFiles = require('replace-in-files');

async function replace(options) {
    try {
        const { countOfMatchesByPaths } = await replaceInFiles(options);
        console.log('Count of matches by paths:', countOfMatchesByPaths.length);
    } catch (error) {
        console.log('Error occurred:', error);
    }
}

async function main() {
    if (process.env.SENTRY_DSN_CHANGE_ME) {
        console.log('Replacing SENTRY_DSN_CHANGE_ME string');
        const options = {
            files: 'src/main.ts',
            from: /SENTRY_DSN_CHANGE_ME/g,
            to: process.env.SENTRY_DSN_CHANGE_ME,
        };

        await replace(options);
    }

    if (process.env.GA_CHANGE_ME) {
        console.log('Replacing GA_CHANGE_ME string');
        const options = {
            files: 'src/main.ts',
            from: /GA_CHANGE_ME/g,
            to: process.env.GA_CHANGE_ME,
        };

        await replace(options);
    }
}

main();
