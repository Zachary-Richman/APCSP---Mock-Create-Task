# Todo

* webui
* algo
* train and generate clues/questions
* frontend and backend integration
* generate sample boards?

- Sort all the words by length, descending. 
- Take the first word and place it on the board.
- Take the next word.
- Search through all the words that are already on the board and see if there are any possible intersections (any common letters) with this word.
5. If there is a possible location for this word, loop through all the words that are on the board and check to see if the new word interferes.
6. If this word doesn't break the board, then place it there and go to step 3, otherwise, continue searching for a place (step 4).
7. Continue this loop until all the words are either placed or unable to be placed.

* At the end of generating a crossword, give it a score based on how many of the words were placed (the more the better), how large the board is (the smaller the better), and the ratio between height and width (the closer to 1 the better). Generate a number of crosswords and then compare their scores and choose the best one.
* Instead of running an arbitrary number of iterations, I've decided to create as many crosswords as possible in an arbitrary amount of time. If you only have a small word list, then you'll get dozens of possible crosswords in 5 seconds. A larger crossword might only be chosen from 5-6 possibilities.
* When placing a new word, instead of placing it immediately upon finding an acceptable location, give that word location a score based on how much it increases the size of the grid and how many intersections there are (ideally you'd want each word to be crossed by 2-3 other words). Keep track of all the positions and their scores and then choose the best one.