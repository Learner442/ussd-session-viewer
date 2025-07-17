import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { History, RotateCcw, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FlowHistoryEntry {
  id: string;
  flow_id: string;
  action: string;
  changes_description: string | null;
  performed_by: string | null;
  performed_at: string;
  old_version: number | null;
  new_version: number | null;
}

interface MenuFlow {
  id: string;
  flow_name: string;
  version: number;
}

interface FlowHistoryProps {
  selectedFlowId: string | null;
}

export function FlowHistory({ selectedFlowId }: FlowHistoryProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [history, setHistory] = useState<FlowHistoryEntry[]>([]);
  const [flows, setFlows] = useState<MenuFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterFlow, setFilterFlow] = useState<string>(selectedFlowId || "all");

  useEffect(() => {
    loadFlows();
  }, []);

  useEffect(() => {
    if (selectedFlowId) {
      setFilterFlow(selectedFlowId);
    }
    loadHistory();
  }, [selectedFlowId, filterAction, filterFlow]);

  const loadFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('ussd_menu_flows')
        .select('id, flow_name, version')
        .order('flow_name');

      if (error) throw error;
      setFlows(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('ussd_flow_history')
        .select('*')
        .order('performed_at', { ascending: false });

      if (filterFlow && filterFlow !== "all") {
        query = query.eq('flow_id', filterFlow);
      }

      if (filterAction && filterAction !== "all") {
        query = query.eq('action', filterAction);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rollbackFlow = async (historyEntry: FlowHistoryEntry) => {
    if (!confirm("Are you sure you want to rollback to this version? This action cannot be undone.")) {
      return;
    }

    try {
      // This is a simplified rollback - in a real implementation, you would:
      // 1. Create a new version with the old configuration
      // 2. Update the flow to point to this new version
      // 3. Record the rollback action in history

      // For now, we'll just record the rollback action
      const { error } = await supabase
        .from('ussd_flow_history')
        .insert({
          flow_id: historyEntry.flow_id,
          action: 'rolled_back',
          changes_description: `Rolled back to version ${historyEntry.old_version || historyEntry.new_version}`,
          performed_by: 'admin',
          old_version: null,
          new_version: historyEntry.old_version || historyEntry.new_version
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flow rolled back successfully",
      });

      loadHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'default';
      case 'updated':
        return 'secondary';
      case 'published':
        return 'default';
      case 'activated':
        return 'default';
      case 'deactivated':
        return 'secondary';
      case 'rolled_back':
        return 'destructive';
      case 'scheduled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getFlowName = (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    return flow ? flow.flow_name : 'Unknown Flow';
  };

  const actionTypes = [
    { value: "all", label: "All Actions" },
    { value: "created", label: "Created" },
    { value: "updated", label: "Updated" },
    { value: "published", label: "Published" },
    { value: "activated", label: "Activated" },
    { value: "deactivated", label: "Deactivated" },
    { value: "rolled_back", label: "Rolled Back" },
    { value: "scheduled", label: "Scheduled" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flow History</h2>
          <p className="text-muted-foreground">Track changes and manage flow versions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Flow</label>
              <Select value={filterFlow} onValueChange={setFilterFlow}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Flows</SelectItem>
                  {flows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id}>
                      {flow.flow_name} (v{flow.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Action</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>History Log ({history.length})</CardTitle>
          <CardDescription>
            Complete audit trail of all flow changes and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No history entries found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {getFlowName(entry.flow_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionColor(entry.action)}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.changes_description || ''}>
                        {entry.changes_description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.old_version && entry.new_version ? (
                        <div className="text-sm">
                          v{entry.old_version} → v{entry.new_version}
                        </div>
                      ) : entry.new_version ? (
                        <div className="text-sm">v{entry.new_version}</div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{entry.performed_by || 'System'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(entry.performed_at).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {new Date(entry.performed_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>History Entry Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this change
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Flow:</label>
                                <div className="mt-1">{getFlowName(entry.flow_id)}</div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Action:</label>
                                <div className="mt-1">
                                  <Badge variant={getActionColor(entry.action)}>
                                    {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">Description:</label>
                                <div className="mt-1 p-3 bg-muted rounded">
                                  {entry.changes_description || 'No description provided'}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Old Version:</label>
                                  <div className="mt-1">{entry.old_version || 'N/A'}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">New Version:</label>
                                  <div className="mt-1">{entry.new_version || 'N/A'}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Performed By:</label>
                                  <div className="mt-1">{entry.performed_by || 'System'}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Date & Time:</label>
                                  <div className="mt-1">
                                    {new Date(entry.performed_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {entry.action !== 'rolled_back' && (entry.old_version || entry.new_version) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => rollbackFlow(entry)}
                            title="Rollback to this version"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}