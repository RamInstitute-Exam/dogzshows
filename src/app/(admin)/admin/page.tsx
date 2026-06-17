'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Dog, Calendar, IndianRupee, Activity, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await api.get('/dashboard/admin/stats');
      if (result && result.success) {
        setStats(result.data || null);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards: {
    title: string;
    value: string | number;
    icon: any;
    bg: string;
    color: string;
    trend?: string;
    trendUp?: boolean;
  }[] = [
    { title: 'Total Revenue', value: stats ? `₹${(stats.revenue || 0).toLocaleString()}` : '...', icon: IndianRupee, bg: 'bg-brand-orange/10', color: 'text-brand-orange' },
    { title: 'Total Events', value: stats?.totalEvents || '...', icon: Calendar, bg: 'bg-blue-500/10', color: 'text-blue-500' },
    { title: 'Registered Dogs', value: stats?.totalDogs || '...', icon: Dog, bg: 'bg-green-500/10', color: 'text-green-500' },
    { title: 'Total Users', value: stats?.totalUsers || '...', icon: Users, bg: 'bg-purple-500/10', color: 'text-purple-500' },
  ];

  const chartOptions: any = {
    chart: { 
      type: 'area', 
      fontFamily: 'inherit', 
      toolbar: { show: false }, 
      zoom: { enabled: false },
      animations: { enabled: false } 
    },
    colors: ['#F97316'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (value: number) => `₹${value / 1000}k` } },
    grid: { strokeDashArray: 4, borderColor: '#1E293B' },
  };

  const chartSeries = [{ name: 'Revenue', data: stats?.chartData || [0,0,0,0,0,0,0] }];

  return (
    <div className="w-full">
      <div className="w-full">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Overview</h1>
              <p className="text-muted-foreground font-medium mt-1">Live platform metrics and activity logs.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-sm font-semibold shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Healthy
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {statCards.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Card className="border border-border shadow-xl bg-card overflow-hidden relative transition-all hover:border-[rgba(255,255,255,0.15)]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      {stat.trend && (
                        <div className={`flex items-center gap-1 text-sm font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.trend} <ArrowUpRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      {loading ? (
                        <div className="h-8 bg-accent animate-pulse rounded w-1/2 mb-1"></div>
                      ) : (
                        <h3 className="text-3xl font-extrabold text-foreground mb-1">{stat.value}</h3>
                      )}
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 ga">
            {/* Revenue Chart */}
            <Card className="border border-border shadow-xl bg-card lg:col-span-2">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Revenue Growth</h3>
                    <p className="text-sm text-muted-foreground">Monthly breakdown across all events</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  {!loading && isClient && <Chart options={chartOptions} series={chartSeries} type="area" height="100%" />}
                  {loading && <div className="w-full h-full bg-accent animate-pulse rounded-xl"></div>}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-border shadow-xl bg-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-orange" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 mt-2 rounded-full bg-accent animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-accent animate-pulse rounded w-3/4"></div>
                          <div className="h-3 bg-accent animate-pulse rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    stats?.recentRegistrations?.map((activity: any, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-[#0F172A]" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{activity.user?.firstName || 'A user'} registered {activity.dog?.dogName || 'a dog'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
    </div>
  );
}
