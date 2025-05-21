import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MessageCircle, UserCircle } from "lucide-react";
import MeditationFact from "./MeditationFact";

function formatTimestamp(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

// function MeditationFact() {
//   return (
//     <div
//       className="w-full h-[870px] flex items-center justify-center bg-cover bg-center"
//       style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80')` }}
//     >
//       <div className="bg-black bg-opacity-60 p-6 rounded-lg max-w-xl text-center">
//         <h2 className="text-white text-2xl font-semibold mb-4">Meditation Fact</h2>
//         <p className="text-white text-lg italic">
//           “Regular meditation can reduce stress, enhance concentration, and improve overall emotional well-being.”
//         </p>
//       </div>
//     </div>
//   );
// }

function CommunityList({ posts, selectedTopic }) {
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [commentToggle, setCommentToggle] = useState({});
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser._id) {
      setUserId(storedUser._id);
    }
  }, []);

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const toggleComments = (postId) => {
    setCommentToggle((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    if (activePostId !== postId) fetchComments(postId);
    setActivePostId(activePostId === postId ? null : postId);
  };

  const handleCommentSubmit = async (postId) => {
    if (!userId) return alert("User not logged in.");

    try {
      await axios.post("http://localhost:5000/api/comments", {
        communityId: postId,
        commenter: userId,
        commentText: newComment,
      });
      setNewComment("");
      fetchComments(postId);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const filteredPosts = selectedTopic
    ? posts.filter((post) => post.topic === selectedTopic)
    : posts;

  return (
    <div className="flex flex-col gap-6 max-h-[870px] overflow-y-auto">
      {selectedTopic === null || selectedTopic === undefined ? (
        <MeditationFact />
      ) : filteredPosts.length === 0 ? (
        <p className="text-center text-gray-400">No posts found for this topic.</p>
      ) : (
        filteredPosts.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#15202b] text-white p-4 rounded-xl shadow-lg max-w-xl w-full mx-auto relative"
          >
            {/* Timestamp */}
            <p className="text-xs text-gray-400 absolute top-3 right-4">
              {formatTimestamp(post.timestamp)}
            </p>

            <div className="flex items-start gap-3">
              {post.sender?.profileImageUrl ? (
                <img
                  src={post.sender.profileImageUrl}
                  alt="user"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold text-base">
                  {post.sender?.name || "Anonymous"}
                </h3>
                <p className="text-xs text-gray-400">
                  {post.sender?.email || "unknown"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-green-400 font-semibold">{post.topic}</p>
              <p className="text-sm mt-1">{post.content}</p>
            </div>

            <div className="flex gap-6 items-center mt-4">
              <button onClick={() => toggleComments(post._id)}>
                <MessageCircle
                  className={`w-5 h-5 transition ${
                    commentToggle[post._id] ? "text-red-500" : "text-green-400"
                  }`}
                />
              </button>
            </div>

            {/* Comments Section */}
            {activePostId === post._id && (
              <div className="mt-4 bg-[#1e2a38] p-3 rounded-xl">
                <div className="space-y-2 mb-3">
                  {comments[post._id]?.length > 0 ? (
                    comments[post._id].map((comment) => (
                      <div key={comment._id} className="text-sm bg-gray-800 p-2 rounded">
                        <p>{comment.commentText}</p>
                        <span className="text-xs text-gray-400 block mt-1">
                          {comment.commenter?.name || "Anonymous"} (
                          {comment.commenter?.email})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No comments yet.</p>
                  )}
                </div>

                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border px-3 py-2 w-full text-sm rounded bg-gray-900 text-white resize-none"
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  className="bg-green-600 text-white px-4 py-1 text-sm rounded mt-2 hover:bg-green-700"
                >
                  Post Comment
                </button>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}

export default CommunityList;
