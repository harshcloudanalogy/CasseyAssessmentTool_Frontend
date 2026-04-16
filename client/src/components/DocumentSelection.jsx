import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle2, CloudUpload, FileText, Trash2, LogOut, User, Upload, 
  FileCheck, RefreshCw, Eye, AlertCircle, Clock, Shield, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import logo from "../components/assets/Edulogo.png";
import { fetchUnitsForReports } from "./SuperAdmin/api";
import { useAuth } from "@/hooks/use-auth";
import { parseJwt } from "@/lib/auth";

// Small Logo Component
const SmallLogo = () => (
  <img src={logo} alt="EduValidate Logo" className="w-21 h-9 object-contain" />
);


// Side Navigation Component
const SideNav = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("access_token");
  const decoded = token ? parseJwt(token) : null;
  const isAdmin = decoded?.role === 0;

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-gray-200">
      <div className="p-[18px] border-b border-gray-200">
        <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-700">Welcome, {isAdmin ? 'Admin' : 'User'}</span>
              </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => {
            setActiveTab("assessment");
            navigate("/documents");
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
            activeTab === "assessment"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Assessment Tool</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("report");
            navigate("/report-status");
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
            activeTab === "report"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FileCheck className="w-5 h-5" />
          <span>Report Status</span>
        </button>
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-2">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="w-full justify-start text-[#021B30] border-[#021B30] hover:bg-blue-50 font-medium"
          >
            <Shield className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            sessionStorage.removeItem('access_token');
            navigate("/")
          }}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

