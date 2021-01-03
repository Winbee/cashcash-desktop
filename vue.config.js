const webpack = require('webpack');
const path = require('path');
process.env.CASHCASH_APP_VERSION = require('./package.json').version;

module.exports = {
    productionSourceMap: false,
    pluginOptions: {
        electronBuilder: {
            externals: ['typeorm', 'sqlite3'],
            nodeModulesPath: ['./node_modules'],
            nodeIntegration: true,
            chainWebpackRendererProcess: (config) => {
                const svgRule = config.module.rule('svg');
                svgRule.exclude.add(path.join(__dirname, './src/renderer/common/icons')).end();

                const svgSpriteRule = config.module.rule('svg-sprite');
                svgSpriteRule
                    .test(/\.svg$/)
                    .include.add(path.join(__dirname, './src/renderer/common/icons'))
                    .end()
                    // Even create named uses (loaders)
                    .use('svg-sprite-loader')
                    .loader('svg-sprite-loader')
                    .options({
                        symbolId: 'icon-[name]',
                    });

                config.module
                    .rule('scss')
                    .oneOf('vue-modules')
                    .use('sass-loader')
                    .tap((options) => {
                        return {
                            ...options,
                            sourceMap: true,
                            sourceMapContents: false,
                        };
                    });

                config.module
                    .rule('scss')
                    .oneOf('vue-modules')
                    .use('resolve-url-loader')
                    .loader('resolve-url-loader')
                    .before('sass-loader');

                config.module
                    .rule('scss')
                    .oneOf('vue')
                    .use('sass-loader')
                    .tap((options) => {
                        return {
                            ...options,
                            sourceMap: true,
                            sourceMapContents: false,
                        };
                    });

                config.module
                    .rule('scss')
                    .oneOf('vue')
                    .use('resolve-url-loader')
                    .loader('resolve-url-loader')
                    .before('sass-loader');

                config.module
                    .rule('scss')
                    .oneOf('normal-modules')
                    .use('sass-loader')
                    .tap((options) => {
                        return {
                            ...options,
                            sourceMap: true,
                            sourceMapContents: false,
                        };
                    });

                config.module
                    .rule('scss')
                    .oneOf('normal-modules')
                    .use('resolve-url-loader')
                    .loader('resolve-url-loader')
                    .before('sass-loader');

                config.module
                    .rule('scss')
                    .oneOf('normal')
                    .use('sass-loader')
                    .tap((options) => {
                        return {
                            ...options,
                            sourceMap: true,
                            sourceMapContents: false,
                        };
                    });

                config.module
                    .rule('scss')
                    .oneOf('normal')
                    .use('resolve-url-loader')
                    .loader('resolve-url-loader')
                    .before('sass-loader');
            },
            builderOptions: {
                productName: 'Cashcash',
                appId: 'net.gagnepain.cashcashpro',
                copyright: 'Copyright © 2020 Samuel Gagnepain',
                asar: true,
                asarUnpack: '**/*.node',
                extraResources: ['build/icons/*'],
                mac: {
                    target: ['dmg'],
                    category: 'public.app-category.finance',
                    electronLanguages: ['en'],
                    hardenedRuntime: false,
                    gatekeeperAssess: false,
                    extendInfo: {
                        ElectronTeamID: 'LY2Q92GW3C',
                    },
                },
                win: {
                    rfc3161TimeStampServer:
                        'http://sha256timestamp.ws.symantec.com/sha256/timestamp',
                    icon: './public/favicon.ico',
                    target: [
                        'appx',
                        {
                            target: 'nsis',
                            arch: 'x64',
                        },
                    ],
                    extraFiles: [
                        {
                            from: 'build-win/Cashcash.VisualElementsManifest.xml',
                            to: '.',
                        },
                    ],
                    extraResources: ['build-win/icons/*'],
                    legalTrademarks: 'Copyright © 2020 Samuel Gagnepain',
                },
                appx: {
                    applicationId: 'SamuelGagnepain.cashcash',
                    identityName: '26898SamuelGagnepain.cashcash',
                    publisher: 'CN=E312FF34-57FD-468E-94EF-BAF2F24566A7',
                    backgroundColor: '#505ec2',
                    showNameOnTiles: 'true',
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                },
                linux: {
                    category: 'Office',
                    target: 'AppImage',
                },
            },
        },
    },
    transpileDependencies: ['vue-echarts/components', 'resize-detector'],
};
