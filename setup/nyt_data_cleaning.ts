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