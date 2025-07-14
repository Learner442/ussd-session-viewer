import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, MessageSquare, Send, Clock, AlertTriangle } from "lucide-react";

type SMSStatus = "sent" | "pending" | "failed" | "delivered";

interface SMSRecord {
  id: string;
  sessionId: string;
  phoneNumber: string;
  message: string;
  status: SMSStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  cost: number;
  retryCount: number;
  errorMessage?: string;
}

// Mock SMS data
const mockSMSRecords: SMSRecord[] = [
  {
    id: "SMS-001",
    sessionId: "USS-002",
    phoneNumber: "+233245678901",
    message: "Your PayBill transaction of GHS 150.00 to ECG was successful. Reference: TXN789012",
    status: "delivered",
    sentAt: new Date(Date.now() - 60000),
    deliveredAt: new Date(Date.now() - 58000),
    cost: 0.02,
    retryCount: 0
  },
  {
    id: "SMS-002",
    sessionId: "USS-006",
    phoneNumber: "+233289012345",
    message: "Your Electricity Payment of GHS 225.00 has been processed successfully. Token: 1234-5678-9012",
    status: "delivered",
    sentAt: new Date(Date.now() - 720000),
    deliveredAt: new Date(Date.now() - 718000),
    cost: 0.02,
    retryCount: 0
  },
  {
    id: "SMS-003",
    sessionId: "USS-001",
    phoneNumber: "+233244123456",
    message: "Your Send Money transaction is being processed. You will receive confirmation shortly.",
    status: "pending",
    sentAt: new Date(Date.now() - 30000),
    cost: 0.02,
    retryCount: 1
  },
  {
    id: "SMS-004",
    sessionId: "USS-003",
    phoneNumber: "+233256789012",
    message: "Your Airtime purchase failed. Please try again or contact customer service.",
    status: "failed",
    sentAt: new Date(Date.now() - 240000),
    cost: 0.02,
    retryCount: 3,
    errorMessage: "Invalid phone number format"
  }
];

const getSMSBadgeVariant = (status: SMSStatus) => {
  switch (status) {
    case "delivered": return "completed";
    case "sent": return "active";
    case "pending": return "pending";
    case "failed": return "failed";
    default: return "default";
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function SMSManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [smsRecords, setSMSRecords] = useState(mockSMSRecords);

  const filteredSMS = smsRecords.filter(sms => {
    const matchesSearch = sms.phoneNumber.includes(searchTerm) || 
                         sms.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sms.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sms.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const refreshSMS = () => {
    setSMSRecords([...mockSMSRecords]);
  };

  const getSMSStats = () => {
    const total = smsRecords.length;
    const delivered = smsRecords.filter(s => s.status === "delivered").length;
    const pending = smsRecords.filter(s => s.status === "pending").length;
    const failed = smsRecords.filter(s => s.status === "failed").length;
    const totalCost = smsRecords.reduce((sum, s) => sum + s.cost, 0);
    const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
    
    return { total, delivered, pending, failed, totalCost, deliveryRate };
  };

  const stats = getSMSStats();

  return (
    <div className="space-y-6">
      {/* SMS Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Send className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-completed">{stats.delivered}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-pending">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-failed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-failed">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <span className="text-sm text-muted-foreground">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${stats.totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <span className="text-sm text-muted-foreground">%</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.deliveryRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* SMS Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>SMS Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search SMS..."
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
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={refreshSMS} variant="outline" size="icon">
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
                  <TableHead>SMS ID</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSMS.map((sms) => (
                  <TableRow key={sms.id}>
                    <TableCell className="font-medium">{sms.id}</TableCell>
                    <TableCell className="font-mono">{sms.sessionId}</TableCell>
                    <TableCell>{sms.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getSMSBadgeVariant(sms.status)}>
                          {sms.status.toUpperCase()}
                        </Badge>
                        {sms.errorMessage && (
                          <span className="text-xs text-destructive">{sms.errorMessage}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {sms.sentAt && <span>{formatTime(sms.sentAt)}</span>}
                        {sms.deliveredAt && (
                          <span className="text-xs text-muted-foreground">
                            Delivered: {formatTime(sms.deliveredAt)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-destructive">${sms.cost.toFixed(3)}</TableCell>
                    <TableCell>
                      {sms.retryCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {sms.retryCount} retries
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-64 truncate">{sms.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredSMS.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No SMS records found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}