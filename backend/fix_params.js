const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src/routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert req.params.xxx to String(req.params.xxx)
    const regex = /req\.params\.([a-zA-Z0-9_]+)/g;

    // We only replace if it's not already wrapped in String() or something similar
    // For safety, let's just replace exact occurrences that are standalone.
    // Actually, simply appending ` as string` is valid in TS anywhere.
    // Replace `req.params.id` with `(req.params.id as string)`
    let updated = content.replace(regex, '(req.params.$1 as string)');

    if (updated !== content) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated ${file}`);
    }
});
