import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings, LogOut, ShieldCheck } from "lucide-react";
import logo from "./assets/Small 1.png"; // We'll use the same logo but white version if available, or filter it

export default function AdminSidebar() {
  const navigate = useNavigate();
  // We'll rely on the parent component to pass active state or use URL query params if we were fully routing.
  // Since Index.tsx manages state, we might need to bubble up clicks or just use query params. 
  // For now, let's assume Index.tsx is the main view and we might need to coordinate.
  // Actually, Index.tsx is the *page*. AdminSidebar is in *AdminLayout*.
  // To make this work seamlessly without Context, we might need to pass props.
  // BUT, AdminLayout surrounds Outlet. Index is inside Outlet.
  // OPTION: We can use a simple Context or URL #hashes or search params to control the view in Index.
  // Let's use URL search params for view control: ?view=dashboard, ?view=assessments
  
  const searchParams = new URLSearchParams(window.location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const handleNav = (view) => {
    navigate(`/admin?view=${view}`);
  };



  return (
    <div className="w-64 bg-[#021E34] text-white flex flex-col min-h-screen shadow-xl z-10 shrink-0">
      {/* Branding */}
      <div className="h-16 flex items-center justify-center px-6 border-b border-blue-600/30">
        <div className="flex items-center justify-center w-full">
             <div className="rounded-md">
                <img 
                    src={logo} 
                    alt="EduValidate" 
                    className="h-8 w-auto" 
                    style={{ filter: "brightness(0) invert(1)" }}
                />
             </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={currentView === "dashboard"} 
          onClick={() => handleNav("dashboard")} 
        />
        <NavItem 
          icon={FileText} 
          label="Competency Units" 
          active={currentView === "assessments"} 
          onClick={() => handleNav("assessments")} 
        />
        <NavItem 
          icon={Users} 
          label="Organizations" 
          active={currentView === "orgs"} 
          onClick={() => handleNav("orgs")} 
        />
        <NavItem 
          icon={ShieldCheck} 
          label="Document Tool" 
          active={currentView === "documents"} 
          onClick={() => handleNav("documents")} 
        />
      </nav>

      {/* Footer / Account */}
      {/* <div className="p-4 border-t border-blue-600/30 bg-blue-900/20">
        <NavItem 
          icon={Settings} 
          label="Account & Settings" 
          active={currentView === "settings"} 
          onClick={() => handleNav("settings")} 
        />
      </div> */}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                active 
                ? "bg-white/10 text-white shadow-sm border-l-4 border-white" 
                : "text-blue-100 hover:bg-white/5 hover:text-white"
            } ${className}`}
        >
            <Icon className={`w-5 h-5 ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
            {label}
        </button>
    )
}
