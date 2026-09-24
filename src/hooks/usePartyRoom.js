// src/hooks/usePartyRoom.js — Socket.IO party room hook
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function usePartyRoom() {
  const socketRef = useRef(null);
  const [connected, setConnected]   = useState(false);
  const [room, setRoom]             = useState(null);   // { code, partyName, hostName, occasionType }
  const [players, setPlayers]       = useState([]);
  const [gameState, setGameState]   = useState({});
  const [currentGame, setCurrentGame] = useState(null);
  const [myName, setMyName]         = useState('');
  const [isHost, setIsHost]         = useState(false);
  const [effect, setEffect]         = useState(null);   // { type, by, payload } or null
  const [error, setError]           = useState(null);
  const [activityLog, setActivityLog] = useState([]);  // [{ type:'joined'|'left', name, time }]
  const [playerActivities, setPlayerActivities] = useState({}); // { [name]: activityString | null }

  // Lazy-connect: only create socket on first use
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${BASE_URL}/party`, {
        transports: ['websocket'],
        autoConnect: true,
      });

      const s = socketRef.current;

      s.on('connect',    () => setConnected(true));
      s.on('disconnect', () => setConnected(false));

      s.on('party:player-joined', ({ name, players: pl }) => {
        setPlayers(pl);
        if (name) setActivityLog(prev => [...prev.slice(-19), { type: 'joined', name, time: Date.now() }]);
      });
      s.on('party:player-left', ({ name, players: pl }) => {
        setPlayers(pl);
        if (name) {
          setActivityLog(prev => [...prev.slice(-19), { type: 'left', name, time: Date.now() }]);
          setPlayerActivities(prev => { const next = { ...prev }; delete next[name]; return next; });
        }
      });

      s.on('party:player-activity', ({ name, activity }) => {
        setPlayerActivities(prev => {
          if (!activity) { const next = { ...prev }; delete next[name]; return next; }
          return { ...prev, [name]: activity };
        });
      });

      s.on('party:game-changed', ({ game, gameState: gs }) => {
        setCurrentGame(game);
        setGameState(gs || {});
      });

      s.on('party:state-update', ({ gameState: gs }) => {
        setGameState(gs || {});
      });

      s.on('party:closed', () => {
        setRoom(null); setPlayers([]); setGameState({}); setCurrentGame(null);
        setMyName(''); setIsHost(false);
        setError('The host closed the room.');
      });

      s.on('party:effect', (data) => {
        setEffect(data);
        setTimeout(() => setEffect(null), 3000);
      });
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const createRoom = useCallback(({ occasionType, partyName, hostName }) => {
    setError(null);
    return new Promise((resolve) => {
      const s = getSocket();
      s.emit('party:create', { occasionType, partyName, hostName }, (res) => {
        if (res.ok) {
          setRoom(res.room);
          setPlayers(res.room.players);
          setGameState(res.room.gameState || {});
          setCurrentGame(res.room.currentGame);
          setMyName(hostName);
          setIsHost(true);
        } else {
          setError(res.error);
        }
        resolve(res);
      });
    });
  }, [getSocket]);

  const joinRoom = useCallback(({ code, name }) => {
    setError(null);
    return new Promise((resolve) => {
      const s = getSocket();
      s.emit('party:join', { code, name }, (res) => {
        if (res.ok) {
          setRoom(res.room);
          setPlayers(res.room.players);
          setGameState(res.room.gameState || {});
          setCurrentGame(res.room.currentGame);
          setMyName(name);
          setIsHost(name === res.room.hostName);
        } else {
          setError(res.error);
        }
        resolve(res);
      });
    });
  }, [getSocket]);

  const closeRoom = useCallback(() => {
    return new Promise((resolve) => {
      getSocket().emit('party:close', resolve);
    });
  }, [getSocket]);

  const leaveRoom = useCallback(() => {
    return new Promise((resolve) => {
      getSocket().emit('party:leave', () => {
        setRoom(null); setPlayers([]); setGameState({}); setCurrentGame(null);
        setMyName(''); setIsHost(false);
        resolve();
      });
    });
  }, [getSocket]);

  const sendAction = useCallback((action, payload) => {
    return new Promise((resolve) => {
      getSocket().emit('party:action', { action, payload }, resolve);
    });
  }, [getSocket]);

  const sendEffect = useCallback((type, payload) => {
    getSocket().emit('party:effect', { type, payload });
  }, [getSocket]);

  const setActivity = useCallback((activity) => {
    if (!socketRef.current) return;
    socketRef.current.emit('party:set-activity', { activity: activity || null });
  }, []);

  const setGame = useCallback((game, initialState) => {
    return new Promise((resolve) => {
      getSocket().emit('party:set-game', { game, initialState }, resolve);
    });
  }, [getSocket]);

  return {
    connected, room, players, gameState, currentGame,
    myName, isHost, effect, error, activityLog, playerActivities,
    createRoom, joinRoom, closeRoom, leaveRoom,
    sendAction, sendEffect, setGame, setActivity,
    clearError: () => setError(null),
  };
}
