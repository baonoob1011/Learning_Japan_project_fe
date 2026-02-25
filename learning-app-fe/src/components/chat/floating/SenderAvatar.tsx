"use client";
import { useState } from "react";

interface SenderAvatarProps {
    avatar: string;
    name: string;
    size?: "sm" | "md";
}

export default function SenderAvatar({
    avatar,
    name,
    size = "sm",
}: SenderAvatarProps) {
    const [imgError, setImgError] = useState(false);
    const initials = name
        .split(" ")
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const sizeClass = size === "sm" ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs";

    if (imgError || !avatar || avatar === "/default-avatar.png") {
        return (
            <div
                className={`${sizeClass} rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center font-bold text-white shrink-0`}
                title={name}
            >
                {initials || "?"}
            </div>
        );
    }

    return (
        <img
            src={avatar}
            alt={name}
            title={name}
            className={`${sizeClass} rounded-full object-cover shrink-0`}
            onError={() => setImgError(true)}
        />
    );
}
