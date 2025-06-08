from flask import Flask, request, jsonify
from dotenv import load_dotenv
from openai import AzureOpenAI
import os
import json

# Initialize Flask app
app = Flask(__name__)

# Load environment variables
load_dotenv()

# Load Azure OpenAI and Azure Search credentials
azure_oai_endpoint = os.getenv("AZURE_OAI_ENDPOINT")
azure_oai_key = os.getenv("AZURE_OAI_KEY")
azure_oai_deployment = os.getenv("AZURE_OAI_DEPLOYMENT")
azure_search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
azure_search_key = os.getenv("AZURE_SEARCH_KEY")
azure_search_index = os.getenv("AZURE_SEARCH_INDEX")

# Initialize Azure OpenAI client
client = AzureOpenAI(
    base_url=f"{azure_oai_endpoint}/openai/deployments/{azure_oai_deployment}/extensions",
    api_key=azure_oai_key,
    api_version="2023-09-01-preview"
)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Empty question"}), 400

    try:
        # Azure Cognitive Search integration
        extension_config = {
            "dataSources": [
                {
                    "type": "AzureCognitiveSearch",
                    "parameters": {
                        "endpoint": azure_search_endpoint,
                        "key": azure_search_key,
                        "indexName": azure_search_index
                    }
                }
            ]
        }

        # Call Azure OpenAI with RAG + data source
        response = client.chat.completions.create(
            model=azure_oai_deployment,
            temperature=0.5,
            max_tokens=1000,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful mediation assistant that provides answers to questions based on the provided data source."
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            extra_body=extension_config
        )

        answer = response.choices[0].message.content

        return jsonify({
            "question": question,
            "results": [
                {
                    "score": None,
                    "text": answer,
                    "source": "Azure OpenAI + Azure Cognitive Search"
                }
            ]
        })

    except Exception as ex:
        return jsonify({"error": str(ex)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001, use_reloader=False)