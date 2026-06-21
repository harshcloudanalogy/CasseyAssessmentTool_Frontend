import AdminSidebar from "./AdminSidebar";
import OrgSidebar from "./OrgSidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { parseJwt, logout } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({ isOrg = false }) {
  useAuth();
  const navigate = useNavigate();

  if (!sessionStorage.getItem("access_token")) return null;

  const token = sessionStorage.getItem("access_token");
  const decoded = token ? parseJwt(token) : null;
  const userRole = decoded?.role;
  
  // Extract display name and initial
  let displayName = "Admin";
  let displaySubtitle = "Super User";
  let displayInitial = "A";

  if (userRole === 1 || userRole === 2) {
    // Top line should always be "Organization" as requested
    displayName = "Organization";
    const userEmail = decoded?.email || decoded?.email_id || decoded?.sub;
    displaySubtitle = userRole === 1 ? (userEmail || "Organization") : "User Account";
    displayInitial = displayName.charAt(0).toUpperCase();
  }

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("token_timestamp");
      navigate("/");
    }
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] overflow-hidden">
      <div 
        className="flex w-full h-full origin-top-left" 
        style={{ 
          zoom: "0.9", 
          width: "100%", 
          height: "111.111%" 
        }}
      >
        {/* Sidebar - Fixed Height due to Parent h-screen & overflow-hidden on parent */}
        {isOrg ? <OrgSidebar /> : <AdminSidebar />}
        
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top Header - Fixed at top of this column */}
          <header className="h-16 bg-[#021E34] text-white flex items-center justify-end px-8 shadow-md z-20 shrink-0">
               <div className="flex items-center gap-3">
                   <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                          <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-sm font-bold border border-white/10">
                              {displayInitial}
                          </div>
                          <div className="flex flex-col items-start sr-only sm:not-sr-only">
                              <span className="text-sm font-medium opacity-90 leading-none">{displayName}</span>
                              <span className="text-[10px] text-blue-200 opacity-70 leading-none mt-0.5">{displaySubtitle}</span>
                          </div>
                          <ChevronDown size={14} className="text-blue-200 opacity-70" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                          <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span className="font-medium">Logout</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
               </div>
          </header>
  
          {/* Main Content - Scrolls independently */}
          <main className={`flex-1 overflow-y-auto relative scroll-smooth bg-[#f8fafc] ${
            window.location.search.includes("view=subscription") 
              ? "p-0" 
              : "p-8 pb-24"
          }`}>
              <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
