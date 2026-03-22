"use client";

import { useEffect, useState, useCallback } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function getAccessToken(): string | null {
    try {
        const raw = localStorage.getItem("auth-storage");
        if (!raw) return null;
        return JSON.parse(raw)?.state?.accessToken ?? null;
    } catch {
        return null;
    }
}

/**
 * Hook to track online status of users globally.
 * Subscribes to /topic/online-users to get a Set of active user IDs.
 */
export const useOnlineStatus = () => {
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        const backendUrl = "https://api.nibojapan.cloud";
        let sub: StompSubscription | null = null;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${backendUrl}/ws`),
            reconnectDelay: 10000,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                setIsConnected(true);
                console.log("[useOnlineStatus] 🟢 Tracking online status...");

                // Subscribe to global online-users topic
                sub = client.subscribe("/topic/online-users", (message) => {
                    try {
                        const data: string[] = JSON.parse(message.body);
                        setOnlineUserIds(new Set(data));
                    } catch (e) {
                        console.error("[useOnlineStatus] Data parse error", e);
                    }
                });

                // Optionally fetch initial list via REST if broadcast hasn't happened yet
                fetch(`${backendUrl}/api/v1/users/online`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res?.data) {
                            setOnlineUserIds(new Set(res.data));
                        }
                    })
                    .catch(() => { });
            },
            onDisconnect: () => setIsConnected(false),
            onStompError: (frame) => console.error("[useOnlineStatus] STOMP error", frame),
        });

        client.activate();

        return () => {
            sub?.unsubscribe();
            client.deactivate();
        };
    }, []);

    const isUserOnline = useCallback(
        (userId: string | undefined | null) => {
            if (!userId) return false;
            return onlineUserIds.has(userId);
        },
        [onlineUserIds]
    );

    return { onlineUserIds, isUserUserOnline: isUserOnline, isConnected };
};
