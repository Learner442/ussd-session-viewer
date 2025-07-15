import { useState } from "react";
import { CalendarIcon, Download, Filter, Search, FileText, FileSpreadsheet, Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for transactions
const mockTransactions = [
  {
    id: "TXN001",
    date: "2024-01-15 14:30",
    amount: 1500.00,
    serviceFee: 75.00,
    smsFee: 5.00,
    mnoCommission: 150.00,
    netProfit: 1270.00,
    user: "John Doe",
    service: "Airtime Purchase",
    status: "Success",
    region: "Lagos",
    mno: "MTN",
    gateway: "Paystack"
  },
  {
    id: "TXN002",
    date: "2024-01-15 15:45",
    amount: 2000.00,
    serviceFee: 100.00,
    smsFee: 5.00,
    mnoCommission: 200.00,
    netProfit: 1695.00,
    user: "Jane Smith",
    service: "Bill Payment",
    status: "Success",
    region: "Abuja",
    mno: "Glo",
    gateway: "Flutterwave"
  },
  {
    id: "TXN003",
    date: "2024-01-15 16:20",
    amount: 500.00,
    serviceFee: 25.00,
    smsFee: 5.00,
    mnoCommission: 50.00,
    netProfit: 0.00,
    user: "Mike Johnson",
    service: "Data Bundle",
    status: "Failed",
    region: "Kano",
    mno: "Airtel",
    gateway: "Paystack"
  },
  {
    id: "TXN004",
    date: "2024-01-15 17:10",
    amount: 3000.00,
    serviceFee: 150.00,
    smsFee: 5.00,
    mnoCommission: 300.00,
    netProfit: 2545.00,
    user: "Sarah Wilson",
    service: "Electricity Bill",
    status: "Success",
    region: "Port Harcourt",
    mno: "9Mobile",
    gateway: "Flutterwave"
  },
  {
    id: "TXN005",
    date: "2024-01-15 18:00",
    amount: 1200.00,
    serviceFee: 60.00,
    smsFee: 5.00,
    mnoCommission: 120.00,
    netProfit: 0.00,
    user: "David Brown",
    service: "Airtime Purchase",
    status: "Pending",
    region: "Ibadan",
    mno: "MTN",
    gateway: "Paystack"
  },
];

export function Transactions() {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate metrics
  const totalTransactions = mockTransactions.length;
  const successfulTransactions = mockTransactions.filter(t => t.status === "Success").length;
  const failedTransactions = mockTransactions.filter(t => t.status === "Failed").length;
  const pendingTransactions = mockTransactions.filter(t => t.status === "Pending").length;
  
  const grossRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCosts = mockTransactions.reduce((sum, t) => sum + t.serviceFee + t.smsFee + t.mnoCommission, 0);
  const netProfit = mockTransactions.reduce((sum, t) => sum + t.netProfit, 0);
  const avgTransactionValue = grossRevenue / totalTransactions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !selectedUser || transaction.user === selectedUser;
    const matchesRegion = !selectedRegion || transaction.region === selectedRegion;
    const matchesService = !selectedService || transaction.service === selectedService;
    const matchesStatus = !selectedStatus || transaction.status === selectedStatus;
    
    return matchesSearch && matchesUser && matchesRegion && matchesService && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-muted-foreground">
            View and analyze all monetary transactions on the USSD platform
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background border z-50">
            <DropdownMenuItem>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                <div className="text-xs text-muted-foreground space-x-2">
                  <span className="text-green-600">{successfulTransactions} Success</span>
                  <span className="text-red-600">{failedTransactions} Failed</span>
                  <span className="text-yellow-600">{pendingTransactions} Pending</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{grossRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ₦{avgTransactionValue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{totalCosts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Fees & Commissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₦{netProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Margin: {((netProfit / grossRevenue) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border z-50">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border z-50">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Region</Label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="">All Regions</SelectItem>
                      <SelectItem value="Lagos">Lagos</SelectItem>
                      <SelectItem value="Abuja">Abuja</SelectItem>
                      <SelectItem value="Kano">Kano</SelectItem>
                      <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                      <SelectItem value="Ibadan">Ibadan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="">All Services</SelectItem>
                      <SelectItem value="Airtime Purchase">Airtime Purchase</SelectItem>
                      <SelectItem value="Bill Payment">Bill Payment</SelectItem>
                      <SelectItem value="Data Bundle">Data Bundle</SelectItem>
                      <SelectItem value="Electricity Bill">Electricity Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Detailed view of all monetary transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Service Fee</TableHead>
                      <TableHead>SMS Fee</TableHead>
                      <TableHead>MNO Commission</TableHead>
                      <TableHead>Net Profit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>MNO</TableHead>
                      <TableHead>Gateway</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.user}</TableCell>
                        <TableCell>{transaction.service}</TableCell>
                        <TableCell>₦{transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>₦{transaction.serviceFee.toLocaleString()}</TableCell>
                        <TableCell>₦{transaction.smsFee.toLocaleString()}</TableCell>
                        <TableCell>₦{transaction.mnoCommission.toLocaleString()}</TableCell>
                        <TableCell className={transaction.netProfit > 0 ? "text-green-600" : "text-red-600"}>
                          ₦{transaction.netProfit.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{transaction.region}</TableCell>
                        <TableCell>{transaction.mno}</TableCell>
                        <TableCell>{transaction.gateway}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profitability by Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(mockTransactions.map(t => t.service))).map(service => {
                    const serviceTransactions = mockTransactions.filter(t => t.service === service);
                    const serviceRevenue = serviceTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const serviceCosts = serviceTransactions.reduce((sum, t) => sum + t.serviceFee + t.smsFee + t.mnoCommission, 0);
                    const serviceProfit = serviceTransactions.reduce((sum, t) => sum + t.netProfit, 0);
                    const margin = serviceRevenue > 0 ? ((serviceProfit / serviceRevenue) * 100).toFixed(1) : "0.0";
                    
                    return (
                      <div key={service} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{service}</span>
                          <span className="text-sm text-muted-foreground">{margin}% margin</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>Revenue: ₦{serviceRevenue.toLocaleString()}</div>
                          <div>Costs: ₦{serviceCosts.toLocaleString()}</div>
                          <div className="text-green-600">Profit: ₦{serviceProfit.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability by MNO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(mockTransactions.map(t => t.mno))).map(mno => {
                    const mnoTransactions = mockTransactions.filter(t => t.mno === mno);
                    const mnoRevenue = mnoTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const mnoCosts = mnoTransactions.reduce((sum, t) => sum + t.serviceFee + t.smsFee + t.mnoCommission, 0);
                    const mnoProfit = mnoTransactions.reduce((sum, t) => sum + t.netProfit, 0);
                    const margin = mnoRevenue > 0 ? ((mnoProfit / mnoRevenue) * 100).toFixed(1) : "0.0";
                    
                    return (
                      <div key={mno} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{mno}</span>
                          <span className="text-sm text-muted-foreground">{margin}% margin</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>Revenue: ₦{mnoRevenue.toLocaleString()}</div>
                          <div>Costs: ₦{mnoCosts.toLocaleString()}</div>
                          <div className="text-green-600">Profit: ₦{mnoProfit.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}