import React, { useState, useEffect } from "react";
import Hero from "./Hero";
import content from "./Community.json";
import MessageBar from "./MessageBar";
import CommunityForm from "./CommunityForm";
import CommunityList from "./CommunityList";
import axios from "axios";
import { motion } from "framer-motion";

const SERVER_URL = "http://localhost:5000";

export default function Community() {
  const [uiText, setUiText] = useState(content.page);
  const [translationMap, setTranslationMap] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [posts, setPosts] = useState([]);

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

  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    const fetchAndTranslate = async () => {
      try {
        const url = selectedTopic
          ? `${SERVER_URL}/api/community?topic=${encodeURIComponent(selectedTopic)}`
          : `${SERVER_URL}/api/community`;
        const res = await axios.get(url);
        let fetched = res.data;

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

  const handlePostSubmit = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-[#f5f0eb] to-[#d7c7b9]
 py-10 px-4 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          {uiText.title}
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          {uiText.subTitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto w-full max-w-7xl"
      >
        <MessageBar
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
        />

        <div className="mt-6 flex flex-col md:flex-row gap-6">
          {/* Posts Section */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 h-[70vh] overflow-y-auto border border-gray-200">
            <CommunityList selectedTopic={selectedTopic} posts={posts} />
          </div>

          {/* Form Section */}
          <div className="w-full md:w-1/3 bg-gray-50 rounded-xl shadow-md p-4 border border-gray-300">
            <CommunityForm
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              onPostSubmit={handlePostSubmit}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
