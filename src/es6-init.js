let path = require('path');
let appRoot = path.join(__dirname, '..');

require('electron-compile').init(appRoot, require.resolve('./main'));
