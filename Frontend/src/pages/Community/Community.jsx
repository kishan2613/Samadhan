import Hero from "./Hero";
import content from "./Community.json";
import MessageBar from "./MessageBar";
import CommunityForm from "./CommunityForm";
import CommunityList from "./CommunityList";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Community() {
  const { title, subTitle } = content.page;

  const [selectedTopic, setSelectedTopic] = useState("");
  const [posts, setPosts] = useState([]);

  // Fetch initial posts when component mounts or selectedTopic changes
  useEffect(() => {
    async function fetchPosts() {
      try {
        // Assuming your API supports filtering by topic as a query param
        const url = selectedTopic
          ? `http://localhost:5000/api/community?topic=${selectedTopic}`
          : `http://localhost:5000/api/community`;

        const res = await axios.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    fetchPosts();
  }, [selectedTopic]);

  // Callback to add new post immediately after submission
  const handlePostSubmit = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  return (
    <div className="flex flex-col  text-center">  
      <div>
          <MessageBar selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />        
      </div>             
        <div className="flex flex-row w-full  mx-auto shadow-lg rounded-lg overflow-hidden">
            <div className="flex-1   w-2/3 overflow-y-auto bg-[url('/assets/images/Assistant-Bg.png')] bg-cover p-3">
              <CommunityList selectedTopic={selectedTopic} posts={posts} />
            </div>
            <div className="border-t w-1/3 bg-gray-100 p-2">
              <CommunityForm
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                onPostSubmit={handlePostSubmit}  // <-- pass callback here
              />
            </div>
        </div>   
    </div>
  );
}
