## For Mr. Giese

The main files to look at are `./setup/nyt_data_cleaning.ts` and `./new_algo.ts`. I have linked them below, but taking a look at all other utilized files might help in terms of context.

`./setup/nyt_data_cleaning.ts`

```js
/*
    THIS FILE WAS USED FOR CLEANING THE DATASET TO BECOME USABLE.
 */


import fs from 'node:fs';
const { promisify } = require('node:util');

export interface config {
    directory: string;
    start_year: number;
    end_year: number;
}

export interface word_clue_pair {
    word: string,
    clue: string
}

export const CONFIG = {
    directory: "../nyt_crosswords/",
    start_year: 1976,
    end_year: 2018
};

const initializeDataset = async () => {
    const readFile = promisify(fs.readFile);
    const writeFile = promisify(fs.writeFile);

    try {
        let jsonData: Buffer = await readFile('./dataset.json');
        if (!jsonData.trim()) {
            throw new Error('Empty file');
        }
        JSON.parse(String(jsonData)); // To validate JSON (throws err if can't process)
    } catch (error) {
        console.warn("Initializing dataset.json as it is missing or invalid.");
        await writeFile('./dataset.json', JSON.stringify([], null, 2));
    }
};


const get_all_days = async (path: string): Promise<number> => {
    const readdir = promisify(fs.readdir);
    try {
        const days: Array<string> = await readdir(path);
        return days.length;
    } catch (error) {
        console.error(`Error reading directory at ${path}:`, error);
        return 0; // Return 0 days to allow processing to continue :)
    }
};

const readfile = async (path: string): Promise<object | null> => {
    const readFile = promisify(fs.readFile);
    try {
        const output = await readFile(path);
        return JSON.parse(String(output));
    } catch (error) {
        console.error(`Error reading or parsing file at ${path}:`, error);
        return null; // Return null to indicate failure
    }
};

const update_file = async (json_data: string): Promise<void> => {
    const readFile = promisify(fs.readFile);
    const writeFile = promisify(fs.writeFile);

    try {
        let jsonData: Buffer = await readFile('./dataset.json');
        let parsedData = JSON.parse(String(jsonData));
        parsedData.push(JSON.parse(json_data));

        await writeFile('./dataset.json', JSON.stringify(parsedData, null, 2));
    } catch (error) {
        console.error(`Error updating dataset.json:`, error);
    }
};

const main = async (CONFIG: config): Promise<void> => {
    for (let year: number = CONFIG.start_year; year < CONFIG.end_year; year++) {
        for (let month: number = 1; month <= 12; month++) { // Fixed month loop range
            const month_key: string = month.toString().padStart(2, "0");
            let path: string = `${CONFIG.directory}/${String(year)}/${String(month_key)}`;

            const days: number = await get_all_days(path);
            if (days === 0) continue; // Skip this month if no days found

            for (let day: number = 1; day <= days; day++) { // Fixed day loop range
                const new_day: string = day.toString().padStart(2, "0");
                const filePath = `${path}/${new_day}.json`;

                const json_resp: object | null = await readfile(filePath);
                if (!json_resp) continue; // Skip this day if file read fails

                try {
                    const words: Array<string> = [...json_resp["answers"]["across"], ...json_resp["answers"]["down"]];
                    const clues: Array<string> = [...json_resp["clues"]["across"], ...json_resp["clues"]["down"]];

                    for (let i: number = 0; i < words.length; i++) {
                        const input: string = words[i];
                        const output: string = clues[i].split(/ (.+)/)[1]; // remove the numbers (gets spaces)

                        const json: string = JSON.stringify({
                            word: input,
                            clue: output
                        });

                        console.log(json);
                        await update_file(json);
                    }
                } catch (error) {
                    console.error(`Error processing data for ${filePath}:`, error);
                }
            }
        }
    }
};

if (require.main === module) {
    (async (): Promise<void> => {
        try {
            await initializeDataset();
            await main(CONFIG);
        } catch (error) {
            console.error("Critical error in main execution:", error);
        }
    })();
}
```

<hr>

`./new_algo.ts`

