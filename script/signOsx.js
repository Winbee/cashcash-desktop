const sign = require('electron-osx-sign');
const path = require('path');
const notarizing = require('./notarize');
const yargs = require('yargs');

const projectPath = `/Users/samuel_gagnepain/projects/perso/cashcash-desktop`;

// MAC
// const appPath = `${projectPath}/dist_electron_pro/mac/Cashcash.app`;
// MAS-DEV
// const appPath = `${projectPath}/dist_electron_pro/mas-dev/Cashcash.app`;
// MAS
// const appPath = `${projectPath}/dist_electron_pro/mas/Cashcash.app`;
// MANUAL
const appPath = `${projectPath}/dist_electron_pro_manual/Cashcash.app`;

const pkgPath = `${projectPath}/dist_electron_pro/Cashcash.pkg`;
const platform = `mas`;

var argv = yargs.boolean(['dev']).argv;

const dev = argv.dev;
if (dev) {
    console.log('DEV MODE ON...');
} else {
    console.log('PROD MODE ON...');
}

const PARENT_PLIST_PATH = `${projectPath}/entitlements_pro/default.entitlements.mas.plist`;
const PROVISIONING_PROFILE = `${projectPath}/ignore_env/Cashcashpro_App_store_Old_way.provisionprofile`;
const PROVISIONING_DEV_PROFILE = `${projectPath}/ignore_env/Cashcashpro_Development_Old_way.provisionprofile`;

const signApp = () => {
    const signOpts = {
        app: appPath,
        platform,
        hardenedRuntime: false,
        'gatekeeper-assess': false,
        strict: false,
        binaries: [
            // path.join(appPath, './Contents/Resources/app.asar.unpacked/node_modules/sqlite3/build/Release/node_sqlite3.node'),
            path.join(
                appPath,
                './Contents/Resources/app.asar.unpacked/node_modules/sqlite3/lib/binding/electron-v7.1-darwin-x64/node_sqlite3.node',
            ),
            path.join(
                appPath,
                './Contents/Resources/app.asar.unpacked/node_modules/sqlite3/lib/binding/node-v64-darwin-x64/node_sqlite3.node',
            ),
        ],
        // 'pre-auto-entitlements': false,
        // identity: `Developer ID Application:`,
    };

    if (platform === 'mas') {
        signOpts.entitlements = PARENT_PLIST_PATH;
    }

    if (platform === 'mas' && !dev) {
        signOpts['provisioning-profile'] = PROVISIONING_PROFILE;
        signOpts.type = 'distribution';
    } else {
        signOpts['provisioning-profile'] = PROVISIONING_DEV_PROFILE;
        signOpts.type = 'development';
    }

    const flatOpts = {
        app: appPath,
        platform,
        hardenedRuntime: true,
        strict: false,
        pkg: pkgPath,
    };

    console.log('Mac: Signing app...', JSON.stringify(signOpts, ' ', 4));

    let signProm = sign.signAsync(signOpts);

    if (platform === 'mas' && !dev) {
        signProm = signProm.then(() => sign.flatAsync(flatOpts));
    }

    return signProm.then(() => {
        console.log('Mac: Signed app.');
        if (platform === 'mas' && !dev) {
            notarizing.default({
                appPath,
                electronPlatformName: platform,
            });
        }
    });
};

signApp();
