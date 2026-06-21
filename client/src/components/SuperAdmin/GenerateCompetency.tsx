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
import { Loader2, SearchIcon, Sparkles, X } from "lucide-react";
import { CompetencyReport } from "./types";
import { callProcessUnit, getAuthToken, searchUnitCodes } from "./api";

interface GenerateCompetencyProps {
  setCompetencyReports: React.Dispatch<React.SetStateAction<CompetencyReport[]>>;
  setActiveManagerTab: (tab: "system" | "add" | "live_status") => void;
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
    const [unitSearchResults, setUnitSearchResults] = useState<any[]>([]);
    const [unitSearchLoading, setUnitSearchLoading] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const [addUnitLoading, setAddUnitLoading] = useState(false);
    const [addUnitError, setAddUnitError] = useState<string | null>(null);
    const [addUnitSuccess, setAddUnitSuccess] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<any | null>(null);

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
                const data = await searchUnitCodes(debouncedQuery, "50");
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
        if (!selectedUnit) return;
        const unitCode = selectedUnit.unit_code;
        
        setAddUnitLoading(true);
        setAddUnitError(null);
        setAddUnitSuccess(null);
    
        // 1. Create Report Placeholder
        const reportId = `CR-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const newReport: CompetencyReport = {
            id: reportId,
            name: `Report - ${unitCode}`,
            units: [unitCode],
            createdAt: new Date().toISOString(),
            status: "processing",
            taskIds: []
        };
        // Update parent state
        setCompetencyReports(prev => [...prev, newReport]);
    
        try {
            // 2. Perform actions: Process
            const res = await callProcessUnit(unitCode);
    
            if (res?.task_id) {
                setCompetencyReports(prev => prev.map(r => r.id === reportId ? { ...r, taskIds: [res.task_id] } : r));
                setAddUnitSuccess(`Unit ${unitCode} processed! Report generation started.`);
                setActiveManagerTab('live_status'); 
                
                // Refresh system list in background just in case
                setTimeout(() => loadSystemUnits(), 2000);
            } else {
                setAddUnitError("Unit processed but no Task ID returned.");
            }
    
        } catch (e: any) {
            console.error(e);
            setCompetencyReports(prev => prev.map(r => r.id === reportId ? { 
                ...r, 
                status: "completed", 
                htmlContent: btoa(`<h2>Processing Failed</h2><p>${e.message || "Unknown error"}</p>`) 
            } : r));
            setAddUnitError(e.message || "An unexpected error occurred.");
        } finally {
            setAddUnitLoading(false);
            setUnitSearchQuery('');
            setSelectedUnit(null);
        }
    };

    return (
        <div className="max-w-2xl pb-24 animate-in fade-in slide-in-from-left-2 duration-300">
            <Card className="border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl overflow-visible">
                <CardHeader className="border-b border-gray-100 dark:border-slate-700/50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-slate-100">
                                Add & Process New Unit
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                AI-driven competency unit validation pipeline.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 relative">
                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-lg">
                             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex gap-2">
                                <SearchIcon className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                                <span>
                                    Search and <strong>Select</strong> a unit from the results. e.g. <code className="bg-blue-100/50 text-blue-700 dark:text-blue-400 px-1 rounded font-mono">BSBCMM211</code>
                                </span>
                             </p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Label className="text-xs font-bold mb-2 block text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                    Unit Selection
                                </Label>
                                <div className="relative group">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"/>
                                    <Input 
                                        placeholder="Type unit code or name..." 
                                        className="pl-11 h-12 text-base border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/10"
                                        value={unitSearchQuery}
                                        onChange={(e) => {
                                            setUnitSearchQuery(e.target.value);
                                            setSelectedUnit(null); // Invalidate if they type/paste manually
                                            setShowUnitDropdown(true);
                                        }}
                                        disabled={addUnitLoading}
                                        onFocus={() => setShowUnitDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)} 
                                    />
                                    {showUnitDropdown && (unitSearchLoading || unitSearchResults.length > 0) && (
                                        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-xl max-h-[300px] overflow-auto animate-in fade-in zoom-in-95 duration-200">
                                            {unitSearchLoading && (
                                                <div className="p-4 flex items-center justify-center text-xs text-muted-foreground border-b italic gap-2">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Searching...
                                                </div>
                                            )}
                                            {unitSearchResults.map((unit) => (
                                                <div 
                                                    key={unit.unit_code} 
                                                    className={`px-5 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0 ${selectedUnit?.unit_code === unit.unit_code ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                    onMouseDown={() => {
                                                        setUnitSearchQuery(`${unit.unit_code} - ${unit.unit_name}`);
                                                        setSelectedUnit(unit);
                                                        setShowUnitDropdown(false);
                                                    }}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{unit.unit_code}</span>
                                                        <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{unit.unit_name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button 
                                className="w-full bg-[#021E34] hover:bg-[#032E47] dark:bg-blue-600 dark:hover:bg-blue-500 h-12 text-sm font-bold rounded-lg gap-2"
                                onClick={handleAddUnit}
                                disabled={addUnitLoading || !selectedUnit}
                            >
                                {addUnitLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" /> 
                                        <span>Process Validation Report</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        {addUnitError && (
                            <div className="flex items-start gap-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                                <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{addUnitError}</span>
                            </div>
                        )}
                        {addUnitSuccess && (
                             <div className="flex items-start gap-3 text-xs text-green-700 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{addUnitSuccess}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
