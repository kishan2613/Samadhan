import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MessageCircle, UserCircle } from "lucide-react";
import MeditationFact from "./MeditationFact";
import UI from "./CommunityListUI.json";

function formatTimestamp(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString();
}

function CommunityList({ posts: rawPosts, selectedTopic }) {
  const [uiText, setUiText] = useState(UI);
  const [translationMap, setTranslationMap] = useState(null);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  const [newComment, setNewComment] = useState("");
  const [commentToggle, setCommentToggle] = useState({});
  const [activePostId, setActivePostId] = useState(null);

  const [userId, setUserId] = useState("");
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (stored?._id) setUserId(stored._id);
  }, []);

  // deep-translate helper
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

  // 1️⃣ On mount: translate only the UI labels
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/translate/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonObject: UI, targetLang: lang }),
          }
        );
        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => (map[source] = target));
        setUiText(translateJSON(UI, map));
        setTranslationMap(map);
      } catch (err) {
        console.error("UI translation error:", err);
      }
    })();
  }, []);

  // 2️⃣ Translate posts array whenever rawPosts or translationMap changes
  useEffect(() => {
    if (!translationMap) {
      setPosts(rawPosts);
    } else {
      setPosts(translateJSON(rawPosts, translationMap));
    }
  }, [rawPosts, translationMap]);

  // 3️⃣ Fetch comments AND translate them immediately via API call
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/comments/${postId}`
      );
      let rawComments = res.data;

      // if a preferred language is set, call translate API on the comments payload
      const lang = localStorage.getItem("preferredLanguage");
      if (lang && rawComments.length) {
        const translateRes = await fetch(
          "http://localhost:5000/translate/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonObject: rawComments,
              targetLang: lang,
            }),
          }
        );
        const tdata = await translateRes.json();
        const outputs = tdata.pipelineResponse?.[0]?.output || [];
        const commentMap = {};
        outputs.forEach(({ source, target }) => {
          commentMap[source] = target;
        });
        rawComments = translateJSON(rawComments, commentMap);
      }

      setComments((prev) => ({ ...prev, [postId]: rawComments }));
    } catch (err) {
      console.error("Error fetching/translating comments:", err);
    }
  };

  const toggleComments = (postId) => {
    setCommentToggle((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    if (!commentToggle[postId]) {
      fetchComments(postId);
    }
    setActivePostId(activePostId === postId ? null : postId);
  };

  const handleCommentSubmit = async (postId) => {
    if (!userId) {
      alert(uiText.noPosts);
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/comments", {
        communityId: postId,
        commenter: userId,
        commentText: newComment,
      });
      setNewComment("");
      // re-fetch and re-translate
      fetchComments(postId);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const filtered = selectedTopic
    ? posts.filter((p) => p.topic === selectedTopic)
    : posts;

  return (
    <div className="flex flex-col gap-6 max-h-[870px] overflow-y-auto">
      {selectedTopic == null ? (
        <MeditationFact />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400">{uiText.noPosts}</p>
      ) : (
        filtered.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#15202b] text-white p-4 rounded-xl shadow-lg max-w-xl w-full mx-auto relative"
          >
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
              <p className="text-sm text-green-400 font-semibold">
                {post.topic}
              </p>
              <p className="text-sm mt-1">{post.content}</p>
            </div>

            <div className="flex gap-6 items-center mt-4">
              <button onClick={() => toggleComments(post._id)}>
                <MessageCircle
                  className={`w-5 h-5 transition ${
                    commentToggle[post._id]
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                />
              </button>
            </div>

            {activePostId === post._id && (
              <div className="mt-4 bg-[#1e2a38] p-3 rounded-xl">
                <div className="space-y-2 mb-3">
                  {comments[post._id]?.length > 0 ? (
                    comments[post._id].map((c) => (
                      <div
                        key={c._id}
                        className="text-sm bg-gray-800 p-2 rounded"
                      >
                        <p>{c.commentText}</p>
                        <span className="text-xs text-gray-400 block mt-1">
                          {c.commenter?.name || "Anonymous"} (
                          {c.commenter?.email})
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">
                      {uiText.noComments}
                    </p>
                  )}
                </div>

                <textarea
                  placeholder={uiText.writeComment}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="border px-3 py-2 w-full text-sm rounded bg-gray-900 text-white resize-none"
                />
                <button
                  onClick={() => handleCommentSubmit(post._id)}
                  className="bg-green-600 text-white px-4 py-1 text-sm rounded mt-2 hover:bg-green-700"
                >
                  {uiText.postComment}
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
