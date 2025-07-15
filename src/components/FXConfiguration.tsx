import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Download, Eye, Globe, Save, Settings, TrendingUp, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface FXRate {
  id: string;
  buyRate: number;
  sellRate: number;
  timestamp: string;
  userId: string;
  isOverride?: boolean;
  reason?: string;
}

interface FXActivity {
  id: string;
  userId: string;
  direction: "USD_TO_CDF" | "CDF_TO_USD";
  amount: number;
  rate: number;
  timestamp: string;
  margin: number;
}

interface CountryConfig {
  country: string;
  currency: string;
  deliveryMethods: string[];
  fxRate: number;
  margin: number;
  enabled: boolean;
}

export function FXConfiguration() {
  const [buyRate, setBuyRate] = useState("2650");
  const [sellRate, setSellRate] = useState("2680");
  const [marginBuy, setMarginBuy] = useState("2.5");
  const [marginSell, setMarginSell] = useState("3.0");
  const [apiSyncEnabled, setApiSyncEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("https://api.exchangerates.com/latest");
  const [refreshRate, setRefreshRate] = useState("300");
  const [overrideReason, setOverrideReason] = useState("");
  const [simulateAmount, setSimulateAmount] = useState("");
  const [simulateDirection, setSimulateDirection] = useState("USD_TO_CDF");
  const [thresholdMin, setThresholdMin] = useState("2500");
  const [thresholdMax, setThresholdMax] = useState("2800");
  const [alertEnabled, setAlertEnabled] = useState(true);
  
  const { toast } = useToast();

  // Mock data
  const fxHistory: FXRate[] = [
    { id: "1", buyRate: 2650, sellRate: 2680, timestamp: "2024-01-15 10:30:00", userId: "admin1" },
    { id: "2", buyRate: 2640, sellRate: 2670, timestamp: "2024-01-15 08:15:00", userId: "admin2", isOverride: true, reason: "Market volatility" },
    { id: "3", buyRate: 2655, sellRate: 2685, timestamp: "2024-01-14 16:45:00", userId: "admin1" },
  ];

  const fxActivity: FXActivity[] = [
    { id: "1", userId: "user123", direction: "USD_TO_CDF", amount: 100, rate: 2650, timestamp: "2024-01-15 11:30:00", margin: 2.5 },
    { id: "2", userId: "user456", direction: "CDF_TO_USD", amount: 265000, rate: 2680, timestamp: "2024-01-15 11:25:00", margin: 3.0 },
    { id: "3", userId: "user789", direction: "USD_TO_CDF", amount: 50, rate: 2650, timestamp: "2024-01-15 11:20:00", margin: 2.5 },
  ];

  const countryConfigs: CountryConfig[] = [
    { country: "Rwanda", currency: "RWF", deliveryMethods: ["Mobile Money", "Bank Transfer"], fxRate: 1285, margin: 2.0, enabled: true },
    { country: "Uganda", currency: "UGX", deliveryMethods: ["Mobile Money"], fxRate: 3750, margin: 2.5, enabled: true },
    { country: "Kenya", currency: "KES", deliveryMethods: ["Mobile Money", "Bank Transfer"], fxRate: 150, margin: 1.8, enabled: false },
  ];

  const handleSaveRates = () => {
    toast({
      title: "FX Rates Updated",
      description: "Buy and sell rates have been saved successfully.",
    });
  };

  const handleOverride = () => {
    if (!overrideReason.trim()) {
      toast({
        title: "Override Reason Required",
        description: "Please provide a reason for the rate override.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "FX Rates Overridden",
      description: "Emergency override has been applied successfully.",
    });
    setOverrideReason("");
  };

  const calculateSimulation = () => {
    const amount = parseFloat(simulateAmount);
    if (isNaN(amount)) return { effectiveRate: 0, marginApplied: 0, amountReceived: 0 };

    const rate = simulateDirection === "USD_TO_CDF" ? parseFloat(buyRate) : parseFloat(sellRate);
    const margin = simulateDirection === "USD_TO_CDF" ? parseFloat(marginBuy) : parseFloat(marginSell);
    const effectiveRate = rate * (1 + margin / 100);
    const amountReceived = simulateDirection === "USD_TO_CDF" ? amount * effectiveRate : amount / effectiveRate;

    return { effectiveRate, marginApplied: margin, amountReceived };
  };

  const simulation = calculateSimulation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">FX Configuration</h2>
          <p className="text-muted-foreground">Manage foreign exchange rates and settings</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Live Rates Active
        </Badge>
      </div>

      <Tabs defaultValue="rates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="rates">FX Rates</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Manual FX Rates
                </CardTitle>
                <CardDescription>
                  Set USD to CDF exchange rates manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyRate">Buy Rate (USD → CDF)</Label>
                    <Input
                      id="buyRate"
                      type="number"
                      value={buyRate}
                      onChange={(e) => setBuyRate(e.target.value)}
                      placeholder="2650"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellRate">Sell Rate (CDF → USD)</Label>
                    <Input
                      id="sellRate"
                      type="number"
                      value={sellRate}
                      onChange={(e) => setSellRate(e.target.value)}
                      placeholder="2680"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marginBuy">Buy Margin (%)</Label>
                    <Input
                      id="marginBuy"
                      type="number"
                      step="0.1"
                      value={marginBuy}
                      onChange={(e) => setMarginBuy(e.target.value)}
                      placeholder="2.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginSell">Sell Margin (%)</Label>
                    <Input
                      id="marginSell"
                      type="number"
                      step="0.1"
                      value={marginSell}
                      onChange={(e) => setMarginSell(e.target.value)}
                      placeholder="3.0"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Effective Rates Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">USD → CDF:</span>
                      <span className="ml-2 font-medium">
                        {(parseFloat(buyRate) * (1 + parseFloat(marginBuy) / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CDF → USD:</span>
                      <span className="ml-2 font-medium">
                        {(parseFloat(sellRate) * (1 + parseFloat(marginSell) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveRates} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Rates
                </Button>
              </CardContent>
            </Card>

            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Sync Configuration
                </CardTitle>
                <CardDescription>
                  Configure automatic rate updates from external API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="apiSync">Enable API Sync</Label>
                  <Switch
                    id="apiSync"
                    checked={apiSyncEnabled}
                    onCheckedChange={setApiSyncEnabled}
                  />
                </div>

                {apiSyncEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiEndpoint">API Endpoint</Label>
                      <Input
                        id="apiEndpoint"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        placeholder="API endpoint URL"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refreshRate">Refresh Rate (seconds)</Label>
                      <Select value={refreshRate} onValueChange={setRefreshRate}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                          <SelectItem value="900">15 minutes</SelectItem>
                          <SelectItem value="3600">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Emergency Override */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Emergency Rate Override
                </CardTitle>
                <CardDescription>
                  Override current rates for emergency situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Emergency overrides will apply instantly and affect all user transactions.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="overrideReason">Override Reason</Label>
                  <Textarea
                    id="overrideReason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Explain why this override is necessary..."
                    rows={3}
                  />
                </div>

                <Button variant="destructive" onClick={handleOverride}>
                  Apply Emergency Override
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Real-Time FX Activity</CardTitle>
                <CardDescription>Monitor live currency conversions</CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fxActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.userId}</TableCell>
                      <TableCell>
                        <Badge variant={activity.direction === "USD_TO_CDF" ? "default" : "secondary"}>
                          {activity.direction === "USD_TO_CDF" ? "USD → CDF" : "CDF → USD"}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.amount.toLocaleString()}</TableCell>
                      <TableCell>{activity.rate.toFixed(2)}</TableCell>
                      <TableCell>{activity.margin}%</TableCell>
                      <TableCell>{activity.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FX Rate History</CardTitle>
              <CardDescription>Track historical rate changes and modifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Buy Rate</TableHead>
                    <TableHead>Sell Rate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fxHistory.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.timestamp}</TableCell>
                      <TableCell>{rate.buyRate.toFixed(2)}</TableCell>
                      <TableCell>{rate.sellRate.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={rate.isOverride ? "destructive" : "default"}>
                          {rate.isOverride ? "Override" : "Regular"}
                        </Badge>
                      </TableCell>
                      <TableCell>{rate.userId}</TableCell>
                      <TableCell>{rate.reason || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Transfer FX Rules</CardTitle>
              <CardDescription>Configure FX behavior per destination country</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Delivery Methods</TableHead>
                    <TableHead>FX Rate</TableHead>
                    <TableHead>Margin %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryConfigs.map((config, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{config.country}</TableCell>
                      <TableCell>{config.currency}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {config.deliveryMethods.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{config.fxRate.toFixed(2)}</TableCell>
                      <TableCell>{config.margin}%</TableCell>
                      <TableCell>
                        <Badge variant={config.enabled ? "default" : "secondary"}>
                          {config.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>FX Conversion Simulator</CardTitle>
              <CardDescription>Test FX conversion calculations before applying rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="simulateAmount">Amount</Label>
                  <Input
                    id="simulateAmount"
                    type="number"
                    value={simulateAmount}
                    onChange={(e) => setSimulateAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simulateDirection">Direction</Label>
                  <Select value={simulateDirection} onValueChange={setSimulateDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD_TO_CDF">USD → CDF</SelectItem>
                      <SelectItem value="CDF_TO_USD">CDF → USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {simulateAmount && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Simulation Results</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Effective Rate:</span>
                      <div className="font-medium text-lg">{simulation.effectiveRate.toFixed(4)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Margin Applied:</span>
                      <div className="font-medium text-lg">{simulation.marginApplied}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount Received:</span>
                      <div className="font-medium text-lg">
                        {simulation.amountReceived.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Threshold Alerts</CardTitle>
              <CardDescription>Configure alerts for when FX rates exceed safe limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Threshold Alerts</Label>
                <Switch
                  checked={alertEnabled}
                  onCheckedChange={setAlertEnabled}
                />
              </div>

              {alertEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="thresholdMin">Minimum Rate Threshold</Label>
                    <Input
                      id="thresholdMin"
                      type="number"
                      value={thresholdMin}
                      onChange={(e) => setThresholdMin(e.target.value)}
                      placeholder="2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thresholdMax">Maximum Rate Threshold</Label>
                    <Input
                      id="thresholdMax"
                      type="number"
                      value={thresholdMax}
                      onChange={(e) => setThresholdMax(e.target.value)}
                      placeholder="2800"
                    />
                  </div>
                </div>
              )}

              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Alerts will be sent via dashboard notifications and email when rates go outside the configured range.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}