import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  X,
  ShieldCheck,
  Loader2,
  Users,
  FolderOpen,
  SearchIcon,
  Home,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  Clock,
  CreditCard,
  Upload,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Heart
} from "lucide-react";
import { Organization, OrgSubscription, OrgSettings, OrgLog } from "./types";
import { getAuthToken, HEADERS_NGROK } from "./api";

interface OrganizationManagementProps {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  loadingOrgs: boolean;
  refreshOrgs: () => Promise<void>;
}

function getDaysUntilExpiry(endDate: string): number {
    return Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
}

export function OrganizationManagement({ organizations, setOrganizations, loadingOrgs, refreshOrgs }: OrganizationManagementProps) {
  const [orgTab, setOrgTab] = useState<"manage" | "requests">("manage");
  
  // Requests Tab State
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; org: Organization | null }>({ open: false, org: null });
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const pendingOrgs = useMemo(() => organizations.filter(o => !o.is_registered), [organizations]);

  // Manage Tab State
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null); 
  const [orgSearch, setOrgSearch] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTo, setRenameTo] = useState("");

  useEffect(() => {
     setCurrentPage(1);
  }, [orgSearch, subscriptionFilter]);

  // Initialize selectedOrgId to first available if null
  useEffect(() => {
     if (!selectedOrgId && organizations.length > 0) {
         const first = organizations.find(o => o.is_registered);
         if (first) setSelectedOrgId(first.id);
     }
  }, [organizations, selectedOrgId]);

  const selectedOrg = useMemo(() => 
    organizations.find(o => o.id === selectedOrgId),
    [organizations, selectedOrgId]
  );

  // Derive "tenants" for Manage View (Mocking "active" property which isn't on API Organization type yet)
  const registeredOrgs = useMemo(() => organizations.filter(o => o.is_registered), [organizations]);
  
  // We need to map registeredOrgs to the structure used in the view (with 'active' etc)
  const orgsFilteredSorted = useMemo(() => {
     let mapped = registeredOrgs.map(o => ({
         ...o,
         active: true, // Mocking active state as true for synced orgs
     }));
     
     if (orgSearch) {
         mapped = mapped.filter(o => 
             o.name.toLowerCase().includes(orgSearch.toLowerCase()) || 
             o.email.toLowerCase().includes(orgSearch.toLowerCase())
         );
     }

     if (subscriptionFilter === "subscribed") {
         mapped = mapped.filter(o => o.is_subscribed);
     } else if (subscriptionFilter === "free") {
         mapped = mapped.filter(o => !o.is_subscribed);
     }
     
     return mapped.sort((a,b) => b.id - a.id);
  }, [registeredOrgs, orgSearch, subscriptionFilter]);

  const totalPages = Math.ceil(orgsFilteredSorted.length / itemsPerPage);
  const paginatedOrgs = useMemo(() => {
     const start = (currentPage - 1) * itemsPerPage;
     return orgsFilteredSorted.slice(start, start + itemsPerPage);
  }, [orgsFilteredSorted, currentPage]);


  async function verifyOrgAction(orgId: number, action: "approve" | "reject", feedback: string = "") {
    setProcessingAction(true);
    try {
      const form = new FormData();
      form.append("org_id", orgId.toString());
      form.append("action", action);
      form.append("feedback", feedback);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/organizations/verify`, 
        {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${getAuthToken().replace(/^Bearer\s*/i, "")}`,
                ...HEADERS_NGROK 
            },
            body: form
        }
      );
      
      const txt = await res.text();
      if (!res.ok) throw new Error("Verify action failed: " + txt);

      await refreshOrgs();
    } catch (err) {
      console.error("Error verifying org:", err);
      alert("Failed to perform action. Check console.");
    } finally {
      setProcessingAction(false);
    }
  }

  const handleApproveClick = (org: Organization) => verifyOrgAction(org.id, "approve");
  const handleRejectClick = (org: Organization) => {
    setRejectDialog({ open: true, org });
    setRejectFeedback("");
  };
  const confirmReject = async () => {
    if (!rejectDialog.org) return;
    if (!rejectFeedback.trim()) { alert("Please provide feedback."); return; }
    await verifyOrgAction(rejectDialog.org.id, "reject", rejectFeedback);
    setRejectDialog({ open: false, org: null });
  };

  // Manage Actions (Mock Logic preserved)

  const removeTenant = (id: number) => {
      setOrganizations(prev => prev.filter(o => o.id !== id));
      if(selectedOrgId === id) setSelectedOrgId(null);
  };

  const renameOrg = (id: number, newName: string) => {
      setOrganizations(prev => prev.map(o => o.id === id ? {...o, name: newName} : o));
  };

  const setTenantActive = (name: string, active: boolean) => {
      // Mock toggling - nothing deep since 'active' isn't on real Organization type
      // Just for UI toggle effect, force re-render or ignored
      console.log("Toggle active", name, active);
  };


  return (
    <div className="space-y-6 pb-12">

      <Tabs value={orgTab} onValueChange={(v) => setOrgTab(v as any)} className="w-full">
         <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-2xl flex gap-1 mb-10 w-fit mx-auto shadow-sm border">
           <TabsTrigger 
              value="manage" 
              className="px-8 py-2.5 rounded-xl font-bold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
           >
              Manage Organizations
           </TabsTrigger>
           <TabsTrigger 
              value="requests" 
              className="px-8 py-2.5 rounded-xl font-bold transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:scale-105 border-0"
           >
              Approve Requests
              {pendingOrgs.length > 0 && <span className="ml-2 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">{pendingOrgs.length}</span>}
           </TabsTrigger>
         </TabsList>

         <TabsContent value="manage" className="mt-0">
             <div className="space-y-6">
                 {/* Search & Filter Bar */}
                 <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative max-w-md w-full">
                        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search organizations..." value={orgSearch} onChange={(e) => setOrgSearch(e.target.value)} className="pl-9 h-11" />
                    </div>
                    <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                        <SelectTrigger className="w-[180px] h-11 rounded-xl">
                            <SelectValue placeholder="All Tiers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tiers</SelectItem>
                            <SelectItem value="subscribed">Subscribed Only</SelectItem>
                            <SelectItem value="free">Free Tier Only</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                 {/* Full-Width Org Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {paginatedOrgs.map((t) => (
                         <div
                             key={t.id}
                             onClick={() => setSelectedOrgId(selectedOrgId === t.id ? null : t.id)}
                             className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group ${
                                 selectedOrgId === t.id
                                     ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]"
                                     : "border-slate-150 hover:border-slate-300 bg-white hover:shadow-md"
                             }`}
                         >
                             <div className="flex items-center gap-3 mb-3">
                                 <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${
                                     selectedOrgId === t.id
                                         ? "bg-white/15 text-white"
                                         : t.is_subscribed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                                 }`}>
                                     {t.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <div className={`font-bold text-sm truncate ${selectedOrgId === t.id ? "text-white" : "text-slate-800"}`}>{t.name}</div>
                                     <div className={`text-xs truncate ${selectedOrgId === t.id ? "text-white/50" : "text-slate-400"}`}>{t.email}</div>
                                 </div>
                             </div>
                             <div className="flex items-center justify-between">
                                 <Badge variant={selectedOrgId === t.id ? "outline" : (t.is_subscribed ? "default" : "secondary")} className={`text-[10px] px-2 h-5 ${selectedOrgId === t.id ? "border-white/20 text-white/70" : ""}`}>
                                     {t.is_subscribed ? "Subscribed" : "Free"}
                                 </Badge>
                                 <div className={`flex items-center gap-1 text-xs font-bold ${selectedOrgId === t.id ? "text-emerald-400" : "text-slate-500"}`}>
                                     <CreditCard className="h-3 w-3" />
                                     {t.credits_left} credits
                                 </div>
                             </div>
                         </div>
                     ))}
                     {orgsFilteredSorted.length === 0 && (
                         <div className="col-span-full text-center text-muted-foreground py-12">
                             No organizations found.
                         </div>
                     )}
                 </div>

                 {/* Pagination Controls */}
                 {totalPages > 1 && (
                     <div className="flex items-center justify-center gap-2 mt-6">
                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                             disabled={currentPage === 1}
                             className="rounded-xl border-slate-200"
                         >
                             <ChevronLeft size={16} className="mr-1" /> Previous
                         </Button>
                         
                         <div className="flex items-center gap-1 mx-4">
                             {[...Array(totalPages)].map((_, i) => {
                                 const pageNum = i + 1;
                                 return (
                                     <Button
                                         key={pageNum}
                                         variant={currentPage === pageNum ? "default" : "ghost"}
                                         size="icon"
                                         className={`h-8 w-8 rounded-lg text-xs font-bold ${currentPage === pageNum ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                                         onClick={() => setCurrentPage(pageNum)}
                                     >
                                         {pageNum}
                                     </Button>
                                 );
                             })}
                         </div>

                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                             disabled={currentPage === totalPages}
                             className="rounded-xl border-slate-200"
                         >
                             Next <ChevronRight size={16} className="ml-1" />
                         </Button>
                     </div>
                 )}

                 {/* Detail Cards — shown below when an org is selected */}
                 {selectedOrg && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                         {/* Org Name Header Bar */}
                         <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm font-black">
                                     {selectedOrg.name.charAt(0).toUpperCase()}
                                 </div>
                                 <div>
                                     <h3 className="text-lg font-bold text-slate-800">{selectedOrg.name}</h3>
                                     <p className="text-[11px] text-slate-400">
                                         {selectedOrg.orgtype_id === 1 ? 'Small' : selectedOrg.orgtype_id === 2 ? 'Medium' : selectedOrg.orgtype_id === 3 ? 'Large' : 'Enterprise'} Organization · Since {new Date(selectedOrg.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                     </p>
                                 </div>
                             </div>
                             <Button variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSelectedOrgId(null)}>
                                 <X size={14} className="mr-1" /> Close
                             </Button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                             {/* Card 1: About & Description */}
                             <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                 <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
                                     <CardTitle className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                         <FolderOpen size={13} />
                                         About
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent className="p-5 space-y-4">
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Organization ID</div>
                                         <div className="text-sm font-bold text-slate-700">#{selectedOrg.id}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Type</div>
                                         <div className="text-sm font-bold text-slate-700 capitalize">
                                             {selectedOrg.orgtype_id === 1 ? 'Small' : selectedOrg.orgtype_id === 2 ? 'Medium' : selectedOrg.orgtype_id === 3 ? 'Large' : 'Enterprise'}
                                         </div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Description</div>
                                         <p className="text-xs text-slate-600 leading-relaxed">
                                             {selectedOrg.description || "No description provided."}
                                         </p>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Address</div>
                                         <p className="text-xs text-slate-600 leading-relaxed">
                                             {selectedOrg.address || "—"}
                                         </p>
                                     </div>
                                 </CardContent>
                             </Card>

                             {/* Card 2: Contact Information */}
                             <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                 <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
                                     <CardTitle className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                         <Users size={13} />
                                         Contact
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent className="p-5 space-y-4">
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Contact Person</div>
                                         <div className="text-sm font-bold text-slate-700">{selectedOrg.contact_person || "—"}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Email Address</div>
                                         <div className="text-sm font-bold text-slate-700 break-all">{selectedOrg.email}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Phone</div>
                                         <div className="text-sm font-bold text-slate-700">{selectedOrg.phone || "—"}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Website</div>
                                         {selectedOrg.website ? (
                                             <a href={selectedOrg.website} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline break-all">{selectedOrg.website}</a>
                                         ) : (
                                             <div className="text-sm text-slate-300">—</div>
                                         )}
                                     </div>
                                 </CardContent>
                             </Card>

                             {/* Card 3: Subscription & Credits */}
                             <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                 <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
                                     <CardTitle className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                                         <CreditCard size={13} />
                                         Subscription
                                     </CardTitle>
                                 </CardHeader>
                                 <CardContent className="p-5 space-y-4">
                                     <div className="flex items-center justify-between">
                                         <div>
                                             <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Current Plan</div>
                                             <div className="text-lg font-black text-slate-800">{selectedOrg.is_subscribed ? "Enterprise" : "Free Tier"}</div>
                                         </div>
                                         <Badge className={`text-[10px] px-2.5 py-1 ${selectedOrg.is_subscribed ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                             {selectedOrg.is_subscribed ? "Active" : "Inactive"}
                                         </Badge>
                                     </div>
                                     <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                                         <div>
                                             <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Available Credits</div>
                                             <div className="text-2xl font-black text-emerald-600">{selectedOrg.credits_left}</div>
                                         </div>
                                         <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${selectedOrg.is_subscribed ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>
                                             <ShieldCheck size={22} />
                                         </div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Registration Status</div>
                                         <div className="flex items-center gap-2">
                                             <div className={`h-2 w-2 rounded-full ${selectedOrg.is_registered ? "bg-emerald-500" : "bg-amber-500"}`} />
                                             <span className="text-sm font-bold text-slate-700">{selectedOrg.is_registered ? "Verified" : "Pending"}</span>
                                         </div>
                                     </div>
                                 </CardContent>
                             </Card>
                         </div>
                     </div>
                 )}
             </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
              <div className="space-y-4 pb-20">
                 {pendingOrgs.map((req) => (
                   <Card key={req.id} className="overflow-hidden border border-slate-200 shadow-sm bg-white dark:bg-slate-900 group transition-all hover:shadow-md rounded-2xl">
                     <div className="flex flex-col md:flex-row min-h-[160px]">
                        {/* Side Profile Indicator */}
                        <div className="md:w-32 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 p-4 shrink-0">
                            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-600 border border-amber-200 dark:border-amber-900 shadow-sm font-black text-2xl mb-2">
                                {req.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">REQ-{req.id}</div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 flex flex-col justify-center">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-xl font-black text-slate-800 dark:text-gray-100 tracking-tight truncate">
                                            {req.name}
                                        </h4>
                                        <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0 text-[9px] font-black uppercase tracking-wider">
                                            Pending Review
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-4 italic">
                                        "{req.description || "No description provided."}"
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                                                <User size={10} /> Contact
                                            </div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{req.contact_person}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                                                <Mail size={10} /> Email
                                            </div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{req.email}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                                                <MapPin size={10} /> Location
                                            </div>
                                            <div className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{req.address || "Not provided"}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1.5">
                                                <Globe size={10} /> Website
                                            </div>
                                            <div className="text-sm font-bold text-primary truncate">
                                                {req.website ? <a href={req.website} target="_blank" rel="noreferrer" className="hover:underline">{req.website}</a> : "None"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Decision Zone */}
                        <div className="md:w-56 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-center gap-2.5 shrink-0">
                            <Button 
                                disabled={processingAction} 
                                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all hover:scale-[1.02] border-none shadow-sm" 
                                onClick={() => handleApproveClick(req)}
                            > 
                                <CheckCircle2 className="mr-2 h-4 w-4"/> Approve
                            </Button>
                            <Button 
                                disabled={processingAction} 
                                variant="outline" 
                                className="w-full h-11 rounded-xl text-slate-400 hover:text-red-600 border-slate-100 hover:border-red-100 hover:bg-red-50 font-bold transition-all" 
                                onClick={() => handleRejectClick(req)}
                            > 
                                <X className="mr-2 h-4 w-4"/> Reject
                            </Button>
                        </div>
                     </div>
                   </Card>
                 ))}
                 {!loadingOrgs && pendingOrgs.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/50 text-center animate-in fade-in duration-500">
                     <ShieldCheck className="h-12 w-12 text-emerald-500 mb-4 opacity-50" />
                     <h3 className="text-lg font-black text-slate-800">Review Queue Empty</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status: All Clear</p>
                   </div>
                 )}
                 {loadingOrgs && <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest animate-pulse">Syncing...</div>}
              </div>
          </TabsContent>
      </Tabs>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog(prev => ({...prev, open: false}))}>
        <DialogContent>
            <DialogHeader><DialogTitle>Reject Organization Request</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Reason for rejection</Label>
                    <textarea className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-[100px]" value={rejectFeedback} onChange={(e) => setRejectFeedback(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setRejectDialog(d => ({...d, open: false}))}>Cancel</Button>
                <Button variant="destructive" onClick={confirmReject} disabled={processingAction || !rejectFeedback.trim()}>Confirm Rejection</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
