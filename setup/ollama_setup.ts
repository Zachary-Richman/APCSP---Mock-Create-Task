// prompt credits go to @pisuthd on GitHub
import ollama from 'ollama';


const generate_words = async (types: string, topic: string, totalWords: number): Promise<Array<string>>  =>{
	const prompt: string = `You're an AI agent and can only answer in a single string JSON array generate ${totalWords} words of ${types} in ${topic} that no longer than 10 characters and choose a one word that easy to place the first on the crossword grid and put on the first item`;

	const response = await ollama.chat({
		model: 'llama3.1',
		messages: [{ role: 'user', content: prompt }]
	});

	return JSON.parse(response.message.content);
}	


const generate_clues = async (words: Array<string>): Promise<Array<string>> =>{
	const prompt: string = `You're an AI agent and can only answer in a single string JSON array and from the list ${String(words)} return the clue for crossword game for all items, the string must be in this format "this is a clue"`
	
	const response = await ollama.chat({
		model: 'llama3.1',
		messages: [{ role: 'user', content: prompt }]
	});

	return JSON.parse(response.message.content);
}


const generate_all = async (): Promise<void> =>{
	
}
		
