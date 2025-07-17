import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Play, Pause, Copy, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuFlow {
  id: string;
  flow_name: string;
  service_id: string;
  version: number;
  is_active: boolean;
  is_published: boolean;
  scheduled_publish_at: string | null;
  language: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  ussd_services?: {
    service_name: string;
    service_code: string;
  };
}

interface Service {
  id: string;
  service_name: string;
  service_code: string;
  service_type: string;
}

interface MenuFlowManagerProps {
  onSelectFlow: (flowId: string) => void;
}

export function MenuFlowManager({ onSelectFlow }: MenuFlowManagerProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [flows, setFlows] = useState<MenuFlow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<MenuFlow | null>(null);
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState({
    flow_name: "",
    service_id: "",
    description: "",
    language: "en",
    is_active: false,
    scheduled_publish_at: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load flows with service info
      const { data: flowsData, error: flowsError } = await supabase
        .from('ussd_menu_flows')
        .select(`
          *,
          ussd_services(service_name, service_code)
        `)
        .order('created_at', { ascending: false });

      if (flowsError) throw flowsError;

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('ussd_services')
        .select('*')
        .eq('is_active', true)
        .order('service_name');

      if (servicesError) throw servicesError;

      setFlows(flowsData || []);
      setServices(servicesData || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFlow) {
        // Update existing flow
        const { error } = await supabase
          .from('ussd_menu_flows')
          .update({
            ...formData,
            scheduled_publish_at: formData.scheduled_publish_at || null
          })
          .eq('id', editingFlow.id);

        if (error) throw error;

        // Record history
        await supabase.from('ussd_flow_history').insert({
          flow_id: editingFlow.id,
          action: 'updated',
          changes_description: `Updated flow: ${formData.flow_name}`,
          performed_by: 'admin',
          old_version: editingFlow.version,
          new_version: editingFlow.version
        });

        toast({
          title: "Success",
          description: "Menu flow updated successfully",
        });
      } else {
        // Create new flow
        const { data, error } = await supabase
          .from('ussd_menu_flows')
          .insert({
            ...formData,
            created_by: 'admin',
            scheduled_publish_at: formData.scheduled_publish_at || null
          })
          .select()
          .single();

        if (error) throw error;

        // Record history
        await supabase.from('ussd_flow_history').insert({
          flow_id: data.id,
          action: 'created',
          changes_description: `Created new flow: ${formData.flow_name}`,
          performed_by: 'admin',
          new_version: 1
        });

        toast({
          title: "Success",
          description: "Menu flow created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingFlow(null);
      setFormData({
        flow_name: "",
        service_id: "",
        description: "",
        language: "en",
        is_active: false,
        scheduled_publish_at: ""
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleFlowStatus = async (flow: MenuFlow) => {
    try {
      const { error } = await supabase
        .from('ussd_menu_flows')
        .update({ is_active: !flow.is_active })
        .eq('id', flow.id);

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: flow.id,
        action: flow.is_active ? 'deactivated' : 'activated',
        changes_description: `Flow ${flow.is_active ? 'deactivated' : 'activated'}`,
        performed_by: 'admin'
      });

      toast({
        title: "Success",
        description: `Flow ${flow.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const publishFlow = async (flow: MenuFlow) => {
    try {
      const { error } = await supabase
        .from('ussd_menu_flows')
        .update({ is_published: true })
        .eq('id', flow.id);

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: flow.id,
        action: 'published',
        changes_description: 'Flow published',
        performed_by: 'admin'
      });

      toast({
        title: "Success",
        description: "Flow published successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const duplicateFlow = async (flow: MenuFlow) => {
    try {
      const { data, error } = await supabase
        .from('ussd_menu_flows')
        .insert({
          flow_name: `${flow.flow_name} (Copy)`,
          service_id: flow.service_id,
          description: flow.description,
          language: flow.language,
          created_by: 'admin',
          is_active: false,
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;

      // Record history
      await supabase.from('ussd_flow_history').insert({
        flow_id: data.id,
        action: 'created',
        changes_description: `Duplicated from flow: ${flow.flow_name}`,
        performed_by: 'admin',
        new_version: 1
      });

      toast({
        title: "Success",
        description: "Flow duplicated successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFlow = async (flow: MenuFlow) => {
    if (!confirm("Are you sure you want to delete this flow? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ussd_menu_flows')
        .delete()
        .eq('id', flow.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flow deleted successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editFlow = (flow: MenuFlow) => {
    setEditingFlow(flow);
    setFormData({
      flow_name: flow.flow_name,
      service_id: flow.service_id,
      description: flow.description || "",
      language: flow.language,
      is_active: flow.is_active,
      scheduled_publish_at: flow.scheduled_publish_at?.split('T')[0] || ""
    });
    setIsDialogOpen(true);
  };

  const filteredFlows = flows.filter(flow => {
    const serviceMatch = filterService === "all" || flow.service_id === filterService;
    const statusMatch = filterStatus === "all" || 
      (filterStatus === "active" && flow.is_active) ||
      (filterStatus === "published" && flow.is_published) ||
      (filterStatus === "draft" && !flow.is_published);
    
    return serviceMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Menu Flows</h2>
          <p className="text-muted-foreground">Manage USSD menu flows and their configurations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFlow ? 'Edit Flow' : 'Create New Flow'}</DialogTitle>
              <DialogDescription>
                {editingFlow ? 'Update the flow configuration' : 'Create a new USSD menu flow'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="flow_name">Flow Name</Label>
                <Input
                  id="flow_name"
                  value={formData.flow_name}
                  onChange={(e) => setFormData({ ...formData, flow_name: e.target.value })}
                  placeholder="Enter flow name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="service_id">Service</Label>
                <Select
                  value={formData.service_id}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.service_name} ({service.service_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="sw">Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div>
                <Label htmlFor="scheduled_publish_at">Scheduled Publish (Optional)</Label>
                <Input
                  id="scheduled_publish_at"
                  type="date"
                  value={formData.scheduled_publish_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_publish_at: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingFlow ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Service</Label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.service_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flows Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Flows ({filteredFlows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading flows...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flow Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlows.map((flow) => (
                  <TableRow key={flow.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectFlow(flow.id)}>
                    <TableCell className="font-medium">{flow.flow_name}</TableCell>
                    <TableCell>
                      {flow.ussd_services?.service_name}
                      <div className="text-sm text-muted-foreground">
                        {flow.ussd_services?.service_code}
                      </div>
                    </TableCell>
                    <TableCell>v{flow.version}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={flow.is_active ? "default" : "secondary"}>
                          {flow.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {flow.is_published && (
                          <Badge variant="outline">Published</Badge>
                        )}
                        {flow.scheduled_publish_at && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{flow.language.toUpperCase()}</TableCell>
                    <TableCell>{new Date(flow.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            editFlow(flow);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlowStatus(flow);
                          }}
                        >
                          {flow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        {!flow.is_published && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              publishFlow(flow);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateFlow(flow);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFlow(flow);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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