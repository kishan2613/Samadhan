import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatText from "../../WebData/Chat.json";

const ChatRooms = () => {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState(ChatText);
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();

  // parse user ID once
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const userId = user?._id || null;

  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");

    // helper to deep-translate any object using a map
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

    const loadAll = async () => {
      let map = null;

      // 1️⃣ If the user has a preferred language, fetch translation map for ChatText
      if (lang) {
        const cacheKey = `chatMap_${lang}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          map = JSON.parse(cached);
          setText(translateJSON(ChatText, map));
        } else {
          try {
            const res = await fetch("http://localhost:5000/translate/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonObject: ChatText, targetLang: lang }),
            });
            const data = await res.json();
            const outputs = data.pipelineResponse?.[0]?.output || [];
            map = {};
            outputs.forEach(({ source, target }) => (map[source] = target));
            sessionStorage.setItem(cacheKey, JSON.stringify(map));
            setText(translateJSON(ChatText, map));
          } catch (err) {
            console.error("Static translation error:", err);
          }
        }
      }

      // 2️⃣ Fetch chat rooms
      if (!userId) {
        setLoading(false);
        return;
      }
      let rooms = [];
      try {
        const res = await fetch("http://localhost:5000/api/chat/myRooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error("Failed to fetch chat rooms");
        rooms = await res.json();
      } catch (err) {
        console.error(err);
      }

      // 3️⃣ If we have a translation map, immediately translate the room-member names
      if (map) {
        rooms = rooms.map((room) => ({
          ...room,
          members: room.members.map((m) => ({
            ...m,
            name: map[m.name] || m.name,
          })),
        }));
      }

      setChatRooms(rooms);
      setLoading(false);
    };

    loadAll();
  }, [userId, navigate]);

  if (loading) {
    return <div className="text-center mt-10 text-xl">{text.loadingText}</div>;
  }
  if (chatRooms.length === 0) {
    return <p className="text-center text-gray-500 mt-10">{text.noRoomsText}</p>;
  }

  return (
    <div className="w-full h-full mt-16 mb-4 pt-2">
      <div className="max-w-md mx-auto">
        {chatRooms.map((room) => {
          const mediator = room.members.find((m) => m.role === "mediator");
          const parties = room.members.filter((m) => m.role !== "mediator");
          if (!mediator || parties.length < 2) return null;

          // partyNames already translated above
          const partyNames = parties.map((p) =>
            p._id === userId ? text.youLabel : p.name
          );
          const roomTitle = partyNames.join(", ");

          return (
            <div
              key={room._id}
              className="flex items-center px-4 py-3 rounded-xl m-2 bg-white hover:bg-[#ebebeb] border-b cursor-pointer transition"
              onClick={() =>
                navigate(`/chat/${room._id}`, {
                  state: { Title: roomTitle, roomId: room._id, userId },
                })
              }
            >
              <img
                src={
                  mediator.image ||
                  "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
                }
                alt={mediator.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="flex-1 border-b border-gray-100 pb-2">
                <h2 className="text-[15px] font-medium text-gray-800">
                  {roomTitle}
                </h2>
                <p className="text-xs text-gray-500">
                  {text.mediatorLabel} {mediator.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatRooms;
