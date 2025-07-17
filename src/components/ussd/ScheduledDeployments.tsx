import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, Play, Pause, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ScheduledFlow {
  id: string;
  flow_name: string;
  service_id: string;
  version: number;
  scheduled_publish_at: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  ussd_services?: {
    service_name: string;
    service_code: string;
  };
}

export function ScheduledDeployments() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [scheduledFlows, setScheduledFlows] = useState<ScheduledFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<ScheduledFlow | null>(null);

  const [formData, setFormData] = useState({
    scheduled_publish_at: "",
    description: ""
  });

  useEffect(() => {
    loadScheduledFlows();
    // Set up interval to refresh every minute to show accurate countdown
    const interval = setInterval(loadScheduledFlows, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadScheduledFlows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ussd_menu_flows')
        .select(`
          *,
          ussd_services(service_name, service_code)
        `)
        .not('scheduled_publish_at', 'is', null)
        .eq('is_published', false)
        .order('scheduled_publish_at');

      if (error) throw error;
      setScheduledFlows(data || []);
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

  const publishNow = async (flow: ScheduledFlow) => {
    if (!confirm("Are you sure you want to publish this flow immediately?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ussd_menu_flows')
        .update({ 
          is_published: true, 
          scheduled_publish_at: null 
        })
        .eq('id', flow.id);

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: flow.id,
        action: 'published',
        changes_description: 'Flow published immediately (ahead of schedule)',
        performed_by: 'admin'
      });

      toast({
        title: "Success",
        description: "Flow published successfully",
      });
      
      loadScheduledFlows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelScheduled = async (flow: ScheduledFlow) => {
    if (!confirm("Are you sure you want to cancel the scheduled publication?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ussd_menu_flows')
        .update({ scheduled_publish_at: null })
        .eq('id', flow.id);

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: flow.id,
        action: 'schedule_cancelled',
        changes_description: 'Scheduled publication cancelled',
        performed_by: 'admin'
      });

      toast({
        title: "Success",
        description: "Scheduled publication cancelled",
      });
      
      loadScheduledFlows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlow) return;

    try {
      const scheduledDate = new Date(formData.scheduled_publish_at);
      const now = new Date();

      if (scheduledDate <= now) {
        toast({
          title: "Error",
          description: "Scheduled time must be in the future",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('ussd_menu_flows')
        .update({
          scheduled_publish_at: scheduledDate.toISOString(),
          description: formData.description || editingFlow.description
        })
        .eq('id', editingFlow.id);

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: editingFlow.id,
        action: 'schedule_updated',
        changes_description: `Schedule updated to ${scheduledDate.toLocaleString()}`,
        performed_by: 'admin'
      });

      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });

      setIsDialogOpen(false);
      setEditingFlow(null);
      setFormData({ scheduled_publish_at: "", description: "" });
      loadScheduledFlows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editSchedule = (flow: ScheduledFlow) => {
    setEditingFlow(flow);
    setFormData({
      scheduled_publish_at: flow.scheduled_publish_at ? 
        new Date(flow.scheduled_publish_at).toISOString().slice(0, 16) : "",
      description: flow.description || ""
    });
    setIsDialogOpen(true);
  };

  const getTimeUntilPublish = (scheduledTime: string) => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diff = scheduled.getTime() - now.getTime();

    if (diff <= 0) {
      return "Overdue";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getScheduleStatus = (scheduledTime: string) => {
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    const diff = scheduled.getTime() - now.getTime();

    if (diff <= 0) {
      return { status: "overdue", color: "destructive" };
    } else if (diff <= 60 * 60 * 1000) { // 1 hour
      return { status: "soon", color: "default" };
    } else {
      return { status: "pending", color: "secondary" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Scheduled Deployments</h2>
          <p className="text-muted-foreground">Manage flows scheduled for automatic publication</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {scheduledFlows.filter(f => getScheduleStatus(f.scheduled_publish_at).status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {scheduledFlows.filter(f => getScheduleStatus(f.scheduled_publish_at).status === "soon").length}
                </div>
                <div className="text-sm text-muted-foreground">Publishing Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">
                  {scheduledFlows.filter(f => getScheduleStatus(f.scheduled_publish_at).status === "overdue").length}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Flows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Publications ({scheduledFlows.length})</CardTitle>
          <CardDescription>
            Flows waiting for scheduled publication times
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading scheduled flows...</div>
          ) : scheduledFlows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No flows are currently scheduled for publication
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Time Until Publish</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledFlows.map((flow) => {
                  const scheduleStatus = getScheduleStatus(flow.scheduled_publish_at);
                  return (
                    <TableRow key={flow.id}>
                      <TableCell className="font-medium">{flow.flow_name}</TableCell>
                      <TableCell>
                        {flow.ussd_services?.service_name}
                        <div className="text-sm text-muted-foreground">
                          {flow.ussd_services?.service_code}
                        </div>
                      </TableCell>
                      <TableCell>v{flow.version}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(flow.scheduled_publish_at).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(flow.scheduled_publish_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {getTimeUntilPublish(flow.scheduled_publish_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scheduleStatus.color as any}>
                          {scheduleStatus.status.charAt(0).toUpperCase() + scheduleStatus.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editSchedule(flow)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => publishNow(flow)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelScheduled(flow)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Schedule</DialogTitle>
            <DialogDescription>
              Modify the scheduled publication time for this flow
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={updateSchedule} className="space-y-4">
            <div>
              <Label htmlFor="scheduled_publish_at">Scheduled Publication Time</Label>
              <Input
                id="scheduled_publish_at"
                type="datetime-local"
                value={formData.scheduled_publish_at}
                onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Update description (optional)"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Update Schedule
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}