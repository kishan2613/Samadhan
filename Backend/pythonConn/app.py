from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json

app = Flask(__name__)

# Load sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load FAISS index and data
index = faiss.read_index("semantic_index/index.faiss")
texts = json.load(open("semantic_index/texts.json", encoding="utf-8"))
meta = json.load(open("semantic_index/metadata.json", encoding="utf-8"))

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Empty question"}), 400

    # Encode and search
    q_emb = model.encode([question], convert_to_numpy=True)
    faiss.normalize_L2(q_emb)

    k = 5  # top-k results
    scores, indices = index.search(q_emb, k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        results.append({
            "score": float(score),
            "text": texts[idx],
            "source": meta[idx]
        })

    return jsonify({
        "question": question,
        "results": results
    })

if __name__ == "__main__":
     app.run(debug=True, port=5001, use_reloader=False)
