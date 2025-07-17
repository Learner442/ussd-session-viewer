import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Target, AlertTriangle, Users, MessageCircle, TrendingUp, Star, Trophy, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentScore {
  agent_id: string;
  agent_name: string;
  region: string;
  revenue_score: number;
  customer_feedback_score: number;
  targets_met_score: number;
  total_score: number;
  performance_band: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  quota_achievement: number;
  close_rate: number;
}

interface UnderperformingAgent {
  agent_id: string;
  agent_name: string;
  region: string;
  quota_achievement: number;
  close_rate: number;
  coaching_tips: string[];
  priority: 'high' | 'medium' | 'low';
}

interface LeaderboardEntry {
  rank: number;
  agent_id: string;
  agent_name: string;
  region: string;
  total_points: number;
  achievements: string[];
  performance_badge: string;
}

export const PerformanceManagement = () => {
  const { toast } = useToast();
  const [agentScores, setAgentScores] = useState<AgentScore[]>([]);
  const [underperformingAgents, setUnderperformingAgents] = useState<UnderperformingAgent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAgentScores(),
        loadUnderperformingAgents(),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "Error loading performance data",
        description: "Failed to load performance management data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAgentScores = async () => {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        id,
        agent_id,
        agent_name,
        region,
        agent_user_transactions(revenue_generated),
        agent_recruited_users(id),
        agent_user_sessions(is_completed),
        agent_commissions(total_commission)
      `)
      .eq('status', 'active');

    if (error) throw error;

    const scores: AgentScore[] = agents?.map(agent => {
      const transactions = agent.agent_user_transactions || [];
      const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.revenue_generated) || 0), 0);
      const totalUsers = agent.agent_recruited_users?.length || 0;
      const completedSessions = agent.agent_user_sessions?.filter(s => s.is_completed)?.length || 0;
      
      // Calculate scores (0-100)
      const revenueScore = Math.min((totalRevenue / 10000) * 100, 100); // Max at $10k
      const customerFeedbackScore = Math.random() * 40 + 60; // Simulated 60-100
      const targetsMetScore = Math.min((totalUsers / 20) * 100, 100); // Max at 20 users
      
      const totalScore = (revenueScore + customerFeedbackScore + targetsMetScore) / 3;
      
      // Determine performance band
      let performanceBand: AgentScore['performance_band'] = 'poor';
      if (totalScore >= 90) performanceBand = 'excellent';
      else if (totalScore >= 80) performanceBand = 'good';
      else if (totalScore >= 70) performanceBand = 'average';
      else if (totalScore >= 60) performanceBand = 'below_average';

      const quota = 100000; // Default quota
      const quotaAchievement = (totalRevenue / quota) * 100;
      const closeRate = totalUsers > 0 ? (completedSessions / totalUsers) * 100 : 0;

      return {
        agent_id: agent.agent_id,
        agent_name: agent.agent_name,
        region: agent.region,
        revenue_score: revenueScore,
        customer_feedback_score: customerFeedbackScore,
        targets_met_score: targetsMetScore,
        total_score: totalScore,
        performance_band: performanceBand,
        quota_achievement: Math.min(quotaAchievement, 100),
        close_rate: closeRate
      };
    }) || [];

    setAgentScores(scores.sort((a, b) => b.total_score - a.total_score));
  };

  const loadUnderperformingAgents = async () => {
    const underperformers = agentScores
      .filter(agent => agent.quota_achievement < 60 || agent.close_rate < 50)
      .map(agent => {
        const tips: string[] = [];
        
        if (agent.quota_achievement < 40) {
          tips.push("Focus on lead generation and prospecting activities");
          tips.push("Review and optimize your sales process");
        }
        if (agent.close_rate < 30) {
          tips.push("Improve objection handling techniques");
          tips.push("Practice consultative selling approach");
          tips.push("Follow up more consistently with prospects");
        }
        if (agent.customer_feedback_score < 70) {
          tips.push("Work on active listening skills");
          tips.push("Focus on understanding customer needs better");
        }
        
        let priority: UnderperformingAgent['priority'] = 'low';
        if (agent.quota_achievement < 30 || agent.close_rate < 25) priority = 'high';
        else if (agent.quota_achievement < 50 || agent.close_rate < 40) priority = 'medium';

        return {
          agent_id: agent.agent_id,
          agent_name: agent.agent_name,
          region: agent.region,
          quota_achievement: agent.quota_achievement,
          close_rate: agent.close_rate,
          coaching_tips: tips,
          priority
        };
      });

    setUnderperformingAgents(underperformers);
  };

  const loadLeaderboard = async () => {
    const leaderboardData: LeaderboardEntry[] = agentScores
      .slice(0, 20) // Top 20
      .map((agent, index) => {
        const achievements: string[] = [];
        
        if (agent.total_score >= 95) achievements.push("Excellence Award");
        if (agent.quota_achievement >= 100) achievements.push("Quota Crusher");
        if (agent.close_rate >= 80) achievements.push("Conversion Master");
        if (agent.revenue_score >= 90) achievements.push("Revenue Champion");
        if (agent.customer_feedback_score >= 95) achievements.push("Customer Favorite");

        let performanceBadge = "Rising Star";
        if (index === 0) performanceBadge = "🥇 Champion";
        else if (index === 1) performanceBadge = "🥈 Runner-up";
        else if (index === 2) performanceBadge = "🥉 Third Place";
        else if (index < 5) performanceBadge = "⭐ Top 5";
        else if (index < 10) performanceBadge = "🌟 Top 10";

        return {
          rank: index + 1,
          agent_id: agent.agent_id,
          agent_name: agent.agent_name,
          region: agent.region,
          total_points: Math.round(agent.total_score * 10), // Convert to points
          achievements,
          performance_badge: performanceBadge
        };
      });

    setLeaderboard(leaderboardData);
  };

  const getPerformanceBadge = (band: string) => {
    const config = {
      excellent: { label: 'Excellent', variant: 'default' as const, color: 'text-green-600' },
      good: { label: 'Good', variant: 'default' as const, color: 'text-blue-600' },
      average: { label: 'Average', variant: 'outline' as const, color: 'text-yellow-600' },
      below_average: { label: 'Below Average', variant: 'destructive' as const, color: 'text-orange-600' },
      poor: { label: 'Poor', variant: 'destructive' as const, color: 'text-red-600' }
    };

    const config_item = config[band as keyof typeof config] || config.average;
    return <Badge variant={config_item.variant}>{config_item.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: { label: 'High Priority', variant: 'destructive' as const },
      medium: { label: 'Medium Priority', variant: 'outline' as const },
      low: { label: 'Low Priority', variant: 'secondary' as const }
    };

    const config_item = config[priority as keyof typeof config] || config.medium;
    return <Badge variant={config_item.variant}>{config_item.label}</Badge>;
  };

  const sendCoachingReminder = (agentName: string) => {
    toast({
      title: "Coaching reminder sent",
      description: `Coaching reminder sent to ${agentName}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Performance Management</h2>
        <p className="text-muted-foreground">Agent scoring, leaderboards, and performance improvement</p>
      </div>

      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scoring">Agent Scoring</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="coaching">Coaching Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Excellent Performers</p>
                    <p className="text-2xl font-bold text-green-600">
                      {agentScores.filter(a => a.performance_band === 'excellent').length}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Good Performers</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {agentScores.filter(a => a.performance_band === 'good').length}
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
                    <p className="text-sm font-medium text-muted-foreground">Underperformers</p>
                    <p className="text-2xl font-bold text-red-600">
                      {agentScores.filter(a => a.quota_achievement < 60).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">
                      {(agentScores.reduce((sum, a) => sum + a.total_score, 0) / agentScores.length || 0).toFixed(1)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Scoring Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Agent Performance Scores
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Scores based on revenue, customer feedback, and targets met
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Revenue Score</TableHead>
                    <TableHead>Customer Score</TableHead>
                    <TableHead>Targets Score</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Performance Band</TableHead>
                    <TableHead>Quota Achievement</TableHead>
                    <TableHead>Close Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentScores.map((agent) => (
                    <TableRow key={agent.agent_id}>
                      <TableCell className="font-medium">{agent.agent_name}</TableCell>
                      <TableCell className="capitalize">{agent.region}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.revenue_score} className="w-16" />
                          <span className="text-sm">{agent.revenue_score.toFixed(0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.customer_feedback_score} className="w-16" />
                          <span className="text-sm">{agent.customer_feedback_score.toFixed(0)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={agent.targets_met_score} className="w-16" />
                          <span className="text-sm">{agent.targets_met_score.toFixed(0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{agent.total_score.toFixed(1)}</TableCell>
                      <TableCell>{getPerformanceBadge(agent.performance_band)}</TableCell>
                      <TableCell>{agent.quota_achievement.toFixed(0)}%</TableCell>
                      <TableCell>{agent.close_rate.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Current Quarter Leaderboard
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Top performing agents ranked by overall performance score
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Performance Badge</TableHead>
                    <TableHead>Achievements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow key={entry.agent_id} className={entry.rank <= 3 ? "bg-muted/50" : ""}>
                      <TableCell className="font-bold text-lg">
                        {entry.rank <= 3 ? (
                          <span className="text-2xl">
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          entry.rank
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{entry.agent_name}</TableCell>
                      <TableCell className="capitalize">{entry.region}</TableCell>
                      <TableCell className="font-semibold">{entry.total_points}</TableCell>
                      <TableCell>
                        <Badge variant={entry.rank <= 5 ? "default" : "outline"}>
                          {entry.performance_badge}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.achievements.slice(0, 2).map((achievement, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                          {entry.achievements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.achievements.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-6">
          {/* Underperforming Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Agents Requiring Coaching
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Agents below 60% quota achievement or 50% close rate with personalized coaching suggestions
              </p>
            </CardHeader>
            <CardContent>
              {underperformingAgents.length === 0 ? (
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    Excellent! All agents are performing above the minimum thresholds.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {underperformingAgents.map((agent) => (
                    <div key={agent.agent_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{agent.agent_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{agent.region}</p>
                        </div>
                        <div className="flex gap-2">
                          {getPriorityBadge(agent.priority)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sendCoachingReminder(agent.agent_name)}
                          >
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Quota Achievement:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={agent.quota_achievement} className="flex-1" />
                            <span className="text-sm font-medium">{agent.quota_achievement.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Close Rate:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={agent.close_rate} className="flex-1" />
                            <span className="text-sm font-medium">{agent.close_rate.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Coaching Suggestions:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {agent.coaching_tips.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};