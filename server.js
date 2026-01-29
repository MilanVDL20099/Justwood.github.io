const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const logPath = path.join(__dirname, 'logs.json');

// --- 1. THE LOGGER MIDDLEWARE ---
// This runs on EVERY request before anything else happens
app.use((req, res, next) => {
    const visitorData = {
        timestamp: new Date().toLocaleString(),
        ip: req.ip || req.headers['x-forwarded-for'] || "127.0.0.1",
        userAgent: req.get('User-Agent'),
        path: req.path
    };

    let logs = [];

    // 1. Check if file exists
    if (fs.existsSync(logPath)) {
        try {
            const fileContent = fs.readFileSync(logPath, 'utf8');
            // 2. Only parse if there's actually something in the file
            logs = fileContent ? JSON.parse(fileContent) : [];
        } catch (parseError) {
            console.log("Found a messy log file, resetting it...");
            logs = []; // If JSON is corrupted, we just reset to an empty list
        }
    }

    // 3. Add the new visit and save
    logs.push(visitorData);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    console.log(`Log carved for: ${visitorData.path}`);
    next();
});

// --- 2. SERVE THE SITE ---
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Woody Cabin is open on http://localhost:${PORT}`);
    console.log(`Logging to: ${logPath}`);
});