import React, { useState, useEffect } from "react";
import axios from "axios";
import pageData from "./Community.json";
import UI from "./CommunityFormUI.json";

const SERVER_URL = "https://samadhan-zq8e.onrender.com";

function CommunityForm({ selectedTopic, setSelectedTopic, onPostSubmit }) {
  // form state
  const [formData, setFormData] = useState({
    sender: "",
    topic: "",
    content: "",
  });

  // UI text & topics (translated)
  const [uiText, setUiText] = useState(UI);
  const [topics, setTopics] = useState(pageData.page.topics);

  // translation map
  const [translationMap, setTranslationMap] = useState(null);
  console.log(translationMap);

  // helper: deep-translate any object/array/string
  const translateJSON = (obj, map) => {
    if (typeof obj === "string") return map[obj] || obj;
    if (Array.isArray(obj)) return obj.map((o) => translateJSON(o, map));
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, translateJSON(v, map)])
      );
    }
    return obj;
  };

  // 1️⃣ On mount: fetch preferredLanguage, translate UI labels + topics list
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      try {
        // combine UI JSON + topics into one object for translation
        const payload = {
          ui: UI,
          topics: pageData.page.topics,
        };

        const res = await fetch(`${SERVER_URL}/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonObject: payload,
            targetLang: lang,
          }),
        });

        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => {
          map[source] = target;
        });

        setTranslationMap(map);
        // translate UI labels
        setUiText(translateJSON(UI, map));
        // translate topics array
        setTopics(translateJSON(pageData.page.topics, map));
      } catch (err) {
        console.error("CommunityForm translation error:", err);
      }
    })();
  }, []);

  // 2️⃣ Pre-fill sender
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (stored?._id) {
      setFormData((prev) => ({ ...prev, sender: stored._id }));
    }
  }, []);

  // 3️⃣ Sync `topic` field with parent’s selectedTopic
  useEffect(() => {
    if (selectedTopic) {
      setFormData((prev) => ({ ...prev, topic: selectedTopic }));
    }
  }, [selectedTopic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    if (name === "topic") {
      setSelectedTopic(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/community`,
        formData
      );
      alert(uiText.successAlert);
      if (onPostSubmit) onPostSubmit(res.data);
      setFormData((f) => ({ ...f, topic: "", content: "" }));
      setSelectedTopic("");
    } catch (err) {
      console.error("Error submitting post:", err);
      alert(uiText.failureAlert);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg h-[80vh] overflow-hidden"
    >
      <div >
        <img
          src="/assets/images/Community.jpg"
          alt="Banner"
          className="w-full h-40 object-cover p-2 rounded-t-2xl"
        />
      </div>

      <div className="p-4 space-y-4">
        <select
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
        >
          <option value="">
            {uiText.selectTopicPlaceholder}
          </option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <textarea
          name="content"
          rows="4"
          placeholder={uiText.contentPlaceholder}
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none"
        />

        <button
          type="submit"
          className="w-full bg-[#d1a76e] text-black py-2 rounded-lg hover:scale-105 hover:shadow-xl transition"
        >
          {uiText.submitText}
        </button>
      </div>
    </form>
  );
}

export default CommunityForm;
