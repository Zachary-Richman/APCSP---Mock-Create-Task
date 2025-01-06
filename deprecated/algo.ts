export class Algorithm{
    words_across: Array<[string]>
    words_down: Array<[string]>

    constructor(words_across: Array<[string]>, words_down: Array<[string]>){
        this.words_across  = words_across;
        this.words_down = words_down;
    }

    sort = (): void =>{
        // Sorts in descending order (top to bottom)
        this.words_across.sort(
            (
                a: [string],
                b: [string]
            ) => b.length - a.length
        );

        this.words_down.sort(
            (
                a: [string],
                b: [string]
            ) => b.length - a.length
        );
    }

    shuffle = (array: Array<string>): Array<string> =>{
        for (let i: number = array.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    pad_verticals = (max_height: number = 12): void =>{
        // changes the words_down value

        let padding_arr: Array<number> = [];

        for(let i: number = 0; i < this.words_down.length; i++){
            const padding: number = Math.floor(
                Math.random() * (max_height - this.words_down[i].length)
            );
            padding_arr.push(padding);
        }

        // padStart & padEnd

        for(let padding: number = 0; padding < padding_arr.length; padding++){
            const val = padding_arr[padding];
            let temp: Array<string> = [];

            for(let pad_left = 0; pad_left < val; pad_left++){
                temp.push("#");
            }

            // combine w/ word
            temp = [...temp, ...this.words_down[padding]];

            for(let pad_right = 0; pad_right < (max_height - this.words_down[padding].length - padding_arr[padding]); pad_right++){
                temp.push("#");
            }

            this.words_down[padding] = temp;
        }
    }

    transpose = (matrix: Array<[string]>) => matrix[0].map((col, i) => matrix.map(row => row[i]));

    play = (): void =>{
        this.sort(); // sorts all values in descending values

        // shuffle words vertically
        // noinspection TypeScriptValidateTypes
        this.words_down = this.shuffle(this.words_down);

        this.pad_verticals();

        this.words_down = this.transpose(this.words_down);
        console.log(this.words_down);
    }
}