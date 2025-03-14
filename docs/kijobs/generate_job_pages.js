const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const mdConverter = new showdown.Converter();

// Load the JSON data
const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Load the HTML template
const suffixes =  ["", "_en"];

suffixes.forEach(suffix => {
    const templatePath = path.join(__dirname, `templates/template${suffix}.html`);

    fs.readFile(templatePath, 'utf8', (err, template) => {
        if (err) {
            console.error("Error reading the template:", err);
            return;
        }

        // Iterate over each job entry in the JSON
        jsonData.forEach(entry => {
            const jobKey = entry.job.replace(/\s+/g, '_'); // Replace spaces to avoid issues in filenames
            const jobKeyEn = entry.jobEnglish.replace(/\s+/g, '_'); // Replace spaces to avoid issues in filenames


            // Create the output HTML by replacing placeholders in the template
            let outputHtml = template;
            Object.keys(entry).forEach(key => {
                let text = String(entry[key]);
                if (key.includes("Reasoning")) {
                    text =  mdConverter.makeHtml(text);
                }
                outputHtml = outputHtml.replace(new RegExp(`{{ ${key} }}`, 'g'), text);
            });
            outputHtml = outputHtml.replace(new RegExp(`{{ jobKey }}`, 'g'), jobKey);
            outputHtml = outputHtml.replace(new RegExp(`{{ jobKeyEn }}`, 'g'), jobKeyEn);


            // Define the output path
            const outputDir = path.join(__dirname, 'jobs');
            let outputPath = path.join(outputDir, `${jobKey}.html`);
            if (suffix === "_en") {
                outputPath = path.join(outputDir, `${jobKeyEn}${suffix}.html`);
            }

            // Write the output HTML file
            fs.mkdirSync(outputDir, { recursive: true }); // Ensure the output directory exists
            fs.writeFile(outputPath, outputHtml, err => {
                if (err) {
                    console.error("Error writing the file:", err);
                } else {
                    console.log(`Generated: ${outputPath}`);
                }
            });
        });
    });
});