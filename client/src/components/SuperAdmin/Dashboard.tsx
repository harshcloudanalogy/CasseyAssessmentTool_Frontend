import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  CheckCircle2,
  SearchIcon,
  Download,
  TriangleAlert,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  RefreshCw
} from "lucide-react";
import { fetchAdminValidationReports, fetchOrganizationsAPI, downloadValidationReport } from "./api";
import { AdminValidationReport, Organization } from "./types";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const [data, setData] = useState<AdminValidationReport[]>([]);
  const [orgData, setOrgData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { toast } = useToast();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Stats
  const [totalCount, setTotalCount] = useState(0);
  
  // Org Credits Tile State
  const [showOrgCreditsDetail, setShowOrgCreditsDetail] = useState(false);
  const [totalCreditsLeft, setTotalCreditsLeft] = useState(0);

  const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
          const [resReports, resOrgs] = await Promise.all([
             fetchAdminValidationReports().catch(e => ({ success: false, error: e.message })),
             fetchOrganizationsAPI().catch(e => ({ success: false, error: e.message }))
          ]);

          if (resReports && (resReports.success || Array.isArray(resReports.data))) {
              const reports = resReports.data || [];
              setData(reports);
              setTotalCount(resReports.count || reports.length);
          }

          if (resOrgs && (resOrgs.success || Array.isArray(resOrgs.data))) {
              const orgs = resOrgs.data || [];
              setOrgData(orgs);
              const totalLeft = orgs.reduce((acc: number, org: Organization) => acc + (org.credits_left || 0), 0);
              setTotalCreditsLeft(totalLeft);
          }

           if (!resReports.error && !resOrgs.error) {
               toast({
                   title: "Data Synced",
                   description: "Dashboard content has been updated successfully.",
               });
           }
      } catch (e: any) {
          setError(e.message);
          toast({
              title: "Refresh Failed",
              description: e.message,
              variant: "destructive"
          });
      } finally {
          setLoading(false);
      }
  };

  const handleDownload = async (report: AdminValidationReport) => {
    if (!report.output_paths.pdf) {
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
            // Convert base64 to blob
            const binaryString = window.atob(res.base64_content);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            
            // Trigger download
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

  useEffect(() => {
      loadData();
  }, []);

  // Filter Logic
  const uniqueUnits = useMemo(() => {
      const units = new Set(data.map(item => item.competency_unit_code).filter(Boolean));
      return Array.from(units).sort();
  }, [data]);

  const filteredData = useMemo(() => {
      return data.filter(item => {
          const matchesSearch = (
              (item.user_name && item.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.competency_unit_code && item.competency_unit_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.report_name && item.report_name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          const matchesUnit = unitFilter === "all" || item.competency_unit_code === unitFilter;
          const matchesStatus = statusFilter === "all" || item.status === statusFilter;

          return matchesSearch && matchesUnit && matchesStatus;
      });
  }, [data, searchQuery, unitFilter, statusFilter]);


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset page when filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [searchQuery, unitFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
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

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Total Validations Card */}
        <Card className="bg-[#021E34] text-white border-none shadow-lg h-40 flex flex-col justify-center relative overflow-hidden group">
          {/* Decorative subtle background pattern */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-12 opacity-50 group-hover:translate-x-8 transition-transform duration-500"></div>
          
          <CardContent className="p-6 flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <FileText className="h-5 w-5 text-blue-300" />
                <span className="font-medium text-sm uppercase tracking-wider text-blue-100">Total Validations</span>
              </div>
              <div className="text-4xl font-bold tracking-tight">{totalCount}</div>
              <p className="text-xs text-blue-300 mt-2">Processed reports via API</p>
            </div>
          </CardContent>
        </Card>

        {/* Organization Credits Card - Expandable */}
        <Card 
            className={`
                bg-emerald-600 text-white border-none shadow-lg relative overflow-hidden transition-all duration-500 ease-in-out
                ${showOrgCreditsDetail ? 'h-[400px]' : 'h-40'}
            `}
        >
           {/* Normal View Content */}
           <div className={`p-6 flex flex-col h-full bg-emerald-600 z-20 relative transition-opacity duration-300 ${showOrgCreditsDetail ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 mb-2 opacity-90">
                        <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                        <span className="font-medium text-sm uppercase tracking-wider text-emerald-100">Credits Remaining</span>
                     </div>
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white bg-white/10 hover:bg-white/20 p-2 h-8 rounded-full transition-transform hover:scale-105"
                        onClick={() => setShowOrgCreditsDetail(true)}
                     >
                        <span className="text-xs font-medium px-2">View Breakdown</span>
                        <ChevronDown size={14} />
                     </Button>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                    <div className="text-4xl font-bold tracking-tight">{loading && orgData.length === 0 ? "..." : totalCreditsLeft}</div>
                    <p className="text-xs text-emerald-200 mt-2">Aggregated across {orgData.length} organizations</p>
                </div>
           </div>

           {/* Expanded View Content */}
           <div className={`absolute inset-0 bg-[#064e3b] flex flex-col transition-all duration-500 ${showOrgCreditsDetail ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="p-4 border-b border-emerald-500/30 flex items-center justify-between bg-[#065f46]">
                     <h3 className="font-semibold flex items-center gap-2 text-white">
                        <Building2 size={16} /> Organization Credits
                     </h3>
                     <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-white hover:bg-white/10 h-8 w-8 p-0 rounded-full"
                        onClick={() => setShowOrgCreditsDetail(false)}
                     >
                        <ChevronUp size={18} />
                     </Button>
                </div>
                <div className="flex-1 overflow-hidden p-2">
                    <ScrollArea className="h-full pr-2">
                        <div className="space-y-2">
                            {orgData.map((org, i) => (
                                <div 
                                    key={org.id} 
                                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-lg border border-white/5 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-200 shrink-0">
                                            {org.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-medium truncate text-sm text-gray-100" title={org.name}>
                                                {org.name}
                                            </span>
                                            <span className="text-[10px] text-emerald-300/70 truncate">{org.email}</span>
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-500 text-white border-none min-w-[3rem] justify-center ml-2">
                                        {org.credits_left}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
           </div>
        </Card>
      </div>

      {/* Assessment Log Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 border-b bg-gray-50/50">
            <div className="flex items-center justify-between">
                <div>
                     <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <List className="h-5 w-5 text-gray-500" />
                        Assessment Log
                     </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {filteredData.length} Records
                    </Badge>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-blue-600 hover:bg-blue-50 transition-all active:scale-95" 
                        onClick={() => loadData()} 
                        disabled={loading}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>
            </div>
            
            {/* Functional Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                 <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search user, unit, or report..." 
                        className="pl-9 h-9 bg-white border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <Select value={unitFilter} onValueChange={setUnitFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-white border-gray-200">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter size={14} />
                            <SelectValue placeholder="Unit Code" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Units</SelectItem>
                        {uniqueUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-white border-gray-200">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={14} />
                            <SelectValue placeholder="Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
        </CardHeader>
        <div className="p-0">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-bold text-gray-700 w-[25%]">Unit Code & Title</TableHead>
                        <TableHead className="font-bold text-gray-700 w-[30%] text-center">User who validated</TableHead>
                        <TableHead className="font-bold text-gray-700 w-[20%] text-center">Report</TableHead>
                        <TableHead className="font-bold text-gray-700 w-[25%] text-right pr-6">Validation Outcome</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-red-500">{error}</TableCell>
                        </TableRow>
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((row) => (
                        <TableRow key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                            <TableCell className="font-medium text-blue-700">
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm">{row.competency_unit_code}</span>
                                    <span className="text-xs text-slate-500 font-normal truncate max-w-[200px]" title={row.report_name}>{row.report_name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-600 font-medium text-center">
                                <div className="flex flex-col items-center">
                                    <span>{row.user_name}</span>
                                    <span className="text-xs text-gray-400 font-normal">{row.organization_name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 px-3 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800 transition-colors" 
                                    disabled={!row.output_paths.pdf || downloadingId === row.id}
                                    onClick={() => handleDownload(row)}
                                >
                                    <Download className={`w-3 h-3 mr-1.5 ${downloadingId === row.id ? 'animate-bounce' : ''}`} /> 
                                    {downloadingId === row.id ? 'Downloading...' : 'Download'}
                                </Button>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                {getStatusBadge(row.status)}
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground flex-col items-center justify-center">
                                <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                No reports match your filters.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="p-4 border-t flex items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50/30">
                <span>Showing {paginatedData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results</span>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-20"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                    </Button>
                    <span className="flex items-center px-2 font-medium">
                        Page {currentPage} of {Math.max(1, totalPages)}
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-20"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
}
