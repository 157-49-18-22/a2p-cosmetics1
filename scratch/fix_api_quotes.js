import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/lenovo/Desktop/a2p eco/src';
const apiConfigPath = 'c:/Users/lenovo/Desktop/a2p eco/src/apiConfig.js';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk(srcDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the mess: replace the broken placeholders and mismatched quotes
    // Match something like `API_BASE_URL_PLACEHOLDER/path'
    // or `API_BASE_URL_PLACEHOLDER/path"
    let updated = false;
    
    // Replace broken templates
    if (content.includes('API_BASE_URL_PLACEHOLDER')) {
        content = content.replace(/`API_BASE_URL_PLACEHOLDER\/([^'"]+)['"]/g, '`${API_BASE_URL}/$1`');
        content = content.replace(/API_BASE_URL_PLACEHOLDER/g, 'API_BASE_URL');
        updated = true;
    }
    
    // Fix double imports or missing imports
    if (content.includes('API_BASE_URL') && !content.includes('import API_BASE_URL')) {
        let relativePath = path.relative(path.dirname(filePath), apiConfigPath).replace(/\\/g, '/');
        if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
        content = `import API_BASE_URL from '${relativePath}';\n` + content;
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${filePath}`);
    }
  }
});
