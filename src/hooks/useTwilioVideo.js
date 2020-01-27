import React, { createContext, useContext, useReducer, useRef } from 'react';
import axios from 'axios';
import { connect } from 'twilio-video';

const DEFAULT_STATE = {
  identity: false,
  roomName: false,
  token: false,
  room: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'join':
      return {
        ...state,
        token: action.token,
        identity: action.identity,
        roomName: action.roomName,
      };
    case 'set-active-room':
      return {
        ...state,
        room: action.room,
      };
    case 'disconnect':
      state.room.disconnect();
      return DEFAULT_STATE;
    default:
      return DEFAULT_STATE;
  }
};

const TwilioVideoContext = createContext();

const TwilioVideoProvider = ({ children }) => (
  <TwilioVideoContext.Provider value={useReducer(reducer, DEFAULT_STATE)}>
    {children}
  </TwilioVideoContext.Provider>
);

export const wrapRootElement = ({ element }) => (
  <TwilioVideoProvider>{element}</TwilioVideoProvider>
);

const useTwilioVideo = () => {
  const [state, dispatch] = useContext(TwilioVideoContext);
  const videoRef = useRef();

  const getRoomToken = async ({ identity, roomName }) => {
    console.log(process.env);

    const result = await axios.post(process.env.GATSBY_TWILIO_TOKEN_URL, {
      identity,
      room: roomName,
    });
    dispatch({ type: 'join', token: result.data, identity, roomName });
  };

  const handleRemoteParticipant = (container, participant) => {
    const id = participant.sid;

    const el = document.createElement('div');
    el.id = id;
    el.classList = 'remote-participant';

    const name = document.createElement('h4');
    name.innerText = participant.identity;

    el.appendChild(name);

    container.appendChild(el);

    const addTrack = track => {
      const participantDiv = document.getElementById(id);
      const media = track.attach();

      participantDiv.appendChild(media);
    };

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        addTrack(publication.track);
      }
    });

    participant.on('trackSubscribed', addTrack);

    participant.on('trackUnsubscribed', track => {
      track.detach().forEach(el => el.remove());

      const container = document.getElementById(id);
      if (container) container.remove();
    });
  };

  const connectToRoom = async () => {
    if (!state.token) {
      return;
    }

    const room = await connect(
      state.token,
      {
        name: state.roomName,
        audio: true,
        video: { width: 640 },
        logLevel: 'info',
      },
    ).catch(e => console.error(e));

    const localTrack = [...room.localParticipant.videoTracks.values()][0].track;

    if (!videoRef.current.hasChildNodes()) {
      const localEl = localTrack.attach();

      videoRef.current.appendChild(localEl);
    }

    const handleParticipant = participant => {
      handleRemoteParticipant(videoRef.current, participant);
    };

    room.participants.forEach(handleParticipant);
    room.on('participantConnected', handleParticipant);

    dispatch({ type: 'set-active-room', room });
  };
  const leaveRoom = () => dispatch({ type: 'disconnect' });

  const startVideo = () => connectToRoom();

  return { state, getRoomToken, startVideo, videoRef, leaveRoom };
};

export default useTwilioVideo;