```ts
/*
    THE BOARD CREATION ALGORITHM
 */

interface wordList {
    number: number,
    clue: any,
    x: any,
    y: any,
    vertical: any,
    word: any
}


export class Board {
    public cols: number;
    public rows: number;

    grid: { indexDisplay: string; value: string; targetChar: string }[][];
    activeWordList: Array<wordList>;
    acrossCount: number;
    downCount: number;

    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = this.initializeGrid(cols, rows);
        this.activeWordList = [];
        this.acrossCount = 0;
        this.downCount = 0;
    }

    initializeGrid = (cols, rows) => {
        const empty_char = ""; // Define a default empty character

        return Array.from({length: cols}, () =>
            Array.from({length: rows}, () => ({
                targetChar: empty_char,
                indexDisplay: "",
                value: "-"
            }))
        );
    }

    suggestCoords = (word, GRID_WIDTH, GRID_HEIGHT): Array<any> => {
        const coordList = [];
        for (let i = 0; i < word.length; i++) {
            for (let x = 0; x < GRID_HEIGHT; x++) {
                for (let y = 0; y < GRID_WIDTH; y++) {
                    if (this.grid[x][y].targetChar === word[i]) {
                        if (x - i + word.length - 1 < GRID_HEIGHT) {
                            coordList.push({x: x - i, y, vertical: true, score: 0});
                        }
                        if (y - i + word.length - 1 < GRID_WIDTH) {
                            coordList.push({x, y: y - i, vertical: false, score: 0});
                        }
                    }
                }
            }
        }
        return coordList;
    }

    checkFitScore = (word, x, y, vertical, GRID_WIDTH, GRID_HEIGHT): number => {
        // scoring logic
        const EMPTYCHAR: string = "";
        let fitScore: number = 1;

        for (let i: number = 0; i < word.length; i++) {
            const xi = vertical ? x + i : x;
            const yi = vertical ? y : y + i;

            if (xi < 0 || xi >= GRID_HEIGHT || yi < 0 || yi >= GRID_WIDTH) {
                return 0;
            }

            const cell = this.grid[xi][yi];
            if (cell.targetChar === word[i]) {
                fitScore++;
            } else if (cell.targetChar !== EMPTYCHAR) {
                return 0;
            }
        }

        return fitScore;
    }

    placeWord = (word, clue, x, y, vertical, GRID_WIDTH, GRID_HEIGHT): boolean => {
        if (
            (vertical && x + word.length > GRID_HEIGHT) ||
            (!vertical && y + word.length > GRID_WIDTH)
        ) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {
            const xi = vertical ? x + i : x;
            const yi = vertical ? y : y + i;
            this.grid[xi][yi].targetChar = word[i];
        }

        const newWord: wordList = {
            word,
            clue,
            x,
            y,
            vertical,
            number: vertical ? ++this.downCount : ++this.acrossCount
        };

        this.activeWordList.push(newWord);
        return true;
    }

    isActiveWord = (word) => {
        return this.activeWordList.some(activeWord => activeWord[word] === word);
    }

    displayGrid = (): void => {
        console.table(
            this.grid.map(row => row.map(cell => cell.targetChar || "-"))
        );
    }

    generateBoard = (wordArray, GRID_WIDTH, GRID_HEIGHT, FIT_ATTEMPTS: number = 2): void => {
        for (let seed = 0; seed < FIT_ATTEMPTS; seed++) {
            this.placeWord(wordArray[seed].word, wordArray[seed].clue, 0, 0, false, GRID_WIDTH, GRID_HEIGHT);

            for (const wordObj of wordArray.slice(1)) {
                if (this.isActiveWord(wordObj.word)) continue;

                const coordList = this.suggestCoords(wordObj.word, GRID_WIDTH, GRID_HEIGHT);
                let topScore = 0;
                let bestCoord = null;

                for (const coord of coordList) {
                    const score = this.checkFitScore(
                        wordObj.word,
                        coord.x,
                        coord.y,
                        coord.vertical,
                        GRID_WIDTH,
                        GRID_HEIGHT
                    );

                    if (score > topScore) {
                        topScore = score;
                        bestCoord = coord;
                    }
                }

                if (topScore > 1 && bestCoord) {
                    this.placeWord(
                        wordObj.word,
                        wordObj.clue,
                        bestCoord.x,
                        bestCoord.y,
                        bestCoord.vertical,
                        GRID_WIDTH,
                        GRID_HEIGHT
                    );
                }
            }
        }
    }
}
```
