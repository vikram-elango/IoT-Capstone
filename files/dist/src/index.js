"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const filePath = 'C:\\capstone\\files\\test'; // Use double backslashes for Windows paths
(0, node_fs_1.readFile)(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});
//# sourceMappingURL=index.js.map