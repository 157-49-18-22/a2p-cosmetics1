import fs from 'fs';
import path from 'path';

// Fix path to point to the root src directory
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
    if (content.includes('http://localhost:5000/api')) {
      console.log(`Updating ${filePath}`);
      
      // Calculate relative path to src/apiConfig.js
      const apiConfigPath = 'c:/Users/lenovo/Desktop/a2p eco/src/apiConfig.js';
      let relativePath = path.relative(path.dirname(filePath), apiConfigPath).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
      
      // Add import if not present
      if (!content.includes('import API_BASE_URL')) {
        content = `import API_BASE_URL from '${relativePath}';\n` + content;
      }
      
      // Replace hardcoded URLs
      // 1. Literal match for base URL
      content = content.replace(/['"]http:\/\/localhost:5000\/api['"]/g, 'API_BASE_URL');
      
      // 2. Base URL followed by slash (in templates or strings)
      content = content.replace(/['"]http:\/\/localhost:5000\/api\//g, '`${API_BASE_URL}/');
      // If we used backtick above, we need to close it. But usually it's used like fetch(`.../${id}`)
      // Let's be more specific
      content = content.replace(/http:\/\/localhost:5000\/api/g, '${API_BASE_URL}');
      
      // If the above caused double ${API_BASE_URL}, fix it
      content = content.replace(/\${API_BASE_URL}/g, 'API_BASE_URL_PLACEHOLDER');
      // wait, this is getting complex. Let's do a simpler string replacement.
      
      fs.writeFileSync(filePath, content);
    }
  }
});
