'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, List } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import { config } from '@/lib/config';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${config.apiUrl}';
        const res = await fetch(`${apiUrl}/fci-groups`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch FCI groups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="min-h-fit bg-background">
      <BreadcrumbBanner
        slug="groups"
        fallbackTitle="FCI Breed Groups"
        fallbackSubtitle="Explore the 10 internationally recognized breed groups and their characteristics."
        fallbackImage="/images/about_banner.png"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No groups found.</div>
            ) : groups.map((group, i) => (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0B1220] rounded-[2rem] p-6 shadow-sm border border-border premium-hover flex flex-col group relative overflow-hidden"
              >
                <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                  <Shield className="w-40 h-40 text-foreground" />
                </div>
                
                <h3 className="text-2xl font-[800] text-foreground mb-1">Group {group.groupNumber}</h3>
                <p className="text-[#F59E0B] font-[700] text-lg mb-4">{group.name}</p>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4 relative z-10">
                  {group.description || 'No description available for this group.'}
                </p>

                <div className="mt-auto pt-6 border-t border-border relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-[600]">
                    <List className="w-4 h-4 text-[#F59E0B]" />
                    <span>View Breeds</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-foreground hover:bg-brand-orange transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
