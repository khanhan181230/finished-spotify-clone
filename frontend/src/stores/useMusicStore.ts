import { axiosInstance } from "@/lib/axios";
import type { Album, Song, Stats } from "@/types";
import { create } from "zustand";
import { toast } from 'react-hot-toast';
// Define the shape of the music store
interface MusicStore {
    songs: Song[];
    albums: Album[];
    isLoading: boolean;
    error: string | null;
    currentAlbum: Album | null;
    featuredSongs: Song[];
    madeForYouSongs: Song[];
    trendingSongs: Song[];
    stats: Stats

    fetchAlbums: () => Promise<void>; // Function to fetch albums
    fetchAlbumById: (id: string) => Promise<void>; // Function to fetch a single album by ID
    fetchFeaturedSongs: () => Promise<void>;
    fetchMadeForYouSongs: () => Promise<void>;
    fetchTrendingSongs: () => Promise<void>;
    fetchStats: () => Promise<void>;
    fetchSongs: () => Promise<void>;
    deleteSong:(id:string) => Promise<void>;
    deleteAlbum:(id:string) => Promise<void>;

}
export const useMusicStore = create<MusicStore>((set) => ({
    albums: [],
    songs: [],
    error: null,
    isLoading: false,
    currentAlbum: null,
    featuredSongs: [],
    madeForYouSongs:[],
    trendingSongs: [],
    stats:{
        totalSongs: 0,
        totalUsers: 0,
        totalAlbums: 0,
        totalArtists: 0
    },

    fetchSongs: async () => {
        set({ isLoading: true, error: null });
        try{
            const response = await axiosInstance.get("/songs");
            set({songs: response.data, isLoading: false});
        } catch (error: any) {
            console.error("Error fetching songs:", error);
            const message = error?.response?.data?.message || error?.message || "Failed to fetch songs";
            set({ error: message, isLoading: false });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchStats: async () => {
        set({ isLoading: true, error: null });
        try{
            const response = await axiosInstance.get("/stats");
            set({stats: response.data, isLoading: false});
        } catch (error: any) {
            console.error("Error fetching stats:", error);
            const message = error?.response?.data?.message || error?.message || "Failed to fetch stats";
            set({ error: message, isLoading: false });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchAlbums: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/albums");
            set({ albums: response.data, isLoading: false });
        } catch (error: any) {
            console.error("Error fetching albums:", error);
            const message = error?.response?.data?.message || error?.message || "Failed to fetch albums";
            set({ error: message, isLoading: false });
        } finally {
            set({ isLoading: false });
        }
    },
    fetchAlbumById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            console.log("Fetching album with ID:", id);
            const response = await axiosInstance.get(`/albums/${id}`);
            console.log("Album response:", response.data);
            set({ currentAlbum: response.data, isLoading: false });
        } catch (error: any) {
            console.error("Error fetching album:", error);
            set({ error: error.response?.data?.message || "Failed to fetch album", isLoading: false });
        }finally {
            set({ isLoading: false });
        }
    },
    fetchFeaturedSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/featured");
            set({featuredSongs:response.data})
        } catch (error:any) {set({error: error.response.data.message})
        } finally {
            set({ isLoading: false });
        }
    },
    fetchMadeForYouSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/made-for-you");
            set({madeForYouSongs:response.data})
        } catch (error:any) {set({error: error.response.data.message})
        } finally {
            set({ isLoading: false });
        }},
    fetchTrendingSongs: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get("/songs/trending");
            set({trendingSongs:response.data})
        } catch (error:any) {set({error: error.response.data.message})
        } finally {
            set({ isLoading: false });
        }
    },
    deleteSong: async(id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/songs/${id}`);
            // Remove the deleted song from the store (UI update)
            set(state => ({
                songs: state.songs.filter(song => song._id !== id)
            }))
            toast.success("Song deleted successfully");
        } catch (error: any) {
            toast.error("Error deleting song");
            const message = error?.response?.data?.message || error?.message || "Failed to delete song";
            set({ error: message });
        } finally {
            set({ isLoading: false });
        }
    },
    deleteAlbum: async(id) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.delete(`/admin/albums/${id}`);
            // Remove the deleted album from the store (UI update)
            set(state => ({
                albums: state.albums.filter(album => album._id !== id),
                songs: state.songs.map((song)=> 
                song.albumId === state.albums.find((a) => a._id === id)?.title ? {...song, album: null} : song
             )
            }))
            toast.success("Album deleted successfully");
        } catch (error: any) {
            toast.error("Error deleting album");
            const message = error?.response?.data?.message || error?.message || "Failed to delete album";
            set({ error: message });
        } finally {
            set({ isLoading: false });
        }


    }
}));