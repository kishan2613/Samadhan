import React, { useState, useEffect } from "react";
import content from "./Community.json";

const SERVER_URL = "http://localhost:5000";

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
    <div className="p-4 bg-white shadow rounded-md">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchData.placeholder}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          {searchData.buttonText}
        </button>
      </div>

      {/* Scrollable Topics Buttons */}
      <div className="mt-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 w-max">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => setSelectedTopic(topic)}
              className={`whitespace-nowrap px-4 py-1 rounded-full text-sm font-medium transition
                ${
                  selectedTopic === topic
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                }
              `}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
