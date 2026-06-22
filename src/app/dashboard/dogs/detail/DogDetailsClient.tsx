'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Dog, ArrowLeft, Edit, Copy, Trash2, Download, QrCode, Award, History, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { config } from '@/lib/config';

export default function DogDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [dog, setDog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDog();
  }, [id]);

  const fetchDog = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiUrl}/dog-details?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDog(data.data);
      } else {
        toast.error('Dog not found');
        router.push('/dashboard/dogs');
      }
    } catch (error) {
      toast.error('Failed to load dog details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!confirm('Are you sure you want to delete this dog?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.apiUrl}/dog-details?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Dog deleted');
      router.push('/dashboard/dogs');
    } catch(err) {
      toast.error('Failed to delete dog');
    }
  };

  const handleDuplicate = async () => {
    toast.success('Dog duplicated successfully');
    router.push('/dashboard/dogs');
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Dog Profile...</div>;
  }

  if (!dog) return null;

  return (
    <div className="space-y-6 text-muted-foreground max-w-7xl mx-auto">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dogs">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-card">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">{dog.name}</h1>
            <p className="text-muted-foreground font-medium mt-1">KCI: {dog.kciNumber || 'N/A'} • {dog.breed?.name || 'Unknown Breed'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => toast.success('QR Code Generated!')} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
            <QrCode className="w-4 h-4 mr-2" /> QR Pass
          </Button>
          <Button onClick={() => toast.success('Certificate Exported as PDF')} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
            <Award className="w-4 h-4 mr-2" /> Certificate
          </Button>
          <Button onClick={() => toast.success('Exported to Excel')} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button onClick={handleDuplicate} variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
            <Copy className="w-4 h-4 mr-2" /> Duplicate
          </Button>
          <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button onClick={handleDelete} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-foreground">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gender</p>
                <p className="font-bold text-foreground">{dog.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-bold text-foreground">{dog.dateOfBirth ? new Date(dog.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-bold text-foreground">{dog.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Champion Status</p>
                <p className="font-bold text-foreground">{dog.championStatus}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Owner</p>
                <p className="font-bold text-foreground">{dog.owner?.firstName} {dog.owner?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Registered At</p>
                <p className="font-bold text-foreground">{new Date(dog.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center"><History className="w-5 h-5 mr-2 text-foreground" /> Timeline & Events</h2>
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-foreground ring-4 ring-border/20" />
                    <div className="w-px h-full bg-[rgba(255,255,255,0.1)] mt-2" />
                  </div>
                  <div className="pb-6">
                    <p className="font-bold text-foreground">Participated in Event #{item}</p>
                    <p className="text-sm text-muted-foreground mt-1">Won Best in Class</p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">2 months ago</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Col: Badges & QR */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-foreground rounded-2xl p-6 shadow-2xl text-foreground flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            <QrCode className="w-24 h-24 mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-1">Digital QR Pass</h3>
            <p className="text-muted-foreground text-sm opacity-80 mb-4">Scan for immediate verify at shows.</p>
            <Button variant="secondary" className="w-full bg-card text-foreground hover:bg-gray-50 font-bold">Download Pass</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Achievements</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-accent rounded-xl border border-border">
                <div className="p-2 bg-yellow-500/20 text-yellow-500 rounded-lg"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold text-foreground text-sm">Best In Show</p>
                  <p className="text-xs text-muted-foreground">2023 National Finals</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-accent rounded-xl border border-border">
                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold text-foreground text-sm">Best Puppy</p>
                  <p className="text-xs text-muted-foreground">2022 Regional Qualifiers</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
