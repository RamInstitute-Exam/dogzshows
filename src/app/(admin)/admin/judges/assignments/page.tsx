'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/shared/AdminSidebar';
import { config } from '@/lib/config';

export default function JudgeAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('${config.apiUrl}/judges/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 bg-background">
        <div className="w-full max-w-[1600px] mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <Users className="w-8 h-8 text-brand-orange" /> Judge Assignments
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Map judges to specific events and FCI groups.</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <Button className="bg-brand-orange hover:bg-orange-600 text-foreground font-bold whitespace-nowrap">
                Assign Judge to Event
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-48 bg-card animate-pulse rounded-xl"></div>)
            ) : assignments.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-card rounded-xl border border-border">
                <Users className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No judge assignments found.</p>
              </div>
            ) : (
              assignments.map((assignment, i) => (
                <motion.div 
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-foreground">{assignment.judge?.name}</h3>
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded font-bold uppercase">Active</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assigned Event</p>
                      <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-orange" /> {assignment.event?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Groups / Specialization</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.assignedGroups ? assignment.assignedGroups.map((g: any, idx: number) => (
                          <span key={idx} className="text-xs bg-accent text-foreground px-2 py-1 rounded">Group {g.fciGroupId}</span>
                        )) : <span className="text-sm text-foreground">All Groups</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
