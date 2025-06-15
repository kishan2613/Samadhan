import React, { useState, useEffect } from "react";
import content from "./Community.json";

const SERVER_URL = "https://samadhan-zq8e.onrender.com";

export default function MessageBar({ selectedTopic, setSelectedTopic }) {
  // raw static UI text and topics
  const { search: rawSearchData, topics: rawTopics } = content.page;

  // translated UI text and topics
  const [searchData, setSearchData] = useState(rawSearchData);
  const [topics, setTopics] = useState(rawTopics);

  // local search input
  const [search, setSearch] = useState("");

  // helper to deep-translate any object/array/string
  const translateJSON = (obj, map) => {
    if (typeof obj === "string") return map[obj] || obj;
    if (Array.isArray(obj)) return obj.map(o => translateJSON(o, map));
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, translateJSON(v, map)])
      );
    }
    return obj;
  };

  // on mount: if preferredLanguage set, translate both UI text and topics
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      try {
        // combine into one payload
        const payload = {
          ui: rawSearchData,
          topics: rawTopics,
        };
        const res = await fetch(`${SERVER_URL}/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: payload, targetLang: lang }),
        });
        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => {
          map[source] = target;
        });

        // apply translation
        setSearchData(translateJSON(rawSearchData, map));
        setTopics(translateJSON(rawTopics, map));
      } catch (err) {
        console.error("MessageBar translation error:", err);
      }
    })();
  }, [rawSearchData, rawTopics]);

 return (
  <div className="p-6 bg-white/60 backdrop-blur-md border border-[#d1bfae] shadow-xl rounded-xl max-w-6xl mx-auto">
    {/* Search Bar */}
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchData.placeholder}
        className="flex-1 w-full px-6 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d1a76e] bg-white shadow-sm transition"
      />
      <button className="px-6 py-2 bg-[#d1a76e] text-white font-medium rounded-full shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200">
        {searchData.buttonText}
      </button>
    </div>

    {/* Scrollable Topics Buttons */}
    <div className="mt-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 min-w-max py-2 px-1">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => setSelectedTopic(topic)}
            className={`whitespace-nowrap px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 shadow-sm ${
              selectedTopic === topic
                ? "bg-[#87311e] text-white"
                : "bg-[#e3c6a0] text-gray-800 hover:bg-[#d9b78f] hover:shadow-md hover:scale-105"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  </div>
);

}
