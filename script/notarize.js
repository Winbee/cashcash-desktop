require('dotenv').config({ path: 'ignore_env/.envapple' });
const { notarize } = require('electron-notarize');
const pkg = require('../package.json');
const appBundleId = pkg.name;

exports.default = async function notarizing(context) {
    const { electronPlatformName, appPath } = context;
    if (electronPlatformName !== 'darwin' || true) {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId,
        appPath,
        appleId: process.env.APPLEID,
        appleIdPassword: process.env.APPLEIDPASS,
    });
};
