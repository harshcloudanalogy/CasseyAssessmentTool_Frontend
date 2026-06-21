import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// SuperAdmin Components
import { Dashboard } from "./SuperAdmin/Dashboard";
import { OrganizationManagement } from "./SuperAdmin/Organization";
import { CompetencyUnits } from "./SuperAdmin/CompetencyUnits";
import { GenerateCompetency } from "./SuperAdmin/GenerateCompetency";
import { ValidationReports } from "./SuperAdmin/ValidationReports";
import { DocumentGame } from "./SuperAdmin/DocumentGame";
import { AdminSettings } from "./SuperAdmin/AdminSettings";

// Shared Types & API
import { Organization, CompetencyReport } from "./SuperAdmin/types";
import { fetchUnitsForReports, fetchOrganizationsAPI } from "./SuperAdmin/api";

export default function Index() {
  const navigate = useNavigate();
  // View control via URL params
  const searchParams = new URLSearchParams(window.location.search);
  const currentView = searchParams.get("view") || "dashboard";

  // Global State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [systemUnits, setSystemUnits] = useState<any[]>([]);
  const [loadingSystemUnits, setLoadingSystemUnits] = useState(false);
  
  // Competency Reports State (Centralized to share between Generate and View)
  const [competencyReports, setCompetencyReports] = useState<CompetencyReport[]>([]); // In a real app this would be fetched
  const [activeManagerTab, setActiveManagerTab] = useState<"system" | "add" | "live_status">("system");

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
      loadSystemUnits();
  }, []);

  // Fetch Organizations
  async function fetchOrganizations() {
    setLoadingOrgs(true);
    try {
      const json = await fetchOrganizationsAPI();
      if (json.success && Array.isArray(json.data)) {
        setOrganizations(json.data);
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
    } finally {
      setLoadingOrgs(false);
    }
  }

  useEffect(() => {
    if (currentView === "orgs") {
      fetchOrganizations();
    }
  }, [currentView]);


  // Handler to switch main tabs
  const handleTabChange = (val: string) => {
      const newParams = new URLSearchParams(window.location.search);
      newParams.set("view", val);
      navigate(`?${newParams.toString()}`);
  };

  const handleLogout = () => {
      sessionStorage.removeItem("access_token");
      navigate("/login");
  };

  return (
    <div className="space-y-6">
        {/* Render Active View */}
        
        {currentView === "dashboard" && (
            <Dashboard />
        )}

        {currentView === "documents" && (
            <DocumentGame />
        )}

        {currentView === "assessments" && (
            <div className="space-y-6">
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
                        onClick={() => setActiveManagerTab('live_status')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                            activeManagerTab === 'live_status'
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-muted-foreground hover:text-gray-700"
                        }`}
                    >
                        Live Status
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

                {activeManagerTab === 'live_status' && (
                    <ValidationReports 
                        competencyReports={competencyReports}
                        setCompetencyReports={setCompetencyReports}
                    />
                )}
            </div>
        )}

        {currentView === "orgs" && (
            <OrganizationManagement 
                organizations={organizations}
                setOrganizations={setOrganizations}
                loadingOrgs={loadingOrgs}
                refreshOrgs={fetchOrganizations}
            />
        )}

        {currentView === "settings" && (
            <AdminSettings />
        )}
    </div>
  );
}
