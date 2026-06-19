'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DownloadsPage() {
  const [data] = useState([]);

  return (
    <div className="space-y-6">
      
      {/* Page Header & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Downloads</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and view your downloads records.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-foreground outline-none text-foreground" />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Filter className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-xl border-border text-muted-foreground hover:text-foreground"><Download className="w-4 h-4" /></Button>
          <Button className="bg-foreground hover:bg-foreground rounded-xl font-bold shadow-md text-foreground"><Plus className="w-4 h-4 sm:mr-2" /><span className="hidden sm:inline">New Entry</span></Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Records Found</h2>
            <p className="text-muted-foreground max-w-sm mb-6">There are currently no downloads records available in this section. Start by creating a new entry.</p>
            <Button variant="outline" className="border-border text-foreground hover:bg-foreground hover:text-foreground">Create New</Button>
          </div>
        ) : (
          <div className="p-8 text-foreground">Records go here</div>
        )}
      </div>
      
    </div>
  );
}
