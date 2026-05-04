const fs = require('fs');
const text = fs.readFileSync('test-output-new.txt', 'utf16le');
const lines = text.split('\n');
let printNext = false;
let exceptionBlock = [];

for (let line of lines) {
    if (line.includes('=== GENERATE EXCEPTION ===')) {
        printNext = true;
        exceptionBlock = [];
        continue;
    }
    if (line.includes('==========================') && printNext) {
        printNext = false;
        console.log("== MATCHED BLOCK ==");
        console.log(exceptionBlock.join('\n'));
        console.log("===================");
        continue;
    }
    if (printNext) {
        exceptionBlock.push(line);
    }
}
