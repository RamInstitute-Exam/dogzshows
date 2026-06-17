import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  description: string;
  icon: React.ElementType;
  data: T[];
  columns: ColumnDefinition<T>[];
  loading: boolean;
  totalCount: number;
  page: number;
  totalPages: number;
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onExport?: () => void;
  createLink?: string;
  onCreate?: () => void;
  createLabel?: string;
  keyExtractor: (item: T) => string;
}

export function AdminDataTable<T>({
  title,
  description,
  icon: Icon,
  data,
  columns,
  loading,
  totalCount,
  page,
  totalPages,
  search,
  onSearchChange,
  onRefresh,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onExport,
  createLink,
  onCreate,
  createLabel = 'Create New',
  keyExtractor
}: AdminDataTableProps<T>) {
  return (
    <div className="w-full  flex flex-col">
      {/* Top Header Card */}
      <div className="bg-card p-4 md:p-5 rounded-t-2xl border border-border shadow-md flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        {/* Title Section (Left on Desktop, Top on Tablet/Mobile) */}
        <div className="flex-shrink-0 mb-2 xl:mb-0">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Icon className="w-8 h-8 text-blue-500" /> {title}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">{description}</p>
        </div>
        
        {/* Action Buttons Section */}
        <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto mt-4 xl:mt-0">
          <div className="relative w-full sm:w-auto sm:min-w-[300px] flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <Button variant="outline" className="flex-1 sm:flex-none h-10 border-border text-foreground hover:bg-accent whitespace-nowrap">
            <Filter className="w-4 h-4 sm:mr-2" /> <span className="inline">Filters</span>
          </Button>
          {onExport && (
            <Button variant="outline" onClick={onExport} className="flex-1 sm:flex-none h-10 border-border text-foreground hover:bg-accent whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          )}
          <Button variant="outline" onClick={onRefresh} className="flex-none w-12 h-10 border-border text-foreground hover:bg-accent flex items-center justify-center p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
          {createLink ? (
            <Link href={createLink} className="w-full sm:w-auto">
              <Button className="w-full sm:w-[180px] h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> {createLabel}
              </Button>
            </Link>
          ) : onCreate ? (
            <Button onClick={onCreate} className="w-full sm:w-[180px] h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" /> {createLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border-x border-b border-border rounded-b-2xl shadow-xl overflow-hidden w-full relative -top-[1px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-card border-b border-border">
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right min-w-[180px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.02)]">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500  mb-4" />
                    <p className="text-muted-foreground">Loading data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="py-12 text-center h-auto">
                    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto">
                      <Icon className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1} />
                      <h3 className="text-lg font-bold text-foreground mb-2">No {title} Found</h3>
                      <p className="text-sm text-muted-foreground mb-6 text-center">
                        No records have been created yet. Create your first record to organize and manage them here.
                      </p>
                      {createLink ? (
                        <Link href={createLink}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            <Plus className="w-4 h-4 mr-2" /> {createLabel}
                          </Button>
                        </Link>
                      ) : onCreate ? (
                        <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          <Plus className="w-4 h-4 mr-2" /> {createLabel}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <motion.tr 
                    key={keyExtractor(item)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-accent/30 transition-colors group"
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className={`py-4 px-6 ${col.className || ''}`}>
                        {typeof col.accessor === 'function' ? col.accessor(item) : (item as any)[col.accessor]}
                      </td>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 transition-opacity">
                          {onView && (
                            <Button variant="ghost" size="sm" onClick={() => onView(item)} className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">
                              <Search className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="text-muted-foreground hover:text-foreground">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="ghost" size="sm" onClick={() => onDelete(item)} className="text-red-500 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && data.length > 0 && totalPages > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-card">
            <p className="text-sm text-muted-foreground">Showing Page {page} of {totalPages} ({totalCount} total)</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="h-8 border-border text-foreground hover:bg-accent">
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-8 border-border text-foreground hover:bg-accent">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
