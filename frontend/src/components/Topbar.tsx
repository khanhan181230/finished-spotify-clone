import { LayoutDashboardIcon } from "lucide-react";
import SignInOAuthButtons from "./SignInOAuthButtons.tsx";
import { SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore.ts";
import { buttonVariants } from "./ui/button.tsx";
import { cn } from "@/lib/utils.ts";
const Topbar = () => {
    const {isAdmin}= useAuthStore();
    console.log({isAdmin});
  return (
    <div className="flex items-center justify-between px-4 py-2 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10">
        <div className="flex gap-2 items-center">
            <img src="../spotify.png" alt="Spotify Logo" className="size-8"/>
            Spotify
        </div>
        <div className="flex items-center gap-4">
            {isAdmin && (
                <Link to={"/admin"} className={cn(buttonVariants({variant:"outline"}))}>
                    <LayoutDashboardIcon className="size-4 mr-2"/>
                    Admin Dashboard
                </Link>
            )}

          
            <SignedOut>
                <SignInOAuthButtons />
            </SignedOut>

            <UserButton />
        </div>
    </div>
  )
}

export default Topbar