import React, { useState, useRef, useEffect } from "react";
import { 
  CheckCircle2, CloudUpload, FileText, Trash2, User, Upload, 
  FileCheck, RefreshCw, Eye, AlertCircle, Clock, Download, X, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { fetchUnitsForReports } from "./api";

// Shared API Helper for this specific component's distinct endpoints
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const HEADERS_NGROK = { "ngrok-skip-browser-warning": "true" };

function formatFileSize(bytes: number) {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getAuthToken() {
    return sessionStorage.getItem("access_token");
}

export function DocumentGame() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"assessment" | "report">("assessment");
  
  // Assessment State
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Report State
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  
  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [previewFilename, setPreviewFilename] = useState("validation_report.pdf");
  const [dynamicUnits, setDynamicUnits] = useState<string[]>([]);

  // Fetch dynamic competency units
  useEffect(() => {
    const loadUnits = async () => {
        try {
            const data = await fetchUnitsForReports();
            setDynamicUnits(data?.unit_codes || []);
        } catch (err) {
            console.error("Failed to fetch units:", err);
        }
    };
    loadUnits();
  }, []);

  // Map dynamic units from API to the expected format
  const competencyUnits = dynamicUnits.map(unit => {
    const unitCode = typeof unit === 'string' ? unit : (unit as any).unit_code || (unit as any).value;
    return { value: unitCode, label: unitCode };
  });

  const filteredCompetencyUnits = competencyUnits.filter(unit =>
    unit.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Handlers for Assessment ---

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
        processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload immediately as per original logic
    setUploading(true);
    setTimeout(() => {
        setUploading(false);
        toast({ title: "Success", description: "Files uploaded locally!" });
    }, 1000);
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleGenerateReport = async () => {
    if (uploadedFiles.length === 0) return;
    setGenerating(true);
    try {
        const formData = new FormData();
        formData.append('competency_document', selectedCompetency);
        uploadedFiles.forEach(f => {
             formData.append('assessment_tool_pdf', f.file, f.name);
        });

        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/analyze-assessment-tool`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token || ''}`, ...HEADERS_NGROK },
            body: formData,
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Failed: ${res.status} - ${txt}`);
        }
        
        const data = await res.json();
        toast({ title: "Report Generated", description: "Your validation report has been generated!" });
        
        // If response has PDF content, show preview
        if (data.pdf_content_base64) {
            handlePreviewData(data, `${selectedCompetency}_Report.pdf`);
        } else {
            setActiveTab("report"); // Switch to report view if no immediate PDF
            fetchUserTasks();
        }

    } catch (e: any) {
        toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
    } finally {
        setGenerating(false);
    }
  };

  const handlePreviewData = (data: any, defaultFilename: string) => {
    if (data && data.pdf_content_base64) {
      try {
        const base64String = data.pdf_content_base64;
        const cleanBase64 = base64String.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = window.atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        setPdfBlob(blob);
        setPreviewPdfUrl(url);
        setPreviewFilename(data.filename || defaultFilename);
        setIsPreviewOpen(true);

      } catch (err) {
        console.error('Error processing PDF:', err);
        toast({
          title: "Error",
          description: "Failed to load PDF preview.",
          variant: "destructive",
        });
      }
    } else {
        toast({
            title: "Info",
            description: "No PDF data returned from server.",
        });
    }
  };

  const handleDownloadReport = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = previewFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Downloaded",
        description: "Your validation report has been downloaded successfully!",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

  // --- Handlers for Reports ---

  const fetchUserTasks = async () => {
      setLoadingReports(true);
      setReportError(null);
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/user-tasks`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, ...HEADERS_NGROK },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const json = await res.json();
        
        if (json.tasks) {
            setReports(json.tasks
                .filter((t: any) => t.type === 'validation' || !t.type)
                .map((t: any) => ({
                    id: t.task_id,
                    type: t.type || 'validation',
                    unit_code: t.unit_code || '',
                    document_name: t.type === 'competency'
                        ? `${t.unit_code} — Competency Report`
                        : (t.filename || `${t.competency_document || t.unit_code}_Assessment_Tool.pdf`),
                    uploaded_at: t.created_at,
                    updated_at: t.updated_at,
                    status: (t.status || 'pending').toLowerCase(),
                    competency_document: t.competency_document || t.unit_code,
                    filename: t.filename,
                    message: t.message,
                    error: t.error,
                })));
        }
      } catch (e: any) {
          setReportError(e.message);
      } finally {
          setLoadingReports(false);
      }
  };

  const handlePreview = async (task_id: string, competency_document: string) => {
      setPreviewLoadingId(task_id);
      try {
        const formData = new FormData();
        formData.append("task_id", task_id);
        formData.append("competency_document", competency_document);
        formData.append("include_html", "False"); // Original logic requested JSON result I guess, or maybe handle redirect?
        // Actually original logic navigated to /report with state. 
        // We will try to just alert for now or implement a preview dialog if we knew the response format.
        // Assuming response is JSON with result data.
        
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/get_analyze-assessment-tool`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, ...HEADERS_NGROK },
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to load preview");
        const data = await res.json();
        
        handlePreviewData(data, `${competency_document}_Preview.pdf`);

      } catch (e: any) {
          toast({ title: "Preview Failed", description: e.message, variant: "destructive" });
      } finally {
          setPreviewLoadingId(null);
      }
  };

  useEffect(() => {
      if (activeTab === 'report') {
          fetchUserTasks();
      }
  }, [activeTab]);


  // --- Render ---

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2">
                {activeTab === 'assessment' ? <Upload className="h-5 w-5 text-blue-600"/> : <FileCheck className="h-5 w-5 text-purple-600"/>}
                {activeTab === 'assessment' ? "Assessment Tool Validation" : "Report Status"}
            </h2>
            <div className="flex gap-2">
                 <Button 
                    variant={activeTab === 'assessment' ? "default" : "outline"}
                    onClick={() => setActiveTab('assessment')}
                    size="sm"
                 >
                    Assessment Tool
                 </Button>
                 <Button 
                    variant={activeTab === 'report' ? "default" : "outline"}
                    onClick={() => setActiveTab('report')}
                    size="sm"
                 >
                    Report Status
                 </Button>
            </div>
        </div>

        {activeTab === 'assessment' && (
            <div className="grid gap-6">
                {/* Step 1 */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">1</div>
                            <h3 className="text-lg font-bold">Select Competency Unit</h3>
                        </div>
                        <Select value={selectedCompetency} onValueChange={(v) => { setSelectedCompetency(v); setSearchQuery(""); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a competency unit..." />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2"><Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                                {filteredCompetencyUnits.map(u => (
                                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Step 2 */}
                {selectedCompetency && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">2</div>
                                <h3 className="text-lg font-bold">Upload Assessment Tools</h3>
                            </div>
                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600">Drag files here or click to upload</p>
                                <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleFileSelect} />
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploadedFiles.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-blue-600"/>
                                                <div className="text-sm">
                                                    <div className="font-medium">{f.name}</div>
                                                    <div className="text-xs text-muted-foreground">{formatFileSize(f.size)}</div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeFile(f.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 3 */}
                {selectedCompetency && (
                    <div className="flex justify-center pb-8">
                        <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform"
                            onClick={handleGenerateReport}
                            disabled={uploadedFiles.length === 0 || generating}
                        >
                            {generating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4"/>}
                            {generating ? "Analyzing..." : "Generate Validation Report"}
                        </Button>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'report' && (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Your Reports</h3>
                        <Button variant="outline" size="sm" onClick={() => fetchUserTasks()} disabled={loadingReports}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${loadingReports ? 'animate-spin' : ''}`} /> Refresh
                        </Button>
                    </div>
                    
                    {loadingReports ? (
                        <div className="text-center py-12"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/></div>
                    ) : reportError ? (
                        <div className="text-center py-12 text-red-500">{reportError}</div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No reports found.</div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${r.type === 'competency' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {r.type === 'competency' ? <Sparkles className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {r.document_name}
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    r.type === 'competency' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                                                }`}>
                                                    {r.type}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(r.uploaded_at).toLocaleString()}
                                                {r.message && <span className="ml-2 text-slate-400">· {r.message}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                            r.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            r.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {r.status}
                                        </div>
                                        {r.type === 'validation' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                disabled={r.status !== 'completed' || previewLoadingId === r.id}
                                                onClick={() => handlePreview(r.id, r.competency_document)}
                                            >
                                                {previewLoadingId === r.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                                                <span className="ml-2 hidden sm:inline">Preview</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {/* PDF Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Eye className="h-6 w-6" />
                                Report Preview
                            </DialogTitle>
                            <DialogDescription className="text-blue-100">
                                {previewFilename}
                            </DialogDescription>
                        </div>
                        <Button 
                            onClick={handleDownloadReport}
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </DialogHeader>
                <div className="flex-1 bg-gray-50 p-4">
                    {previewPdfUrl ? (
                         <iframe 
                            src={previewPdfUrl} 
                            className="w-full h-full border-none rounded-lg shadow-inner bg-white"
                            title="Validation Report Preview"
                         />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading preview...</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