// Report Status Page Component (with Real API)
const ReportStatus = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserTasks = async () => {
    const token = sessionStorage.getItem("access_token");
    if (!token) throw new Error("No access token found");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/user-tasks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Failed: ${response.status} – ${txt}`);
    }
    return response.json();
  };

  const {
    data: apiData,
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userTasks"],
    queryFn: fetchUserTasks,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const reports = apiData?.tasks
    ?.filter((t) => t.type === 'validation' || !t.type)
    ?.map((t) => {
    // Check result.status first (actual workflow result), fallback to t.status
    let actualStatus = t.result?.status || t.status;
    
    // If task is "fast-track" or has message about unit already available, mark as completed
    if (t.task_id?.startsWith('fast-track-') || 
        t.message?.includes('already available') || 
        t.message?.includes('added to your organization')) {
      actualStatus = 'completed';
    }
    
    return {
      id: t.task_id,
      type: t.type || 'validation',
      unit_code: t.unit_code || '',
      document_name: t.type === 'competency'
        ? `${t.unit_code} \u2014 Competency Report`
        : (t.filename || `${t.competency_document || t.unit_code}_Assessment_Tool.pdf`),
      uploaded_at: t.created_at,
      updated_at: t.updated_at,
      status: (actualStatus || 'pending').toLowerCase(),
      competency_document: t.competency_document || t.unit_code,
      filename: t.filename,
      error: t.result?.error || t.error,
      message: t.message,
    };
  }) ?? [];

  // Mutation for Preview API
  const previewMutation = useMutation({
    mutationFn: async ({ task_id, competency_document }) => {
      const token = sessionStorage.getItem("access_token");
      if (!token) throw new Error("No access token");

      const formData = new FormData();
      formData.append("task_id", task_id);
      formData.append("competency_document", competency_document);
      formData.append("include_html", "False");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get_analyze-assessment-tool`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Failed: ${response.status} – ${txt}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Loaded",
        description: "Redirecting to preview...",
      });
      navigate("/report", { state: { apiResponse: data } });
    },
    onError: (error) => {
      toast({
        title: "Preview Failed",
        description: error.message || "Could not load report.",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (task_id, competency_document) => {
    toast({
      title: "Loading Preview",
      description: "Fetching report...",
    });
    previewMutation.mutate({ task_id, competency_document });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'failed': 
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleReload = () => {
    toast({ title: "Reloading", description: "Fetching latest tasks…" });
    refetch();
  };

  return (
    <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <SmallLogo />
            <div className="flex items-center space-x-6">
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Report Status
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track the validation status of your uploaded assessment tools
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Validation Reports</h2>
            <Button
              onClick={handleReload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-md transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Loading tasks…</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12 text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>Error: {error?.message || String(error)}</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try again
              </Button>
            </div>
          )}

          {/* Reports List */}
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      report.type === 'competency' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {report.type === 'competency' 
                        ? <Sparkles className="w-6 h-6 text-purple-600" />
                        : <FileText className="w-6 h-6 text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                        {report.document_name}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          report.type === 'competency' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          {report.type}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {new Date(report.uploaded_at).toLocaleString()}
                        {report.message && <span className="ml-2 text-gray-400">· {report.message}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="font-medium capitalize">{report.status}</span>
                    </div>

                  {report.type === 'validation' && (
                    <Button
                      onClick={() => handlePreview(report.id, report.competency_document)}
                      disabled={report.status !== 'completed' || previewMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium shadow-md transition-all hover:scale-105 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                    >
                      {previewMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      Preview
                    </Button>
                  )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No tasks found</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Main Document Selection Component
export default function DocumentSelection() {
  useAuth();
  if (!sessionStorage.getItem("access_token")) return null;
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  // Fix: Preserve active tab across routes
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("report-status") ? "report" : "assessment"
  );

  // Sync active tab when route changes
  useEffect(() => {
    setActiveTab(location.pathname.includes("report-status") ? "report" : "assessment");
  }, [location.pathname]);
  
  // Fetch dynamic competency units
  const { data: dynamicUnitsData } = useQuery({
    queryKey: ["competencyUnits"],
    queryFn: fetchUnitsForReports,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
  
  const dynamicUnits = dynamicUnitsData?.unit_codes || [];

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 1000);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Files uploaded successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files.",
        variant: "destructive",
      });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('competency_document', selectedCompetency); // This now sends correct value like ACMAAS401
      data.files.forEach(fileName => {
        const uploadedFile = uploadedFiles.find(f => f.name === fileName);
        if (uploadedFile) {
          formData.append('assessment_tool_pdf', uploadedFile.file, uploadedFile.name);
        }
      });

      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze-assessment-tool`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || ''}` },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed: ${response.status} - ${errorText}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: "Your validation report has been generated!",
      });
      navigate("/report-status", { state: { apiResponse: data } });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report.",
        variant: "destructive",
      });
    }
  });

  const handleCompetencyChange = (value) => {
    setSelectedCompetency(value);
    setSearchQuery("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('competencyUnit', selectedCompetency);
    uploadMutation.mutate(formData);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleGenerateReport = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload assessment tools.",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate({
      competencyUnit: selectedCompetency,
      files: uploadedFiles.map(f => f.name)
    });
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  // Map dynamic units from API to the expected format
  const competencyUnits = dynamicUnits.map(unit => {
    // Handle both string array and object array if needed
    const unitCode = typeof unit === 'string' ? unit : unit.unit_code || unit.value;
    return { value: unitCode, label: unitCode };
  });

  const filteredCompetencyUnits = competencyUnits.filter(unit =>
    unit.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render Report Status if on that route
  if (location.pathname === "/report-status") {
    return (
      <>
        <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <ReportStatus />
      </>
    );
  }

  return (
    <>
      <SideNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="ml-64 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <SmallLogo />
              <div className="flex items-center space-x-6">
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Assessment Tool Validation
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload and validate your assessment tools against official competency criteria
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Select Competency Unit</h2>
            </div>
            
            <div className="max-w-lg">
              <Select value={selectedCompetency} onValueChange={handleCompetencyChange}>
                <SelectTrigger 
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 transition-colors"
                  data-testid="select-competency"
                >
                  <SelectValue placeholder="Choose a competency unit..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-3 py-2">
                    <Input
                      placeholder="Search competency units..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                      data-testid="search-input"
                    />
                  </div>
                  {filteredCompetencyUnits.length > 0 ? (
                    filteredCompetencyUnits.map((unit) => (
                      <SelectItem 
                        key={unit.value} 
                        value={unit.value} 
                        data-testid={`option-${unit.value}`}
                      >
                        {unit.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No competency units found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCompetency && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  2
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Assessment Tools</h2>
              </div>
              
              <div 
                className={`relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragOver 
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.01]'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-area"
              >
                <CloudUpload className="w-20 h-20 text-blue-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  Drop your files here
                </h3>
                <p className="text-lg text-gray-500 mb-4">or click to browse your computer</p>
                <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Supports: PDF
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  data-testid="file-input"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-8" data-testid="uploaded-files">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900" data-testid={`file-name-${file.id}`}>
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500" data-testid={`file-size-${file.id}`}>
                              {formatFileSize(file.size)} • Uploaded successfully
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          data-testid={`button-remove-file-${file.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCompetency && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200/50 p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4">
                  3
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Generate Validation Report</h2>
              </div>
              
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Ready to validate your assessment tools? Our AI will analyze your documents 
                against the selected competency criteria and provide detailed feedback.
              </p>
              
              <Button
                onClick={handleGenerateReport}
                disabled={uploadedFiles.length === 0 || generateReportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100"
                data-testid="button-generate-report"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Analyzing Documents...
                  </>
                ) : (
                  <>
                    Generate Validation Report
                    <CheckCircle2 className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>
              
              {uploadedFiles.length === 0 && (
                <p className="text-sm text-gray-400 mt-4">
                  Please upload at least one assessment tool to continue
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}