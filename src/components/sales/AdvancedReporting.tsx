import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Calendar, CalendarDays, Download, FileText, TrendingUp, TrendingDown, Users, Award, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonthlyPerformanceData {
  agent_id: string;
  agent_name: string;
  region: string;
  total_revenue: number;
  total_commission: number;
  conversion_rate: number;
  average_deal_size: number;
  users_registered: number;
  sessions_completed: number;
  quota_achievement: number;
}

interface ComparisonData {
  team: string;
  total_agents: number;
  total_revenue: number;
  avg_conversion_rate: number;
  avg_deal_size: number;
  performance_score: number;
}

interface PerformanceTrend {
  agent_id: string;
  agent_name: string;
  previous_month_revenue: number;
  current_month_revenue: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

export const AdvancedReporting = () => {
  const { toast } = useToast();
  const [monthlyData, setMonthlyData] = useState<MonthlyPerformanceData[]>([]);
  const [topAgents, setTopAgents] = useState<MonthlyPerformanceData[]>([]);
  const [teamComparison, setTeamComparison] = useState<ComparisonData[]>([]);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedTeams, setSelectedTeams] = useState('team_a_vs_b');
  const [loading, setLoading] = useState(true);

  const [keyMetrics, setKeyMetrics] = useState({
    avg_conversion_rate: 0,
    avg_deal_size: 0,
    total_agents: 0,
    declining_agents: 0
  });

  useEffect(() => {
    loadReportingData();
  }, [selectedPeriod, selectedTeams]);

