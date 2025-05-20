import React, { useState } from "react";

export default function Guide() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div >
      {/* Floating bot button with "Need Help?" label */}
      <div className="fixed bottom-6 right-6 flex items-center space-x-2 z-50">
        <div className="bg-white text-black px-3 py-1 rounded-full shadow text-sm font-medium">
          Need Help?
        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="bg-[#87311e] text-white rounded-full p-4 shadow-lg transition"
        >
          💬
        </button>
      </div>

      {/* Video Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative w-1/2 h-1/2 bg-white rounded-lg overflow-hidden shadow-xl">
            {/* Close Button */}
            <button
              onClick={() => setChatOpen(false)}
              className="absolute top-2 right-2 text-black bg-white p-1 px-2 rounded-full shadow hover:bg-gray-200"
            >
              ✖
            </button>

            {/* Video Player */}
            <video
              src="/assets/images/Demand-Justice.mp4"
              controls
              autoPlay
              className="w-full h-full pointer-events-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
