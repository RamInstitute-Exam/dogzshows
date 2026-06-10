'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, CalendarRange, Clock, ShieldCheck, XCircle, Mail, UserCheck } from 'lucide-react';

interface Appointment {
  id: string;
  userId: string;
  breederId: string;
  dogId: string;
  dateTime: string;
  status: string;
  notes: string;
  user: { email: string };
  breeder: { email: string };
  dog: { name: string; breed: string };
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setUpdatingId(apptId);
    try {
      await api.patch(`/appointments/${apptId}/status`, { status });
      setAppointments(
        appointments.map((a) => (a.id === apptId ? { ...a, status } : a))
      );
    } catch (error) {
      console.error('Failed to update consultation status:', error);
      alert('Failed to modify consultation booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Group appointments into incoming (breeder) and outgoing (buyer)
  const incomingConsults = appointments.filter(a => a.breederId === user?.userId);
  const outgoingBookings = appointments.filter(a => a.userId === user?.userId);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full min-h-screen">
        
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
            <CalendarRange className="w-6 h-6 text-indigo-600" />
            <span>Consultation Appointments</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Manage breeding appointments and scheduled visitation slots.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* INCOMING REQUESTS PANEL */}
            <section className="space-y-6">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight pb-3 border-b border-gray-200/60">
                Incoming Consultation Leads ({incomingConsults.length})
              </h2>

              {incomingConsults.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200/50 rounded-2xl p-6 text-gray-400">
                  <CalendarRange className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold">No incoming inquiries</p>
                  <p className="text-3xs text-gray-400 mt-0.5">Consult requests will show up when buyers inquire about your dogs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingConsults.map((appt) => {
                    const isPending = appt.status === 'PENDING';
                    const isUpdating = appt.id === updatingId;
                    return (
                      <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-3xs hover:border-indigo-100 transition-colors flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                              appt.status === 'CONFIRMED'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : appt.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {appt.status}
                            </span>
                            <div className="flex items-center space-x-1 text-3xs text-gray-400 font-bold uppercase">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(appt.dateTime).toLocaleString()}</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-gray-900 text-sm">Consultation: {appt.dog.name}</h3>
                          <p className="text-2xs text-indigo-600 font-bold mt-0.5">{appt.dog.breed}</p>
                          <div className="mt-3.5 flex items-center space-x-1 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>Requestor: {appt.user.email}</span>
                          </div>
                          {appt.notes && (
                            <p className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-500 leading-normal italic">
                              "{appt.notes}"
                            </p>
                          )}
                        </div>

                        {isPending && (
                          <div className="mt-5 pt-4 border-t border-gray-100 flex space-x-2">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-3xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Confirm Booking</span>
                              </>}
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                              className="flex-1 bg-white border border-gray-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-xl text-3xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* OUTGOING BOOKINGS PANEL */}
            <section className="space-y-6">
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight pb-3 border-b border-gray-200/60">
                Booked consultations ({outgoingBookings.length})
              </h2>

              {outgoingBookings.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200/50 rounded-2xl p-6 text-gray-400">
                  <CalendarRange className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold">No consultations scheduled</p>
                  <p className="text-3xs text-gray-400 mt-0.5">Browse marketplace listings to submit consult appointments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outgoingBookings.map((appt) => {
                    const isUpdating = appt.id === updatingId;
                    const canCancel = appt.status !== 'CANCELLED';
                    return (
                      <div key={appt.id} className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-3xs hover:border-indigo-100 transition-colors flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold border ${
                              appt.status === 'CONFIRMED'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : appt.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {appt.status}
                            </span>
                            <div className="flex items-center space-x-1 text-3xs text-gray-400 font-bold uppercase">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(appt.dateTime).toLocaleString()}</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-gray-900 text-sm">Consultation: {appt.dog.name}</h3>
                          <p className="text-2xs text-indigo-600 font-bold mt-0.5">{appt.dog.breed}</p>
                          <div className="mt-3.5 flex items-center space-x-1 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>Host Breeder: {appt.breeder.email}</span>
                          </div>
                        </div>

                        {canCancel && (
                          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 border border-transparent rounded-xl text-3xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <span>Cancel Consultation</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
