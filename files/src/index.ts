/*
* index.ts
*/
import * as fs from 'fs'; // import file system supports


import { readFile } from 'node:fs';

const filePath: string = 'C:\\capstone\\files\\test'; // Use double backslashes for Windows paths

readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string | undefined) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
