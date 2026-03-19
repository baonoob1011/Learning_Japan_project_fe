"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Users,
  Plus,
  Loader2,
  Hash,
  ArrowLeft,
  Check,
  Camera,
  UserPlus,
} from "lucide-react";
import {
  roomService,
  CreateGroupRoomRequest,
  ChatGroupBasicResponse,
  ChatRoomResponse,
} from "@/services/roomService";
import { RoomType } from "@/enums/RoomType";

interface GroupRoomsPopupProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSelectRoom?: (room: ChatGroupBasicResponse) => void;
  initialView?: View;
  existingRoomId?: string;
  initialSelectedId?: string; // 👈 Thêm prop này
}

type View = "list" | "create" | "add";

export default function GroupRoomsPopup({
  isDarkMode,
  onClose,
  onSelectRoom,
  initialView = "list",
  existingRoomId,
  initialSelectedId, // 👈 Thêm prop này
}: GroupRoomsPopupProps) {
  const [view, setView] = useState<View>(initialView);

  // --- List view state ---
  const [rooms, setRooms] = useState<ChatGroupBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Create/Add view state ---
  const [groupName, setGroupName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [chatUsers, setChatUsers] = useState<
    { userId: string; fullName: string; avatarUrl?: string }[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch group rooms
  useEffect(() => {
    if (view !== "list") return;
    roomService
      .getMyGroupRooms()
      .then((data) => setRooms(data))
      .catch(() => setError("Không thể tải danh sách nhóm"))
      .finally(() => setLoading(false));
  }, [view]);

  // Fetch chat users khi chuyển sang view create hoặc add
  useEffect(() => {
    if (view !== "create" && view !== "add") return;
    setLoadingUsers(true);

    const fetchData = async () => {
      try {
        // 1. Lấy danh sách bạn bè đã chat
        const users = await roomService.getMyChatUsers();

        let filteredUsers = users;

        // 2. Nếu là view "add", lọc bỏ những người đã ở trong nhóm
        if (view === "add" && existingRoomId) {
          try {
            const groupDetail = await roomService.getGroupDetail(existingRoomId);
            const memberIds = new Set(groupDetail.members.map(m => m.userId));
            filteredUsers = users.filter(u => !memberIds.has(u.userId));
          } catch (err) {
            console.error("Failed to fetch group members:", err);
          }
        }

        setChatUsers(filteredUsers);

        // 3. Auto-select nếu có initialSelectedId (chỉ khi create)
        if (view === "create" && initialSelectedId) {
          setSelectedIds([initialSelectedId]);
        }
      } catch {
        setChatUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [view, existingRoomId, initialSelectedId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const resetCreate = () => {
    setGroupName("");
    setAvatarFile(null);
    setAvatarPreview(null);
    setSelectedIds([]);
    setCreateError(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (!existingRoomId || selectedIds.length === 0) return;
    setCreating(true);
    setCreateError(null);
    try {
      await roomService.addGroupMembers(existingRoomId, {
        memberIds: selectedIds,
      });
      onClose();
    } catch {
      setCreateError("Thêm thành viên thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedIds.length === 0) return;
    setCreating(true);
    setCreateError(null);
    try {
      const request: CreateGroupRoomRequest = {
        name: groupName.trim(),
        memberIds: selectedIds,
        ...(avatarFile ? { avatar: avatarFile } : {}),
      };
      const newRoom: ChatRoomResponse = await roomService.createGroupRoom(
        request
      );
      // Map ChatRoomResponse -> ChatGroupBasicResponse để thêm vào list
      const newGroupBasic: ChatGroupBasicResponse = {
        id: newRoom.id,
        roomType:
          newRoom.roomType === RoomType.PRIVATE
            ? RoomType.PRIVATE
            : RoomType.GROUP,
        createdAt: newRoom.createdAt,
        name: newRoom.name ?? groupName.trim(),
        avatarUrl: newRoom.avatarUrl,
        lastMessage: newRoom.lastMessage,
        lastMessageTime: newRoom.lastMessageTime,
        unreadCount: newRoom.unreadCount ?? 0,
        memberCount: selectedIds.length,
      };
      setRooms((prev) => [newGroupBasic, ...prev]);
      resetCreate();
      setView("list");
      onSelectRoom?.(newGroupBasic);
      onClose();
    } catch {
      setCreateError("Tạo nhóm thất bại, vui lòng thử lại");
    } finally {
      setCreating(false);
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${isDarkMode
    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
    : "bg-cyan-50/50 border-cyan-200 text-gray-900 placeholder-cyan-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
    }`;

  return (
    <div
      ref={popupRef}
      className={`w-72 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${isDarkMode
        ? "bg-gray-800 border-gray-700 text-gray-100"
        : "bg-white border-cyan-200 text-gray-900"
        }`}
    >
      {/* ───────────── HEADER ───────────── */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "border-gray-700" : "border-cyan-100"
          }`}
      >
        <div className="flex items-center gap-2">
          {view === "create" && (
            <button
              onClick={() => {
                setView("list");
                resetCreate();
              }}
              className={`p-1 rounded-full transition-colors mr-1 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
                }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div
            className={`p-1.5 rounded-lg ${isDarkMode
              ? "bg-cyan-500/20"
              : "bg-gradient-to-br from-cyan-100 to-blue-100"
              }`}
          >
            <Users
              className={`w-4 h-4 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
            />
          </div>
          <span className="font-semibold text-sm">
            {view === "list" ? "Nhóm của tôi" : view === "add" ? "Thêm thành viên" : "Tạo nhóm mới"}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
            }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ───────────── LIST VIEW ───────────── */}
      {view === "list" && (
        <>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2
                  className={`w-6 h-6 animate-spin ${isDarkMode ? "text-cyan-400" : "text-cyan-500"
                    }`}
                />
              </div>
            )}
            {error && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            {!loading && !error && rooms.length === 0 && (
              <div className="px-4 py-8 text-center space-y-2">
                <div
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-cyan-50"
                    }`}
                >
                  <Hash
                    className={`w-6 h-6 ${isDarkMode ? "text-gray-500" : "text-cyan-300"
                      }`}
                  />
                </div>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-cyan-400"
                    }`}
                >
                  Chưa có nhóm nào
                </p>
              </div>
            )}
            {!loading &&
              !error &&
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    onSelectRoom?.(room);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isDarkMode ? "hover:bg-gray-700/60" : "hover:bg-cyan-50"
                    }`}
                >
                  {room.avatarUrl ? (
                    <img
                      src={room.avatarUrl}
                      alt={room.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/group-avatar.png";
                      }}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0 shadow"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow bg-gradient-to-br from-cyan-500 to-blue-600">
                      {room.name ? (
                        room.name.charAt(0).toUpperCase()
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {room.name || "Nhóm không tên"}
                    </p>
                    <p
                      className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-cyan-500"
                        }`}
                    >
                      {room.memberCount
                        ? `${room.memberCount} thành viên`
                        : "Nhóm chat"}
                      {room.lastMessage && ` · ${room.lastMessage}`}
                    </p>
                  </div>
                </button>
              ))}
          </div>

          {/* Footer */}
          <div
            className={`border-t px-4 py-2.5 ${isDarkMode ? "border-gray-700" : "border-cyan-100"
              }`}
          >
            <button
              onClick={() => setView("create")}
              className={`w-full flex items-center gap-2 text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${isDarkMode
                ? "text-cyan-400 hover:bg-gray-700"
                : "text-cyan-600 hover:bg-cyan-50"
                }`}
            >
              <Plus className="w-4 h-4" />
              Tạo nhóm mới
            </button>
          </div>
        </>
      )}

      {/* ───────────── CREATE/ADD VIEW ───────────── */}
      {(view === "create" || view === "add") && (
        <div className="flex flex-col">
          {/* Avatar + Tên nhóm (Chỉ hiện khi create) */}
          {view === "create" && (
            <div className="px-4 pt-4 pb-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${isDarkMode
                    ? "border-gray-600 hover:border-cyan-500 bg-gray-700"
                    : "border-cyan-200 hover:border-cyan-400 bg-cyan-50"
                    }`}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera
                      className={`w-6 h-6 ${isDarkMode ? "text-gray-400" : "text-cyan-400"
                        }`}
                    />
                  )}
                </button>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow pointer-events-none">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <input
                type="text"
                placeholder="Tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={inputClass}
                autoFocus
              />
            </div>
          )}

          {/* Member label */}
          <div
            className={`px-4 ${view === "create" ? "pb-1" : "py-3"
              } text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-cyan-500"
              }`}
          >
            {view === "create" ? "Chọn thành viên" : "Thêm thành viên mới"}
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </div>

          {/* Member list */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 pb-2">
            {loadingUsers && (
              <div className="flex items-center justify-center py-10">
                <Loader2
                  className={`w-6 h-6 animate-spin ${isDarkMode ? "text-cyan-400" : "text-cyan-500"
                    }`}
                />
              </div>
            )}
            {!loadingUsers && chatUsers.length === 0 && (
              <p
                className={`text-xs text-center py-10 ${isDarkMode ? "text-gray-400" : "text-cyan-400"
                  }`}
              >
                Không có người dùng khả dụng
              </p>
            )}
            {!loadingUsers &&
              chatUsers.map((user) => {
                const selected = selectedIds.includes(user.userId);
                return (
                  <button
                    key={user.userId}
                    onClick={() => toggleUser(user.userId)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${selected
                      ? isDarkMode
                        ? "bg-cyan-500/20"
                        : "bg-cyan-50"
                      : isDarkMode
                        ? "hover:bg-gray-700/60"
                        : "hover:bg-cyan-50/60"
                      }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold bg-gradient-to-br from-cyan-500 to-blue-600 shadow-sm">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-sm font-medium truncate">
                      {user.fullName}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected
                        ? "bg-cyan-500 border-cyan-500 scale-110 shadow-md"
                        : isDarkMode
                          ? "border-gray-500 hover:border-cyan-400"
                          : "border-cyan-300 hover:border-cyan-500"
                        }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
          </div>

          {createError && (
            <p className="text-xs text-red-500 px-4 pb-2 font-medium">
              {createError}
            </p>
          )}

          {/* Actions */}
          <div
            className={`border-t px-4 py-3.5 flex gap-2 ${isDarkMode ? "border-gray-700" : "border-cyan-100"
              }`}
          >
            <button
              onClick={() => {
                if (initialView === "add") {
                  onClose();
                } else {
                  setView("list");
                  resetCreate();
                }
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all hover:shadow-md active:scale-95 ${isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
                }`}
            >
              Hủy
            </button>
            <button
              onClick={view === "create" ? handleCreateGroup : handleAddMembers}
              disabled={
                (view === "create" && !groupName.trim()) ||
                selectedIds.length === 0 ||
                creating
              }
              className={`flex-1 py-2.5 text-sm rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95 ${((view === "create" && !groupName.trim()) ||
                selectedIds.length === 0 ||
                creating)
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-cyan-100 text-cyan-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white"
                }`}
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  {view === "create" ? (
                    <>
                      <Plus className="w-4 h-4" />
                      Tạo nhóm
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Xác nhận thêm
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
