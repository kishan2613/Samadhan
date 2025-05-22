import React, { useState, useEffect } from "react";
import axios from "axios";
import pageData from "./Community.json";

function CommunityForm({ selectedTopic, setSelectedTopic, onPostSubmit }) {
  const [formData, setFormData] = useState({
    sender: "",
    topic: "",
    content: "",
  });
  const topics = pageData.page.topics;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setFormData((prev) => ({ ...prev, sender: storedUser._id }));
    }
  }, []);

  // Sync formData.topic with selectedTopic prop from parent
  useEffect(() => {
    if (selectedTopic) {
      setFormData((prev) => ({ ...prev, topic: selectedTopic }));
    }
  }, [selectedTopic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "topic") {
      setSelectedTopic(value); // Sync topic change to parent
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/community", formData);
      alert("Post submitted successfully!");
      
      // Notify parent with the new post to update list instantly
      if (onPostSubmit) onPostSubmit(res.data);

      setFormData((prev) => ({ ...prev, topic: "", content: "" }));
      setSelectedTopic(""); // reset selected topic in parent
    } catch (err) {
      console.error("Error submitting post:", err);
      alert("Failed to submit post");
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
          <option value="">Select a topic</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <textarea
          name="content"
          rows="4"
          placeholder="Write your message..."
          value={formData.content}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none"
        />

        <button
          type="submit"
          className="w-full bg-[#d1a76e] text-black py-2 rounded-lg hover:scale-105 hover:shadow-xl transition"
        >
          Submit
        </button>
      </div>
    </form>
  );
}

export default CommunityForm;
