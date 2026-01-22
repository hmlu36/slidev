const fs = require('fs');
const path = require('path');

// Helper to get next Friday
function getNextFriday() {
    const d = new Date();
    const dayOfWeek = 5; // Friday is 5
    const diff = (dayOfWeek + 7 - d.getDay()) % 7;
    d.setDate(d.getDate() + diff);

    // If today is Friday, move to next week
    if (d.getDay() === dayOfWeek && diff === 0) {
        d.setDate(d.getDate() + 7);
    }
    return d;
}

// Format date as YYYYMMDD and YYYY
const nextFriday = getNextFriday();
const year = nextFriday.getFullYear();
const month = String(nextFriday.getMonth() + 1).padStart(2, '0');
const day = String(nextFriday.getDate()).padStart(2, '0');
const dateStr = `${year}${month}${day}`;
const slashDate = `${year}/${month}/${day}`;

const targetDir = path.join(__dirname, '..', 'pages', String(year));
const targetFile = path.join(targetDir, `${dateStr}.md`);
const mainFile = path.join(__dirname, '..', 'main.md');

const args = process.argv.slice(2);
const lyricsDir = path.join(__dirname, '..', 'pages', 'lyrics');

console.log(`Targeting: ${targetFile}`);

// 1. Create file if not exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(targetFile)) {
    console.log('File already exists. Updating main.md only.');
    updateMainFile(); // Call updateMainFile here as well if file exists
} else {
    // Determine songs: use args if provided, else defaults
    let songs = args;
    if (songs.length === 0) {
        songs = ['祢是我的一切', '永活盼望', '我要愛慕祢'];
    }

    // Pre-fetch all available lyric files for fuzzy search
    let availableLyrics = [];
    try {
        availableLyrics = fs.readdirSync(lyricsDir).filter(f => f.endsWith('.md'));
    } catch (e) {
        console.error(`Error reading lyrics directory: ${e.message}`);
    }

    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

    const processSongs = async () => {
        let slidesContent = '';

        for (const songName of songs) {
            let fileName = songName;
            if (!fileName.endsWith('.md')) {
                fileName += '.md';
            }

            const possiblePath = path.join(lyricsDir, fileName);

            if (fs.existsSync(possiblePath)) {
                console.log(`[FOUND] Lyric file: ${fileName}`);
                slidesContent += `---
src: ../lyrics/${fileName}
---
`;
            } else {
                console.log(`[NOT FOUND] Lyric file: ${fileName}`);

                // Fuzzy search
                const searchKey = songName.replace('.md', '');
                const suggestions = availableLyrics.filter(f => f.includes(searchKey));

                if (suggestions.length > 0) {
                    console.log(`    Possible matches:`);
                    suggestions.forEach((s, index) => console.log(`      ${index + 1}. ${s}`));

                    const answer = await askQuestion(`    Select a song (1-${suggestions.length}) or press Enter to keep "${fileName}": `);
                    const selectionIndex = parseInt(answer) - 1;

                    if (!isNaN(selectionIndex) && selectionIndex >= 0 && selectionIndex < suggestions.length) {
                        const selectedFile = suggestions[selectionIndex];
                        console.log(`    => Using: ${selectedFile}`);
                        slidesContent += `---
src: ../lyrics/${selectedFile}
---
`;
                    } else {
                        console.log(`    => Keeping original: ${fileName}`);
                        slidesContent += `---
src: ../lyrics/${fileName}
---
`;
                    }
                } else {
                    console.log(`    No partial matches found. Using original.`);
                    slidesContent += `---
src: ../lyrics/${fileName}
---
`;
                }
            }
        }

        rl.close();

        const content = `${slidesContent}`;
        fs.writeFileSync(targetFile, content);
        console.log(`Created ${targetFile}`);
    };

    processSongs().then(() => {
        updateMainFile();
    });
}

function updateMainFile() {
    // 2. Update main.md
    let mainContent = fs.readFileSync(mainFile, 'utf-8');

    // Regex to find the src line: src: ./pages/YYYY/YYYYMMDD.md
    const newSrcLine = `src: ./pages/${year}/${dateStr}.md`;
    const srcRegex = /^src: .*$/m;

    if (srcRegex.test(mainContent)) {
        mainContent = mainContent.replace(srcRegex, newSrcLine);

        const dateCommentRegex = /^ # \d{4}\/\d{2}\/\d{2}$/m;
        if (dateCommentRegex.test(mainContent)) {
            mainContent = mainContent.replace(dateCommentRegex, ` # ${slashDate}`);
        }

        fs.writeFileSync(mainFile, mainContent);
        console.log(`Updated main.md to point to ${dateStr}.md`);
    } else {
        console.error('Could not find "src: ..." line in main.md');
    }
}
// End of script
