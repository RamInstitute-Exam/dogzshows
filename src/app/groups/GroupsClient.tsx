'use client';

import { useFCIGroups } from '@/hooks/useCMS';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, List } from 'lucide-react';
import BreadcrumbBanner from '@/components/shared/BreadcrumbBanner';
import PageContainer from '@/components/layout/PageContainer';
import Link from 'next/link';

export default function GroupsClient({ initialBannerData }: { initialBannerData?: any }) {
  const { data, isLoading } = useFCIGroups();
  const groups = data?.success && Array.isArray(data.data) ? data.data : [];
  const loading = isLoading;

  return (
    <PageContainer>
      <BreadcrumbBanner
        slug="groups"
        fallbackTitle="FCI Breed Groups"
        fallbackSubtitle="Explore the 10 internationally recognized breed groups and their characteristics."
        fallbackImage="/images/about_banner.png"
        initialBannerData={initialBannerData}
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
             <div className="w-12 h-12 border-4 border-border border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groups.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No groups found.</div>
            ) : groups.map((group: any, i: number) => (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={`/group-details?slug=${group.slug}`}
                  className="bg-card rounded-[2rem] p-6 border border-border hover:border-primary/30 hover:-translate-y-[6px] hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 ease flex flex-col group relative overflow-hidden h-full cursor-pointer block"
                >
                  <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <Shield className="w-40 h-40 text-foreground" />
                  </div>
                  
                  <h3 className="text-2xl font-[800] text-foreground mb-1">Group {group.groupNumber}</h3>
                  <p className="text-primary font-[700] text-lg mb-4 group-hover:text-primary transition-colors">{group.name}</p>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4 relative z-10">
                    {group.description || 'No description available for this group.'}
                  </p>

                  <div className="mt-auto pt-6 border-t border-border relative z-10 flex justify-between items-center w-full">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-[600]">
                      <List className="w-4 h-4 text-primary" />
                      <span>View Breeds</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
