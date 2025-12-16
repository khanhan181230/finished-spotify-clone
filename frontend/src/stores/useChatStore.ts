import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";
import { create } from "zustand";
import { io } from 'socket.io-client';

interface ChatStore {
    users: User[],
    isLoading:boolean;
    error: string | null;
    socket: any;
    isConnected: boolean;
    onlineUsers: Set<string>;
    userActivities: Map <string, string>;
    messages: Message[];
    selectedUser: User | null;
    fetchUsers: () => Promise<void>;
    fetchMessages: (userId: string) => Promise<void>;
    initSocket: (userId: string) => Promise<void>;
    disconnectSocket: () => Promise<void>;
    sendMessage: (receiverId: string, senderId: string, content: string) => void;
    setSelectedUser: (user: User | null) => void;
}

const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

const socket = io(baseUrl, {
    autoConnect: false, //only connect if user is authenticated
    withCredentials: true,
})
export const useChatStore = create<ChatStore>((set, get)=> ({
    users:[],
    isLoading: false,
    error: null,
    socket: socket,
    isConnected: false,
    onlineUsers: new Set(),
    userActivities: new Map(),
    messages: [],
    selectedUser: null,

    fetchUsers: async() => {
        set({isLoading: true, error: null});
        try {
            const response = await axiosInstance.get("/users");
            console.log("Users response:", response.data);
            const users = Array.isArray(response.data) ? response.data : response.data.users || [];
            set({users: users, isLoading: false});
        } catch (error:any) {
            console.error("Error fetching users:", error);
            set({isLoading: false, error: error.message});
        }
    },

    initSocket: async(userId) =>{
        if(!get().isConnected){
            socket.auth = {userId};
            socket.connect();
            socket.emit("user_connected", userId);
            socket.on("users_online", (users: string[]) => {
                set({onlineUsers: new Set(users)});
            });

            socket.on("activities", (activities: [string, string][]) => {
                set({userActivities: new Map(activities)});
            });

            socket.on("user_connected", (userId: string) => {
                set((state) => ({
                    onlineUsers: new Set([...state.onlineUsers, userId]),
                }));
            });

            socket.on("user_disconnected", (userId: string) => {
                set((state) => {
                   const newOnlineUsers = new Set(state.onlineUsers);
                   newOnlineUsers.delete(userId);
                   return { onlineUsers: newOnlineUsers };
                });
            });

            socket.on("receive_message", (message: Message) => {
                set((state)=> ({
                    messages: [...state.messages, message],
                }));
            });

            socket.on("message_sent", (message: Message) => {
                set((state)=> ({
                    messages: [...state.messages, message],
                }));
            });

            socket.on("activity_updated", (userId, activity) => {
                set((state) => {
                   const newActivities = new Map(state.userActivities);
                   newActivities.set(userId, activity);
                   return { userActivities: newActivities };
                });
            });

            set({isConnected: true});
        }
    },

    disconnectSocket: async () => {
        if(get().isConnected){
        socket.disconnect();
        set({isConnected: false})
     }
    },

    sendMessage: async (receiverId, senderId, content) => {
        const socket = get().socket;
        if(!socket) return;
        socket.emit("send_message", {receiverId, senderId, content});
    },

    fetchMessages: async(userId ) => {
        set({isLoading: true, error: null});
        try {
            const response = await axiosInstance.get(`/users/messages/${userId}`);
            console.log("Messages response:", response.data);
            set({messages: response.data})
        } catch (error:any) {
            console.error("Error fetching messages:", error);
            set({isLoading: false, error: error.message});
        } finally {
            set({isLoading: false});
        }
    },

    setSelectedUser: (user) => {
        set({selectedUser: user});
    }

}))
