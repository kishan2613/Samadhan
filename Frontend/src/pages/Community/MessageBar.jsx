import React, { useState } from "react";
import content from "./Community.json";

export default function MessageBar({ selectedTopic, setSelectedTopic }) {
  const [search, setSearch] = useState("");
  const { search: searchData, topics } = content.page;

  return (
    <div className="p-4 bg-[#d6c6b8] shadow rounded-md">
      {/* Search Bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchData.placeholder}
          className="flex-1 mr-4 px-10 py-2 border rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 text-black bg-[#d1a76e] hover:scale-105 hover:shadow-xl rounded-3xl ">
          {searchData.buttonText}
        </button>
      </div>

      {/* Scrollable Topics Buttons */}
      <div className="mt-4 overflow-x-auto scrollbar-hide">
        <div className="flex justify-around space-x-2 w-full">
          {topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => setSelectedTopic(topic)}
              className={`whitespace-nowrap px-4 py-1 rounded-full text-sm  transition
                ${
                  selectedTopic === topic
                    ? "bg-[#87311e] text-white"
                    : "bg-[#d1a76e] text-grey-50 hover:scale-105 hover:shadow-xl"
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
