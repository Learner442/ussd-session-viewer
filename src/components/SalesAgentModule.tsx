import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { AgentManagement } from './sales/AgentManagement';
import { AdvancedReporting } from './sales/AdvancedReporting';
import { PerformanceManagement } from './sales/PerformanceManagement';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from './ErrorBoundary';

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
  const { t } = useTranslation('sales');
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
          <h1 className="text-3xl font-bold text-foreground">{t('module.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('module.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            {t('buttons.export', { ns: 'common' })}
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t('buttons.filter', { ns: 'common' })}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('filters.title')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('filters.timePeriod')}</label>
              <Select value={filters.timePeriod} onValueChange={(value) => updateFilter('timePeriod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('filters.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('filters.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('filters.monthly')}</SelectItem>
                  <SelectItem value="quarterly">{t('filters.quarterly')}</SelectItem>
                  <SelectItem value="yearly">{t('filters.yearly')}</SelectItem>
                  <SelectItem value="custom">{t('filters.customDateRange')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('filters.region')}</label>
              <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allRegions')}</SelectItem>
                  <SelectItem value="goma">{t('cities.goma')}</SelectItem>
                  <SelectItem value="kinshasa">{t('cities.kinshasa')}</SelectItem>
                  <SelectItem value="bukavu">{t('cities.bukavu')}</SelectItem>
                  <SelectItem value="urban">{t('cities.urbanZones')}</SelectItem>
                  <SelectItem value="rural">{t('cities.ruralZones')}</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">{t('metrics.totalAgents')}</p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('metrics.totalRevenue')}</p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('metrics.totalCommissions')}</p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('metrics.activeUsers')}</p>
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
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="management">{t('tabs.agentManagement')}</TabsTrigger>
          <TabsTrigger value="performance">{t('tabs.performanceTable')}</TabsTrigger>
          <TabsTrigger value="reporting">{t('tabs.advancedReports')}</TabsTrigger>
          <TabsTrigger value="commissions">{t('tabs.commissions')}</TabsTrigger>
          <TabsTrigger value="charts">{t('tabs.charts')}</TabsTrigger>
          <TabsTrigger value="performance-mgmt">{t('tabs.performanceMgmt')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <ErrorBoundary>
            <AgentManagement />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="performance">
          <ErrorBoundary>
            <AgentPerformanceTable filters={filters} />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="reporting">
          <ErrorBoundary>
            <AdvancedReporting />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="commissions">
          <ErrorBoundary>
            <CommissionCalculator />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="charts">
          <ErrorBoundary>
            <PerformanceCharts filters={filters} />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="performance-mgmt">
          <ErrorBoundary>
            <PerformanceManagement />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="analytics">
          <ErrorBoundary>
            <AgentAnalytics filters={filters} />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};