import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FilterState {
  timePeriod: string;
  region: string;
  agentStatus: string;
  userType: string;
}

interface PerformanceChartsProps {
  filters: FilterState;
}

interface ChartData {
  revenuePerAgent: Array<{ name: string; revenue: number; commission: number }>;
  userTypeDistribution: Array<{ name: string; value: number; color: string }>;
  sessionsOverTime: Array<{ date: string; [key: string]: any }>;
  regionActivity: Array<{ region: string; agents: number; revenue: number }>;
  sessionVsCommission: Array<{ sessions: number; commission: number; agent: string }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ filters }) => {
  const { toast } = useToast();
  const [chartData, setChartData] = useState<ChartData>({
    revenuePerAgent: [],
    userTypeDistribution: [],
    sessionsOverTime: [],
    regionActivity: [],
    sessionVsCommission: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [filters]);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Load agents with their performance data
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          agent_user_transactions(revenue_generated),
          agent_commissions(total_commission),
          agent_user_sessions(session_date),
          agent_recruited_users(user_type)
        `);

      if (agentsError) throw agentsError;

      // Process revenue per agent
      const revenuePerAgent = agents?.map(agent => {
        const revenue = agent.agent_user_transactions?.reduce((sum: number, t: any) => 
          sum + (Number(t.revenue_generated) || 0), 0) || 0;
        const commission = agent.agent_commissions?.reduce((sum: number, c: any) => 
          sum + (Number(c.total_commission) || 0), 0) || 0;
        
        return {
          name: agent.agent_name,
          revenue: Number(revenue.toFixed(2)),
          commission: Number(commission.toFixed(2))
        };
      }).slice(0, 10) || []; // Top 10 agents

      // Process user type distribution
      const userTypeCounts = { citizen: 0, merchant: 0, agent: 0 };
      agents?.forEach(agent => {
        agent.agent_recruited_users?.forEach((user: any) => {
          if (user.user_type in userTypeCounts) {
            userTypeCounts[user.user_type as keyof typeof userTypeCounts]++;
          }
        });
      });

      const userTypeDistribution = [
        { name: 'Citizens', value: userTypeCounts.citizen, color: COLORS[0] },
        { name: 'Merchants', value: userTypeCounts.merchant, color: COLORS[1] },
        { name: 'Agents', value: userTypeCounts.agent, color: COLORS[2] }
      ];

      // Process sessions over time (last 30 days)
      const sessionsOverTime: Array<{ date: string; [key: string]: any }> = [];
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      last30Days.forEach(date => {
        const dayData: any = { date: date.split('-').slice(1).join('/') };
        
        agents?.slice(0, 5).forEach(agent => { // Top 5 agents for readability
          const sessionsOnDate = agent.agent_user_sessions?.filter((session: any) => 
            session.session_date?.startsWith(date)
          ).length || 0;
          dayData[agent.agent_name] = sessionsOnDate;
        });
        
        sessionsOverTime.push(dayData);
      });

      // Process region activity
      const regionMap = new Map();
      agents?.forEach(agent => {
        const region = agent.region;
        if (!regionMap.has(region)) {
          regionMap.set(region, { agents: 0, revenue: 0 });
        }
        const regionData = regionMap.get(region);
        regionData.agents += 1;
        regionData.revenue += agent.agent_user_transactions?.reduce((sum: number, t: any) => 
          sum + (Number(t.revenue_generated) || 0), 0) || 0;
      });

      const regionActivity = Array.from(regionMap.entries()).map(([region, data]) => ({
        region: region.charAt(0).toUpperCase() + region.slice(1),
        agents: data.agents,
        revenue: Number(data.revenue.toFixed(2))
      }));

      // Process sessions vs commission scatter plot
      const sessionVsCommission = agents?.map(agent => {
        const sessions = agent.agent_user_sessions?.length || 0;
        const commission = agent.agent_commissions?.reduce((sum: number, c: any) => 
          sum + (Number(c.total_commission) || 0), 0) || 0;
        
        return {
          sessions,
          commission: Number(commission.toFixed(2)),
          agent: agent.agent_name
        };
      }).filter(data => data.sessions > 0 || data.commission > 0) || [];

      setChartData({
        revenuePerAgent,
        userTypeDistribution,
        sessionsOverTime,
        regionActivity,
        sessionVsCommission
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
      toast({
        title: "Error loading charts",
        description: "Failed to load performance chart data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Revenue per Agent Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue per Agent</CardTitle>
          <p className="text-sm text-muted-foreground">Top performing agents by revenue and commission</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.revenuePerAgent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              <Bar dataKey="commission" fill="#82ca9d" name="Commission" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Type Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Type Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Types of users registered by agents</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.userTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.userTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sessions Over Time Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">Daily session activity for top agents</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.sessionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartData.sessionsOverTime.length > 0 && 
                Object.keys(chartData.sessionsOverTime[0])
                  .filter(key => key !== 'date')
                  .slice(0, 5)
                  .map((agentName, index) => (
                    <Line 
                      key={agentName}
                      type="monotone" 
                      dataKey={agentName} 
                      stroke={COLORS[index]} 
                      strokeWidth={2}
                    />
                  ))
              }
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Region Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Activity by Region</CardTitle>
          <p className="text-sm text-muted-foreground">Number of agents and revenue by region</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.regionActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="agents" fill="#8884d8" name="Agent Count" />
              <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sessions vs Commission Scatter Plot */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sessions vs Commission Correlation</CardTitle>
          <p className="text-sm text-muted-foreground">Relationship between session count and commission earned</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={chartData.sessionVsCommission}>
              <CartesianGrid />
              <XAxis type="number" dataKey="sessions" name="Sessions" />
              <YAxis type="number" dataKey="commission" name="Commission ($)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} 
                formatter={(value, name) => [`${name === 'commission' ? '$' : ''}${value}`, name]}
                labelFormatter={(label) => `Agent: ${chartData.sessionVsCommission.find(d => d.sessions === label)?.agent || 'Unknown'}`}
              />
              <Scatter dataKey="commission" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};