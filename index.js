const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const version = "1.0.0";
const url = "https://github.com/Daniel4-Scratch/gziptool";

/**
 * Archive multiple files into a single .gz file with metadata.
 * @param {string} outputFile - Output .gz path.
 * @param {string[]} inputFiles - List of input files.
 */
function createCustomGzipArchive(outputFile, inputFiles) {
    const out = fs.createWriteStream(outputFile);
    const gzip = zlib.createGzip();
    const combined = [];

    for (const file of inputFiles) {
        const fileName = path.basename(file);
        const fileBuffer = fs.readFileSync(file);
        const size = fileBuffer.length;
        combined.push(Buffer.from(fileName + "\n"));
        combined.push(Buffer.from(size.toString() + "\n"));
        combined.push(fileBuffer);
    }

    const finalBuffer = Buffer.concat(combined);
    gzip.pipe(out);
    gzip.write(finalBuffer);
    gzip.end();
}

/**
 * Extract files from a custom .gz archive.
 * @param {string} inputFile - Input .gz path.
 * @param {string} outputDir - Output directory.
 */
function extractCustomGzipArchive(inputFile, outputDir) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const compressed = fs.readFileSync(inputFile);
    const decompressed = zlib.gunzipSync(compressed);

    let offset = 0;
    while (offset < decompressed.length) {
        let end = decompressed.indexOf(0x0A, offset); // \n
        if (end === -1) break;
        const fileName = decompressed.slice(offset, end).toString();
        offset = end + 1;

        end = decompressed.indexOf(0x0A, offset);
        const fileSize = parseInt(decompressed.slice(offset, end).toString());
        offset = end + 1;

        const content = decompressed.slice(offset, offset + fileSize);
        offset += fileSize;

        fs.writeFileSync(path.join(outputDir, fileName), content);
    }
}

/**
 * Extracts files into memory from a custom .gz archive.
 * @param {string} inputFile - Input .gz path.
 * @returns {Object} Dictionary with file names and contents.
 */
function extractCustomGzipToMemory(inputFile) {
    const compressed = fs.readFileSync(inputFile);
    const decompressed = zlib.gunzipSync(compressed);

    let offset = 0;
    const files = {};
    while (offset < decompressed.length) {
        let end = decompressed.indexOf(0x0A, offset);
        if (end === -1) break;
        const fileName = decompressed.slice(offset, end).toString();
        offset = end + 1;

        end = decompressed.indexOf(0x0A, offset);
        const fileSize = parseInt(decompressed.slice(offset, end).toString());
        offset = end + 1;

        const content = decompressed.slice(offset, offset + fileSize);
        offset += fileSize;

        files[fileName] = content;
    }

    return files;
}

/**
 * Checks if all given paths are files.
 */
function isListFiles(list) {
    return list.every(f => fs.existsSync(f) && fs.statSync(f).isFile());
}

/**
 * Checks if file is GZip (by header, not just extension).
 */
function isFileGz(file) {
    const header = fs.readFileSync(file, { start: 0, end: 1 });
    return header[0] === 0x1f && header[1] === 0x8b;
}

function main() {
    const args = process.argv.slice(2);
    const now = new Date();
    const timestamp = now.toLocaleString('en-AU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).replace(/[^\d]/g, "-");

    try {
        if (args.length > 2 && args[0] === 'archive') {
            createCustomGzipArchive(args[1], args.slice(2));
        } else if (args.length > 2 && args[0] === 'unarchive') {
            extractCustomGzipArchive(args[1], args[2]);
        } else if (args.length > 0 && isListFiles(args)) {
            createCustomGzipArchive(`archive_${timestamp}.gz`, args);
        } else if (args.length === 1 && isFileGz(args[0])) {
            const base = path.basename(args[0]);
            extractCustomGzipArchive(args[0], `unarchive_${base}`);
        } else if (args.length === 1 && args[0] === 'info') {
            console.log(version);
            console.log(url);
        } else {
            console.log("Invalid arguments");
            console.log("Archive: node gziptool.js archive <output_file> <input_files> ...");
            console.log("Unarchive: node gziptool.js unarchive <input_file> <output_dir>");
        }
    } catch (e) {
        fs.writeFileSync("error.log", e.stack || e.message);
        console.error("An error occurred. See error.log for details.");
    }
}

if (require.main === module) {
    main();
}
