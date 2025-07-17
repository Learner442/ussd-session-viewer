import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MNO {
  id: string;
  mno_code: string;
  mno_name: string;
  country: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function MNOManager() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [mnos, setMnos] = useState<MNO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMNO, setEditingMNO] = useState<MNO | null>(null);

  const [formData, setFormData] = useState({
    mno_code: "",
    mno_name: "",
    country: "",
    is_active: true
  });

  useEffect(() => {
    loadMNOs();
  }, []);

  const loadMNOs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mnos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMnos(data || []);
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
      if (editingMNO) {
        // Update existing MNO
        const { error } = await supabase
          .from('mnos')
          .update(formData)
          .eq('id', editingMNO.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "MNO updated successfully",
        });
      } else {
        // Create new MNO
        const { error } = await supabase
          .from('mnos')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "MNO created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingMNO(null);
      setFormData({
        mno_code: "",
        mno_name: "",
        country: "",
        is_active: true
      });
      loadMNOs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleMNOStatus = async (mno: MNO) => {
    try {
      const { error } = await supabase
        .from('mnos')
        .update({ is_active: !mno.is_active })
        .eq('id', mno.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `MNO ${mno.is_active ? 'deactivated' : 'activated'} successfully`,
      });
      
      loadMNOs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMNO = async (mno: MNO) => {
    if (!confirm("Are you sure you want to delete this MNO? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mnos')
        .delete()
        .eq('id', mno.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "MNO deleted successfully",
      });
      
      loadMNOs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editMNO = (mno: MNO) => {
    setEditingMNO(mno);
    setFormData({
      mno_code: mno.mno_code,
      mno_name: mno.mno_name,
      country: mno.country || "",
      is_active: mno.is_active
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mobile Network Operators</h2>
          <p className="text-muted-foreground">Manage MNO configurations for USSD services</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add MNO
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingMNO ? 'Edit MNO' : 'Add New MNO'}</DialogTitle>
              <DialogDescription>
                {editingMNO ? 'Update the MNO configuration' : 'Create a new mobile network operator'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mno_code">MNO Code</Label>
                <Input
                  id="mno_code"
                  value={formData.mno_code}
                  onChange={(e) => setFormData({ ...formData, mno_code: e.target.value })}
                  placeholder="e.g., VODACOM"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="mno_name">MNO Name</Label>
                <Input
                  id="mno_name"
                  value={formData.mno_name}
                  onChange={(e) => setFormData({ ...formData, mno_name: e.target.value })}
                  placeholder="e.g., Vodacom Tanzania"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., Tanzania"
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
                  {editingMNO ? 'Update' : 'Create'}
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
          <CardTitle>Mobile Network Operators ({mnos.length})</CardTitle>
          <CardDescription>
            Configure MNO settings and link them to specific menu flows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading MNOs...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MNO Code</TableHead>
                  <TableHead>MNO Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mnos.map((mno) => (
                  <TableRow key={mno.id}>
                    <TableCell className="font-mono">{mno.mno_code}</TableCell>
                    <TableCell className="font-medium">{mno.mno_name}</TableCell>
                    <TableCell>
                      {mno.country && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {mno.country}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mno.is_active ? "default" : "secondary"}>
                        {mno.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(mno.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editMNO(mno)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMNOStatus(mno)}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMNO(mno)}
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