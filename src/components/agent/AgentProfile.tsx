import { useState } from "react";
import { ArrowLeft, Edit, Shield, DollarSign, TrendingUp, AlertCircle, Download, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface AgentProfileProps {
  agentId: string | null;
  onBack: () => void;
}

export function AgentProfile({ agentId, onBack }: AgentProfileProps) {
  // Mock data - in real app this would come from API
  const agentData = {
    id: agentId || "AGT_001",
    name: "Jean Baptiste Mukendi",
    phone: "+243 999 123 456",
    region: "Goma",
    supervisor: "Marie Ngozi",
    walletBalance: 2456.75,
    status: "Active",
    registrationDate: "2024-01-15",
    lastActivity: "2 hours ago"
  };

  const services = [
    { name: "Airtime", active: true, notes: "All networks" },
    { name: "Internet Bundles", active: true, notes: "Vodacom & Orange only" },
    { name: "Bill Payments", active: false, notes: "Pending approval" },
    { name: "SNEL Tokens", active: true, notes: "On-demand" },
    { name: "REGIDESO", active: true, notes: "Limited to $500/day" },
    { name: "Merchant Registration", active: true, notes: "Certified" }
  ];

  const salesData = [
    { product: "Airtime", units: 430, totalSales: 645.00, commission: 25.80 },
    { product: "SNEL", units: 70, totalSales: 890.00, commission: 35.60 },
    { product: "Internet", units: 85, totalSales: 425.00, commission: 17.00 },
    { product: "Merchant Registration", units: 12, totalSales: 0, commission: 24.00 }
  ];

  const transactions = [
    { id: "TXN_001", amount: 45.00, date: "2024-07-16 14:30", channel: "Vodacom", status: "Success", buyer: "CUST_123" },
    { id: "TXN_002", amount: 25.50, date: "2024-07-16 13:15", channel: "Orange", status: "Success", buyer: "CUST_456" },
    { id: "TXN_003", amount: 78.20, date: "2024-07-16 12:45", channel: "Airtel", status: "Pending", buyer: "CUST_789" },
    { id: "TXN_004", amount: 120.00, date: "2024-07-16 11:30", channel: "SNEL", status: "Success", buyer: "CUST_012" },
    { id: "TXN_005", amount: 35.75, date: "2024-07-16 10:20", channel: "Vodacom", status: "Failed", buyer: "CUST_345" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Agent Profile</h1>
          <p className="text-muted-foreground">Extended report for {agentData.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agent Overview</span>
            <Badge variant={agentData.status === "Active" ? "default" : "secondary"}>
              {agentData.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Agent ID</p>
              <p className="text-lg font-semibold">{agentData.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg font-semibold">{agentData.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Region</p>
              <p className="text-lg font-semibold">{agentData.region}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
              <p className="text-lg font-semibold">{agentData.supervisor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
              <p className="text-lg font-semibold text-green-600">${agentData.walletBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
              <p className="text-lg font-semibold">{agentData.registrationDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Activity</p>
              <p className="text-lg font-semibold">{agentData.lastActivity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services & Permissions</CardTitle>
              <CardDescription>Manage agent service access and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${service.active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.notes}</p>
                      </div>
                    </div>
                    <Badge variant={service.active ? "default" : "secondary"}>
                      {service.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Wallet Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">${agentData.walletBalance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Refill</p>
                  <p className="text-lg">July 14, 2024</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Cashout</p>
                  <p className="text-lg">July 12, 2024</p>
                </div>
                <Button className="w-full">Top-up Wallet</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CashIn/CashOut Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total CashIn</span>
                    <span className="font-semibold text-green-600">$3,456.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total CashOut</span>
                    <span className="font-semibold text-red-600">$2,890.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Difference</span>
                    <span className="text-green-600">+$566.00</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Transaction Distribution</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Vodacom</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Orange</span>
                      <span>35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Airtel</span>
                      <span>20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary by Product</CardTitle>
              <CardDescription>Performance breakdown across all product lines</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sale.product}</TableCell>
                      <TableCell>{sale.units}</TableCell>
                      <TableCell>${sale.totalSales.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">${sale.commission.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest 10 transaction records</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Buyer ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell>${txn.amount.toFixed(2)}</TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell>{txn.channel}</TableCell>
                      <TableCell>
                        <Badge variant={
                          txn.status === "Success" ? "default" :
                          txn.status === "Pending" ? "secondary" : "destructive"
                        }>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{txn.buyer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Transactions</span>
                    <span className="font-semibold">112</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Volume</span>
                    <span className="font-semibold">$2,285</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Commission</span>
                    <span className="font-semibold text-green-600">$103.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Daily Revenue</span>
                    <span className="font-semibold">$26.40</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention</span>
                    <span className="font-semibold">82%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Airtime Stock</span>
                    <Badge variant="default">$234.50</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Internet Bundles</span>
                    <Badge variant="secondary">$45.20</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SNEL Tokens</span>
                    <Badge variant="default">On-demand</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>REGIDESO Balance</span>
                    <Badge variant="default">$156.75</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Notes & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <p className="font-medium">No CashIn in 5 days</p>
                  <p className="text-sm text-muted-foreground">Auto-flagged for follow-up</p>
                </div>
                <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <p className="font-medium">Eligible for Bonus</p>
                  <p className="text-sm text-muted-foreground">Met Q2 performance targets</p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <p className="font-medium">KYC Compliant</p>
                  <p className="text-sm text-muted-foreground">Verified on July 10, 2024</p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send to Supervisor
                </Button>
                <Button variant="outline" size="sm">
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}