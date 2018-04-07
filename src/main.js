const {
	app,
	BrowserWindow,
	ipcMain
} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let indexWindow = {};
let modifyWindow;
const debug = /--debug|--inspect-brk/.test(process.argv[2]);

function createIndexWindow(width, height, view) {
	// Create the browser window.
	indexWindow = new BrowserWindow({
		width: width,
		height: height
	});

	// and load the index.html of the app.
	indexWindow.loadURL(url.format({
		pathname: path.join(__dirname, view),
		protocol: 'file:',
		slashes: true
	}));

	// Launch fullscreen with DevTools open, usage: npm run debug
	if (debug) {
		indexWindow.webContents.openDevTools();
		//mainWindow.maximize();
		require('devtron').install();
	}

	// mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
	// 	if (frameName === 'modal') {
	// 		// open window as modal
	// 		Object.assign(options, {
	// 			modal: false,
	// 			parent: mainWindow
	// 		});
	// 		event.newGuest = new BrowserWindow(options);
	// 	}
	// });

	// Emitted when the window is closed.
	indexWindow.on('closed', (obj) => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		indexWindow = null;
	});
}

function createModifyWindow(width, height, view) {
	// Create the browser window.
	modifyWindow = new BrowserWindow({
		width: width,
		height: height,
		parent: indexWindow,
		modal: false,
		show: false
	});

	// and load the index.html of the app.
	modifyWindow.loadURL(url.format({
		pathname: path.join(__dirname, view),
		protocol: 'file:',
		slashes: true
	}));

	// Launch fullscreen with DevTools open, usage: npm run debug
	if (debug) {
		modifyWindow.webContents.openDevTools();
		//mainWindow.maximize();
		require('devtron').install();
	}

	// Emitted when the window is closed.
	modifyWindow.on('close', ev => {
		ev.preventDefault();
		modifyWindow.hide();
	});
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
	createIndexWindow(1024, 768, 'index.html');
	createModifyWindow(800, 600, 'modify.html');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	//if (process.platform !== 'darwin') {
	app.quit();
	//}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (!indexWindow) {
		createIndexWindow(1024, 768, 'index.html');
	}
});

ipcMain.on('modify', (event, arg) => {
	modifyWindow.webContents.send('open-message', arg);
	modifyWindow.show();
	console.log(JSON.stringify(arg));
});

ipcMain.on('main-message', (event, arg) => {
	console.log(arg); // prints "ping"
	event.sender.send('main-reply', 'pong');
});

ipcMain.on('modify-save-complete', (event, arg) => {
	indexWindow.webContents.send('reload', arg);
	console.log(arg);
});

ipcMain.on('index-refresh-complete', (event, arg) => {
	modifyWindow.hide();
	console.log(arg);
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.