import { Board } from './new_algo';
import { word_clue_pair } from './setup/nyt_data_cleaning'
import fs from 'node:fs';


function seedBoard(wordArray, GRID_WIDTH, GRID_HEIGHT) {
    const gameBoard = new Board(GRID_WIDTH, GRID_HEIGHT);
    gameBoard.generateBoard(wordArray, GRID_WIDTH, GRID_HEIGHT);
    gameBoard.displayGrid();

    console.log("Clues and Locations:");
    gameBoard.activeWordList.forEach(wordObj => {
        console.log(`Number: ${wordObj.number}`);
        console.log(`Word: ${wordObj.word}`);
        console.log(`Clue: ${wordObj.clue}`);
        console.log(`Location: (${wordObj.x}, ${wordObj.y})`);
        console.log(`Orientation: ${wordObj.vertical ? "Vertical" : "Horizontal"}`); // threw in a luh ternary
        console.log("--------\n");
    });
}

const rawData = fs.readFileSync('./setup/dataset.json');
const data = JSON.parse(String(rawData));
const len: number = data.length;

let wordArray: Array<word_clue_pair> = []

for(let i: number = 0; i < 15; i++){
    const num: number = Math.floor(Math.random() * len);
    wordArray.push(data[num]);
}

seedBoard(wordArray, 15, 15);
// params to generate board.