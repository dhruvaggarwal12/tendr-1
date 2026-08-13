import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function usePartyRoom() {
  const [room, setRoom]         = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError]       = useState(null);
  const [myName, setMyName]     = useState("");
  const socketRef               = useRef(null);

  useEffect(() => {
    const socket = io(`${BASE_URL}/party`, {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => { setConnected(true); setError(null); });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (e) => setError("Connection failed — check network"));

    socket.on("party:player-joined", ({ players }) =>
      setRoom(prev => prev ? { ...prev, players } : prev));

    socket.on("party:player-left", ({ players }) =>
      setRoom(prev => prev ? { ...prev, players } : prev));

    socket.on("party:game-changed", ({ game, gameState }) =>
      setRoom(prev => prev ? { ...prev, currentGame: game, gameState } : prev));

    socket.on("party:state-update", ({ gameState }) =>
      setRoom(prev => prev ? { ...prev, gameState } : prev));

    return () => socket.disconnect();
  }, []);

  const createRoom = useCallback(({ occasionType, partyName, hostName }) => {
    return new Promise((resolve) => {
      setMyName(hostName);
      socketRef.current?.emit("party:create", { occasionType, partyName, hostName }, (res) => {
        if (res.ok) { setRoom(res.room); resolve({ ok: true, room: res.room }); }
        else        { setError(res.error); resolve({ ok: false, error: res.error }); }
      });
    });
  }, []);

  const joinRoom = useCallback(({ code, name }) => {
    return new Promise((resolve) => {
      setMyName(name);
      socketRef.current?.emit("party:join", { code: code.toUpperCase(), name }, (res) => {
        if (res.ok) { setRoom(res.room); resolve({ ok: true, room: res.room }); }
        else        { setError(res.error); resolve({ ok: false, error: res.error }); }
      });
    });
  }, []);

  const dispatch = useCallback((action, payload) => {
    return new Promise((resolve) => {
      socketRef.current?.emit("party:action", { action, payload }, (res) => resolve(res || {}));
    });
  }, []);

  const setGame = useCallback((game, initialState = {}) => {
    socketRef.current?.emit("party:set-game", { game, initialState }, () => {});
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current?.connect();
    setRoom(null);
    setMyName("");
  }, []);

  return { room, connected, error, myName, createRoom, joinRoom, dispatch, setGame, leaveRoom };
}
