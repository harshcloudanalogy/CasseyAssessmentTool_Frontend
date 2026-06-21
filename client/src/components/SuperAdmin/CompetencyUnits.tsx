import React, { useState } from "react";
import { Loader2, FileText, Eye, Download, ArrowRight, X, Trash2, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchGeneratedCompetency, deleteCompetencyUnit } from "./api";
import { parseJwt } from "@/lib/auth";

interface CompetencyUnitsProps {
    systemUnits: { unit_code: string; unit_name: string }[];
    loadingSystemUnits: boolean;
    loadSystemUnits: () => Promise<void>;
}

export function CompetencyUnits({ systemUnits, loadingSystemUnits, loadSystemUnits }: CompetencyUnitsProps) {
    const [previewUnit, setPreviewUnit] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [deletingUnit, setDeletingUnit] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Get user role - Allow both SuperAdmin (0) and OrgAdmin (1) to delete
    const token = sessionStorage.getItem("access_token");
    const decodedToken = token ? parseJwt(token) : null;
    const canDelete = decodedToken?.role === 0 || decodedToken?.role === 1;

    const filteredUnits = systemUnits.filter(unit => 
        unit.unit_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (unitCode: string) => {
        try {
            setDeletingUnit(unitCode);
            const res = await deleteCompetencyUnit(unitCode);
            if (res.success) {
                // Successfully deleted, refresh the list from API
                await loadSystemUnits();
            } else {
                console.error("Delete failed:", res.message);
            }
        } catch (e) {
            console.error("Failed to delete unit", unitCode, e);
        } finally {
            setDeletingUnit(null);
        }
    };

    const handlePreview = async (unitCode: string) => {
        setPreviewUnit(unitCode);
        setPreviewContent(null);
        setLoadingPreview(true);
        try {
            const res = await fetchGeneratedCompetency(unitCode);
            if (res.status === 'success' && res.html_base64) {
                setPreviewContent(res.html_base64);
            } else {
                setPreviewContent(null); // or error state
            }
        } catch (e) {
            console.error("Failed to load preview for unit", unitCode, e);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleDownload = () => {
        if (!previewContent || !previewUnit) return;
        try {
            const bin = atob(previewContent);
            const isPdf = bin.startsWith("%PDF");
            const blobType = isPdf ? "application/pdf" : "text/html";
            const ext = isPdf ? "pdf" : "html";

            const len = bin.length;
            const u8 = new Uint8Array(len);
            for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
            
            const blob = new Blob([u8], { type: blobType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${previewUnit}_validation_report.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(e) { console.error("Download fail", e); }
    };

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search Bar */}
            <div className="mb-6 relative">
                 <div className="relative group max-w-md">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                        placeholder="Search units by code or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 rounded-lg shadow-sm"
                    />
                 </div>
            </div>
            {loadingSystemUnits ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Loader2 className="animate-spin inline mr-2" /> Loading units...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredUnits.map((unit, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-500/50 transition flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                                    <FileText size={20} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-mono font-bold text-gray-900 dark:text-slate-100">{unit.unit_code}</span>
                                    <span className="text-xs text-gray-500 dark:text-slate-400 truncate mt-1" title={unit.unit_name}>{unit.unit_name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase font-bold tracking-wider bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">Ready</span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 w-9 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                    onClick={() => handlePreview(unit.unit_code)}
                                >
                                    <Eye size={18} />
                                </Button>
                                {canDelete && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-9 w-9 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                disabled={deletingUnit === unit.unit_code}
                                            >
                                                {deletingUnit === unit.unit_code ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action will permanently delete the competency unit <strong>{unit.unit_code}</strong> and its associated data from the system.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(unit.unit_code)} className="bg-red-600 hover:bg-red-700">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredUnits.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-muted-foreground border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                            {searchQuery ? "No units match your search query." : "No units found in the system. Use \"Add New Unit\" to fetch one."}
                        </div>
                    )}
                </div>
            )}

            {/* Preview Dialog */}
            <Dialog open={!!previewUnit} onOpenChange={(o) => !o && setPreviewUnit(null)}>
                <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                             </div>
                             <div>
                                <DialogTitle className="text-lg font-semibold">{previewUnit || "Preview"}</DialogTitle>
                                <p className="text-xs text-muted-foreground">Generated Competency Report</p>
                             </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mr-8">
                            <Button variant="outline" size="sm" onClick={handleDownload} disabled={!previewContent}>
                                <Download size={14} className="mr-2"/> Download
                            </Button>

                        </div>
                    </DialogHeader>

                    <div className="flex-1 bg-gray-100 dark:bg-slate-900 overflow-hidden relative">
                        {loadingPreview ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                               <Loader2 className="animate-spin text-blue-500" size={32} />
                               <span>Loading Preview...</span>
                            </div>
                        ) : previewContent ? (
                             (() => {
                                 const bin = atob(previewContent);
                                 const isPdf = bin.startsWith("%PDF");
                                 
                                 if (isPdf) {
                                     const dataUri = `data:application/pdf;base64,${previewContent}`;
                                     return (
                                         <iframe 
                                            src={dataUri}
                                            className="w-full h-full border-none"
                                            title="Preview"
                                         />
                                     );
                                 } else {
                                     return (
                                         <iframe 
                                            srcDoc={bin}
                                            className="w-full h-full bg-white border-none"
                                            title="Preview"
                                            sandbox="allow-same-origin allow-scripts allow-popups"
                                         />
                                     );
                                 }
                             })()
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>Failed to load content or no content available.</p>
                             </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
