import React, { useEffect } from 'react';
import './main.css'; // main.css is correctly imported like this

const Meet = () => {
  useEffect(() => {
    // Load AgoraRTC_N-4.7.3.js
    const agoraScript = document.createElement('script');
    agoraScript.src = new URL('./AgoraRTC_N-4.7.3.js', import.meta.url).href;
    agoraScript.async = true;
    document.body.appendChild(agoraScript);

    // Load main.js after Agora is ready
    agoraScript.onload = () => {
      const mainScript = document.createElement('script');
      mainScript.src = new URL('./main.js', import.meta.url).href;
      mainScript.async = true;
      document.body.appendChild(mainScript);

      // Optional: remove mainScript when unmounted
      return () => {
        document.body.removeChild(mainScript);
      };
    };

    // Cleanup: remove agora script too
    return () => {
      document.body.removeChild(agoraScript);
    };
  }, []);

  return (
    <div>
      <button id="join-btn">Join Stream</button>

      <div id="stream-wrapper">
        <div id="video-streams"></div>

        <div id="stream-controls">
          <button id="leave-btn">Leave Stream</button>
          <button id="mic-btn">Mic On</button>
          <button id="camera-btn">Camera on</button>
        </div>
      </div>
    </div>
  );
};

export default Meet;
