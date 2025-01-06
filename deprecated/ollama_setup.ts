import ollama from 'ollama';
import categories from '../data/crossword_categories.json';
import * as fs from 'fs/promises';

const generate_words = async (types: string, topic: string, totalWords: number): Promise<string[]> => {
	const prompt: string = `You're an AI agent and can only answer in a single string JSON array. Generate ${totalWords} words of ${types} in ${topic} that are no longer than 10 characters. Choose one word that is easy to place first on the crossword grid and put it as the first item.`;

	const response = await ollama.chat({
		model: 'llama3.1',
		messages: [{ role: 'user', content: prompt }]
	});

	return JSON.parse(response.message.content);
};

const generate_clues = async (words: string[]): Promise<string[]> => {
	const prompt: string = `You're an AI agent and can only answer in a single string JSON array. From the list ${JSON.stringify(words)}, return the clue for a crossword game for all items. Each clue must be in this format: "this is a clue"`;

	const response = await ollama.chat({
		model: 'llama3.1',
		messages: [{ role: 'user', content: prompt }]
	});

	return JSON.parse(response.message.content);
};

const generate_all = async (): Promise<void> => {
	for (const category of categories) {
		try {
			const words = await generate_words('nouns', category, 10); // Example: 'nouns' and 10 words.
			const clues = await generate_clues(words);

			const crosswordData = {
				category,
				words,
				clues
			};

			const fileName = `${category.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
			await fs.writeFile(fileName, JSON.stringify(crosswordData, null, 2));
			console.log(`JSON data written to ${fileName} successfully.`);
		} catch (error) {
			console.error(`Error processing category "${category}":`, error);
		}
	}
};

generate_all().catch((err) => console.error("Fatal error:", err));
