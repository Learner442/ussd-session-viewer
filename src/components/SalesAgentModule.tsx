import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays, Download, Filter, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AgentPerformanceTable } from './sales/AgentPerformanceTable';
import { CommissionCalculator } from './sales/CommissionCalculator';
import { PerformanceCharts } from './sales/PerformanceCharts';
import { AgentAnalytics } from './sales/AgentAnalytics';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SalesMetrics {
  totalAgents: number;
  totalRevenue: number;
  totalCommissions: number;
  activeUsers: number;
}

interface FilterState {
  timePeriod: string;
  region: string;
  agentStatus: string;
  userType: string;
  dateRange?: DateRange;
}

export const SalesAgentModule = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalAgents: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    activeUsers: 0
  });
  const [filters, setFilters] = useState<FilterState>({
    timePeriod: 'monthly',
    region: 'all',
    agentStatus: 'all',
    userType: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesMetrics();
  }, [filters]);

  const loadSalesMetrics = async () => {
    try {
      setLoading(true);

      // Load agents count
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*');

      if (agentsError) throw agentsError;

      // Load total revenue from transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('agent_user_transactions')
        .select('revenue_generated');

      if (transactionsError) throw transactionsError;

      // Load total commissions
      const { data: commissions, error: commissionsError } = await supabase
        .from('agent_commissions')
        .select('total_commission');

      if (commissionsError) throw commissionsError;

      // Load active users count
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('agent_recruited_users')
        .select('*')
        .eq('is_active', true);

      if (activeUsersError) throw activeUsersError;

      const totalRevenue = transactions?.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0) || 0;
      const totalCommissions = commissions?.reduce((sum, c) => sum + (Number(c.total_commission) || 0), 0) || 0;

      setMetrics({
        totalAgents: agents?.length || 0,
        totalRevenue,
        totalCommissions,
        activeUsers: activeUsers?.length || 0
      });

    } catch (error) {
      toast({
        title: "Error loading metrics",
        description: "Failed to load sales metrics. Please try again.",
        variant: "destructive"
      });
      console.error('Error loading sales metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    toast({
      title: "Export started",
      description: "Generating sales report...",
    });
    // Export functionality would be implemented here
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Agent Module</h1>
          <p className="text-muted-foreground mt-1">
            Performance indicators and analytics for sales agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Time Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={filters.timePeriod} onValueChange={(value) => updateFilter('timePeriod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="goma">Goma</SelectItem>
                  <SelectItem value="kinshasa">Kinshasa</SelectItem>
                  <SelectItem value="bukavu">Bukavu</SelectItem>
                  <SelectItem value="urban">Urban Zones</SelectItem>
                  <SelectItem value="rural">Rural Zones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Agent Status</label>
              <Select value={filters.agentStatus} onValueChange={(value) => updateFilter('agentStatus', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">User Type</label>
              <Select value={filters.userType} onValueChange={(value) => updateFilter('userType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="citizen">Citizens</SelectItem>
                  <SelectItem value="merchant">Merchants</SelectItem>
                  <SelectItem value="agent">Other Agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : metrics.totalAgents}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : `$${metrics.totalRevenue.toFixed(2)}`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : `$${metrics.totalCommissions.toFixed(2)}`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : metrics.activeUsers}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="commissions">Commission Calculator</TabsTrigger>
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <AgentPerformanceTable filters={filters} />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionCalculator />
        </TabsContent>

        <TabsContent value="charts">
          <PerformanceCharts filters={filters} />
        </TabsContent>

        <TabsContent value="analytics">
          <AgentAnalytics filters={filters} />
        </TabsContent>
      </Tabs>
    </div>
  );
};