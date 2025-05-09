import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function VideoCall() {
  const { roomId } = useParams();
  const containerRef = useRef(null);

  useEffect(() => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId,
      parentNode: containerRef.current,
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'hangup',
          'chat', 'tileview', 'settings'
        ]
      }
    };

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.onload = () => {
      /* global JitsiMeetExternalAPI */
      new JitsiMeetExternalAPI(domain, options);
    };
    document.body.appendChild(script);

    return () => {
      // note: Jitsi API will auto-clean on unmount
    };
  }, [roomId]);

  const pageStyle = {
    width: '100%',
    height: '100vh',
    background: `url('/assets/court.png') center/cover no-repeat`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const containerStyle = {
    width: '100%',
    height: '100%'
  };

  return (
    <div style={pageStyle}>
    <div ref={containerRef} style={containerStyle} />
  </div>
  );
}
