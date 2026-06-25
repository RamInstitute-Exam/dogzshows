import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, RefreshCw, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Spinner from '@/components/common/loader/Spinner';

export interface ColumnDefinition<T> {
  header: string | React.ReactNode;
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
  onExport?: (type?: 'single' | 'bulk') => void;
  createLink?: string;
  onCreate?: () => void;
  createLabel?: string;
  emptyStateDescription?: string;
  keyExtractor: (item: T) => string;
  limit?: number;
  onLimitChange?: (limit: number) => void;
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
  emptyStateDescription,
  keyExtractor,
  limit = 10,
  onLimitChange
}: AdminDataTableProps<T>) {
  const [localSearch, setLocalSearch] = React.useState(search);
  const [showExportModal, setShowExportModal] = React.useState(false);

  // Sync local search when search prop changes (e.g. on reset or clear)
  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce search update
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 600); // 600ms debounce
    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);
  
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      end = Math.min(totalPages, 5);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);
  
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
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchChange(localSearch);
                }
              }}
              className="w-full pl-9 pr-4 h-10 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <Button variant="outline" className="flex-1 sm:flex-none h-10 border-border text-foreground hover:bg-accent whitespace-nowrap">
            <Filter className="w-4 h-4 sm:mr-2" /> <span className="inline">Filters</span>
          </Button>
          {onExport && (
            <Button variant="outline" onClick={() => setShowExportModal(true)} className="flex-1 sm:flex-none h-10 border-border text-foreground hover:bg-accent whitespace-nowrap">
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
            <tbody className="divide-y divide-border" style={{ minHeight: loading ? '400px' : 'auto' }}>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-12 text-center">
                    <Spinner size="md" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="py-12 text-center h-auto">
                    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto">
                      <Icon className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1} />
                      <h3 className="text-lg font-bold text-foreground mb-2">No {title} Found</h3>
                      <p className="text-sm text-muted-foreground mb-6 text-center">
                        {emptyStateDescription || "No records have been created yet. Create your first record to organize and manage them here."}
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
          <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 bg-card">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {onLimitChange && (
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      onLimitChange(Number(e.target.value));
                      onPageChange(1); // Reset to page 1 on limit change
                    }}
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[10, 25, 50, 100].map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>
              )}
              <p>
                Showing {startRecord}–{endRecord} of {totalCount} records <span className="hidden sm:inline">(Page {page} of {totalPages})</span>
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(Math.max(1, page - 1))} 
                disabled={page === 1} 
                className="h-8 border-border text-foreground hover:bg-accent px-3 hidden sm:flex"
              >
                &lt;&lt; Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(Math.max(1, page - 1))} 
                disabled={page === 1} 
                className="h-8 w-8 p-0 border-border text-foreground hover:bg-accent sm:hidden"
              >
                &lt;
              </Button>
              
              <div className="flex flex-wrap items-center justify-center gap-1">
                {getPageNumbers()[0] > 1 && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground">1</Button>
                    {getPageNumbers()[0] > 2 && <span className="text-muted-foreground px-1">...</span>}
                  </>
                )}
                
                {getPageNumbers().map(p => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(p)}
                    className={`h-8 w-8 shrink-0 p-0 ${p === page ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p}
                  </Button>
                ))}
                
                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                  <>
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && <span className="text-muted-foreground px-1">...</span>}
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground">{totalPages}</Button>
                  </>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages} 
                className="h-8 border-border text-foreground hover:bg-accent px-3 hidden sm:flex"
              >
                Next &gt;&gt;
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages} 
                className="h-8 w-8 p-0 border-border text-foreground hover:bg-accent sm:hidden"
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Export Choice Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Export Data</h2>
              <p className="text-muted-foreground text-sm mt-2">How would you like to export the records?</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => { setShowExportModal(false); onExport?.('single'); }} 
                className="w-full bg-accent hover:bg-accent/80 text-foreground border border-border"
              >
                Single Page (Current {limit})
              </Button>
              <Button 
                onClick={() => { setShowExportModal(false); onExport?.('bulk'); }} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Bulk Export (All Records)
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowExportModal(false)} 
                className="w-full mt-2 text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
