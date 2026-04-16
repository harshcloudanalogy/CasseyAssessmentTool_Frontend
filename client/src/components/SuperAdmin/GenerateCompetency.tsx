import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, SearchIcon, Sparkles } from "lucide-react";
import { CompetencyReport } from "./types";
import { addCompetencyUnit, callProcessUnit, getAuthToken, searchUnitCodes } from "./api";

interface GenerateCompetencyProps {
  setCompetencyReports: React.Dispatch<React.SetStateAction<CompetencyReport[]>>;
  setActiveManagerTab: (tab: "system" | "add" | "view_reports") => void;
  loadSystemUnits: () => Promise<void>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function GenerateCompetency({ setCompetencyReports, setActiveManagerTab, loadSystemUnits }: GenerateCompetencyProps) {
    const [unitSearchQuery, setUnitSearchQuery] = useState("");
    const [debouncedQuery] = [useDebounce(unitSearchQuery, 300)]; 
    const [unitSearchResults, setUnitSearchResults] = useState<string[]>([]);
    const [unitSearchLoading, setUnitSearchLoading] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const [addUnitLoading, setAddUnitLoading] = useState(false);
    const [addUnitError, setAddUnitError] = useState<string | null>(null);
    const [addUnitSuccess, setAddUnitSuccess] = useState<string | null>(null);

    // Autocomplete Effect
    useEffect(() => {
        if (!showUnitDropdown) return;
        
        if (debouncedQuery.trim() === "") {
             setUnitSearchResults([]);
             setUnitSearchLoading(false);
             return;
        }

        let active = true;
        const performSearch = async () => {
            setUnitSearchLoading(true);
            try {
                const data = await searchUnitCodes(debouncedQuery, "5");
                if (active) setUnitSearchResults(data);
            } catch (err) {
                console.error(err);
                if (active) setUnitSearchResults([]);
            } finally {
                if (active) setUnitSearchLoading(false);
            }
        };

        performSearch();
        return () => { active = false; };
    }, [debouncedQuery, showUnitDropdown]);


    const handleAddUnit = async () => {
        if (!unitSearchQuery) return;
        setAddUnitLoading(true);
        setAddUnitError(null);
        setAddUnitSuccess(null);
    
        // 1. Create Report Placeholder
        const reportId = `CR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const newReport: CompetencyReport = {
            id: reportId,
            name: `Report - ${unitSearchQuery}`,
            units: [unitSearchQuery],
            createdAt: new Date().toISOString(),
            status: "processing",
            taskIds: []
        };
        // Update parent state
        setCompetencyReports(prev => [...prev, newReport]);
    
        try {
            // 2. Perform actions: Add to System + Process
            const [addRes, processRes] = await Promise.allSettled([
                addCompetencyUnit(unitSearchQuery),
                callProcessUnit(unitSearchQuery)
            ]);
    
            // Check Process Result (Priority)
            if (processRes.status === "fulfilled") {
                 const res = processRes.value;
                 if (res?.task_id) {
                     setCompetencyReports(prev => prev.map(r => r.id === reportId ? { ...r, taskIds: [res.task_id] } : r));
                     setAddUnitSuccess(`Unit processed! Report generation started.`);
                     setActiveManagerTab('view_reports'); 
                 } else {
                     setAddUnitError("Unit processed but no Task ID returned.");
                 }
            } else {
                console.error("Process failed:", processRes.reason);
                setCompetencyReports(prev => prev.map(r => r.id === reportId ? { 
                    ...r, 
                    status: "completed", 
                    htmlContent: btoa(`<h2>Processing Failed</h2><p>${processRes.reason?.message || "Unknown error"}</p>`) 
                } : r));
                setAddUnitError("Failed to generate report. See reports list for details.");
            }
    
            // Check Add Result
            if (addRes.status === "fulfilled") {
                loadSystemUnits(); // Refresh system list in background
            } else {
                console.warn("Failed to add to system list:", addRes.reason);
            }
    
        } catch (e: any) {
            console.error(e);
            setAddUnitError(e.message || "An unexpected error occurred.");
        } finally {
            setAddUnitLoading(false);
            setUnitSearchQuery('');
        }
    };

    return (
        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-gray-200 dark:border-slate-700 shadow-sm">
                <CardHeader>
                    <CardTitle>Add & Process New Unit</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Enter a Unit Code - e.g. <code className="bg-gray-100 dark:bg-slate-900 px-1 rounded">BSBCMM211</code>.
                        This will seek definitions and generating a validation report.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="relative">
                            <Label className="text-sm font-medium mb-2 block">Unit Code</Label>
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input 
                                    placeholder="Enter Unit Code..." 
                                    className="pl-9 h-11"
                                    value={unitSearchQuery}
                                    onChange={(e) => {
                                        setUnitSearchQuery(e.target.value.toUpperCase());
                                        setShowUnitDropdown(true);
                                    }}
                                    disabled={addUnitLoading}
                                    onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)} 
                                />
                                {showUnitDropdown && unitSearchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {unitSearchLoading && <div className="p-2 text-xs text-muted-foreground">Searching...</div>}
                                        {unitSearchResults.map((code) => (
                                            <div 
                                                key={code} 
                                                className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm font-mono"
                                                onMouseDown={() => {
                                                    setUnitSearchQuery(code);
                                                    setShowUnitDropdown(false);
                                                }}
                                            >
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-500 h-11"
                            onClick={handleAddUnit}
                            disabled={addUnitLoading || !unitSearchQuery}
                        >
                            {addUnitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Unit...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Generate Report
                                </>
                            )}
                        </Button>
                        
                        {addUnitError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{addUnitError}</p>}
                        {addUnitSuccess && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{addUnitSuccess}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
