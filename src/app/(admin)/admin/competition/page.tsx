'use client';

import AdminSidebar from '@/components/shared/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function CompetitionEngine() {
  const [activeRound, setActiveRound] = useState(1);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const eventId = 'mock-event-id'; // In a real scenario, this is selected or passed via params

  const fetchRounds = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/competitions/events/${eventId}/rounds`);
      // Assuming response.data returns rounds and matches
      // For simplicity, we just set mock or fetched matches here:
      if (response.data && response.data.length > 0) {
        setMatches(response.data[0].matches || []);
      }
    } catch (error) {
      console.error('Failed to fetch rounds', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [activeRound]);

  const handleResult = async (matchId: string, status: string) => {
    try {
      await api.put(`/competitions/matches/${matchId}`, { status, score: status === 'ADVANCED' ? 10 : 0 });
      fetchRounds();
    } catch (error) {
      console.error('Failed to update match', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-card">
      <AdminSidebar />
      <div className="flex-1 md:ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-muted-foregroundxl font-bold text-foreground">Competition Engine</h1>
            <p className="text-muted-foreground mt-1">Live tracking and judging for Event: <span className="font-semibold text-brand-orange">National Championship 2026</span></p>
          </div>
          <Button className="bg-brand-dark hover:bg-foreground text-background gap-2">
            <Trophy className="w-4 h-4" /> Finalize Best in Show
          </Button>
        </div>

        {/* Round Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          {[1, 2, 3].map((round) => (
            <button
              key={round}
              onClick={() => setActiveRound(round)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                activeRound === round 
                  ? 'bg-brand-orange text-foreground shadow-md' 
                  : 'bg-card text-muted-foreground hover:bg-input border border-border'
              }`}
            >
              Round {round}: {round === 1 ? 'Breed Class' : round === 2 ? 'FCI Group' : 'Best in Show'}
            </button>
          ))}
        </div>

        {/* Round Active UI */}
        <Card className="border-0 shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-card border-b border-border">
            <CardTitle>Active Matches - Round {activeRound}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Dog Name</th>
                  <th className="p-4 font-medium">Breed</th>
                  <th className="p-4 font-medium">Class</th>
                  <th className="p-4 font-medium">Current Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center p-8">Loading matches...</td></tr>
                ) : matches.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No matches found for this round.</td></tr>
                ) : matches.map((match) => (
                  <tr key={match.id} className="border-b last:border-0 hover:bg-card transition-colors">
                    <td className="p-4 font-semibold text-foreground">{match.dog?.name || 'Unknown'}</td>
                    <td className="p-4 text-muted-foreground">{match.dog?.breed || '-'}</td>
                    <td className="p-4 text-muted-foreground">Open</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        match.status === 'ADVANCED' ? 'bg-green-100 text-green-700' :
                        match.status === 'ELIMINATED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleResult(match.id, 'ADVANCED')} className="text-green-600 border-green-200 hover:bg-green-50">
                        <CheckCircle className="w-4 h-4 mr-1" /> Advance
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResult(match.id, 'ELIMINATED')} className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-1" /> Eliminate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
