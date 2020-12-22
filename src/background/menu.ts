import { Menu, app } from 'electron';

const setDefaultApplicationMenu = (createHelpWindow: () => void) => {
    const edit = {
        label: 'Edit',
        submenu: [
            {
                role: 'undo',
            },
            {
                role: 'redo',
            },
            {
                type: 'separator',
            },
            {
                role: 'cut',
            },
            {
                role: 'copy',
            },
            {
                role: 'paste',
            },
            {
                role: 'pasteandmatchstyle',
            },
            {
                role: 'selectall',
            },
        ],
    };
    const view = {
        label: 'View',
        submenu: [
            {
                role: 'reload',
            },
            {
                role: 'forcereload',
            },
            {
                type: 'separator',
            },
            {
                role: 'resetzoom',
            },
            {
                role: 'zoomin',
            },
            {
                role: 'zoomout',
            },
            {
                type: 'separator',
            },
            {
                role: 'togglefullscreen',
            },
        ],
    };

    if (process.env.NODE_ENV !== 'production') {
        view.submenu.push({ role: 'toggledevtools' });
    }

    const windowMenu = {
        role: 'window',
        submenu: [
            {
                role: 'minimize',
            },
            {
                role: 'close',
            },
        ],
    };

    const helpMenu = {
        role: 'help',
        submenu: [
            {
                label: 'Documentation',
                click() {
                    createHelpWindow();
                },
            },
        ],
    };

    const template = [edit, view, windowMenu, helpMenu];

    if (process.platform === 'darwin') {
        const name = app.name;
        template.unshift({
            label: name,
            submenu: [
                {
                    role: 'about',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'services',
                    submenu: [],
                },
                {
                    type: 'separator',
                },
                {
                    role: 'hide',
                },
                {
                    role: 'hideothers',
                },
                {
                    role: 'unhide',
                },
                {
                    type: 'separator',
                },
                {
                    role: 'quit',
                },
            ],
        } as any);

        template[3].submenu = [
            {
                role: 'close',
            },
            {
                role: 'minimize',
            },
            {
                role: 'zoom',
            },
            {
                type: 'separator',
            },
            {
                role: 'front',
            },
        ];
    } else {
        template.unshift({
            label: 'File',
            submenu: [
                {
                    role: 'quit',
                },
            ],
        });
    }

    const menu = Menu.buildFromTemplate(template as any[]);
    Menu.setApplicationMenu(menu);
};

export default setDefaultApplicationMenu;
