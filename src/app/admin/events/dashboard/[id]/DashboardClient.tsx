'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Download, BarChart3, ListOrdered, Users, CheckCircle2, Clock, CalendarDays, RefreshCw, XCircle, Check } from 'lucide-react';
import { AdminButton } from '@/components/ui/admin-button';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardClient({ eventId }: { eventId: string }) {
  const [activeTab, setActiveTab] = useState('Registration Matrix');
  const [loading, setLoading] = useState(true);
  const [matrixData, setMatrixData] = useState<{ groups: any[], breeds: any[], classes: any[] } | null>(null);
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, [eventId]);

  useEffect(() => {
    if (activeTab === 'Registrations') {
      fetchRegistrations();
    }
  }, [activeTab, eventId]);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard/admin/matrix/${eventId}`);
      if (res.success) {
        setMatrixData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setRegsLoading(true);
    try {
      const res = await api.get(`/registrations?eventId=${eventId}&limit=100`);
      if (res.success) {
        setRegistrations(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load registrations');
    } finally {
      setRegsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setStatusUpdateLoading(id);
    try {
      const res = await api.put(`/registrations/${id}`, { status: newStatus });
      if (res.success) {
        toast.success(`Registration ${newStatus.toLowerCase()} successfully`);
        fetchRegistrations();
        fetchMatrix(); // Refresh matrix data if approved/rejected
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const tabs = ['Registration Matrix', 'Registrations', 'Catalog & Reports', 'Ring Management'];

  const totalRegistered = matrixData?.groups.reduce((acc, g) => acc + g.registered, 0) || 0;
  const totalCapacity = matrixData?.groups.reduce((acc, g) => acc + g.capacity, 0) || 0;

  return (
    <div className="bg-card shadow-xl rounded-2xl overflow-hidden border border-border">
      <div className="border-b border-border bg-accent/20 px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-black text-foreground">Event Dashboard</h2>
        <AdminButton variant="outline" size="sm" onClick={() => { fetchMatrix(); if(activeTab === 'Registrations') fetchRegistrations(); }} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Data
        </AdminButton>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 border-b-2 font-bold text-sm transition-colors
                ${activeTab === tab
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {loading && activeTab === 'Registration Matrix' ? (
          <div className="py-24 flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {activeTab === 'Registration Matrix' && matrixData && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-background border border-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Total Registrations</p>
                      <p className="text-2xl font-black text-foreground">{totalRegistered} <span className="text-sm font-normal text-muted-foreground">/ {totalCapacity}</span></p>
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                    <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Confirmed Entries</p>
                      <p className="text-2xl font-black text-foreground">{totalRegistered}</p>
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                    <div className="p-3 bg-orange-500/10 rounded-lg"><BarChart3 className="w-6 h-6 text-orange-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">FCI Groups</p>
                      <p className="text-2xl font-black text-foreground">{matrixData.groups.length}</p>
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                    <div className="p-3 bg-purple-500/10 rounded-lg"><ListOrdered className="w-6 h-6 text-purple-600" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold">Breeds Represented</p>
                      <p className="text-2xl font-black text-foreground">{matrixData.breeds.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* FCI Group Capacity Matrix */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">FCI Group Capacities</h3>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-accent/30">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Group</th>
                            <th className="px-4 py-3 text-center text-xs font-black text-muted-foreground uppercase tracking-wider">Capacity</th>
                            <th className="px-4 py-3 text-center text-xs font-black text-muted-foreground uppercase tracking-wider">Registered</th>
                            <th className="px-4 py-3 text-center text-xs font-black text-muted-foreground uppercase tracking-wider">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {matrixData.groups.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-muted-foreground">No group limits configured.</td></tr>
                          ) : (
                            matrixData.groups.map((group: any) => {
                              const isFull = group.registered >= group.capacity;
                              return (
                                <tr key={group.groupId} className="hover:bg-accent/10 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground">{group.groupName}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-muted-foreground font-semibold">{group.capacity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-foreground">{group.registered}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isFull ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                      {group.remaining}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Breed-wise breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-foreground">Breed Distribution</h3>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-accent/30">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Breed</th>
                            <th className="px-4 py-3 text-right text-xs font-black text-muted-foreground uppercase tracking-wider">Entries</th>
                          </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                          {matrixData.breeds.length === 0 ? (
                            <tr><td colSpan={2} className="px-4 py-4 text-center text-sm text-muted-foreground">No breeds registered yet.</td></tr>
                          ) : (
                            matrixData.breeds.map((breed: any) => (
                              <tr key={breed.breedId} className="hover:bg-accent/10 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground">{breed.breedName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-foreground">{breed.count}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Class-wise Breakdown */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-bold text-foreground">Class Distribution</h3>
                  <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background">
                      {matrixData.classes.length === 0 ? (
                        <div className="col-span-full text-center text-sm text-muted-foreground py-4">No classes registered yet.</div>
                      ) : (
                        matrixData.classes.map((cls: any) => (
                          <div key={cls.classId} className="border border-border p-3 rounded-lg flex justify-between items-center shadow-sm">
                            <span className="text-sm font-semibold text-muted-foreground">{cls.className}</span>
                            <span className="text-lg font-black text-foreground">{cls.count}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'Registrations' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-foreground">Registration Approvals</h3>
                </div>
                
                {regsLoading ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-accent/30">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">SN</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Dog Name</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Breed</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Class</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-muted-foreground uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {registrations.length === 0 ? (
                          <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No registrations found.</td></tr>
                        ) : (
                          registrations.map((reg) => (
                            <tr key={reg.id} className="hover:bg-accent/10 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground">{reg.serialNumber}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-foreground">{reg.dog?.name || 'Unknown'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{reg.dog?.breed?.name || '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{reg.category?.name || '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                  reg.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                {reg.status === 'PENDING' && (
                                  <div className="flex justify-end space-x-2">
                                    <button 
                                      onClick={() => handleUpdateStatus(reg.id, 'CONFIRMED')}
                                      disabled={statusUpdateLoading === reg.id}
                                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                      title="Approve"
                                    >
                                      {statusUpdateLoading === reg.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(reg.id, 'REJECTED')}
                                      disabled={statusUpdateLoading === reg.id}
                                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                      title="Reject"
                                    >
                                      {statusUpdateLoading === reg.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'Catalog & Reports' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-xl border border-dashed border-border mt-4">
                <div className="bg-green-500/10 p-4 rounded-full mb-6">
                  <Download className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-black mb-2 text-foreground">Official Print Catalog</h2>
                <p className="text-muted-foreground mb-8 max-w-lg">
                  Generate a professional PDF catalog containing all confirmed registrations, organized automatically by Group, Breed, and Class as per KCI guidelines.
                </p>
                <a 
                  href={`/api/v1/event-catalog/${eventId}/pdf`}
                  target="_blank"
                  className="bg-green-600 text-white px-8 py-3.5 rounded-xl shadow-lg hover:bg-green-700 flex items-center space-x-3 transition-transform hover:scale-105 active:scale-95 font-bold"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Catalog PDF</span>
                </a>
              </motion.div>
            )}

            {activeTab === 'Ring Management' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-24 text-center">
                <div className="inline-block p-4 bg-accent/30 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Ring Management Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">This module will allow you to assign rings and schedules to groups and breeds.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
