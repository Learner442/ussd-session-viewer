import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3, PieChart } from "lucide-react";

interface CostMetrics {
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
  avgRevenuePerSession: number;
  avgCostPerSession: number;
  smsDeliveryRate: number;
  totalSMSCost: number;
}

interface ServiceMetrics {
  service: string;
  sessions: number;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
}

// Mock analytics data
const mockMetrics: CostMetrics = {
  totalRevenue: 3.75,
  totalCosts: 0.42,
  profit: 3.33,
  profitMargin: 88.8,
  avgRevenuePerSession: 0.63,
  avgCostPerSession: 0.07,
  smsDeliveryRate: 75.0,
  totalSMSCost: 0.08
};

const mockServiceMetrics: ServiceMetrics[] = [
  {
    service: "PayBill",
    sessions: 1,
    revenue: 1.50,
    costs: 0.10,
    profit: 1.40,
    profitMargin: 93.3
  },
  {
    service: "Electricity Payment",
    sessions: 1,
    revenue: 2.25,
    costs: 0.12,
    profit: 2.13,
    profitMargin: 94.7
  },
  {
    service: "Send Money",
    sessions: 1,
    revenue: 0,
    costs: 0.05,
    profit: -0.05,
    profitMargin: -100
  },
  {
    service: "Buy Airtime",
    sessions: 1,
    revenue: 0,
    costs: 0.04,
    profit: -0.04,
    profitMargin: -100
  },
  {
    service: "Regional Transfer",
    sessions: 1,
    revenue: 0,
    costs: 0.03,
    profit: -0.03,
    profitMargin: -100
  },
  {
    service: "Forex Exchange",
    sessions: 1,
    revenue: 0,
    costs: 0.12,
    profit: -0.12,
    profitMargin: -100
  }
];

export function CostAnalytics() {
  const getProfitTrendIcon = (margin: number) => {
    return margin > 0 ? (
      <TrendingUp className="h-4 w-4 text-primary" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getProfitColor = (margin: number) => {
    return margin > 0 ? "text-primary" : "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${mockMetrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${mockMetrics.avgRevenuePerSession.toFixed(2)}/session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${mockMetrics.totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${mockMetrics.avgCostPerSession.toFixed(2)}/session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            {getProfitTrendIcon(mockMetrics.profit)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProfitColor(mockMetrics.profit)}`}>
              ${mockMetrics.profit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margin: {mockMetrics.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Delivery</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.smsDeliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Cost: ${mockMetrics.totalSMSCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Service Performance Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockServiceMetrics.map((service) => (
              <div
                key={service.service}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{service.service}</h4>
                  <p className="text-sm text-muted-foreground">
                    {service.sessions} session{service.sessions !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium text-primary">${service.revenue.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-muted-foreground">Costs</p>
                    <p className="font-medium text-destructive">${service.costs.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-muted-foreground">Profit</p>
                    <p className={`font-medium ${getProfitColor(service.profit)}`}>
                      ${service.profit.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-muted-foreground">Margin</p>
                    <Badge
                      variant={service.profitMargin > 0 ? "completed" : "failed"}
                      className="font-medium"
                    >
                      {service.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              <CardTitle>Cost Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">USSD Session Costs</span>
                <span className="font-mono text-destructive">
                  ${(mockMetrics.totalCosts - mockMetrics.totalSMSCost).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">SMS Delivery Costs</span>
                <span className="font-mono text-destructive">
                  ${mockMetrics.totalSMSCost.toFixed(2)}
                </span>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Total Operating Costs</span>
                  <span className="font-mono text-destructive">
                    ${mockMetrics.totalCosts.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue per Session</span>
                <span className="font-mono text-primary">
                  ${mockMetrics.avgRevenuePerSession.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cost per Session</span>
                <span className="font-mono text-destructive">
                  ${mockMetrics.avgCostPerSession.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Successful Sessions</span>
                <Badge variant="completed">33.3%</Badge>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Return on Investment</span>
                  <span className={`font-mono ${getProfitColor(mockMetrics.profitMargin)}`}>
                    {(mockMetrics.totalRevenue / mockMetrics.totalCosts * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}