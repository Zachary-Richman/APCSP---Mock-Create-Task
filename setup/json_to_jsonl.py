import json
import sys

if __name__ == "__main__":
    try:
        with open(sys.argv[1], 'r') as rf:
            data = json.load(rf)

        get_file_name = sys.argv[1].split(".")[0]

        with open(get_file_name + ".jsonl", 'w') as wf:
            for item in data:
                wf.write(json.dumps(item) + "\n")

        print("Successfully converted JSON to JSONL.")
    except Exception as e:
        print("Error converting JSON to JSONL...", e)
        print("\n\nMake sure to pass in argument of file name\n ex: `python3 json_to_jsonl.py dataset.json`")
