import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket({ userId, token, chatType = 'SUPPORT', enabled = true } = {}){

    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    const connect = useCallback(() =>{

        if(!enabled) return;
        if(socketRef.current?.connected) return; // already connected

        try {
            const BASE_URL = import.meta.env.VITE_BASE_URL;

            socketRef.current = io(BASE_URL,{
                auth: { token },
                query: { userId, chatType },
                transports: ['websocket'],
                withCredentials: true,
            });

            socketRef.current.on('connect', () =>{
                console.log(`Socket connected: ${socketRef.current.id}`);
                setConnected(true);
                setError(null);
            })

            socketRef.current.on('disconnect', () =>{
                console.log("Socket disconnected");
                setConnected(false);
            })

            socketRef.current.on('connect_error' , (err) =>{
                console.error("Socket connection error:", err);
                setError(err.message || "Socket connection error");
            })
            
        } catch (error) {
            console.error("Socket init failed:", error);
            setError(error.message || "Failed to initialize socket");
        }      
    }, [userId, token, chatType, enabled]);

    const disconnect = useCallback(() =>{
        if(socketRef.current){
            socketRef.current.disconnect();
            socketRef.current = null;
            setConnected(false);
        }
    },[]);

    const emit = useCallback((event,data) =>{
        if(socketRef.current?.connected){
            socketRef.current.emit(event,data);
        }else{
            console.warn("Socket not connected. Cannot emit event:", event);
        }
    },[]);

    const on = useCallback((event,handler) =>{
        if(!socketRef.current) return;
        socketRef.current.on(event,handler);
        return () => socketRef.current?.off(event,handler);
    },[]);

    useEffect(() =>{
        if(enabled) connect();
        return () => disconnect();
    },[enabled, connect, disconnect, chatType]);

    const api = useMemo(
        () => ({
            socket: socketRef.current,
            connected,
            error,
            emit,
            on,
            connect,
            disconnect,
        }),
        [connected, error, emit, on , connect, disconnect]
    );

    return api;
}