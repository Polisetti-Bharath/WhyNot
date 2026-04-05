import fs from 'fs';
import path from 'path';

const walkSync = (dir: string, filelist: string[] = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch {}
  });
  return filelist;
};
const allFiles = walkSync('src').map(f => f.replace(/\\/g, '/'));
const rootFiles = fs
  .readdirSync('.')
  .filter(f => fs.statSync(f).isFile() && !f.startsWith('.'))
  .map(f => f.replace(/\\/g, '/'));
const inventory = [...rootFiles, ...allFiles].sort();
console.log(inventory.join('\n'));
