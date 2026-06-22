'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dog, Calendar, FileText, CheckCircle, ArrowRight, Activity, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './AdminDashboard';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

interface DashboardStats {
  totalDogs: number;
  upcomingEvents: number;
  pendingRegistrations: number;
  certificates: number;
  recentRegistrations?: any[];
}

function UserDashboardComponent() {
  const { data: statsData, isLoading: loading } = useQuery<DashboardStats>({
    queryKey: ['userDashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data.data;
    }
  });

  const stats = statsData || null;

  const statCards = [
    { title: 'Total Dogs', value: stats?.totalDogs || 0, icon: Dog, color: 'from-primary to-muted-foreground' },
    { title: 'Upcoming Events', value: stats?.upcomingEvents || 0, icon: Calendar, color: 'from-[#38BDF8] to-[#0EA5E9]' },
    { title: 'Pending Registrations', value: stats?.pendingRegistrations || 0, icon: Activity, color: 'from-[#F43F5E] to-[#E11D48]' },
    { title: 'Certificates', value: stats?.certificates || 0, icon: FileText, color: 'from-[#10B981] to-[#059669]' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-muted-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here is the latest overview of your dogs and events.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/events">
            <Button variant="outline" className="border-border hover:bg-input text-foreground">
              Explore Events <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
          </Link>
          <Link href="/dashboard/dogs/create">
            <Button className="bg-primary hover:opacity-90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2"/> Add New Dog
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
                <h3 className="text-4xl font-extrabold text-foreground mb-1">{stat.value}</h3>
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick Actions or Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6"
      >
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Registrations</h2>
          {stats?.recentRegistrations && stats.recentRegistrations.length > 0 ? (
            <div className="space-y-4">
              {stats.recentRegistrations.map((reg: any) => (
                <div key={reg.id} className="flex items-start justify-between p-4 rounded-xl border border-border hover:bg-input transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Dog className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{reg.dog?.name || 'Unknown Dog'}</p>
                      <p className="text-sm text-muted-foreground">{reg.event?.name || 'Unknown Event'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${reg.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {reg.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(reg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No active registrations</h3>
              <p className="text-muted-foreground max-w-sm mb-6">You haven't registered any dogs for upcoming events yet. Check out the Events page to get started!</p>
              <Link href="/events">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">Browse Events</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold text-foreground mb-6">Quick Links</h2>
          <div className="space-y-3">
            <Link href="/dashboard/dogs" className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-input border border-border transition-colors group">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors">Manage Dogs</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/dashboard/certificates" className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-input border border-border transition-colors group">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors">My Certificates</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/dashboard/qr-pass" className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-input border border-border transition-colors group">
              <span className="font-bold text-foreground group-hover:text-primary transition-colors">Digital QR Pass</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <UserDashboardComponent />;
}
