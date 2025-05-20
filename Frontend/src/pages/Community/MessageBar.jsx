import React, { useState } from "react";
import content from "./Community.json";

export default function MessageBar({ selectedTopic, setSelectedTopic }) {
  const [search, setSearch] = useState("");
  const { search: searchData, topics } = content.page;

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
