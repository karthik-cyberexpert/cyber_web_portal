
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Paperclip,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';

export default function GrievancePortalTutor() {
  const token = localStorage.getItem('token');
  const [grievances, setGrievances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [actionType, setActionType] = useState<'Solve' | 'Return' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGrievances = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/grievance?role=tutor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrievances(data.grievances);
      }
    } catch (error) {
      console.error("Failed to fetch grievances", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [token]);

  const handleAction = async () => {
      if (!actionType || !selectedGrievance) return;
      if (!actionReason) {
          toast.error("Please provide a reason/remark");
          return;
      }

      const status = actionType === 'Solve' ? 'Solved' : 'Returned';

      try {
          const res = await fetch(`${API_BASE_URL}/grievance/${selectedGrievance.id}/status`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ status, action_reason: actionReason })
          });

          if (res.ok) {
              toast.success(`Grievance marked as ${status}`);
              setIsDetailsOpen(false);
              setActionType(null);
              setActionReason('');
              setSelectedGrievance(null);
              fetchGrievances();
          } else {
              toast.error("Failed to update status");
          }
      } catch (error) {
          console.error("Update error", error);
          toast.error("An error occurred");
      }
  };

  const openDetails = (g: any) => {
      setSelectedGrievance(g);
      setIsDetailsOpen(true);
      setActionType(null);
      setActionReason('');
  };

  const filteredGrievances = grievances.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = grievances.filter(g => g.status === 'Pending').length;
  const solvedCount = grievances.filter(g => g.status === 'Solved').length;
  const returnedCount = grievances.filter(g => g.status === 'Returned').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Grievance Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage student complaints and issues</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{solvedCount}</div>
            </CardContent>
        </Card>
        <Card className="xs:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returned</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{returnedCount}</div>
            </CardContent>
        </Card>
      </div>


      <div className="grid gap-6">
          <Card className="overflow-hidden">
              <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle>Grievance Requests</CardTitle>
                      <div className="relative w-full sm:w-64">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder="Search student or title..."
                              className="pl-8"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead className="w-[50px] whitespace-nowrap">S.No</TableHead>
                                  <TableHead className="whitespace-nowrap">Registered By</TableHead>
                                  <TableHead className="whitespace-nowrap">Registered Date</TableHead>
                                  <TableHead className="whitespace-nowrap">Status</TableHead>
                                  <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {isLoading ? (
                                  <TableRow>
                                      <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                                  </TableRow>
                              ) : filteredGrievances.length === 0 ? (
                                  <TableRow>
                                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No grievances found</TableCell>
                                  </TableRow>
                              ) : (
                                  filteredGrievances.map((g, idx) => (
                                      <TableRow key={g.id}>
                                          <TableCell className="whitespace-nowrap">{idx + 1}</TableCell>
                                          <TableCell className="min-w-[150px]">
                                              <div className="font-medium">{g.student_name}</div>
                                              <div className="text-xs text-muted-foreground">{g.roll_number}</div>
                                          </TableCell>
                                          <TableCell className="whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{new Date(g.created_at).toLocaleDateString('en-GB')}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="whitespace-nowrap">
                                              <Badge variant="outline" className={
                                                  g.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                  g.status === 'Solved' ? 'bg-green-100 text-green-800' :
                                                  g.status === 'Returned' ? 'bg-red-100 text-red-800' : ''
                                              }>
                                                  {g.status}
                                              </Badge>
                                          </TableCell>
                                          <TableCell className="text-right whitespace-nowrap">
                                              <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="icon">
                                                          <MoreHorizontal className="w-4 h-4" />
                                                      </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                      <DropdownMenuItem onClick={() => openDetails(g)}>
                                                          <Eye className="w-4 h-4 mr-2" /> View Details
                                                      </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                              </DropdownMenu>
                                          </TableCell>
                                      </TableRow>
                                  ))
                              )}
                          </TableBody>
                      </Table>
                  </div>
              </CardContent>
          </Card>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Grievance Details</DialogTitle>
                <CardDescription>
                    Review the complaint from {selectedGrievance?.student_name} ({selectedGrievance?.roll_number})
                </CardDescription>
            </DialogHeader>
            {selectedGrievance && (
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Title</Label>
                            <div className="font-semibold break-words">{selectedGrievance.title}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <div>
                                <Badge variant="outline" className={
                                    selectedGrievance.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    selectedGrievance.status === 'Solved' ? 'bg-green-100 text-green-800' :
                                    selectedGrievance.status === 'Returned' ? 'bg-red-100 text-red-800' : ''
                                }>
                                    {selectedGrievance.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
 
                    <div>
                        <Label className="text-muted-foreground">Description</Label>
                        <div className="bg-muted p-4 rounded-md mt-1 text-sm whitespace-pre-wrap break-words">
                            {selectedGrievance.description}
                        </div>
                    </div>
 
                    {selectedGrievance.attachment_path && (
                        <div>
                            <Label className="text-muted-foreground">Attachment</Label>
                            <div className="mt-1">
                                <a 
                                    href={`${API_BASE_URL}/${selectedGrievance.attachment_path}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:underline bg-primary/10 px-3 py-2 rounded-md font-medium text-sm"
                                >
                                    <Paperclip className="w-4 h-4 shrink-0"/> <span className="truncate">View Attachment</span>
                                </a>
                            </div>
                        </div>
                    )}
 
                    {selectedGrievance.status === 'Pending' && !actionType && (
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                            <Button 
                                className="flex-1 bg-green-600 hover:bg-green-700 w-full" 
                                onClick={() => setActionType('Solve')}
                            >
                                <CheckCircle className="w-4 h-4 mr-2"/> Mark as Solved
                            </Button>
                            <Button 
                                className="flex-1 w-full" 
                                variant="destructive" 
                                onClick={() => setActionType('Return')}
                            >
                                <XCircle className="w-4 h-4 mr-2"/> Return
                            </Button>
                        </div>
                    )}
 
                    {actionType && (
                        <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-bottom-2">
                             <div className="space-y-2">
                                <Label className="text-primary font-semibold">
                                    {actionType === 'Solve' ? 'Resolution Remarks' : 'Reason for Returning'}
                                </Label>
                                <Textarea 
                                    placeholder={actionType === 'Solve' ? "How was this issue resolved?" : "Why is this grievance being returned?"}
                                    className="min-h-[100px]"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                />
                             </div>
                             <div className="flex flex-col sm:flex-row justify-end gap-2">
                                 <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setActionType(null)}>Cancel</Button>
                                 <Button className="w-full sm:w-auto" onClick={handleAction}>Confirm {actionType}</Button>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