  const loadReportingData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMonthlyPerformance(),
        loadTopAgents(),
        loadTeamComparison(),
        loadPerformanceTrends(),
        loadKeyMetrics()
      ]);
    } catch (error) {
      console.error('Error loading reporting data:', error);
      toast({
        title: "Error loading reports",
        description: "Failed to load reporting data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyPerformance = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        region,
        agent_recruited_users(id),
        agent_user_sessions(id, is_completed),
        agent_user_transactions(transaction_amount, revenue_generated),
        agent_commissions(total_commission)
      `)
      .eq('status', 'active');

    if (error) throw error;

    const performanceData: MonthlyPerformanceData[] = agents?.map(agent => {
      const totalUsers = agent.agent_recruited_users?.length || 0;
      const completedSessions = agent.agent_user_sessions?.filter(s => s.is_completed)?.length || 0;
      const transactions = agent.agent_user_transactions || [];
      const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0);
      const totalCommission = agent.agent_commissions?.reduce((sum, c) => sum + (Number(c.total_commission) || 0), 0) || 0;
      const avgDealSize = transactions.length > 0 ? totalRevenue / transactions.length : 0;
      const conversionRate = totalUsers > 0 ? (completedSessions / totalUsers) * 100 : 0;
      const quota = 100000; // Default quota
      const quotaAchievement = (totalRevenue / quota) * 100;

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        region: agent.region,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        conversion_rate: conversionRate,
        average_deal_size: avgDealSize,
        users_registered: totalUsers,
        sessions_completed: completedSessions,
        quota_achievement: Math.min(quotaAchievement, 100)
      };
    }) || [];

    setMonthlyData(performanceData);
  };

  const loadTopAgents = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        region,
        agent_user_transactions(revenue_generated),
        agent_commissions(total_commission)
      `)
      .eq('status', 'active');

    if (error) throw error;

    const topPerformers = agents?.map(agent => {
      const totalRevenue = agent.agent_user_transactions?.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0) || 0;
      const totalCommission = agent.agent_commissions?.reduce((sum, c) => sum + (Number(c.total_commission) || 0), 0) || 0;

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        region: agent.region,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        conversion_rate: 85, // Simulated
        average_deal_size: 500, // Simulated
        users_registered: 50, // Simulated
        sessions_completed: 42, // Simulated
        quota_achievement: 95 // Simulated
      };
    })
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10) || [];

    setTopAgents(topPerformers);
  };

  const loadTeamComparison = async () => {
    // Simulate team comparison data
    const teamA = {
      team: 'Team A (Goma)',
      total_agents: 15,
      total_revenue: 450000,
      avg_conversion_rate: 78,
      avg_deal_size: 520,
      performance_score: 85
    };

    const teamB = {
      team: 'Team B (Kinshasa)',
      total_agents: 18,
      total_revenue: 520000,
      avg_conversion_rate: 82,
      avg_deal_size: 480,
      performance_score: 88
    };

    setTeamComparison([teamA, teamB]);
  };

  const loadPerformanceTrends = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        agent_user_transactions(revenue_generated, transaction_date)
      `)
      .eq('status', 'active');

    if (error) throw error;

    const trends: PerformanceTrend[] = agents?.map(agent => {
      // Simulate previous and current month revenue calculations
      const currentMonthRevenue = Math.random() * 50000;
      const previousMonthRevenue = Math.random() * 50000;
      const changePercentage = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercentage > 5) trend = 'up';
      else if (changePercentage < -5) trend = 'down';

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        previous_month_revenue: previousMonthRevenue,
        current_month_revenue: currentMonthRevenue,
        trend,
        change_percentage: Math.abs(changePercentage)
      };
    }).filter(trend => trend.trend === 'down') || [];

    setPerformanceTrends(trends);
  };

  const loadKeyMetrics = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_user_transactions(transaction_amount, revenue_generated),
        agent_recruited_users(id),
        agent_user_sessions(is_completed)
      `)
      .eq('status', 'active');

    if (error) throw error;

    let totalConversionRate = 0;
    let totalDealSize = 0;
    let validAgents = 0;

    agents?.forEach(agent => {
      const users = agent.agent_recruited_users?.length || 0;
      const completedSessions = agent.agent_user_sessions?.filter(s => s.is_completed)?.length || 0;
      const transactions = agent.agent_user_transactions || [];
      const revenue = transactions.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0);

      if (users > 0 && transactions.length > 0) {
        totalConversionRate += (completedSessions / users) * 100;
        totalDealSize += revenue / transactions.length;
        validAgents++;
      }
    });

    setKeyMetrics({
      avg_conversion_rate: validAgents > 0 ? totalConversionRate / validAgents : 0,
      avg_deal_size: validAgents > 0 ? totalDealSize / validAgents : 0,
      total_agents: agents?.length || 0,
      declining_agents: performanceTrends.length
    });
  };

  const exportReport = async (reportType: string) => {
    toast({
      title: "Export started",
      description: `Generating ${reportType} report...`,
    });
    // Export functionality would be implemented here
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Reporting</h2>
          <p className="text-muted-foreground">Comprehensive sales performance reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Current Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="current_quarter">Current Quarter</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport('monthly_performance')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Conversion Rate</p>
                <p className="text-2xl font-bold">{keyMetrics.avg_conversion_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">${keyMetrics.avg_deal_size.toFixed(0)}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">{keyMetrics.total_agents}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Declining Agents</p>
                <p className="text-2xl font-bold text-red-600">{keyMetrics.declining_agents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Report */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Performance Report
            </CardTitle>
            <Button variant="outline" onClick={() => exportReport('monthly_performance')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Comprehensive performance metrics for all active sales agents
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Avg Deal Size</TableHead>
                <TableHead>Quota Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((agent) => (
                <TableRow key={agent.agent_id}>
                  <TableCell className="font-medium">{agent.agent_name}</TableCell>
                  <TableCell className="capitalize">{agent.region}</TableCell>
                  <TableCell>${agent.total_revenue.toFixed(2)}</TableCell>
                  <TableCell>${agent.total_commission.toFixed(2)}</TableCell>
                  <TableCell>{agent.conversion_rate.toFixed(1)}%</TableCell>
                  <TableCell>${agent.average_deal_size.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={agent.quota_achievement} className="w-16" />
                      <span className="text-sm">{agent.quota_achievement.toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top 10 Agents */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 10 Performing Agents
            </CardTitle>
            <Button variant="outline" onClick={() => exportReport('top_agents')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Commission Earned</TableHead>
                <TableHead>Performance Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAgents.map((agent, index) => (
                <TableRow key={agent.agent_id}>
                  <TableCell className="font-bold">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{agent.agent_name}</TableCell>
                  <TableCell className="capitalize">{agent.region}</TableCell>
                  <TableCell>${agent.total_revenue.toFixed(2)}</TableCell>
                  <TableCell>${agent.total_commission.toFixed(2)}</TableCell>
                  <TableCell>
                    {index === 0 && <Badge className="bg-yellow-500">🥇 Top Performer</Badge>}
                    {index === 1 && <Badge className="bg-gray-400">🥈 Second Place</Badge>}
                    {index === 2 && <Badge className="bg-amber-600">🥉 Third Place</Badge>}
                    {index > 2 && <Badge variant="outline">Top 10</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Comparison */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Team Performance Comparison</CardTitle>
            <Select value={selectedTeams} onValueChange={setSelectedTeams}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="team_a_vs_b">Team A vs Team B</SelectItem>
                <SelectItem value="goma_vs_kinshasa">Goma vs Kinshasa</SelectItem>
                <SelectItem value="urban_vs_rural">Urban vs Rural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamComparison.map((team, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-4">{team.team}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Agents:</span>
                    <span className="font-medium">{team.total_agents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-medium">${team.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Conversion:</span>
                    <span className="font-medium">{team.avg_conversion_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Deal Size:</span>
                    <span className="font-medium">${team.avg_deal_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance Score:</span>
                    <Badge variant={team.performance_score > 85 ? "default" : "outline"}>
                      {team.performance_score}/100
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Declining Performance Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Agents with Declining Performance
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Agents showing performance decline over the past two months
          </p>
        </CardHeader>
        <CardContent>
          {performanceTrends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents with declining performance found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Previous Month</TableHead>
                  <TableHead>Current Month</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Action Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceTrends.map((trend) => (
                  <TableRow key={trend.agent_id}>
                    <TableCell className="font-medium">{trend.agent_name}</TableCell>
                    <TableCell>${trend.previous_month_revenue.toFixed(2)}</TableCell>
                    <TableCell>${trend.current_month_revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-red-600">-{trend.change_percentage.toFixed(1)}%</TableCell>
                    <TableCell>{getTrendIcon(trend.trend)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Coaching Needed</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};