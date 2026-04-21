import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Calendar, Award } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const { data: societies, isLoading: societiesLoading } = useQuery({
    queryKey: ['societies'],
    queryFn: async () => {
      const res = await apiClient.get('/societies');
      return res.data;
    }
  });

  const kpis = [
    { title: 'Available Balance', value: profile?.society?.balance || '₹0.00', icon: TrendingUp, color: 'text-accent' },
    { title: 'Total Members', value: '1,240', icon: Users, color: 'text-blue-400' },
    { title: 'Upcoming Events', value: '12', icon: Calendar, color: 'text-orange-400' },
    { title: 'Active Projects', value: '8', icon: Award, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Terminal_Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm">System Status: <span className="text-accent">ONLINE</span> // Welcome, {profile?.name}</p>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          {new Date().toISOString()}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 backdrop-blur-md rounded-none border-l-2 border-l-primary group hover:border-l-accent transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display text-white">{kpi.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-black/40 border-white/10 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase text-accent">Financial_Flow_Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-white/5">
             <span className="text-muted-foreground font-mono text-xs italic">Loading Chart Data...</span>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/10 rounded-none">
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase text-accent">AI_Financial_Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-white/5 bg-white/5 font-mono text-[10px] leading-relaxed">
              <p className="text-muted-foreground mb-2">&gt; EXECUTING GEMINI_1.5_FLASH ANALYSIS...</p>
              <p className="text-white">Current budget utilization is at 64%. Recommend reallocating 5% to technical projects to meet IEEE global benchmarks. No anomalies detected in recent society transactions.</p>
            </div>
            <button className="w-full py-2 border border-primary text-primary font-mono text-xs uppercase hover:bg-primary hover:text-white transition-all">
              Request Full Report
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
