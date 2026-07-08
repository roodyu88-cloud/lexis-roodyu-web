const fs = require('fs');
const https = require('https');

// Read .env manually
const envPath = '.env';
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match && match[1]) {
        apiKey = match[1].trim().replace(/['"]/g, '');
    }
}

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

// Fetch models
https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log("Response:", json);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
}).on('error', err => {
    console.error("Request error:", err);
});
