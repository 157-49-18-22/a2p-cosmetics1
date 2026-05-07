import fs from 'fs';
import path from 'path';

const srcDir = 'c:/Users/lenovo/Desktop/a2p eco/src';

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
    
    // 1. Fix the template start with single quote end
    // fetch(`API_BASE_URL_PLACEHOLDER/path', -> fetch(`${API_BASE_URL}/path`,
    if (content.includes('API_BASE_URL_PLACEHOLDER')) {
        // Handle the specific mess I made
        content = content.replace(/`API_BASE_URL_PLACEHOLDER\/([^'"]+)['"]/g, '`${API_BASE_URL}/$1`');
        // Handle any remaining placeholders
        content = content.replace(/API_BASE_URL_PLACEHOLDER/g, 'API_BASE_URL');
        
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned up ${filePath}`);
    }
  }
});
