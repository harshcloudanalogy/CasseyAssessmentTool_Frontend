import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle2,
  SearchIcon,
  Download,
  TriangleAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  List,
  RefreshCw,
  Zap,
  Users,
  Mail,
  User,
  Key,
  Copy,
  Check
} from "lucide-react";
import { fetchOrgDashboard, downloadValidationReport, resetOrgKey } from "./api";
import { AdminValidationReport } from "./types";
import { useToast } from "@/hooks/use-toast";
import { parseJwt } from "@/lib/auth";


interface OrgUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: number;
}

export function OrgDashboard() {
  const [reports, setReports] = useState<AdminValidationReport[]>([]);
  const [teamUsers, setTeamUsers] = useState<OrgUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [orgStats, setOrgStats] = useState<any>(null);
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [orgKey, setOrgKey] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { toast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Org Info from Token
  const token = sessionStorage.getItem("access_token");
  const decodedToken = useMemo(() => (token ? parseJwt(token) : null), [token]);
  // Try multiple possible field names: organization_id, org_id, or id
  const orgId = decodedToken?.organization_id || decodedToken?.org_id || decodedToken?.id;
  const userRole = decodedToken?.role;
  const userName = decodedToken?.first_name || decodedToken?.name || decodedToken?.username || decodedToken?.email?.split('@')[0] || 'User';
  const userEmail = decodedToken?.email || '';

  const loadData = async () => {
    // Debug logging
    console.log("🔍 [OrgDashboard] Starting loadData...");
    console.log("🔍 [OrgDashboard] Token exists:", !!token);
    console.log("🔍 [OrgDashboard] Decoded token:", decodedToken);
    
    // Try multiple possible field names for organization ID
    const possibleOrgId = decodedToken?.organization_id || decodedToken?.org_id || decodedToken?.id;
    console.log("🔍 [OrgDashboard] Extracted orgId:", possibleOrgId);
    console.log("🔍 [OrgDashboard] orgId variable:", orgId);

    if (!orgId) {
      const errorMsg = "Organization ID not found in session. Please log in again.";
      console.error("❌ [OrgDashboard]", errorMsg);
      console.error("❌ [OrgDashboard] Available token fields:", Object.keys(decodedToken || {}));
      setError(errorMsg);
      return;
    }

    console.log("✅ [OrgDashboard] Making API call with orgId:", orgId);
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrgDashboard(orgId);
      console.log("✅ [OrgDashboard] API response:", res);

      if (res.success) {
        setReports(res.validation_reports || []);
        setTeamUsers(res.users || []);
        setOrgStats({
          ...res.stats,
          validation_report_count: res.validation_report_count
        });
        setOrgInfo(res.organization);
        
        toast({
          title: "Dashboard Synced",
          description: `Data for ${res.organization.name} updated.`,
        });
      } else {
        throw new Error(res.message || "Failed to fetch dashboard data");
      }
    } catch (e: any) {
      console.error("❌ [OrgDashboard] Error:", e);
      setError(e.message);
      toast({
        title: "Sync Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const filteredReports = useMemo(() => {
    return reports.filter(item => {
      const q = searchQuery.toLowerCase();
      return (
        (item.user_name && item.user_name.toLowerCase().includes(q)) ||
        (item.competency_unit_code && item.competency_unit_code.toLowerCase().includes(q)) ||
        (item.report_name && item.report_name.toLowerCase().includes(q))
      );
    });
  }, [reports, searchQuery]);

  // Pagination for reports
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case 'pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"><TriangleAlert className="w-3 h-3 mr-1" /> Failed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = async (report: AdminValidationReport) => {
    if (!report.output_paths?.pdf) {
      toast({
        title: "Download Failed",
        description: "No PDF path found for this report.",
        variant: "destructive"
      });
      return;
    }

    setDownloadingId(report.id);
    try {
      const res = await downloadValidationReport(report.output_paths.pdf);
      if (res.success && res.base64_content) {
        const binaryString = window.atob(res.base64_content);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.filename || `report_${report.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Started",
          description: `Downloading ${res.filename || 'report'}.`,
        });
      } else {
        throw new Error(res.message || "Failed to retrieve file content");
      }
    } catch (e: any) {
      toast({
        title: "Download Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    setOrgKey(null);
    try {
      const res = await resetOrgKey();
      if (res.success) {
        setOrgKey(res.new_key || res.api_key);
        toast({
          title: "Key Regenerated",
          description: res.message || "Your new organization API key has been generated successfully.",
        });
      } else {
        throw new Error(res.message || "Failed to regenerate key");
      }
    } catch (e: any) {
      toast({
        title: "Regeneration Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!orgKey) return;
    navigator.clipboard.writeText(orgKey);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
    toast({
        title: "Copied",
        description: "API Key copied to clipboard",
        duration: 2000
    });
  };

  if (error) {
    return (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
            <TriangleAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-700 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadData()}>Try Again</Button>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Org Header Info */}
      {orgInfo && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <Zap className="h-6 w-6" />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-slate-800">{orgInfo.name}</h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {orgInfo.contact_person}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {orgInfo.email}</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                    {userRole !== 2 ? (
                      <button 
                          className={`h-9 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center rounded-lg text-sm font-bold ${regenerating ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={handleRegenerateKey}
                      >
                          <Key className={`w-4 h-4 mr-2 ${regenerating ? 'animate-pulse' : ''}`} />
                          {regenerating ? 'Regenerating...' : 'Regenerate Key'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-4 py-2">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <User className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{userName}</span>
                              <span className="text-[10px] text-slate-400">{userEmail}</span>
                          </div>
                      </div>
                    )}
                    <button 
                        className={`h-9 px-4 text-blue-600 hover:bg-blue-50 transition-all active:scale-95 flex items-center rounded-lg border border-blue-100 text-sm font-semibold ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => loadData()}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Sync Dashboard
                    </button>
              </div>
          </div>
      )}

      {/* API Key Display - Only for org admins */}
      {userRole !== 2 && orgKey && (
          <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                      <Key className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Your New API Key</span>
                      <code className="text-sm font-mono text-slate-700 mt-1 bg-white/80 px-2 py-0.5 rounded border border-blue-50/50 break-all select-all">
                          {orgKey}
                      </code>
                  </div>
              </div>
              <button 
                  onClick={copyToClipboard}
                  className="h-9 px-4 bg-white border border-blue-200 rounded-lg text-slate-700 text-sm font-semibold hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 hover:border-blue-300 shadow-sm"
              >
                  {copying ? (
                      <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600">Copied!</span>
                      </>
                  ) : (
                      <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          <span>Copy Key</span>
                      </>
                  )}
              </button>
          </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <Card className="bg-[#021E34] text-white border-none shadow-lg h-36 flex flex-col justify-center overflow-hidden">
          <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <FileText className="h-5 w-5 text-blue-300" />
                <span className="font-medium text-xs uppercase tracking-widest text-blue-100">Validations</span>
              </div>
              <div className="text-3xl font-bold">{orgStats?.validation_report_count ?? reports.length}</div>
              <p className="text-[10px] text-blue-300 mt-1 uppercase tracking-tight">Total across organization</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 text-white border-none shadow-lg h-36 flex flex-col justify-center overflow-hidden">
          <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Zap className="h-5 w-5 text-emerald-200" />
                <span className="font-medium text-xs uppercase tracking-widest text-emerald-100">Credits Left</span>
              </div>
              <div className="text-3xl font-bold">{orgInfo?.credits_left ?? orgStats?.total_credits_available ?? "..."}</div>
              <p className="text-[10px] text-emerald-100 mt-1 uppercase tracking-tight">Available for new reports</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-700 text-white border-none shadow-lg h-36 flex flex-col justify-center overflow-hidden">
          <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Users className="h-5 w-5 text-slate-300" />
                <span className="font-medium text-xs uppercase tracking-widest text-slate-100">Active Users</span>
              </div>
              <div className="text-3xl font-bold">{orgStats?.total_users ?? "..."}</div>
              <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tight">Team members registered</p>
          </CardContent>
        </Card>

        <Card className={`${orgInfo?.subscription?.name === 'Base' ? 'bg-blue-600' : 'bg-purple-600'} text-white border-none shadow-lg h-36 flex flex-col justify-center overflow-hidden transition-colors duration-500`}>
          <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <CheckCircle2 className="h-5 w-5 text-white/80" />
                <span className="font-medium text-xs uppercase tracking-widest text-white/90">Plan Type</span>
              </div>
              <div className="text-3xl font-bold">{orgInfo?.subscription?.name || (loading ? "..." : "Free")}</div>
              <p className="text-[10px] text-white/80 mt-1 uppercase tracking-tight">
                {orgInfo?.is_subscribed ? "Subscribed" : "Current subscription"}
              </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Log Table */}
        <Card className="lg:col-span-2 shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <List className="h-5 w-5 text-blue-600" />
                    Validation Reports
                </CardTitle>
                <div className="mt-4">
                    <div className="relative max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search reports or users..." 
                            className="pl-10 h-10 bg-white border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <div className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-bold text-slate-700">Unit Info</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">User</TableHead>
                            <TableHead className="font-bold text-slate-700 text-center">Cost</TableHead>
                            <TableHead className="font-bold text-slate-700 text-right pr-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && reports.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400">Loading reports...</TableCell></TableRow>
                        ) : paginatedReports.length > 0 ? (
                            paginatedReports.map((row) => (
                                <TableRow key={row.id} className="hover:bg-blue-50/30 transition-colors group text-sm">
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="text-blue-700 font-mono font-bold">{row.competency_unit_code}</span>
                                            <span className="text-[11px] text-slate-500 font-normal truncate max-w-[180px]" title={row.report_name}>{row.report_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-center font-medium">{row.user_name}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="text-slate-500 font-mono text-[10px]">{row.credits_used ?? 1} Cr</Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-3">
                                            {getStatusBadge(row.status)}
                                            {row.output_paths?.pdf && (
                                                <button 
                                                    onClick={() => handleDownload(row)}
                                                    disabled={downloadingId === row.id}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                                                    title="Download PDF"
                                                >
                                                    <Download className={`h-4 w-4 ${downloadingId === row.id ? 'animate-bounce' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400">No validation reports found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="p-4 border-t flex items-center justify-between bg-gray-50/30">
                    <span className="text-[11px] text-slate-500">Showing {paginatedReports.length} of {filteredReports.length}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-[11px]" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                            <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px]" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                            Next <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>

        {/* Team Users Table */}
        <Card className="shadow-sm border-gray-200 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Team Members
                </CardTitle>
            </CardHeader>
            <div className="p-0 h-[450px] overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="font-bold text-slate-700">Name</TableHead>
                            <TableHead className="font-bold text-slate-700">Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && teamUsers.length === 0 ? (
                            <TableRow><TableCell colSpan={2} className="h-32 text-center text-slate-400">Loading team...</TableCell></TableRow>
                        ) : teamUsers.length > 0 ? (
                            teamUsers.map((u) => (
                                <TableRow key={u.id} className="hover:bg-emerald-50/30 transition-colors text-xs">
                                    <TableCell>
                                        <div className="font-bold text-slate-700">{u.first_name} {u.last_name}</div>
                                        <div className="text-[10px] text-slate-400">{u.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`text-[10px] border-none ${u.role === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {u.role === 1 ? 'Admin' : 'Assessor'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={2} className="h-32 text-center text-slate-400">No users found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
      </div>
    </div>
  );
}
