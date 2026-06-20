'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Upload, FileText, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, 
  Download, Play, Check, RefreshCw, Info, FileSpreadsheet, Trash2, Search, Filter
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import Spinner from '@/components/common/loader/Spinner';

interface PreviewRow {
  rowNumber: number;
  status: 'Ready' | 'Warning' | 'Invalid';
  name: string;
  type: string;
  remarks: string;
  isDuplicate: boolean;
  errors: string[];
  warnings: string[];
  mappedData: any;
}

interface ValidationStats {
  total: number;
  valid: number;
  invalid: number;
  warnings: number;
}

const MODULES = [
  { id: 'events', name: 'Dog Shows / Events' },
  { id: 'clubs', name: 'KCI Clubs' },
  { id: 'judges', name: 'Judges' },
  { id: 'entries', name: 'Show Entries' },
  { id: 'breeds', name: 'Breeds Master' },
  { id: 'categories', name: 'Entry Categories' },
  { id: 'sponsors', name: 'Sponsors' },
  { id: 'media-gallery', name: 'Media Gallery' },
  { id: 'photos', name: 'Photos Master' },
  { id: 'videos', name: 'Videos Master' },
  { id: 'results', name: 'Winners & Results' }
];

export default function UniversalBulkUpload() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleParam = searchParams.get('module') || 'events';

  // State definitions
  const [selectedModule, setSelectedModule] = useState(moduleParam);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  
  // Search & Filter in Preview
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Options State
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    replaceExisting: false,
    autoGenerateSlug: true,
    autoCreateRelations: true,
    ignoreEmptyRows: true,
    continueOnWarnings: true,
  });

  // Report and validation preview stats
  const [reportId, setReportId] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [stats, setStats] = useState<ValidationStats>({ total: 0, valid: 0, invalid: 0, warnings: 0 });
  const [importSummary, setImportSummary] = useState({ total: 0, imported: 0, skipped: 0, failed: 0 });

  // Sync module selector with URL
  useEffect(() => {
    if (MODULES.some(m => m.id === moduleParam)) {
      setSelectedModule(moduleParam);
    }
  }, [moduleParam]);

  const handleModuleChange = (newModule: string) => {
    setSelectedModule(newModule);
    setFile(null);
    setPreviewRows([]);
    setReportId('');
    setStep('upload');
    
    // Update URL query parameters
    router.replace(`/admin/bulk-upload?module=${newModule}`);
  };

  const handleOptionChange = (key: keyof typeof options) => {
    setOptions(prev => {
      if (key === 'updateExisting' && !prev.updateExisting) {
        return { ...prev, updateExisting: true, skipDuplicates: false, replaceExisting: false };
      }
      if (key === 'replaceExisting' && !prev.replaceExisting) {
        return { ...prev, replaceExisting: true, skipDuplicates: false, updateExisting: false };
      }
      if (key === 'skipDuplicates' && !prev.skipDuplicates) {
        return { ...prev, skipDuplicates: true, updateExisting: false, replaceExisting: false };
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    const isSupported = ['xlsx', 'csv', 'json'].includes(fileExt || '');
    
    if (!isSupported) {
      toast.error('Unsupported file format. Please upload .xlsx, .csv, or .json file.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB maximum size limit
      toast.error('File exceeds maximum size of 50 MB.');
      return;
    }

    setFile(selectedFile);
    toast.success(`Selected file: ${selectedFile.name}`);
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload & Validate
  const handleValidate = async () => {
    if (!file) {
      toast.error('Please upload a spreadsheet file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'validate');
    formData.append('module', selectedModule);
    
    Object.keys(options).forEach(key => {
      formData.append(key, String(options[key as keyof typeof options]));
    });

    try {
      const response = await axiosInstance.post('/bulk-upload', formData, {
        headers: { 'Content-Type': undefined }
      });

      if (response.data?.success) {
        const result = response.data.data;
        setReportId(result.reportId);
        setStats(result.stats);
        setPreviewRows(result.previewRows);
        setStep('preview');
        toast.success('Validation completed successfully.');
      } else {
        toast.error(response.data?.message || 'Parsing failed.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to process import.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and save to DB inside chunk transactions
  const handleCommit = async () => {
    if (!reportId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.post('/bulk-upload', {
        action: 'commit',
        module: selectedModule,
        reportId,
        continueOnWarnings: options.continueOnWarnings
      });

      if (response.data?.success) {
        const result = response.data.data;
        setImportSummary({
          total: stats.total,
          imported: result.summary.imported,
          skipped: result.summary.skipped,
          failed: result.summary.failed
        });
        setStep('success');
        toast.success('Database transaction committed successfully!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Relational chunk transaction failed. Database rolled back.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.loading(`Downloading ${filename}...`, { id: 'download' });
      const response = await axiosInstance.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download complete.', { id: 'download' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download file.', { id: 'download' });
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewRows([]);
    setReportId('');
    setStep('upload');
  };

  // Client-side search & status filter
  const filteredRows = previewRows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          row.remarks.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || row.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Dynamic preview headers based on selected module
  const renderDynamicDataFields = (row: PreviewRow) => {
    const data = row.mappedData;
    if (!data) return null;

    switch (selectedModule) {
      case 'events':
        return (
          <>
            <p className="font-bold text-slate-100">{data.name}</p>
            <p className="text-[11px] text-slate-400">{data.clubName} • {data.type}</p>
            <p className="text-[10px] text-slate-500 mt-1">{data.venue} ({data.city}, {data.state})</p>
          </>
        );
      case 'clubs':
        return (
          <>
            <p className="font-bold text-slate-100">{data.name}</p>
            <p className="text-[11px] text-slate-400">Secretary: {data.secretaryName} ({data.designation})</p>
            <p className="text-[10px] text-slate-500 mt-1">{data.mobile} | {data.email} | established: {data.establishedYear}</p>
          </>
        );
      case 'judges':
        return (
          <>
            <p className="font-bold text-slate-100">{data.name}</p>
            <p className="text-[11px] text-slate-400">Specialization: {data.specialization}</p>
            <p className="text-[10px] text-slate-500 mt-1">{data.mobile} | {data.email} | {data.country}</p>
          </>
        );
      case 'entries':
        return (
          <>
            <p className="font-bold text-slate-100">{data.dogName} ({data.registrationNumber})</p>
            <p className="text-[11px] text-slate-400">{data.breed} • {data.gender} • {data.category}</p>
            <p className="text-[10px] text-slate-500 mt-1">Owner: {data.ownerName} | Show: {data.dogShowName}</p>
          </>
        );
      default:
        return (
          <>
            <p className="font-bold text-slate-100">{row.name}</p>
            <p className="text-[10px] text-slate-400 truncate max-w-xs">{JSON.stringify(data)}</p>
          </>
        );
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/events" className="text-muted-foreground hover:text-foreground transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Universal Bulk Upload Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground">Import multiple records into the database with preview validation and rollback support.</p>
        </div>

        {/* Templates Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Module Selector */}
          <div className="flex items-center gap-2 border border-border bg-card p-1.5 rounded-xl">
            <span className="text-xs font-bold text-muted-foreground px-2">Target:</span>
            <select 
              value={selectedModule}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="text-xs bg-transparent border-none outline-none font-bold text-foreground cursor-pointer pr-4"
            >
              {MODULES.map(m => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">{m.name}</option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-border mx-1"></div>

          <button 
            onClick={() => handleDownload(`/bulk-upload/sample/${selectedModule}`, `${selectedModule}_import_sample.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-card border border-border text-foreground hover:bg-accent transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Sample Excel
          </button>
          
          <button 
            onClick={() => handleDownload(`/bulk-upload/export/${selectedModule}?format=xlsx`, `${selectedModule}_export.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Live Data
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: UPLOAD AREA & OPTIONS */}
        {step === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Upload Box */}
            <div className="lg:col-span-2 space-y-6">
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-border bg-foreground/5 shadow-inner' 
                    : file 
                      ? 'border-emerald-500/50 bg-emerald-500/5' 
                      : 'border-border bg-card hover:bg-accent/30'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".xlsx, .csv, .json"
                  onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`p-4 rounded-full ${file ? 'bg-emerald-500/10 text-emerald-500' : 'bg-foreground/10 text-foreground'}`}>
                    {file ? <Check className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-bold text-foreground text-lg">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button 
                          onClick={removeFile}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Drag & Drop File Here
                      </p>
                      <p className="text-sm text-muted-foreground my-1">or</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] active:scale-95 transition-all shadow-md"
                      >
                        Browse File
                      </button>
                    </div>
                  )}

                  <div className="border-t border-border w-full max-w-md my-4 pt-4">
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <span>✔ Excel (.xlsx)</span>
                      <span>✔ CSV</span>
                      <span>✔ JSON</span>
                      <span>✔ Max 50MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Asset Instructions */}
              <div className="bg-card border border-border p-6 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base mb-1">Image & Video Assets Import Strategy</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Excel, CSV, and JSON import only text fields and metadata. Logo, banner, or photo columns should contain text URLs or path references (e.g. <code className="bg-accent px-1 py-0.5 rounded text-rose-400">logo.png</code>). 
                    After importing, you can upload physical images by editing the respective item records from the Admin Panel.
                  </p>
                </div>
              </div>
            </div>

            {/* Options Panel */}
            <div className="bg-card border border-border p-6 rounded-2xl h-fit space-y-6">
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">Upload Settings</h3>
                <p className="text-xs text-muted-foreground">Define duplicate constraints and auto-creation values.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-skip"
                    checked={options.skipDuplicates}
                    onChange={() => handleOptionChange('skipDuplicates')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-skip" className="text-sm font-medium text-foreground cursor-pointer">
                    Skip Duplicate Records
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Skip duplicate rows that match existing records in the database.</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-update"
                    checked={options.updateExisting}
                    onChange={() => handleOptionChange('updateExisting')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-update" className="text-sm font-medium text-foreground cursor-pointer">
                    Update Existing Records
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Overwrite fields of existing records with spreadsheet values.</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-replace"
                    checked={options.replaceExisting}
                    onChange={() => handleOptionChange('replaceExisting')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-replace" className="text-sm font-medium text-foreground cursor-pointer">
                    Replace Existing Records
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Completely replace duplicate records with new entries.</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-slug"
                    checked={options.autoGenerateSlug}
                    onChange={() => handleOptionChange('autoGenerateSlug')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-slug" className="text-sm font-medium text-foreground cursor-pointer">
                    Auto Generate Slugs
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Auto generate friendly URL slugs (e.g. for events/clubs).</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-relations"
                    checked={options.autoCreateRelations}
                    onChange={() => handleOptionChange('autoCreateRelations')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-relations" className="text-sm font-medium text-foreground cursor-pointer">
                    Auto Create Missing Relations
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Automatically register referenced clubs, judges, or albums if missing.</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-empty"
                    checked={options.ignoreEmptyRows}
                    onChange={() => handleOptionChange('ignoreEmptyRows')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-empty" className="text-sm font-medium text-foreground cursor-pointer">
                    Ignore Empty Rows
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Skip empty rows in Excel sheets without generating warning labels.</span>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="opt-warnings"
                    checked={options.continueOnWarnings}
                    onChange={() => handleOptionChange('continueOnWarnings')}
                    className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground/50"
                  />
                  <label htmlFor="opt-warnings" className="text-sm font-medium text-foreground cursor-pointer">
                    Continue on Warnings
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">Allow database import even if warnings (like missing clubs) are present.</span>
                  </label>
                </div>
              </div>

              {/* Upload Trigger */}
              <div className="border-t border-border pt-4">
                <button 
                  onClick={handleValidate}
                  disabled={loading || !file}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm font-bold bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md"
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Upload & Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PREVIEW PRE-IMPORT */}
        {step === 'preview' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Statistics Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-5 rounded-2xl flex flex-col">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Total Records</span>
                <span className="text-3xl font-extrabold text-foreground mt-1">{stats.total}</span>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-5 rounded-2xl flex flex-col">
                <span className="text-xs text-emerald-500 font-semibold uppercase">Ready</span>
                <span className="text-3xl font-extrabold text-emerald-500 mt-1">{stats.valid}</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/25 p-5 rounded-2xl flex flex-col">
                <span className="text-xs text-amber-500 font-semibold uppercase">Warnings</span>
                <span className="text-3xl font-extrabold text-amber-500 mt-1">{stats.warnings}</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/25 p-5 rounded-2xl flex flex-col">
                <span className="text-xs text-rose-500 font-semibold uppercase">Invalid</span>
                <span className="text-3xl font-extrabold text-rose-500 mt-1">{stats.invalid}</span>
              </div>
            </div>

            {/* PREVIEW FILTER TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background border border-border p-4 rounded-xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search parsed rows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border focus:border-border rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Status Filter:
                </span>
                <div className="flex border border-border rounded-xl bg-card overflow-hidden">
                  <button 
                    onClick={() => setStatusFilter('all')} 
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-[#111827] text-white dark:bg-white dark:text-[#111827]' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter('ready')} 
                    className={`px-3 py-1.5 text-xs font-bold border-l border-border transition-colors ${statusFilter === 'ready' ? 'bg-emerald-500 text-slate-900' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    Ready
                  </button>
                  <button 
                    onClick={() => setStatusFilter('warning')} 
                    className={`px-3 py-1.5 text-xs font-bold border-l border-border transition-colors ${statusFilter === 'warning' ? 'bg-amber-500 text-slate-900' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    Warning
                  </button>
                  <button 
                    onClick={() => setStatusFilter('invalid')} 
                    className={`px-3 py-1.5 text-xs font-bold border-l border-border transition-colors ${statusFilter === 'invalid' ? 'bg-rose-500 text-slate-100' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    Invalid
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW TABLE (DARK THEME) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800">
                <h3 className="font-bold text-slate-100 text-lg">Parsed Master Data Grid</h3>
                <p className="text-xs text-slate-400">Validate relational bindings and verify column errors before committing updates to the live database.</p>
              </div>

              <div className="overflow-x-auto max-h-[450px]">
                <table className="min-w-full text-slate-300 divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-4 w-16 text-center">Row</th>
                      <th className="p-4 w-28">Status</th>
                      <th className="p-4">Mapped Record Details</th>
                      <th className="p-4 w-96">Validations & Execution Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRows.length > 0 ? (
                      filteredRows.map((row) => (
                        <tr key={row.rowNumber} className="hover:bg-slate-800/40 transition-all">
                          <td className="p-4 text-center font-semibold text-slate-500">{row.rowNumber}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              row.status === 'Ready' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : row.status === 'Warning'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {renderDynamicDataFields(row)}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {row.errors.map((e, idx) => (
                                <p key={idx} className="text-xs text-rose-400 flex items-start gap-1">
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                                  <span className="whitespace-pre-line">{e}</span>
                                </p>
                              ))}
                              {row.warnings.map((w, idx) => (
                                <p key={idx} className="text-xs text-amber-400 flex items-start gap-1">
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                  <span>{w}</span>
                                </p>
                              ))}
                              {row.errors.length === 0 && row.warnings.length === 0 && (
                                <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Valid & Ready</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">No records matched the filter query.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="sticky bottom-4 z-30 flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-xl">
              <button 
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-card border border-border hover:bg-accent text-foreground transition-all"
              >
                Back to Upload
              </button>

              <button 
                onClick={handleCommit}
                disabled={loading || (stats.invalid > 0 && !options.continueOnWarnings)}
                className="px-6 py-2.5 text-sm font-bold bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing SQL Transactions...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Commit Database Import
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SUCCESS REPORT */}
        {step === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-card border border-border p-8 rounded-3xl shadow-xl text-center space-y-6"
          >
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Import Executed Successfully</h2>
              <p className="text-sm text-muted-foreground">The master database has been updated safely inside chunk transactions with rollback support.</p>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-accent/40 border border-border rounded-2xl">
              <div>
                <span className="block text-2xl font-extrabold text-foreground">{importSummary.total}</span>
                <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Rows</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-emerald-500">{importSummary.imported}</span>
                <span className="text-[11px] font-bold text-emerald-500 uppercase">Imported</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-amber-500">{importSummary.skipped}</span>
                <span className="text-[11px] font-bold text-amber-500 uppercase">Skipped</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-rose-500">{importSummary.failed}</span>
                <span className="text-[11px] font-bold text-rose-500 uppercase">Failed</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-border">
              <button 
                onClick={() => handleDownload(`/bulk-upload/report/${reportId}`, `import_execution_report_${reportId}.xlsx`)}
                className="px-6 py-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-accent flex items-center justify-center gap-2 font-bold text-sm transition-all"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                Download Execution Report
              </button>
              
              <button 
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#111827] text-white hover:bg-black dark:bg-white dark:text-[#111827] dark:hover:bg-[#F3F4F6] flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md"
              >
                Import New File
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
