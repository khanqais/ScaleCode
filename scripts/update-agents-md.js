#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Auto-update AGENTS.md files after git commits
 * Scans all AGENTS.md files in the project and updates their RECENT CHANGES section
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findAllAgentsMd(dir = '.') {
  const agentsFiles = [];
  
  function scanDir(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        // Skip node_modules, .git, and other common directories
        if (entry.isDirectory()) {
          if (!['node_modules', '.git', '.next', 'dist', 'build', '.cache'].includes(entry.name)) {
            scanDir(fullPath);
          }
        } else if (entry.isFile() && entry.name === 'AGENTS.md') {
          agentsFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanDir(dir);
  return agentsFiles;
}

function getRecentChanges() {
  try {
    // Get files changed in the last commit
    const changedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim().split('\n').filter(Boolean);
    
    if (changedFiles.length === 0) {
      return null;
    }
    
    // Get file stats (line counts)
    const fileStats = changedFiles.map(file => {
      try {
        const fullPath = path.resolve(file);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n').length;
          return {
            name: path.basename(file),
            path: file,
            lines: lines
          };
        }
      } catch (error) {
        // File might have been deleted or is binary
      }
      return null;
    }).filter(Boolean);
    
    return fileStats;
  } catch (error) {
    log('Warning: Could not get git changes. This might be the first commit.', 'yellow');
    return null;
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateAgentsMd(filePath, recentChanges) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const currentDate = getCurrentDate();
    
    // Check if file has RECENT CHANGES section
    const recentChangesRegex = /## RECENT CHANGES \(Updated: \d{4}-\d{2}-\d{2}\)\s*\n\s*\n### Modified Files:(.*?)(?=\n##|\n\n##|$)/s;
    
    if (!recentChanges || recentChanges.length === 0) {
      // No changes to update
      return false;
    }
    
    // Build new RECENT CHANGES section
    const fileList = recentChanges
      .map(f => `- **${f.name}** (${f.lines} lines)`)
      .join('\n');
    
    const newSection = `## RECENT CHANGES (Updated: ${currentDate})

### Modified Files:
${fileList}
`;
    
    if (recentChangesRegex.test(content)) {
      // Update existing section
      content = content.replace(recentChangesRegex, newSection);
    } else {
      // Add new section after the first heading (# PROJECT KNOWLEDGE BASE or similar)
      const firstHeadingRegex = /(#[^\n]+\n(?:\*\*[^\n]+\*\*\s*\n)*)/;
      if (firstHeadingRegex.test(content)) {
        content = content.replace(firstHeadingRegex, `$1\n${newSection}\n`);
      } else {
        // Prepend if no heading found
        content = `${newSection}\n${content}`;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    log(`Error updating ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('\n📝 Scanning for AGENTS.md files...', 'cyan');
  
  const agentsFiles = findAllAgentsMd('.');
  
  if (agentsFiles.length === 0) {
    log('No AGENTS.md files found in the project.', 'yellow');
    process.exit(0);
  }
  
  log(`Found ${agentsFiles.length} AGENTS.md file(s):`, 'bright');
  agentsFiles.forEach(f => log(`  - ${f}`, 'blue'));
  
  log('\n🔍 Getting recent changes from git...', 'cyan');
  const recentChanges = getRecentChanges();
  
  if (!recentChanges || recentChanges.length === 0) {
    log('No recent changes detected.', 'yellow');
    process.exit(0);
  }
  
  log(`Found ${recentChanges.length} changed file(s):`, 'bright');
  recentChanges.forEach(f => log(`  - ${f.name} (${f.lines} lines)`, 'blue'));
  
  log('\n✏️  Updating AGENTS.md files...', 'cyan');
  let updatedCount = 0;
  
  for (const agentsFile of agentsFiles) {
    log(`\nProcessing: ${agentsFile}`, 'bright');
    
    // Determine if this AGENTS.md should be updated based on proximity to changed files
    const agentsDir = path.dirname(agentsFile);
    const relevantChanges = recentChanges.filter(change => {
      // Check if changed file is in the same directory tree as this AGENTS.md
      const changePath = path.resolve(change.path);
      const agentsDirPath = path.resolve(agentsDir);
      
      // Root AGENTS.md gets all changes
      if (agentsFile === './AGENTS.md' || agentsFile === '.\\AGENTS.md') {
        return true;
      }
      
      // Subdirectory AGENTS.md only get changes from their tree
      return changePath.startsWith(agentsDirPath);
    });
    
    if (relevantChanges.length === 0) {
      log('  ⏭️  No relevant changes for this file', 'yellow');
      continue;
    }
    
    const updated = updateAgentsMd(agentsFile, relevantChanges);
    
    if (updated) {
      log('  ✅ Updated successfully', 'green');
      updatedCount++;
    } else {
      log('  ⚠️  No changes needed', 'yellow');
    }
  }
  
  log(`\n🎉 Update complete! ${updatedCount} file(s) updated.\n`, 'green');
  
  if (updatedCount > 0) {
    log('💡 Tip: Review the changes with:', 'cyan');
    log('   git diff **/AGENTS.md\n', 'bright');
  }
}

// Run the script
main();
