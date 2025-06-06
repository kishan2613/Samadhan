import React, { useState, useEffect } from "react";
import Hero from "./Hero";
import content from "./Community.json";
import MessageBar from "./MessageBar";
import CommunityForm from "./CommunityForm";
import CommunityList from "./CommunityList";
import axios from "axios";

const SERVER_URL = "http://localhost:5000";

export default function Community() {
  // UI text (title & subtitle) and translation map
  const [uiText, setUiText] = useState(content.page);
  const [translationMap, setTranslationMap] = useState(null);

  // Selected topic & fetched posts
  const [selectedTopic, setSelectedTopic] = useState("");
  const [posts, setPosts] = useState([]);

  // Helper to deep‐translate any object/array of strings
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

  // 1️⃣ On mount: translate static UI text (title & subtitle)
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: content.page, targetLang: lang }),
        });
        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => {
          map[source] = target;
        });
        setTranslationMap(map);
        setUiText(translateJSON(content.page, map));
      } catch (err) {
        console.error("Community UI translation error:", err);
      }
    })();
  }, []);

  // 2️⃣ Whenever selectedTopic or translationMap changes: fetch & translate posts
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    const fetchAndTranslate = async () => {
      try {
        // fetch raw posts
        const url = selectedTopic
          ? `${SERVER_URL}/api/community?topic=${encodeURIComponent(selectedTopic)}`
          : `${SERVER_URL}/api/community`;
        const res = await axios.get(url);
        let fetched = res.data;

        // if we have a translationMap and user chose a language, translate fetched posts
        if (lang && translationMap) {
          const translateRes = await fetch(`${SERVER_URL}/translate/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonObject: fetched,
              targetLang: lang,
            }),
          });
          const translateData = await translateRes.json();
          const outputs = translateData.pipelineResponse?.[0]?.output || [];
          const postMap = {};
          outputs.forEach(({ source, target }) => {
            postMap[source] = target;
          });
          fetched = translateJSON(fetched, postMap);
        }

        setPosts(fetched);
      } catch (err) {
        console.error("Community posts error:", err);
      }
    };

    fetchAndTranslate();
  }, [selectedTopic, translationMap]);

  // Handler for new post submissions
  const handlePostSubmit = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <h1 className="text-4xl font-bold text-gray-900">{uiText.title}</h1>
      <h2 className="mt-4 text-lg text-gray-700 max-w-2xl">{uiText.subTitle}</h2>
      <div className="flex flex-row justify-start w-full px-4 md:px-20">
        <div className="mt-8 w-1/3">
          <Hero />
        </div>
        <div className="mt-8 w-2/3 mr-8">
          <MessageBar
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
          />
          <div className="flex flex-row w-full h-3/4 mx-auto shadow-lg rounded-lg overflow-hidden">
            <div className="flex-1 h-3/4 w-2/3 overflow-y-auto bg-[#e5ddd5] p-3">
              <CommunityList selectedTopic={selectedTopic} posts={posts} />
            </div>
            <div className="border-t w-1/3 bg-gray-100 p-2">
              <CommunityForm
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                onPostSubmit={handlePostSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
