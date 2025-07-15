import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Wallet, 
  Activity,
  Calendar,
  Search,
  Filter
} from "lucide-react";

// Mock data for user metrics
const mockUserData = [
  {
    id: "U001",
    phone: "+254721123456",
    firstSeen: "2024-01-15",
    lastSeen: "2024-12-15",
    avgSessionsDaily: 2.5,
    avgSessionsWeekly: 17.5,
    avgSessionsMonthly: 75,
    avgSmsPerSession: 1.2,
    avgSmsPerUser: 90,
    avgServicesUsed: 3.2,
    completedSessions: 847,
    droppedSessions: 23,
    walletBalance: 15240.50,
    totalTransactionValue: 485000.00,
    revenueGenerated: 2425.00,
    lifetimeValue: 200.00,
    tags: ["High Spender", "Frequent SMS User"]
  },
  {
    id: "U002", 
    phone: "+254722987654",
    firstSeen: "2024-03-22",
    lastSeen: "2024-11-30",
    avgSessionsDaily: 0.8,
    avgSessionsWeekly: 5.6,
    avgSessionsMonthly: 24,
    avgSmsPerSession: 0.9,
    avgSmsPerUser: 21.6,
    avgServicesUsed: 1.8,
    completedSessions: 192,
    droppedSessions: 8,
    walletBalance: 2850.75,
    totalTransactionValue: 45000.00,
    revenueGenerated: 225.00,
    lifetimeValue: 5.00,
    tags: ["Agent-recruited"]
  },
  {
    id: "U003",
    phone: "+254733456789", 
    firstSeen: "2024-02-10",
    lastSeen: "2024-08-15",
    avgSessionsDaily: 0.1,
    avgSessionsWeekly: 0.7,
    avgSessionsMonthly: 3,
    avgSmsPerSession: 0.5,
    avgSmsPerUser: 1.5,
    avgServicesUsed: 1.0,
    completedSessions: 15,
    droppedSessions: 12,
    walletBalance: 125.00,
    totalTransactionValue: 2500.00,
    revenueGenerated: 12.50,
    lifetimeValue: 0.83,
    tags: ["Dormant"]
  }
];

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

const tagColors = {
  "High Spender": "bg-green-100 text-green-800 border-green-200",
  "Dormant": "bg-red-100 text-red-800 border-red-200",
  "Frequent SMS User": "bg-blue-100 text-blue-800 border-blue-200",
  "Agent-recruited": "bg-purple-100 text-purple-800 border-purple-200"
};

export function UserMetrics() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const filteredUsers = mockUserData.filter(user => {
    const matchesSearch = user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "all" || user.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  const getSessionAverage = (user: any) => {
    switch (selectedPeriod) {
      case "daily": return user.avgSessionsDaily;
      case "weekly": return user.avgSessionsWeekly;
      case "monthly": return user.avgSessionsMonthly;
      default: return user.avgSessionsMonthly;
    }
  };

  // Calculate summary metrics
  const totalUsers = filteredUsers.length;
  const totalRevenue = filteredUsers.reduce((sum, user) => sum + user.revenueGenerated, 0);
  const avgLifetimeValue = filteredUsers.reduce((sum, user) => sum + user.lifetimeValue, 0) / totalUsers;
  const totalWalletBalance = filteredUsers.reduce((sum, user) => sum + user.walletBalance, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active user base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Generated by users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">Per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWalletBalance)}</div>
            <p className="text-xs text-muted-foreground">In user wallets</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>Comprehensive user behavior and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by phone or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                <SelectItem value="High Spender">High Spender</SelectItem>
                <SelectItem value="Dormant">Dormant</SelectItem>
                <SelectItem value="Frequent SMS User">Frequent SMS User</SelectItem>
                <SelectItem value="Agent-recruited">Agent-recruited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Metrics Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Avg Sessions ({selectedPeriod})</TableHead>
                  <TableHead>SMS/Session</TableHead>
                  <TableHead>SMS/User</TableHead>
                  <TableHead>Avg Services</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Lifetime Value</TableHead>
                  <TableHead>First/Last Seen</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-mono">{user.phone}</TableCell>
                    <TableCell className="font-mono">{getSessionAverage(user).toFixed(1)}</TableCell>
                    <TableCell className="font-mono">{user.avgSmsPerSession.toFixed(1)}</TableCell>
                    <TableCell className="font-mono">{user.avgSmsPerUser}</TableCell>
                    <TableCell className="font-mono">{user.avgServicesUsed.toFixed(1)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-green-600 font-mono">{user.completedSessions} completed</span>
                        <span className="text-red-600 font-mono text-xs">{user.droppedSessions} dropped</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-primary">{formatCurrency(user.walletBalance)}</TableCell>
                    <TableCell className="font-mono">{formatCurrency(user.lifetimeValue)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>First: {formatDate(user.firstSeen)}</span>
                        <span className="text-muted-foreground">Last: {formatDate(user.lastSeen)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`text-xs ${tagColors[tag as keyof typeof tagColors] || 'bg-gray-100 text-gray-800'}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}