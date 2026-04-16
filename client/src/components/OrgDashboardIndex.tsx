import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  FileCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { parseJwt } from "@/lib/auth";

// SuperAdmin Components (some shared)
import { OrgDashboard } from "./SuperAdmin/OrgDashboard";
import { CompetencyUnits } from "./SuperAdmin/CompetencyUnits";
import { GenerateCompetency } from "./SuperAdmin/GenerateCompetency";
import { ValidationReports } from "./SuperAdmin/ValidationReports";
import { DocumentGame } from "./SuperAdmin/DocumentGame";
import { SubscriptionPurchase } from "./SuperAdmin/SubscriptionPurchase";

// Shared Types & API
import { CompetencyReport } from "./SuperAdmin/types";
import { fetchUnitsForReports } from "./SuperAdmin/api";

export default function OrgDashboardIndex() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const currentView = searchParams.get("view") || "dashboard";

  // Check role-based access
  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
      const decoded = parseJwt(token);
      const userRole = decoded?.role;
      
      // Role 2 is restricted from assessments and subscription
      if (userRole === 2 && (currentView === "assessments" || currentView === "subscription")) {
        console.warn("🚫 [Access Control] Access denied for this view. Redirecting to dashboard.");
        navigate("/orgdashboard?view=dashboard", { replace: true });
      }
    }
  }, [currentView, navigate]);

  // Global State
  const [systemUnits, setSystemUnits] = useState<string[]>([]);
  const [loadingSystemUnits, setLoadingSystemUnits] = useState(false);
  
  // Competency Reports State
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]);
  const [activeManagerTab, setActiveManagerTab] = useState<"system" | "add" | "view_reports">("system");

  // Load System Units
  const loadSystemUnits = async () => {
    setLoadingSystemUnits(true);
    try {
        const res = await fetchUnitsForReports();
        if (res && res.unit_codes) {
            setSystemUnits(res.unit_codes);
        }
    } catch (e) {
        console.error("Failed to load units", e);
    } finally {
        setLoadingSystemUnits(false);
    }
  };

  useEffect(() => {
    if (currentView === "assessments" || currentView === "reports") {
        loadSystemUnits();
    }
  }, [currentView]);

  return (
    <div className="space-y-6">
        {/* Render Active View */}
        
        {currentView === "dashboard" && (
            <OrgDashboard />
        )}

        {currentView === "subscription" && (
            <SubscriptionPurchase />
        )}

        {currentView === "documents" && (
            <DocumentGame />
        )}

        {currentView === "assessments" && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        {/* <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            Competency Manager
                        </h2>
                        <p className="text-muted-foreground">
                            Manage competency units, generate reports, and validate standards.
                        </p> */}
                    </div>
                </div>

                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveManagerTab('system')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeManagerTab === 'system'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-muted-foreground hover:text-gray-700"
                        }`}
                    >
                        System Units ({systemUnits.length})
                    </button>
                    <button
                        onClick={() => setActiveManagerTab('add')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeManagerTab === 'add'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-muted-foreground hover:text-gray-700"
                        }`}
                    >
                        Add & Process
                    </button>
                    <button
                        onClick={() => setActiveManagerTab('view_reports')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeManagerTab === 'view_reports'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-muted-foreground hover:text-gray-700"
                        }`}
                    >
                        View Reports
                        {competencyReports.length > 0 && (
                            <span className="ml-2 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">
                                {competencyReports.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeManagerTab === 'system' && (
                    <CompetencyUnits 
                        systemUnits={systemUnits} 
                        loadingSystemUnits={loadingSystemUnits} 
                        loadSystemUnits={loadSystemUnits}
                    />
                )}

                {activeManagerTab === 'add' && (
                    <GenerateCompetency 
                        setCompetencyReports={setCompetencyReports}
                        setActiveManagerTab={setActiveManagerTab}
                        loadSystemUnits={loadSystemUnits}
                    />
                )}

                {activeManagerTab === 'view_reports' && (
                    <ValidationReports 
                        competencyReports={competencyReports}
                        setCompetencyReports={setCompetencyReports}
                    />
                )}
            </div>
        )}

        {/* Reports tab can just be another entry to assessments view_reports if needed, 
            or a dedicated view. For now, let's keep it consistent with Index.tsx 
            but maybe the sidebar link for "Reports" will just set view=assessments&tab=view_reports */}
        {currentView === "reports" && (
             <ValidationReports 
                competencyReports={competencyReports}
                setCompetencyReports={setCompetencyReports}
            />
        )}
    </div>
  );
}
