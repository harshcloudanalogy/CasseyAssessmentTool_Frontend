import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  RefreshCw,
  Eye,
  Download,
  ArrowRight,
  X,
  FileText
} from "lucide-react";
import { CompetencyReport } from "./types";
import { fetchProcessResult, fetchUserTasks } from "./api";

interface ValidationReportsProps {
  competencyReports: CompetencyReport[];
  setCompetencyReports: React.Dispatch<React.SetStateAction<CompetencyReport[]>>;
}

export function ValidationReports({ competencyReports, setCompetencyReports }: ValidationReportsProps) {
  const [reloadingReport, setReloadingReport] = useState<string | null>(null);
  const [viewReportDialog, setViewReportDialog] = useState<CompetencyReport | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  const handleRefreshStatus = async () => {
    setRefreshingStatus(true);
    try {
        const data = await fetchUserTasks();
        if (data.tasks) {
            // Get competency tasks from API
            const competencyTasks = data.tasks.filter((t: any) => t.type === 'competency');
            
            // Build reports from API tasks
            const apiReports: CompetencyReport[] = competencyTasks.map((t: any) => ({
                id: t.task_id,
                name: `Report - ${t.unit_code}`,
                units: [t.unit_code],
                createdAt: t.created_at,
                status: t.result?.status === 'error' ? 'failed' as const
                    : (t.status || 'processing').toLowerCase() === 'completed' ? 'completed' as const
                    : (t.status || 'processing').toLowerCase() === 'failed' ? 'failed' as const
                    : 'processing' as const,
                htmlContent: t.result?.html_base64 || undefined,
                taskIds: [t.task_id],
            }));

            // Merge: keep local reports that are still processing and not yet in API
            setCompetencyReports(prev => {
                const apiTaskIds = new Set(apiReports.map(r => r.taskIds?.[0]));
                const localOnly = prev.filter(r => {
                    const tid = r.taskIds?.[0];
                    return tid && !apiTaskIds.has(tid) && r.status === 'processing';
                });
                return [...apiReports, ...localOnly];
            });
        }
    } catch(e) { console.error(e); }
    finally { setRefreshingStatus(false); }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
         <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" onClick={handleRefreshStatus} disabled={refreshingStatus}>
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshingStatus ? 'animate-spin' : ''}`} />
                Refresh Status
            </Button>
         </div>
         <Card className="border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <CardContent className="p-0">
                {competencyReports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50/50">
                        No reports generated yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead>Report Name</TableHead>
                                <TableHead>Units</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competencyReports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{report.units.join(", ")}</TableCell>
                                    <TableCell>
                                        {report.status === 'processing' ? (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 gap-1">
                                                <Loader2 size={12} className="animate-spin" /> Processing
                                            </Badge>
                                        ) : report.status === 'failed' || report.status === 'error' ? (
                                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none">
                                                Failed
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none">
                                                Completed
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            disabled={report.status !== 'completed'}
                                            title={report.status !== 'completed' ? "Processing..." : "View Report"}
                                            onClick={async () => {
                                                // Always fetch fresh result on click to ensure we get the doc
                                                if (report.taskIds?.[0]) {
                                                     setReloadingReport(report.id);
                                                    try {
                                                        const res = await fetchProcessResult(report.taskIds[0]);
                                                        console.log("📄 [ValidationReports] fetchProcessResult response:", res);
                                                        
                                                        // Check if result has error status
                                                        if (res?.result?.status === 'error') {
                                                            const errorMsg = res.result.error || "Report generation failed";
                                                            alert(`Error: ${errorMsg}`);
                                                            // Update report status to failed
                                                            const updated = { 
                                                                ...report, 
                                                                status: 'failed' as const,
                                                            };
                                                            setCompetencyReports(prev => prev.map(p => p.id === report.id ? updated : p));
                                                        } else if (res?.result?.html_base64) {
                                                            // Update report with latest content
                                                            const updated = { 
                                                                ...report, 
                                                                status: 'completed' as const, 
                                                                htmlContent: res.result.html_base64 // Store base64 direct for dialog usage
                                                            };
                                                            setCompetencyReports(prev => prev.map(p => p.id === report.id ? updated : p));
                                                            setViewReportDialog(updated);
                                                        } else {
                                                            alert("Document not ready or empty.");
                                                        }
                                                    } catch(e) { 
                                                        console.error(e); 
                                                        alert("Failed to fetch document status.");
                                                    } finally { 
                                                        setReloadingReport(null); 
                                                    }
                                                }
                                            }}
                                        >
                                            <Eye size={16} className={report.status !== 'completed' ? "text-gray-300" : "text-blue-600"} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        {/* Full Feature Preview Dialog */}
        <Dialog open={!!viewReportDialog} onOpenChange={(o) => !o && setViewReportDialog(null)}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                         <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                         </div>
                         <div>
                            <DialogTitle className="text-lg font-semibold">{viewReportDialog?.name || "Report View"}</DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                {viewReportDialog?.status === 'completed' ? 'Ready for review' : 'Processing...'}
                            </p>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mr-8">
                        {/* Download Button */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                const content = viewReportDialog?.htmlContent; // Base64
                                if (!content) return;
                                try {
                                    const bin = atob(content);
                                    // Check PDF signature
                                    const isPdf = bin.startsWith("%PDF");
                                    const blobType = isPdf ? "application/pdf" : "text/html";
                                    const ext = isPdf ? "pdf" : "html";

                                    // Create Blob
                                    const len = bin.length;
                                    const u8 = new Uint8Array(len);
                                    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
                                    
                                    const blob = new Blob([u8], { type: blobType });
                                    const url = URL.createObjectURL(blob);
                                    
                                    // Trigger Download
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${viewReportDialog.name.replace(/\s+/g, '_')}.${ext}`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                } catch(e) { console.error("Download fail", e); }
                            }}
                        >
                            <Download size={14} className="mr-2"/> Download
                        </Button>

                        {/* Open New Tab */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                 const content = viewReportDialog?.htmlContent; // Base64
                                if (!content) return;
                                try {
                                    const bin = atob(content);
                                    const isPdf = bin.startsWith("%PDF");
                                    const blobType = isPdf ? "application/pdf" : "text/html";
                                    
                                    const len = bin.length;
                                    const u8 = new Uint8Array(len);
                                    for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
                                    
                                    const blob = new Blob([u8], { type: blobType });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                } catch(e) { console.error("Open tab fail", e); }
                            }}
                        >
                            <ArrowRight size={14} className="-rotate-45 mr-2"/> Open Tab
                        </Button>

                    </div>
                </DialogHeader>

                <div className="flex-1 bg-gray-100 dark:bg-slate-900 overflow-hidden relative">
                    {viewReportDialog?.htmlContent ? (
                         (() => {
                             const content = viewReportDialog.htmlContent;
                             const bin = atob(content);
                             const isPdf = bin.startsWith("%PDF");
                             
                             if (isPdf) {
                                  // Data URI for iframe PDF display
                                 const dataUri = `data:application/pdf;base64,${content}`;
                                 return (
                                     <iframe 
                                        src={dataUri}
                                        className="w-full h-full border-none"
                                        title="PDF Preview"
                                     />
                                 );
                             } else {
                                 return (
                                     <iframe 
                                        srcDoc={bin}
                                        className="w-full h-full bg-white border-none"
                                        title="HTML Preview"
                                        sandbox="allow-same-origin allow-scripts allow-popups"
                                     />
                                 );
                             }
                         })()
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                           <Loader2 className="animate-spin text-blue-500" size={32} />
                           <span>Loading Document...</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
     </div>
  );
}
