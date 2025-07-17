import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
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

interface Service {
  id: string;
  service_code: string;
  service_name: string;
  service_type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ServiceManager() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    service_code: "",
    service_name: "",
    service_type: "",
    description: "",
    is_active: true
  });

  const serviceTypes = [
    { value: "balance_check", label: "Balance Check" },
    { value: "bill_payment", label: "Bill Payment" },
    { value: "loan_service", label: "Loan Service" },
    { value: "money_transfer", label: "Money Transfer" },
    { value: "airtime_topup", label: "Airtime Top-up" },
    { value: "data_bundle", label: "Data Bundle" },
    { value: "mini_statement", label: "Mini Statement" },
    { value: "savings", label: "Savings" },
    { value: "insurance", label: "Insurance" },
    { value: "other", label: "Other" }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ussd_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
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
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('ussd_services')
          .update(formData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Service updated successfully",
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('ussd_services')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Service created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingService(null);
      setFormData({
        service_code: "",
        service_name: "",
        service_type: "",
        description: "",
        is_active: true
      });
      loadServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('ussd_services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Service ${service.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      
      loadServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteService = async (service: Service) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ussd_services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      
      loadServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editService = (service: Service) => {
    setEditingService(service);
    setFormData({
      service_code: service.service_code,
      service_name: service.service_name,
      service_type: service.service_type,
      description: service.description || "",
      is_active: service.is_active
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">USSD Services</h2>
          <p className="text-muted-foreground">Manage available USSD services and their configurations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update the service configuration' : 'Create a new USSD service'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="service_code">Service Code</Label>
                <Input
                  id="service_code"
                  value={formData.service_code}
                  onChange={(e) => setFormData({ ...formData, service_code: e.target.value })}
                  placeholder="e.g., *150*1#"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="service_name">Service Name</Label>
                <Input
                  id="service_name"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="Enter service name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingService ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services ({services.length})</CardTitle>
          <CardDescription>
            Configure USSD service codes and link them to menu flows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading services...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Code</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-mono">{service.service_code}</TableCell>
                    <TableCell className="font-medium">{service.service_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {serviceTypes.find(t => t.value === service.service_type)?.label || service.service_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(service.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleServiceStatus(service)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteService(service)}
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