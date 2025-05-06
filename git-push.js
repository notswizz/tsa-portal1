#!/usr/bin/env node

/**
 * Enhanced script for committing and pushing to GitHub
 * Usage: node git-push.js "Your commit message here"
 * 
 * Features:
 * - Status check before commit
 * - Option to commit only specific files
 * - Check for uncommitted changes
 * - Error handling
 */

const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to execute git commands and handle errors
function runGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`\n❌ Error executing: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Get current branch
function getCurrentBranch() {
  return runGitCommand('git symbolic-ref --short HEAD').trim();
}

// Check if there are any changes to commit
function hasChanges() {
  const status = runGitCommand('git status --porcelain');
  return status.length > 0;
}

// Main function
async function main() {
  // Check if a commit message was provided
  const commitMessage = process.argv[2];
  if (!commitMessage) {
    console.error('❌ Error: Please provide a commit message');
    console.error('Usage: node git-push.js "Your commit message here"');
    process.exit(1);
  }

  // Check for changes
  if (!hasChanges()) {
    console.log('ℹ️ No changes detected. Nothing to commit.');
    process.exit(0);
  }

  // Show current status
  console.log('\n📄 Current git status:');
  console.log(runGitCommand('git status --short'));

  // Ask for confirmation
  rl.question('Do you want to continue with the commit? (y/n): ', (answer) => {
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Commit cancelled.');
      rl.close();
      process.exit(0);
    }

    rl.question('Would you like to commit all changes or specific files? (all/specific): ', (commitType) => {
      if (commitType.toLowerCase() === 'specific') {
        rl.question('Enter files to commit (space-separated): ', (files) => {
          const fileList = files.trim();
          if (fileList) {
            console.log(`\n🔍 Adding specific files: ${fileList}`);
            runGitCommand(`git add ${fileList}`);
          } else {
            console.log('\n❌ No files specified. Exiting.');
            rl.close();
            process.exit(0);
          }
          completeCommitAndPush();
        });
      } else {
        // Add all files
        console.log('\n🔍 Adding all changed files...');
        runGitCommand('git add .');
        completeCommitAndPush();
      }
    });
  });

  function completeCommitAndPush() {
    // Commit changes
    console.log(`\n💾 Committing with message: "${commitMessage}"`);
    runGitCommand(`git commit -m "${commitMessage}"`);

    // Get current branch
    const currentBranch = getCurrentBranch();

    // Ask for confirmation before pushing
    rl.question(`Push to ${currentBranch}? (y/n): `, (confirmPush) => {
      if (confirmPush.toLowerCase() === 'y' || confirmPush.toLowerCase() === 'yes') {
        console.log(`\n⬆️ Pushing to branch: ${currentBranch}...`);
        runGitCommand(`git push origin ${currentBranch}`);
        console.log('\n✅ Successfully pushed changes to GitHub!');
      } else {
        console.log('\nChanges committed but not pushed.');
      }
      rl.close();
    });
  }
}

// Run the script
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
}); 