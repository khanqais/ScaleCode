

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel Deployment for ScaleCode...');


const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: Please run this script from the ScaleCode project root directory');
    process.exit(1);
}

try {
  
    console.log('Installing dependencies...');
    process.chdir('frontend');
    execSync('npm install', { stdio: 'inherit' });

    
    try {
        execSync('vercel --version', { stdio: 'ignore' });
    } catch {
        console.log(' Installing Vercel CLI...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
    }

   
    console.log('Deploying to Vercel...');
    execSync('vercel', { stdio: 'inherit' });

    console.log('Deployment initiated! Check your Vercel dashboard for status.');
    console.log('Don\'t forget to set your environment variables in Vercel dashboard!');
    console.log('See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions');

} catch (error) {
    console.error(' Deployment failed:', error.message);
    process.exit(1);
}