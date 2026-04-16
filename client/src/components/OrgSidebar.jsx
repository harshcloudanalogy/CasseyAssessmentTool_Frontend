import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, ShieldCheck, Settings, CreditCard } from "lucide-react";
import logo from "./assets/Small 1.png";
import { parseJwt } from "@/lib/auth";


export default function OrgSidebar() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const currentView = searchParams.get("view") || "dashboard";

  const token = sessionStorage.getItem("access_token");
  const decoded = token ? parseJwt(token) : null;
  const userRole = decoded?.role;

  const handleNav = (view) => {
    navigate(`/orgdashboard?view=${view}`);
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
          label="Overview" 
          active={currentView === "dashboard"} 
          onClick={() => handleNav("dashboard")} 
        />
        
        {/* Only show for Organization (role 1) or Super Admin (role 0) */}
        {userRole !== 2 && (
          <>
            <NavItem 
              icon={FileText} 
              label="Competency Units" 
              active={currentView === "assessments"} 
              onClick={() => handleNav("assessments")} 
            />
            <NavItem 
              icon={CreditCard} 
              label="Subscription" 
              active={currentView === "subscription"} 
              onClick={() => handleNav("subscription")} 
            />
          </>
        )}

        <NavItem 
              icon={ShieldCheck} 
              label="Validation Tool" 
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
  );
}
