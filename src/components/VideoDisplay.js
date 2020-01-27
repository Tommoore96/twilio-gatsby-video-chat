import React, { useEffect } from 'react';
import useTwilioVideo from '../hooks/useTwilioVideo';
import { navigate } from 'gatsby';

const VideoDisplay = ({ roomID }) => {
  const { state, startVideo, videoRef, leaveRoom } = useTwilioVideo();

  useEffect(() => {
    if (!state.token) {
      navigate('/', { state: { roomName: roomID } });
    }

    if (!state.room) {
      startVideo();
    }

    window.addEventListener('beforeunload', leaveRoom);
    return () => {
      window.removeEventListener('beforeunload', leaveRoom);
    };
  }, [state, roomID, startVideo, leaveRoom]);

  return (
    <>
      <h1>Room: "{roomID}"</h1>
      {state.room && (
        <button className="leave-room" onCLick={leaveRoom}>
          Leave Room
        </button>
      )}
      <div className="chat" ref={videoRef} />
    </>
  );
};
export default VideoDisplay;
