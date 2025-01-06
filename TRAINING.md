# Using Google Vertex to Generate The Questions

> ### Important Links
> 1. [Doshea — All NYT Crosswords](https://github.com/doshea/nyt_crosswords)
> 2. [Google Cloud - Vertex AI](https://console.cloud.google.com/vertex-ai/studio/freeform)


### Step 1: Cleaning the data
`git clone https://github.com/doshea/nyt_crosswords  # Download the crosswords`

Upon downloading Doshea's collection of all NYT crosswords, we need to get it into a format usable for Gemini.

We need to combine and map objects to each other in the following format: `{word: clue}`


## Code to clean up the data

`
{
    "contents": [
        {
        "role": "user",
        "parts": [
        {
        "text": "Your input prompt here"
        }
        ]
        },
        {
        "role": "model",
        "parts": [
        {
        "text": "Expected model response here"
        }
        ]
        }
    ]
}
`


## GCP Routing

1. Go to [Google Cloud Console](https://console.cloud.google.com/vertex-ai)
2. Under `VERTEX AI STUDIO` go to `Tuning`
3. For this project, I'm using 1.5 pro due to its larger context size
4. If you need a JSONL format, a python script can be found [here](#) to convert the regular JSON to JSONL
5. Upon uploading the file, if you don't already have a bucket, go ahead and create one. I recommend using a single region for performance
6. Click start tuning

## Implementation
We're going to fetch a random word, then feed it to our trained model. After that result we'll append it to our dataset

```shell
npm install @google-cloud/vertexai@latest
gcloud auth application-default login
```