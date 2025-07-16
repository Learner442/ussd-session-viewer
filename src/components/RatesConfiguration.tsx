import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, History, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Rate {
  id: string;
  type: string;
  mnoRate: number;
  dapayMargin: number;
  totalRate: number;
  rateType: 'fixed' | 'percentage';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface RateHistory {
  id: string;
  rateId: string;
  oldRate: Rate;
  newRate: Rate;
  changedBy: string;
  changeDate: string;
  changeType: string;
}

export function RatesConfiguration() {
  const [rates, setRates] = useState<Rate[]>([
    {
      id: '1',
      type: 'USSD',
      mnoRate: 5.0,
      dapayMargin: 2.0,
      totalRate: 7.0,
      rateType: 'fixed',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@dapay.com'
    },
    {
      id: '2',
      type: 'SMS',
      mnoRate: 3.0,
      dapayMargin: 1.5,
      totalRate: 4.5,
      rateType: 'fixed',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@dapay.com'
    },
    {
      id: '3',
      type: 'P2P',
      mnoRate: 15.0,
      dapayMargin: 5.0,
      totalRate: 20.0,
      rateType: 'percentage',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'admin@dapay.com'
    }
  ]);

  const [rateHistory, setRateHistory] = useState<RateHistory[]>([
    {
      id: '1',
      rateId: '1',
      oldRate: {
        id: '1',
        type: 'USSD',
        mnoRate: 4.0,
        dapayMargin: 1.5,
        totalRate: 5.5,
        rateType: 'fixed',
        status: 'active',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        createdBy: 'admin@dapay.com'
      },
      newRate: {
        id: '1',
        type: 'USSD',
        mnoRate: 5.0,
        dapayMargin: 2.0,
        totalRate: 7.0,
        rateType: 'fixed',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin@dapay.com'
      },
      changedBy: 'admin@dapay.com',
      changeDate: '2024-01-15T10:00:00Z',
      changeType: 'Updated'
    }
  ]);

  const [newRate, setNewRate] = useState({
    type: '',
    mnoRate: '',
    dapayMargin: '',
    agentRate: '',
    rateType: 'fixed' as 'fixed' | 'percentage',
    status: 'active' as 'active' | 'inactive'
  });

  const handleCreateRate = () => {
    if (!newRate.type || !newRate.mnoRate || !newRate.dapayMargin || !newRate.agentRate) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const mnoRateNum = parseFloat(newRate.mnoRate);
    const dapayMarginNum = parseFloat(newRate.dapayMargin);
    const totalRate = mnoRateNum + dapayMarginNum;

    const rate: Rate = {
      id: Date.now().toString(),
      type: newRate.type,
      mnoRate: mnoRateNum,
      dapayMargin: dapayMarginNum,
      totalRate,
      rateType: newRate.rateType,
      status: newRate.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user@dapay.com'
    };

    setRates([...rates, rate]);
    setNewRate({
      type: '',
      mnoRate: '',
      dapayMargin: '',
      agentRate: '',
      rateType: 'fixed',
      status: 'active'
    });

    toast({
      title: "Success",
      description: "Rate created successfully"
    });
  };

  const toggleRateStatus = (id: string) => {
    setRates(rates.map(rate => 
      rate.id === id 
        ? { ...rate, status: rate.status === 'active' ? 'inactive' : 'active' }
        : rate
    ));
  };

  const deleteRate = (id: string) => {
    setRates(rates.filter(rate => rate.id !== id));
    toast({
      title: "Success",
      description: "Rate deleted successfully"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rates Configuration</h1>
          <p className="text-muted-foreground">Manage MNO prices and DAPAY margins for all services</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Rate
        </Button>
      </div>

      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rates">Rate Management</TabsTrigger>
          <TabsTrigger value="visualization">Rate Visualization</TabsTrigger>
          <TabsTrigger value="history">Rate History</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-6">
          {/* Create New Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Rate</CardTitle>
              <CardDescription>Configure MNO prices and DAPAY margins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-type">Service Type</Label>
                  <Select value={newRate.type} onValueChange={(value) => setNewRate({...newRate, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USSD">USSD</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="P2P">P2P Transaction</SelectItem>
                      <SelectItem value="C2B">C2B Transaction</SelectItem>
                      <SelectItem value="B2C">B2C Transaction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mno-rate">MNO Rate</Label>
                  <Input
                    id="mno-rate"
                    type="number"
                    step="0.01"
                    value={newRate.mnoRate}
                    onChange={(e) => setNewRate({...newRate, mnoRate: e.target.value})}
                    placeholder="Enter MNO rate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dapay-margin">DAPAY Margin</Label>
                  <Input
                    id="dapay-margin"
                    type="number"
                    step="0.01"
                    value={newRate.dapayMargin}
                    onChange={(e) => setNewRate({...newRate, dapayMargin: e.target.value})}
                    placeholder="Enter DAPAY margin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-rate">Agent Rate</Label>
                  <Input
                    id="agent-rate"
                    type="number"
                    step="0.01"
                    value={newRate.agentRate}
                    onChange={(e) => setNewRate({...newRate, agentRate: e.target.value})}
                    placeholder="Enter agent commission rate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate-type-select">Rate Type</Label>
                  <Select value={newRate.rateType} onValueChange={(value: 'fixed' | 'percentage') => setNewRate({...newRate, rateType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newRate.status} onValueChange={(value: 'active' | 'inactive') => setNewRate({...newRate, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleCreateRate} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    Create Rate
                  </Button>
                </div>
              </div>

              {newRate.mnoRate && newRate.dapayMargin && newRate.agentRate && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Rate Preview</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">MNO Rate:</span>
                      <p className="font-semibold">
                        {newRate.rateType === 'fixed' 
                          ? formatCurrency(parseFloat(newRate.mnoRate) || 0)
                          : `${newRate.mnoRate}%`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DAPAY Margin:</span>
                      <p className="font-semibold">
                        {newRate.rateType === 'fixed' 
                          ? formatCurrency(parseFloat(newRate.dapayMargin) || 0)
                          : `${newRate.dapayMargin}%`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agent Rate:</span>
                      <p className="font-semibold">
                        {newRate.rateType === 'fixed' 
                          ? formatCurrency(parseFloat(newRate.agentRate) || 0)
                          : `${newRate.agentRate}%`
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Rate:</span>
                      <p className="font-semibold text-primary">
                        {newRate.rateType === 'fixed' 
                          ? formatCurrency((parseFloat(newRate.mnoRate) || 0) + (parseFloat(newRate.dapayMargin) || 0))
                          : `${((parseFloat(newRate.mnoRate) || 0) + (parseFloat(newRate.dapayMargin) || 0)).toFixed(2)}%`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Rates</CardTitle>
              <CardDescription>Manage current rate configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>MNO Rate</TableHead>
                    <TableHead>DAPAY Margin</TableHead>
                    <TableHead>Total Rate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.type}</TableCell>
                      <TableCell>
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.mnoRate)
                          : `${rate.mnoRate}%`
                        }
                      </TableCell>
                      <TableCell>
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.dapayMargin)
                          : `${rate.dapayMargin}%`
                        }
                      </TableCell>
                      <TableCell className="font-semibold">
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.totalRate)
                          : `${rate.totalRate}%`
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={rate.rateType === 'fixed' ? 'default' : 'secondary'}>
                          {rate.rateType === 'fixed' ? 'Fixed' : 'Percentage'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={rate.status === 'active'}
                            onCheckedChange={() => toggleRateStatus(rate.id)}
                          />
                          <Badge variant={rate.status === 'active' ? 'default' : 'secondary'}>
                            {rate.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(rate.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteRate(rate.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rates.filter(rate => rate.status === 'active').map((rate) => (
              <Card key={rate.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {rate.type} Rate
                    <Badge variant={rate.rateType === 'fixed' ? 'default' : 'secondary'}>
                      {rate.rateType === 'fixed' ? 'Fixed' : 'Percentage'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">MNO Price</span>
                      <span className="font-semibold">
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.mnoRate)
                          : `${rate.mnoRate}%`
                        }
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">DAPAY Margin</span>
                      <span className="font-semibold">
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.dapayMargin)
                          : `${rate.dapayMargin}%`
                        }
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total End-User Cost</span>
                      <span className="font-bold text-primary text-lg">
                        {rate.rateType === 'fixed' 
                          ? formatCurrency(rate.totalRate)
                          : `${rate.totalRate}%`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Rate History
              </CardTitle>
              <CardDescription>Track all rate changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Old Rate</TableHead>
                    <TableHead>New Rate</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{formatDate(history.changeDate)}</TableCell>
                      <TableCell className="font-medium">{history.oldRate.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{history.changeType}</Badge>
                      </TableCell>
                      <TableCell>
                        {history.oldRate.rateType === 'fixed' 
                          ? formatCurrency(history.oldRate.totalRate)
                          : `${history.oldRate.totalRate}%`
                        }
                      </TableCell>
                      <TableCell>
                        {history.newRate.rateType === 'fixed' 
                          ? formatCurrency(history.newRate.totalRate)
                          : `${history.newRate.totalRate}%`
                        }
                      </TableCell>
                      <TableCell>{history.changedBy}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
