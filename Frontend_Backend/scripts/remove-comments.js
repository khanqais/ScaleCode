const fs = require('fs');
const path = require('path');

const targetDirs = ['src', 'scripts'];

function removeComments(content) {
    
    
    
    
    const regex = /("(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|`(?:[^`\\]|\\.)*`)|(\/\*[\s\S]*?\*\/)|(\/\/.*)/gm;

    return content.replace(regex, (match, group1, group2, group3) => {
        if (group1) {
            return match; 
        }
        if (group2 || group3) {
             return "";
        }
        return match;
    });
}

function processFile(fullPath) {
    if (!fs.existsSync(fullPath)) return;
    
    // Only process code files
    if (!/\.(ts|tsx|js|jsx|css|mjs)$/.test(fullPath)) return;

    // Optional: skip self if you want to keep this script's comments, 
    // but the user said "remove all comments" so we process everything.
    
    console.log(`Processing ${fullPath}...`);
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = removeComments(content);
    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
    }
}

function traverseDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (stat.isFile()) {
            processFile(fullPath);
        }
    }
}

console.log('Starting comment removal...');


targetDirs.forEach(d => traverseDir(path.join(process.cwd(), d)));


const root = process.cwd();
const rootItems = fs.readdirSync(root);
for (const item of rootItems) {
    const fullPath = path.join(root, item);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
        processFile(fullPath); 
    }
}

console.log('Done.');
