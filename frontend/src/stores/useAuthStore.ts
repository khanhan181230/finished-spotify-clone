import { axiosInstance } from "@/lib/axios";
import {create} from "zustand";

interface AuthStore {
    isAdmin: boolean;
    isLoading: boolean;
    error: string | null;

    checkAdminStatus: () => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    isAdmin: false,
    isLoading: false,
    error: null,

checkAdminStatus: async () => {
    console.log("checkAdminStatus called");
    set({isLoading: true, error: null});
    try {
        console.log("Making request to /admin/check");
        const response = await axiosInstance.get("/admin/check");
        console.log("Admin check response:", response.data);
        set({isAdmin: response.data.admin, isLoading: false});
    } catch (error: any) {
        console.error("Error checking admin status:", error);
        set({isAdmin: false, error: error.response?.data?.message || "Failed to check admin status", isLoading: false})
    }
},

reset: () => {
    set({ isAdmin: false, isLoading: false, error: null });
}
}));