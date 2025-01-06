import {StreamGenerateContentResult} from "@google-cloud/vertexai";

const {VertexAI} = require('@google-cloud/vertexai');

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: '<projectname>', location: '<location>'});
const model = '<modelname>';


// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
        maxOutputTokens: 8192,
        temperature: 1,
        topP: 0.95,
    },
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'OFF',
        }
    ],
});



export const sendMessage = async (message): Promise<string> =>{
    const chat = generativeModel.startChat({});
    const streamResult: StreamGenerateContentResult = await chat.sendMessageStream(message);
    return JSON.stringify((await streamResult.response).candidates[0].content);
}