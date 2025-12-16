import { useAuth } from "@clerk/clerk-react"
import { useState, useEffect } from "react"
import { axiosInstance } from "../lib/axios.ts"
import { Loader } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { useChatStore } from "@/stores/useChatStore.ts";
const updateApiToken = (token: string | null) => {
  // 
  if(token) {
    axiosInstance.defaults.headers.common[`Authorization`]= `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common[`Authorization`]
  }
}
const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const {getToken, userId} = useAuth();
  const [loading, setLoading] = useState(true);
  const {checkAdminStatus} = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();
  useEffect(()=>{
    const initAuth = async () => {
      try {
        console.log("AuthProvider: Getting token...");
        const token = await getToken ();
        console.log("AuthProvider: Token received:", token ? "YES" : "NO");
        updateApiToken(token);
        if(token){
          console.log("AuthProvider: Calling checkAdminStatus...");
          await checkAdminStatus();
          //init socket
          if(userId) initSocket(userId);
          console.log("AuthProvider: checkAdminStatus completed");
        } else {
          console.log("AuthProvider: No token, skipping checkAdminStatus");
        }
      } catch (error:any) {
        updateApiToken(null);
        console.log("Error in Auth Provider", error.message)
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    //cleanup
    return () => {
      disconnectSocket();
    };
  }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket]);

  if(loading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader className="size-8 text-emerald-500" />
    </div>
  )
  
  return (
    <>{children}</>
  )
}

export default AuthProvider