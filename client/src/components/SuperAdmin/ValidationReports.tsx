import React, { useState, useEffect } from "react";
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
import { fetchUserTasks } from "./api";

interface ValidationReportsProps {
  competencyReports: CompetencyReport[];
  setCompetencyReports: React.Dispatch<React.SetStateAction<CompetencyReport[]>>;
}

export function ValidationReports({ competencyReports, setCompetencyReports }: ValidationReportsProps) {
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  useEffect(() => {
    handleRefreshStatus();
  }, []);

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
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                                <TableHead className="text-right font-bold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competencyReports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.name}</TableCell>
                                    <TableCell>{report.units.join(", ")}</TableCell>
                                    <TableCell className="text-right">
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

        {/* End of component */}
     </div>
  );
}
