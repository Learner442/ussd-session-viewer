import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Signal, MessageSquare, DollarSign, TrendingUp } from "lucide-react";

type USSDStatus = "active" | "completed" | "failed" | "pending" | "timeout";
type USSDService = "Send Money" | "PayBill" | "Buy Airtime" | "Regional Transfer" | "Forex Exchange" | "Electricity Payment";

interface USSDSession {
  id: string;
  phoneNumber: string;
  serviceCode: string;
  service: USSDService;
  status: USSDStatus;
  startTime: Date;
  endTime?: Date;
  duration: number;
  requestCount: number;
  lastRequest: string;
  sessionCost: number;
  revenue: number;
  smsStatus?: "sent" | "pending" | "failed";
  smsCost?: number;
  smsDeliveredAt?: Date;
}

// Mock data for USSD sessions
const mockSessions: USSDSession[] = [
  {
    id: "USS-001",
    phoneNumber: "+233244123456",
    serviceCode: "*170#",
    service: "Send Money",
    status: "active",
    startTime: new Date(Date.now() - 45000),
    duration: 45,
    requestCount: 3,
    lastRequest: "Enter Amount",
    sessionCost: 0.05,
    revenue: 0,
    smsStatus: "pending"
  },
  {
    id: "USS-002", 
    phoneNumber: "+233245678901",
    serviceCode: "*150#",
    service: "PayBill",
    status: "completed",
    startTime: new Date(Date.now() - 180000),
    endTime: new Date(Date.now() - 60000),
    duration: 120,
    requestCount: 5,
    lastRequest: "Payment Successful",
    sessionCost: 0.08,
    revenue: 1.50,
    smsStatus: "sent",
    smsCost: 0.02,
    smsDeliveredAt: new Date(Date.now() - 60000)
  },
  {
    id: "USS-003",
    phoneNumber: "+233256789012",
    serviceCode: "*130#",
    service: "Buy Airtime",
    status: "failed",
    startTime: new Date(Date.now() - 300000),
    endTime: new Date(Date.now() - 240000),
    duration: 60,
    requestCount: 2,
    lastRequest: "Transaction Failed",
    sessionCost: 0.04,
    revenue: 0,
    smsStatus: "failed"
  },
  {
    id: "USS-004",
    phoneNumber: "+233267890123",
    serviceCode: "*170#",
    service: "Regional Transfer",
    status: "pending",
    startTime: new Date(Date.now() - 30000),
    duration: 30,
    requestCount: 1,
    lastRequest: "Select Country",
    sessionCost: 0.03,
    revenue: 0
  },
  {
    id: "USS-005",
    phoneNumber: "+233278901234",
    serviceCode: "*140#",
    service: "Forex Exchange",
    status: "timeout",
    startTime: new Date(Date.now() - 600000),
    endTime: new Date(Date.now() - 300000),
    duration: 300,
    requestCount: 1,
    lastRequest: "Session Timeout",
    sessionCost: 0.12,
    revenue: 0
  },
  {
    id: "USS-006",
    phoneNumber: "+233289012345",
    serviceCode: "*150#",
    service: "Electricity Payment",
    status: "completed",
    startTime: new Date(Date.now() - 900000),
    endTime: new Date(Date.now() - 720000),
    duration: 180,
    requestCount: 6,
    lastRequest: "Payment Complete",
    sessionCost: 0.10,
    revenue: 2.25,
    smsStatus: "sent",
    smsCost: 0.02,
    smsDeliveredAt: new Date(Date.now() - 720000)
  }
];

const getStatusBadgeVariant = (status: USSDStatus) => {
  switch (status) {
    case "active": return "active";
    case "completed": return "completed"; 
    case "failed": return "failed";
    case "pending": return "pending";
    case "timeout": return "timeout";
    default: return "default";
  }
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function USSDSessionTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sessions, setSessions] = useState(mockSessions);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.phoneNumber.includes(searchTerm) || 
                         session.serviceCode.includes(searchTerm) ||
                         session.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const refreshSessions = () => {
    // Simulate refresh with new mock data
    setSessions([...mockSessions]);
  };

  const getSessionStats = () => {
    const total = sessions.length;
    const active = sessions.filter(s => s.status === "active").length;
    const completed = sessions.filter(s => s.status === "completed").length;
    const failed = sessions.filter(s => s.status === "failed").length;
    const totalRevenue = sessions.reduce((sum, s) => sum + s.revenue, 0);
    const totalCosts = sessions.reduce((sum, s) => sum + s.sessionCost + (s.smsCost || 0), 0);
    const smsDelivered = sessions.filter(s => s.smsStatus === "sent").length;
    
    return { total, active, completed, failed, totalRevenue, totalCosts, smsDelivered };
  };

  const stats = getSessionStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <div className="w-2 h-2 bg-status-active rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-active">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="w-2 h-2 bg-status-completed rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-completed">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <div className="w-2 h-2 bg-status-failed rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-failed">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${stats.totalCosts.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Delivered</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.smsDelivered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>USSD Sessions</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={refreshSessions} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>SMS</TableHead>
                  <TableHead>Last Request</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.id}</TableCell>
                    <TableCell>{session.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.service}</span>
                        <span className="text-sm text-muted-foreground font-mono">{session.serviceCode}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(session.startTime)}</TableCell>
                    <TableCell className="font-mono">{formatDuration(session.duration)}</TableCell>
                    <TableCell className="font-mono text-destructive">${session.sessionCost.toFixed(3)}</TableCell>
                    <TableCell className="font-mono text-primary">${session.revenue.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-destructive">
                      {session.revenue === 0 ? `$${session.sessionCost.toFixed(3)}` : "$0.000"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {session.smsStatus && (
                          <Badge variant={session.smsStatus === "sent" ? "completed" : session.smsStatus === "failed" ? "failed" : "pending"} className="text-xs">
                            {session.smsStatus.toUpperCase()}
                          </Badge>
                        )}
                        {session.smsCost && (
                          <span className="text-xs text-muted-foreground mt-1">${session.smsCost.toFixed(3)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{session.lastRequest}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No sessions found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}