import { useState } from "react";
import { Search, Filter, Download, MessageSquare, Gift, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface AgentMonitoringProps {
  onAgentSelect: (agentId: string) => void;
}

export function AgentMonitoring({ onAgentSelect }: AgentMonitoringProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Mock agent data
  const agents = [
    {
      id: "AGT_001",
      name: "Jean Baptiste Mukendi",
      region: "Goma",
      walletBalance: 2456.75,
      todayVolume: 345.20,
      totalVolume: 12890.50,
      status: "Active",
      lastActivity: "2 hours ago",
      performance: "High",
      alerts: 0
    },
    {
      id: "AGT_002", 
      name: "Marie Ngozi Kabila",
      region: "Bukavu",
      walletBalance: 1234.50,
      todayVolume: 567.80,
      totalVolume: 9876.25,
      status: "Active",
      lastActivity: "30 mins ago", 
      performance: "High",
      alerts: 1
    },
    {
      id: "AGT_003",
      name: "Paul Mwanza",
      region: "Kinshasa",
      walletBalance: 45.20,
      todayVolume: 0,
      totalVolume: 5432.10,
      status: "Inactive",
      lastActivity: "3 days ago",
      performance: "Low",
      alerts: 2
    },
    {
      id: "AGT_004",
      name: "Grace Luamba",
      region: "Goma",
      walletBalance: 3421.80,
      todayVolume: 789.40,
      totalVolume: 15678.90,
      status: "Active",
      lastActivity: "1 hour ago",
      performance: "High",
      alerts: 0
    },
    {
      id: "AGT_005",
      name: "Emmanuel Tshisekedi",
      region: "Lubumbashi",
      walletBalance: 156.30,
      todayVolume: 23.50,
      totalVolume: 3456.78,
      status: "Active",
      lastActivity: "4 hours ago",
      performance: "Medium",
      alerts: 1
    }
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.id.toLowerCase().includes(searchQuery.toLowerCase());
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
      setSelectedAgents(filteredAgents.map(agent => agent.id));
    } else {
      setSelectedAgents([]);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Active" ? "default" : "secondary"}>
        {status}
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
        <div>
          <h1 className="text-2xl font-bold">Agent Monitoring</h1>
          <p className="text-muted-foreground">Monitor and manage all field agents across regions</p>
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
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-sm text-muted-foreground">Total Agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === "Active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              ${agents.reduce((sum, a) => sum + a.todayVolume, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Today's Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {agents.reduce((sum, a) => sum + a.alerts, 0)}
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
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={(checked) => handleSelectAgent(agent.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{agent.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">Last: {agent.lastActivity}</p>
                    </div>
                  </TableCell>
                  <TableCell>{agent.region}</TableCell>
                  <TableCell>
                    <span className={agent.walletBalance < 100 ? "text-red-600" : "text-green-600"}>
                      ${agent.walletBalance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>${agent.todayVolume.toFixed(2)}</TableCell>
                  <TableCell>${agent.totalVolume.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(agent.status)}</TableCell>
                  <TableCell>{getPerformanceBadge(agent.performance)}</TableCell>
                  <TableCell>
                    {agent.alerts > 0 && (
                      <Badge variant="destructive">{agent.alerts}</Badge>
                    )}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}