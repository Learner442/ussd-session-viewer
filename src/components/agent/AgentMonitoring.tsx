import { useState, useEffect } from "react";
import { Search, Filter, Download, MessageSquare, Gift, Eye, MoreHorizontal, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface AgentMonitoringProps {
  onAgentSelect: (agentId: string) => void;
  onBack?: () => void;
}

export function AgentMonitoring({ onAgentSelect, onBack }: AgentMonitoringProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch agents from database
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          agent_wallets(balance, total_transactions),
          agent_services(service_type, rate, rate_type)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Helper function to format time since creation
  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Calculate performance based on wallet balance and services
  const calculatePerformance = (agent: any) => {
    const balance = agent.agent_wallets?.[0]?.balance || 0;
    const serviceCount = agent.agent_services?.length || 0;
    
    if (balance > 1000 && serviceCount > 2) return "High";
    if (balance > 100 && serviceCount > 1) return "Medium";
    return "Low";
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.agent_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || agent.region === regionFilter;
    const matchesStatus = statusFilter === "all" || agent.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesRegion && matchesStatus;
  });

  const handleSelectAgent = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents([...selectedAgents, agentId]);
    } else {
      setSelectedAgents(selectedAgents.filter(id => id !== agentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(filteredAgents.map(agent => agent.agent_id));
    } else {
      setSelectedAgents([]);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPerformanceBadge = (performance: string) => {
    const variants = {
      High: "default",
      Medium: "secondary", 
      Low: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[performance as keyof typeof variants]}>
        {performance}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Agent Monitoring</h1>
            <p className="text-muted-foreground">Monitor and manage all field agents across regions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {selectedAgents.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Bulk Message ({selectedAgents.length})
              </Button>
              <Button variant="outline" size="sm">
                <Gift className="h-4 w-4 mr-2" />
                Bulk Bonus
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{loading ? "..." : agents.length}</div>
            <p className="text-sm text-muted-foreground">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : agents.filter(a => a.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ${loading ? "..." : agents.reduce((sum, a) => sum + (a.agent_wallets?.[0]?.total_transactions || 0), 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : "0"}
            </div>
            <p className="text-sm text-muted-foreground">Total Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by agent name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Goma">Goma</SelectItem>
                <SelectItem value="Bukavu">Bukavu</SelectItem>
                <SelectItem value="Kinshasa">Kinshasa</SelectItem>
                <SelectItem value="Lubumbashi">Lubumbashi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agent Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
          <CardDescription>
            Showing {filteredAgents.length} of {agents.length} agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Agent ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Today's Sales</TableHead>
                <TableHead>Total Volume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    Loading agents...
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No agents found. Try adjusting your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAgents.includes(agent.agent_id)}
                          onCheckedChange={(checked) => handleSelectAgent(agent.agent_id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{agent.agent_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.agent_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {agent.phone_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{agent.region}</p>
                          <p className="text-sm text-muted-foreground">
                            Supervisor: {agent.supervisor}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={
                          (agent.agent_wallets?.[0]?.balance || 0) < 100 ? "text-red-600" : "text-green-600"
                        }>
                          ${(agent.agent_wallets?.[0]?.balance || 0).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        ${agent.agent_wallets?.[0]?.last_transaction_at ? 
                          (Math.random() * 1000).toFixed(2) : "0.00"}
                      </TableCell>
                      <TableCell>
                        ${(agent.agent_wallets?.[0]?.total_transactions || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(agent.status || 'pending')}</TableCell>
                      <TableCell>{getPerformanceBadge(calculatePerformance(agent))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {agent.agent_services?.filter(s => !s.is_enabled).length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAgentSelect(agent.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Gift className="h-4 w-4 mr-2" />
                              Send Bonus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
