import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, Edit, Trash2, Filter, Users, MapPin, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  agent_id: string;
  agent_name: string;
  phone_number: string;
  region: string;
  status: string;
  supervisor: string;
  initial_topup: number;
  created_at: string;
  updated_at: string;
  sales_quota?: number;
  territory?: string;
  last_activity?: string;
}

interface NewAgentForm {
  agent_name: string;
  phone_number: string;
  region: string;
  sales_agent_id: string; // Changed from supervisor to sales_agent_id
  initial_topup: number;
  sales_quota: number;
  territory: string;
}

interface SalesAgent {
  id: string;
  sales_agent_id: string;
  agent_name: string;
  region: string;
  status: string;
}

export const AgentManagement = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filters, setFilters] = useState({
    region: 'all',
    status: 'all',
    seniority: 'all'
  });

  const [newAgentForm, setNewAgentForm] = useState<NewAgentForm>({
    agent_name: '',
    phone_number: '',
    region: '',
    sales_agent_id: '', // Changed from supervisor
    initial_topup: 0,
    sales_quota: 100000,
    territory: ''
  });

  useEffect(() => {
    loadAgents();
    loadSalesAgents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [agents, filters]);

  const loadSalesAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_agents')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setSalesAgents(data || []);
    } catch (error) {
      console.error('Error loading sales agents:', error);
    }
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load last activity for each agent
      const agentsWithActivity = await Promise.all(
        (data || []).map(async (agent) => {
          const { data: lastSession } = await supabase
            .from('agent_user_sessions')
            .select('session_date')
            .eq('agent_id', agent.id)
            .order('session_date', { ascending: false })
            .limit(1);

          return {
            ...agent,
            last_activity: lastSession?.[0]?.session_date || agent.updated_at,
            sales_quota: 100000, // Default quota
            territory: agent.region // Default territory same as region
          };
        })
      );

      setAgents(agentsWithActivity);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error loading agents",
        description: "Failed to load agents data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...agents];

    if (filters.region !== 'all') {
      filtered = filtered.filter(agent => agent.region === filters.region);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(agent => agent.status === filters.status);
    }

    if (filters.seniority !== 'all') {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      if (filters.seniority === 'senior') {
        filtered = filtered.filter(agent => new Date(agent.created_at) <= threeMonthsAgo);
      } else if (filters.seniority === 'junior') {
        filtered = filtered.filter(agent => new Date(agent.created_at) > threeMonthsAgo);
      }
    }

    setFilteredAgents(filtered);
  };

  const addAgent = async () => {
    try {
      const { error } = await supabase
        .from('agents')
        .insert({
          agent_id: '', // Will be auto-generated by trigger
          agent_name: newAgentForm.agent_name,
          phone_number: newAgentForm.phone_number,
          region: newAgentForm.region,
          supervisor: '', // Temporary for compatibility
          sales_agent_id: newAgentForm.sales_agent_id === "none" ? null : newAgentForm.sales_agent_id || null,
          initial_topup: newAgentForm.initial_topup,
          status: 'pending' as const
        });

      if (error) throw error;

      toast({
        title: "Agent added successfully",
        description: `${newAgentForm.agent_name} has been added as a new agent.`,
      });

      setIsAddDialogOpen(false);
      setNewAgentForm({
        agent_name: '',
        phone_number: '',
        region: '',
        sales_agent_id: '',
        initial_topup: 0,
        sales_quota: 100000,
        territory: ''
      });
      loadAgents();
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error adding agent",
        description: "Failed to add new agent.",
        variant: "destructive"
      });
    }
  };

  const updateAgent = async () => {
    if (!selectedAgent) return;

    try {
      const { error } = await supabase
        .from('agents')
        .update({
          agent_name: selectedAgent.agent_name,
          phone_number: selectedAgent.phone_number,
          region: selectedAgent.region,
          supervisor: selectedAgent.supervisor,
          status: selectedAgent.status as "pending" | "active" | "suspended" | "inactive"
        })
        .eq('id', selectedAgent.id);

      if (error) throw error;

      toast({
        title: "Agent updated successfully",
        description: `${selectedAgent.agent_name}'s information has been updated.`,
      });

      setIsEditDialogOpen(false);
      setSelectedAgent(null);
      loadAgents();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error updating agent",
        description: "Failed to update agent information.",
        variant: "destructive"
      });
    }
  };

  const deactivateAgent = async (agentId: string, agentName: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ status: 'inactive' as const })
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agent deactivated",
        description: `${agentName} has been deactivated.`,
      });

      loadAgents();
    } catch (error) {
      console.error('Error deactivating agent:', error);
      toast({
        title: "Error deactivating agent",
        description: "Failed to deactivate agent.",
        variant: "destructive"
      });
    }
  };

  const deactivateInactiveAgents = async () => {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const inactiveAgents = agents.filter(agent => {
        const lastActivity = new Date(agent.last_activity || agent.updated_at);
        return lastActivity <= threeMonthsAgo && agent.status === 'active';
      });

      if (inactiveAgents.length === 0) {
        toast({
          title: "No inactive agents found",
          description: "All agents have been active in the past 3 months.",
        });
        return;
      }

      for (const agent of inactiveAgents) {
        await supabase
          .from('agents')
          .update({ status: 'inactive' as const })
          .eq('id', agent.id);
      }

      toast({
        title: "Inactive agents deactivated",
        description: `${inactiveAgents.length} agents have been deactivated due to inactivity.`,
      });

      loadAgents();
    } catch (error) {
      console.error('Error deactivating inactive agents:', error);
      toast({
        title: "Error deactivating agents",
        description: "Failed to deactivate inactive agents.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const },
      inactive: { label: 'Inactive', variant: 'secondary' as const },
      suspended: { label: 'Suspended', variant: 'destructive' as const },
      pending: { label: 'Pending', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeniorityBadge = (createdAt: string) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const agentDate = new Date(createdAt);
    
    return agentDate <= threeMonthsAgo ? 
      <Badge variant="default">Senior</Badge> : 
      <Badge variant="outline">Junior</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sales Agent Management</h2>
          <p className="text-muted-foreground">Add, update, and manage sales agents</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Deactivate Inactive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate Inactive Agents</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate all agents who haven't logged any activity in the past 3 months. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deactivateInactiveAgents}>Deactivate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sales Agent</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={newAgentForm.agent_name}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, agent_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newAgentForm.phone_number}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select value={newAgentForm.region} onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goma">Goma</SelectItem>
                        <SelectItem value="kinshasa">Kinshasa</SelectItem>
                        <SelectItem value="bukavu">Bukavu</SelectItem>
                        <SelectItem value="urban">Urban Zones</SelectItem>
                        <SelectItem value="rural">Rural Zones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sales_agent">Sales Agent (Supervisor)</Label>
                    <Select value={newAgentForm.sales_agent_id} onValueChange={(value) => setNewAgentForm(prev => ({ ...prev, sales_agent_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Supervisor</SelectItem>
                        {salesAgents.map((salesAgent) => (
                          <SelectItem key={salesAgent.id} value={salesAgent.id}>
                            {salesAgent.agent_name} ({salesAgent.sales_agent_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quota">Sales Quota ($)</Label>
                    <Input
                      id="quota"
                      type="number"
                      value={newAgentForm.sales_quota}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, sales_quota: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="topup">Initial Top-up ($)</Label>
                    <Input
                      id="topup"
                      type="number"
                      value={newAgentForm.initial_topup}
                      onChange={(e) => setNewAgentForm(prev => ({ ...prev, initial_topup: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={addAgent}>Add Agent</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Region</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="goma">Goma</SelectItem>
                  <SelectItem value="kinshasa">Kinshasa</SelectItem>
                  <SelectItem value="bukavu">Bukavu</SelectItem>
                  <SelectItem value="urban">Urban Zones</SelectItem>
                  <SelectItem value="rural">Rural Zones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seniority</Label>
              <Select value={filters.seniority} onValueChange={(value) => setFilters(prev => ({ ...prev, seniority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seniority</SelectItem>
                  <SelectItem value="senior">Senior (3+ months)</SelectItem>
                  <SelectItem value="junior">Junior (&lt;3 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Agents ({filteredAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading agents...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Sales Quota</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.agent_id}</TableCell>
                    <TableCell>{agent.agent_name}</TableCell>
                    <TableCell className="capitalize">{agent.region}</TableCell>
                    <TableCell className="capitalize">{agent.territory}</TableCell>
                    <TableCell>${agent.sales_quota?.toLocaleString()}</TableCell>
                    <TableCell>{agent.supervisor}</TableCell>
                    <TableCell>{getStatusBadge(agent.status)}</TableCell>
                    <TableCell>{getSeniorityBadge(agent.created_at)}</TableCell>
                    <TableCell>{new Date(agent.last_activity || agent.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAgent(agent);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deactivate Agent</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to deactivate {agent.agent_name}? This action can be reversed later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deactivateAgent(agent.id, agent.agent_name)}>
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredAgents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No agents found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent Information</DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Agent Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedAgent.agent_name}
                    onChange={(e) => setSelectedAgent(prev => prev ? { ...prev, agent_name: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={selectedAgent.phone_number}
                    onChange={(e) => setSelectedAgent(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-region">Region/Territory</Label>
                  <Select value={selectedAgent.region} onValueChange={(value) => setSelectedAgent(prev => prev ? { ...prev, region: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goma">Goma</SelectItem>
                      <SelectItem value="kinshasa">Kinshasa</SelectItem>
                      <SelectItem value="bukavu">Bukavu</SelectItem>
                      <SelectItem value="urban">Urban Zones</SelectItem>
                      <SelectItem value="rural">Rural Zones</SelectItem>
                      <SelectItem value="east_coast">East Coast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={selectedAgent.status} onValueChange={(value) => setSelectedAgent(prev => prev ? { ...prev, status: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-supervisor">Supervisor</Label>
                <Input
                  id="edit-supervisor"
                  value={selectedAgent.supervisor}
                  onChange={(e) => setSelectedAgent(prev => prev ? { ...prev, supervisor: e.target.value } : null)}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateAgent}>Update Agent</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};