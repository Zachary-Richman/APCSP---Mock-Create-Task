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

    initializeGrid(cols, rows) {
        const empty_char = ""; // Define a default empty character
        const grid = Array.from({length: cols}, () =>
            Array.from({length: rows}, () => ({
                targetChar: empty_char,
                indexDisplay: "",
                value: "-"
            }))
        );
        return grid;
    }

    suggestCoords(word, GRID_WIDTH, GRID_HEIGHT) {
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

    checkFitScore(word, x, y, vertical, GRID_WIDTH, GRID_HEIGHT) {
        const EMPTYCHAR = "";
        let fitScore = 1;

        for (let i = 0; i < word.length; i++) {
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

    placeWord(word, clue, x, y, vertical, GRID_WIDTH, GRID_HEIGHT) {
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

    isActiveWord(word) {
        return this.activeWordList.some(activeWord => activeWord[word] === word);
    }

    displayGrid() {
        console.table(
            this.grid.map(row => row.map(cell => cell.targetChar || "-"))
        );
    }

    generateBoard(wordArray, GRID_WIDTH, GRID_HEIGHT, FIT_ATTEMPTS = 2) {
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