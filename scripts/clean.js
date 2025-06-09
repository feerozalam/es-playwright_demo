const fs = require('fs');
const path = require('path');

function cleanDirectory(directory) {
    if (fs.existsSync(directory)) {
        console.log(`Cleaning directory: ${directory}`);
        fs.readdirSync(directory).forEach((file) => {
            const currentPath = path.join(directory, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                cleanDirectory(currentPath);
            } else {
                console.log(`Removing file: ${currentPath}`);
                fs.unlinkSync(currentPath);
            }
        });
    } else {
        console.log(`Directory does not exist: ${directory}`);
    }
}

// Clean test results directory
const testResultsDir = path.join(__dirname, '..', 'test-results');
const dirs = [
    path.join(testResultsDir, 'screenshots'),
    path.join(testResultsDir, 'videos'),
    path.join(testResultsDir, 'logs')
];

// Create directories if they don't exist
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Clean existing files
dirs.forEach(dir => {
    cleanDirectory(dir);
});

// Remove cucumber report if it exists
const cucumberReport = path.join(testResultsDir, 'cucumber-report.html');
if (fs.existsSync(cucumberReport)) {
    console.log(`Removing report: ${cucumberReport}`);
    fs.unlinkSync(cucumberReport);
}
