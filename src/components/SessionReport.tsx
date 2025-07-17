import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Filter, Users, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";

// Mock data for charts
const sessionsByMNO = [
  { name: "Airtel", sessions: 8500 },
  { name: "MTN", sessions: 7200 },
  { name: "9Mobile", sessions: 4800 },
  { name: "Glo", sessions: 4067 },
];

const serviceDistribution = [
  { name: "Airtime", value: 35, color: "#8884d8" },
  { name: "Data", value: 25, color: "#82ca9d" },
  { name: "Bill Payment", value: 20, color: "#ffc658" },
  { name: "Transfer", value: 15, color: "#ff7c7c" },
  { name: "Other", value: 5, color: "#8dd1e1" },
];

const sessionTrends = [
  { time: "00:00", sessions: 1200 },
  { time: "06:00", sessions: 2100 },
  { time: "12:00", sessions: 4500 },
  { time: "18:00", sessions: 3800 },
  { time: "24:00", sessions: 1900 },
];

const completionRate = [
  { time: "Mon", completed: 78, dropped: 22 },
  { time: "Tue", completed: 82, dropped: 18 },
  { time: "Wed", completed: 75, dropped: 25 },
  { time: "Thu", completed: 88, dropped: 12 },
  { time: "Fri", completed: 79, dropped: 21 },
  { time: "Sat", completed: 85, dropped: 15 },
  { time: "Sun", completed: 80, dropped: 20 },
];

export function SessionReport() {
  const { t } = useTranslation('reports');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6" />
          <h2 className="text-2xl font-bold">{t('sessionReport.title')}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('sessionReport.export')}
          </Button>
          <Button variant="default" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {t('sessionReport.filters')}
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title', { ns: 'dashboard' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('filters.mno', { ns: 'dashboard' })}</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allMnos', { ns: 'dashboard' })}</SelectItem>
                  <SelectItem value="airtel">{t('mnos.airtel')}</SelectItem>
                  <SelectItem value="mtn">{t('mnos.mtn')}</SelectItem>
                  <SelectItem value="9mobile">{t('mnos.9mobile')}</SelectItem>
                  <SelectItem value="glo">{t('mnos.glo')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">{t('filters.serviceType', { ns: 'dashboard' })}</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allServices', { ns: 'dashboard' })}</SelectItem>
                  <SelectItem value="airtime">{t('services.airtime')}</SelectItem>
                  <SelectItem value="data">{t('services.data')}</SelectItem>
                  <SelectItem value="bill">{t('services.billPayment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="north">North</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Volume</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  <SelectItem value="high">High Volume</SelectItem>
                  <SelectItem value="medium">Medium Volume</SelectItem>
                  <SelectItem value="low">Low Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('metrics.totalSessions')}</p>
                <p className="text-3xl font-bold">24,567</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('metrics.conversionRate')}</p>
                <p className="text-3xl font-bold">78.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-status-active" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('metrics.dropRate')}</p>
                <p className="text-3xl font-bold">12.3%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-status-failed" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('metrics.avgSessionCost')}</p>
                <p className="text-3xl font-bold">$0.23</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions by MNO */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions by MNO</CardTitle>
            <CardDescription>Bar Chart: Sessions per MNO</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionsByMNO}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>Pie Chart: Distribution by Service</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Session Trends</CardTitle>
            <CardDescription>Hourly session volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
            <CardDescription>Daily completion vs drop rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionRate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(var(--status-active))" />
                <Bar dataKey="dropped" fill="hsl(var(--status-failed))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Services by Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Top Services by Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground">SERVICE</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">TOTAL SESSIONS</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">COMPLETED</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">COMPLETION RATE</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">REVENUE</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Electricity Purchase</td>
                  <td className="p-2">8,450</td>
                  <td className="p-2">7,892</td>
                  <td className="p-2">93.4%</td>
                  <td className="p-2">$1,945.60</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Bill Payment</td>
                  <td className="p-2">6,230</td>
                  <td className="p-2">5,567</td>
                  <td className="p-2">89.4%</td>
                  <td className="p-2">$1,432.90</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Mobile Money Transfer</td>
                  <td className="p-2">4,890</td>
                  <td className="p-2">4,123</td>
                  <td className="p-2">84.3%</td>
                  <td className="p-2">$1,124.70</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Balance Check</td>
                  <td className="p-2">3,456</td>
                  <td className="p-2">2,789</td>
                  <td className="p-2">80.7%</td>
                  <td className="p-2">$794.88</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Merchant Registration</td>
                  <td className="p-2">1,541</td>
                  <td className="p-2">1,156</td>
                  <td className="p-2">75.0%</td>
                  <td className="p-2">$354.43</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regional Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Kinshasa</h4>
              <p className="text-2xl font-bold">9,234</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-sm text-muted-foreground">Success Rate: 82.1%</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">North Kivu</h4>
              <p className="text-2xl font-bold">7,891</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-sm text-muted-foreground">Success Rate: 79.4%</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Katanga</h4>
              <p className="text-2xl font-bold">5,442</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-sm text-muted-foreground">Success Rate: 76.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Email Summary
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Dashboard Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}