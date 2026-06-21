import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Database,
  RefreshCw,
  CheckCircle2,
  Save,
  AlertTriangle,
  RotateCcw,
  CloudLightning,
  Link as LinkIcon,
  Settings,
  Loader2,
  Cpu,
  Sparkles,
  Info
} from "lucide-react";
import {
  fetchAIModels,
  updateAIModels,
  addAndUpdateTrainingPackage,
  addAndUpdateCompetencyUnits,
  linkCompetencyUnits,
  fetchScraperStatus,
} from "./api";
import { useToast } from "@/hooks/use-toast";

interface ScraperStatus {
  status: "idle" | "processing" | "completed" | "failed" | "pending";
  message: string;
  updated_at: string | null;
}

export function AdminSettings() {
  const { toast } = useToast();

  // AI Models State
  const [loadingModels, setLoadingModels] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [competencyModel, setCompetencyModel] = useState("");
  const [validationModel, setValidationModel] = useState("");
  const [initialModels, setInitialModels] = useState({ comp: "", val: "" });
  const [updatingModels, setUpdatingModels] = useState(false);

  // Scraper Status State
  const [scraperStatus, setScraperStatus] = useState<{
    training_packages: ScraperStatus;
    competency_units: ScraperStatus;
  }>({
    training_packages: { status: "idle", message: "Never run", updated_at: null },
    competency_units: { status: "idle", message: "Never run", updated_at: null },
  });
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Sync Loading States (for the buttons)
  const [syncPkgLoading, setSyncPkgLoading] = useState(false);
  const [syncUnitsLoading, setSyncUnitsLoading] = useState(false);
  const [syncLinkLoading, setSyncLinkLoading] = useState(false);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const data = await fetchAIModels();
      setAvailableModels(data.available_models || []);
      setCompetencyModel(data.current_competency_model || "");
      setValidationModel(data.current_validation_model || "");
      setInitialModels({
        comp: data.current_competency_model || "",
        val: data.current_validation_model || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch AI models configuration.",
        variant: "destructive",
      });
    } finally {
      setLoadingModels(false);
    }
  };

  const loadScraperStatus = async (silent = false) => {
    if (!silent) setLoadingStatus(true);
    try {
      const data = await fetchScraperStatus();
      if (data) {
        setScraperStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch scraper status", error);
    } finally {
      if (!silent) setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadModels();
    loadScraperStatus();

    // Poll every 3 minutes
    const interval = setInterval(() => {
      loadScraperStatus(true);
    }, 180000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateModels = async () => {
    if (!competencyModel || !validationModel) {
      toast({
        title: "Validation Error",
        description: "Both models must be selected before applying changes.",
        variant: "destructive",
      });
      return;
    }
    setUpdatingModels(true);
    try {
      const res = await updateAIModels(competencyModel, validationModel);
      if (res.success) {
        toast({
          title: "Models Updated",
          description: "AI models updated successfully across all services!",
        });
        setInitialModels({ comp: competencyModel, val: validationModel });
      } else {
        throw new Error(res.detail || res.message || "Update failed");
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update AI model configuration.",
        variant: "destructive",
      });
    } finally {
      setUpdatingModels(false);
    }
  };

  const handleRevert = () => {
    setCompetencyModel(initialModels.comp);
    setValidationModel(initialModels.val);
    toast({
      title: "Reverted",
      description: "Model selections have been reset to current active values.",
    });
  };

  const triggerSyncPkg = async () => {
    setSyncPkgLoading(true);
    try {
      const res = await addAndUpdateTrainingPackage();
      toast({
        title: res.success ? "Sync Started" : "Notice",
        description: res.message || "Training packages sync triggered.",
        variant: res.success ? "default" : "destructive",
      });
      loadScraperStatus(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger training packages sync.",
        variant: "destructive",
      });
    } finally {
      setSyncPkgLoading(false);
    }
  };

  const triggerSyncUnits = async () => {
    setSyncUnitsLoading(true);
    try {
      const res = await addAndUpdateCompetencyUnits();
      toast({
        title: res.success ? "Sync Started" : "Notice",
        description: res.message || "Competency units sync triggered.",
        variant: res.success ? "default" : "destructive",
      });
      loadScraperStatus(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger competency units sync.",
        variant: "destructive",
      });
    } finally {
      setSyncUnitsLoading(false);
    }
  };

  const triggerLinkUnits = async () => {
    setSyncLinkLoading(true);
    try {
      const res = await linkCompetencyUnits();
      toast({
        title: res.success ? "Linking Complete" : "Notice",
        description: res.message || "Competency units linking triggered.",
        variant: res.success ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to trigger competency units linking.",
        variant: "destructive",
      });
    } finally {
      setSyncLinkLoading(false);
    }
  };

  const isChanged =
    competencyModel !== initialModels.comp ||
    validationModel !== initialModels.val;

  const isScraperBusy = 
    scraperStatus.training_packages.status === "processing" || 
    scraperStatus.competency_units.status === "processing" ||
    scraperStatus.training_packages.status === "pending" ||
    scraperStatus.competency_units.status === "pending";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {status.toUpperCase()}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> FAILED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          System Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1 ml-[52px]">
          Configure AI models and manage system database synchronization.
        </p>
      </div>

      {/* AI Model Configuration */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  AI Model Configuration
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live-switch the active Gemini models used by the system.
                </p>
              </div>
            </div>
            {loadingModels && (
              <Badge
                variant="secondary"
                className="font-mono text-xs gap-1.5"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Competency Model */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg mt-0.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Competency Units Extractor
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Model for scraping and formatting training.gov.au PDFs into
                    JSON mappings.
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Active Model
                </label>
                <Select
                  value={competencyModel}
                  onValueChange={setCompetencyModel}
                  disabled={loadingModels}
                >
                  <SelectTrigger className="w-full h-10 bg-white border-gray-200">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Validation Model */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg mt-0.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Validation Report Generator
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Model for deep analysis between Assessment Tool PDF and JSON
                    Mapping array.
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                  Active Model
                </label>
                <Select
                  value={validationModel}
                  onValueChange={setValidationModel}
                  disabled={loadingModels}
                >
                  <SelectTrigger className="w-full h-10 bg-white border-gray-200">
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleRevert}
              disabled={!isChanged || updatingModels}
              className="h-9 text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Revert / Refresh
            </Button>
            <Button
              onClick={handleUpdateModels}
              disabled={!isChanged || updatingModels}
              className="h-9 bg-[#021E34] hover:bg-[#032E47] text-white font-semibold"
            >
              {updatingModels ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Apply Changes Globally
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Database Sync */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Database className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-800">
                  System Database Sync
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Trigger background scrapers for core training.gov.au data.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadScraperStatus()}
              disabled={loadingStatus}
              className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loadingStatus ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              These are{" "}
              <span className="font-bold text-amber-700">
                heavy operations (10-30 min)
              </span>
              . Button stays disabled while running. Ensure you run them in the
              correct order.
            </p>
          </div>

          {/* Sync Items */}
          <div className="space-y-3">
            {/* 1. Sync Training Packages */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                      1
                    </span>
                    Sync Training Packages
                  </h4>
                  {getStatusBadge(scraperStatus.training_packages.status)}
                </div>
                <p className="text-xs text-gray-500 ml-8 italic">
                  {scraperStatus.training_packages.message}
                </p>
                <div className="flex items-center gap-2 ml-8 text-[10px] text-gray-400">
                  <Info size={10} />
                  Last Updated: {formatDate(scraperStatus.training_packages.updated_at)}
                </div>
              </div>
              <Button
                onClick={triggerSyncPkg}
                disabled={syncPkgLoading || isScraperBusy}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 min-w-[120px] ml-4 shrink-0"
              >
                {syncPkgLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CloudLightning className="w-4 h-4 mr-2" />
                )}
                Run Sync
              </Button>
            </div>

            {/* 2. Sync Competency Units */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                      2
                    </span>
                    Sync Competency Units
                  </h4>
                  {getStatusBadge(scraperStatus.competency_units.status)}
                </div>
                <p className="text-xs text-gray-500 ml-8 italic">
                  {scraperStatus.competency_units.message}
                </p>
                <div className="flex items-center gap-2 ml-8 text-[10px] text-gray-400">
                  <Info size={10} />
                  Last Updated: {formatDate(scraperStatus.competency_units.updated_at)}
                </div>
              </div>
              <Button
                onClick={triggerSyncUnits}
                disabled={syncUnitsLoading || isScraperBusy}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 min-w-[120px] ml-4 shrink-0"
              >
                {syncUnitsLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CloudLightning className="w-4 h-4 mr-2" />
                )}
                Run Sync
              </Button>
            </div>

            {/* 3. Link Competency Units */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                    3
                  </span>
                  Link Competency Units
                </h4>
                <p className="text-xs text-gray-500 ml-8">
                  Links raw Competency Units to their corresponding Training
                  Packages.
                </p>
              </div>
              <Button
                onClick={triggerLinkUnits}
                disabled={syncLinkLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 min-w-[120px] ml-4 shrink-0"
              >
                {syncLinkLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                Link Units
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
