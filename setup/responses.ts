/*
    LOOP{
        get word
        send to model
        take response
        package it and append it
    }
 */
import { sendMessage } from "./training";
import {promises as fs} from 'node:fs';

interface word_clue_pair{
    word: string,
    clue: string
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const get_random_word = async (): Promise<string> =>{
    // returns a random word as a string
    try{
        const url: string = "https://random-word-api.herokuapp.com/word";
        const response: Response = await fetch(url);
        return response.json();


    } catch (err){
        console.error("Error fetching the random word API: " + String(err))
    }
}


const main = async (word_count: number): Promise<Array<word_clue_pair>> =>{
    let container_arr: Array<word_clue_pair> = []

    for(let i: number = 0; i < word_count; i++){
        const word: string = await get_random_word();

        const resp: string = await sendMessage(word);

        const pair: word_clue_pair = {
            word: word,
            clue: resp
        }

        container_arr.push(pair);
        console.log(pair);
        await sleep(60000); // im way to lazy to write a backoff, this project is a month overdue
    }

    return container_arr;
}

main(250)
    .then(async (result: Array<word_clue_pair>): Promise<void> => {
        const filePath: string = "word_clue_pairs.json";
        await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
        console.log(`Word-clue pairs saved to ${filePath}`);
    })
    .catch((err) => console.error("Error in main function: ", err));
