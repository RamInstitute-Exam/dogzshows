'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrganizingCommittee({ secretaries }: { secretaries: any[] }) {
  if (!secretaries || secretaries.length === 0) return null;

  return (
    <div className="bg-card rounded-[20px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-border mb-8 text-foreground">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">Organizing Committee</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {secretaries.map((sec, i) => (
          <motion.div 
            key={sec.id || i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border hover:border-border/40 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-muted border border-border"
                >
                  <User className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-foreground leading-tight">{sec.name}</h4>
                  <span
                    className="inline-block mt-1 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-foreground border border-border"
                  >
                    {sec.designation || 'Hony. Secretary'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-semibold text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1 text-foreground">
                    <p>{sec.mobile}</p>
                    {sec.alternateMobile && <p className="text-xs text-muted-foreground font-medium">Alt Mobile: {sec.alternateMobile}</p>}
                    {sec.phone && <p className="text-xs text-muted-foreground font-medium">Landline: {sec.phone}</p>}
                  </div>
                </div>

                {(sec.email || sec.alternateEmail) && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <div className="space-y-1 text-foreground break-all">
                      {sec.email && <p>{sec.email}</p>}
                      {sec.alternateEmail && <p className="text-xs text-muted-foreground font-medium">Alt Email: {sec.alternateEmail}</p>}
                    </div>
                  </div>
                )}

                {sec.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-foreground leading-relaxed">
                      <p className="whitespace-pre-line">{sec.address}</p>
                      <p>{[sec.city, sec.state, sec.pincode].filter(Boolean).join(', ')}</p>
                      {sec.country && <p className="text-xs text-muted-foreground font-medium">{sec.country}</p>}
                    </div>
                  </div>
                )}

                {sec.website && (
                  <div className="flex items-start gap-3 pt-1">
                    <Globe className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                    <a 
                      href={sec.website.startsWith('http') ? sec.website : `https://${sec.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:underline truncate"
                    >
                      {sec.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

