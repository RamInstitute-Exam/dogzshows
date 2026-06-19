'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Dog, Calendar, DollarSign, Activity, CheckCircle, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import Spinner from '@/components/common/loader/Spinner';

interface AdminStats {
  totalDogs: number;
  totalUsers: number;
  totalEvents: number;
  registrations: number;
  payments: number;
  upcomingEvents: number;
  completedEvents: number;
  pendingPayments: number;
  winners: number;
  revenue?: number;
  recentRegistrations?: any[];
}

export default function AdminDashboard() {
  const { data: statsData, isLoading: loading } = useQuery<AdminStats>({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/admin/stats');
      return response.data.data;
    }
  });

  const stats = statsData || null;

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.revenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'from-[#10B981] to-[#059669]' },
    { title: 'Total Dogs', value: stats?.totalDogs || 0, icon: Dog, color: 'from-[#FF007A] to-[#7E00FF]' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-[#8B5CF6] to-[#6D28D9]' },
    { title: 'Registrations', value: stats?.registrations || 0, icon: FileText, color: 'from-[#3B82F6] to-[#2563EB]' },
    { title: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: Calendar, color: 'from-[#38BDF8] to-[#0EA5E9]' },
    { title: 'Completed Events', value: stats?.completedEvents || 0, icon: CheckCircle, color: 'from-[#14B8A6] to-[#0D9488]' },
    { title: 'Pending Payments', value: stats?.pendingPayments || 0, icon: Activity, color: 'from-[#F43F5E] to-[#E11D48]' },
    { title: 'Winners', value: stats?.winners || 0, icon: Award, color: 'from-[#EAB308] to-[#CA8A04]' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Enterprise Admin Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of the complete Dog Show Management Platform.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="relative overflow-hidden bg-card rounded-2xl border border-border p-6 shadow-xl group hover:border-[rgba(255,255,255,0.15)] transition-all duration-300"
            >
              <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-all duration-500`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-foreground" />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-extrabold text-foreground mb-1">{stat.value}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Charts & Recent Activities Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6"
      >
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Revenue & Registrations Overview</h2>
          <Spinner className="py-20" />
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Latest Registrations</h2>
          <div className="space-y-4">
            {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
              stats.recentRegistrations.map((reg: any) => (
                <div key={reg.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-input transition-colors border border-transparent hover:border-border group">
                  <div className="w-2 h-2 mt-2 rounded-full bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                      {reg.user?.firstName} registered {reg.dog?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{reg.event?.name}</p>
                    <span className="text-[10px] font-mono text-muted-foreground mt-1 block">
                      {new Date(reg.createdAt).toLocaleDateString()} at {new Date(reg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent registrations found.</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
