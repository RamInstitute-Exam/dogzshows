'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  UploadCloud, FileJson, Loader2, ArrowLeft, CheckCircle2, AlertCircle,
  X, Download, Eye, EyeOff, ChevronRight, Database, Users, AlertTriangle,
  FileText, RotateCcw, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

type ImportStage = 'idle' | 'preview' | 'importing' | 'done';

interface JudgeRecord {
  fullName?: string;
  name?: string;
  specialization?: string;
  description?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  status?: string;
  [key: string]: any;
}

interface ImportResult {
  success: boolean;
  totalImported: number;
  skipped: number;
  failed: number;
  failedRecords: { record: any; error: string }[];
  backupCount: number;
  backupTimestamp: string;
  message: string;
  existingDeleted: boolean;
}

const TEMPLATE: JudgeRecord[] = [
  {
    fullName: 'Mr. Sample Judge',
    title: 'Mr.',
    description: 'ALL BREEDS',
    address: '123, Sample Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    zipcode: '600001',
    phone: '044-2220000',
    mobile: '9000000000',
    email: 'judge@example.com',
    specialization: 'ALL BREEDS',
    status: 'ACTIVE',
    featured: false,
    biography: '',
    profileImage: '',
    experience: '10 years',
    certifications: '',
    slug: 'mr-sample-judge'
  }
];

function validateRecord(r: JudgeRecord): string[] {
  const errors: string[] = [];
  const name = r.fullName || r.name || '';
  if (!name.trim()) errors.push('Name is required');
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) errors.push('Invalid email format');
  return errors;
}

export default function BulkUploadJudges() {
  const [stage, setStage] = useState<ImportStage>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<JudgeRecord[]>([]);
  const [parseErrors, setParseErrors] = useState<{ index: number; errors: string[] }[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template download
  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(TEMPLATE, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kci_judges_template.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  // Download error report
  const handleDownloadErrorReport = () => {
    if (!importResult?.failedRecords?.length) return;
    const headers = ['Name', 'Email', 'City', 'Error'];
    const rows = importResult.failedRecords.map(f => [
      f.record.fullName || f.record.name || '',
      f.record.email || '',
      f.record.city || '',
      f.error
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.info('Error report downloaded');
  };

  const parseFile = useCallback((file: File) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Only .json files are supported. Download the template first.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!Array.isArray(json)) {
          toast.error('JSON must be an array of judge objects.');
          return;
        }
        const errors: { index: number; errors: string[] }[] = [];
        json.forEach((record, i) => {
          const errs = validateRecord(record);
          if (errs.length) errors.push({ index: i, errors: errs });
        });
        setParsedRecords(json);
        setParseErrors(errors);
        setStage('preview');
        toast.success(`${json.length} records parsed. ${errors.length} validation warnings.`);
      } catch (err: any) {
        toast.error('Failed to parse JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) parseFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.[0]) parseFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!parsedRecords.length) return;
    setStage('importing');
    setProgress(0);

    // Simulate progress steps
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 3, 90));
    }, 300);

    try {
      const res = await api.post('/judges/bulk-import', {
        replaceExisting,
        judges: parsedRecords
      });
      clearInterval(progressInterval);
      setProgress(100);
      if (res.success) {
        setImportResult(res);
        setStage('done');
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Import failed');
        setStage('preview');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      toast.error('Import error: ' + err.message);
      setStage('preview');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setParsedRecords([]);
    setParseErrors([]);
    setImportResult(null);
    setProgress(0);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const invalidIndices = useMemo(() => new Set(parseErrors.map(e => e.index)), [parseErrors]);

  const filteredRecords = useMemo(() => {
    let recs = parsedRecords.map((r, i) => ({ ...r, _index: i, _hasError: invalidIndices.has(i) }));
    if (showFailedOnly) recs = recs.filter(r => r._hasError);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      recs = recs.filter(r =>
        (r.fullName || r.name || '').toLowerCase().includes(q) ||
        (r.city || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q)
      );
    }
    return recs;
  }, [parsedRecords, showFailedOnly, searchQuery, invalidIndices]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card px-6 py-4 rounded-2xl border border-border shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/admin/judges">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Database className="w-6 h-6 text-brand-orange" />
              Bulk Judge Import
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Upload KCI judge data via JSON. Supports replace, validation & error reporting.
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleDownloadTemplate} variant="outline" className="px-5 py-2.5 rounded-xl border-blue-500/30 text-blue-500 hover:bg-blue-500/10 font-bold">
            <FileJson className="w-4 h-4 mr-2" /> Template
          </Button>
          {stage !== 'idle' && (
            <Button onClick={handleReset} variant="outline" className="px-5 py-2.5 rounded-xl font-bold">
              <RotateCcw className="w-4 h-4 mr-2" /> Start Over
            </Button>
          )}
        </div>
      </div>

      {/* STAGE: IDLE — Drop Zone */}
      {stage === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Drop Zone */}
          <div className="lg:col-span-3">
            <div
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all flex flex-col items-center justify-center min-h-[420px] cursor-pointer ${
                dragActive
                  ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]'
                  : 'border-border bg-card hover:border-brand-orange/50 hover:bg-accent/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleChange} />
              <div className="w-24 h-24 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20">
                <UploadCloud className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-2">Drop JSON File Here</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                Accepts .json format. Max 5MB. Array of judge objects.
              </p>
              <Button className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20 pointer-events-none">
                Browse Files
              </Button>
            </div>
          </div>

          {/* Instructions + Settings */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex-1">
              <h3 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-orange" /> Import Guide
              </h3>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-4">
                <li>Download the JSON template using the <strong>Template</strong> button.</li>
                <li>Populate all 28 KCI judge records into the JSON array.</li>
                <li>Each record needs at minimum a <strong>fullName</strong> field.</li>
                <li>Ensure all <strong>emails are unique</strong> across the batch.</li>
                <li>Upload the file — a preview will appear for validation.</li>
                <li>Review warnings, then click <strong>Import</strong> to proceed.</li>
              </ol>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-foreground mb-4">Import Settings</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setReplaceExisting(!replaceExisting)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors cursor-pointer ${
                    replaceExisting ? 'bg-brand-orange border-brand-orange' : 'border-border'
                  }`}
                >
                  {replaceExisting && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <span className="text-foreground font-semibold text-sm">Replace all existing judges</span>
                  <p className="text-muted-foreground text-xs mt-1">Deletes all current judge records and their login accounts before importing new data.</p>
                </div>
              </label>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-600">
                <strong>Warning:</strong> Replace mode permanently removes all existing judge records before importing. This action cannot be undone from the UI.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: PREVIEW */}
      {stage === 'preview' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Records', value: parsedRecords.length, color: 'text-foreground', bg: 'bg-card' },
              { label: 'Valid Records', value: parsedRecords.length - parseErrors.length, color: 'text-green-500', bg: 'bg-green-500/5' },
              { label: 'Warnings', value: parseErrors.length, color: 'text-orange-500', bg: 'bg-orange-500/5' },
              { label: 'Replace Mode', value: replaceExisting ? 'ON' : 'OFF', color: replaceExisting ? 'text-red-500' : 'text-blue-500', bg: 'bg-card' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-border p-4`}>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{s.label}</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Validation Warnings */}
          {parseErrors.length > 0 && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-orange-500 font-bold mb-3">
                <AlertCircle className="w-5 h-5" />
                {parseErrors.length} Validation Warning{parseErrors.length > 1 ? 's' : ''} (records will be skipped)
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {parseErrors.map(e => (
                  <div key={e.index} className="text-sm text-orange-600 flex gap-2">
                    <span className="font-bold">Row {e.index + 1}:</span>
                    <span>{e.errors.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table Controls */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-b border-border">
              <h3 className="font-extrabold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-orange" /> Preview ({filteredRecords.length} shown)
              </h3>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground w-44 outline-none focus:ring-2 focus:ring-brand-orange"
                />
                <button
                  onClick={() => setShowFailedOnly(!showFailedOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    showFailedOnly ? 'bg-orange-500 text-white border-orange-500' : 'border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" /> Warnings Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-card border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Specialization</th>
                    <th className="px-4 py-3 font-semibold">City / State</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Valid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredRecords.map((rec) => (
                    <tr key={rec._index} className={`hover:bg-accent/50 transition-colors ${rec._hasError ? 'bg-orange-500/5' : ''}`}>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{rec._index + 1}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{rec.fullName || rec.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{rec.specialization || rec.description || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{[rec.city, rec.state].filter(Boolean).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{rec.email || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-muted-foreground'
                        }`}>{rec.status || 'ACTIVE'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {rec._hasError
                          ? <AlertCircle className="w-4 h-4 text-orange-500" />
                          : <CheckCircle2 className="w-4 h-4 text-green-500" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-card border border-border rounded-2xl p-4">
            <div className="text-sm text-muted-foreground">
              {replaceExisting && (
                <span className="text-red-500 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> All existing judges will be replaced.
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleReset} variant="outline" className="px-6 font-bold">
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button
                onClick={handleImport}
                className="bg-brand-orange hover:bg-orange-600 text-white font-bold px-8 h-11 rounded-xl shadow-lg shadow-orange-500/20"
                disabled={parsedRecords.length - parseErrors.length === 0}
              >
                <ChevronRight className="w-4 h-4 mr-2" />
                Import {parsedRecords.length - parseErrors.length} Judges
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: IMPORTING */}
      {stage === 'importing' && (
        <div className="bg-card rounded-3xl border border-border shadow-xl p-16 flex flex-col items-center justify-center min-h-[500px] text-center">
          <div className="w-28 h-28 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20">
            <Loader2 className="w-14 h-14 animate-spin" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-3">Importing Judges…</h2>
          <p className="text-muted-foreground mb-10 text-lg">Please do not close this page.</p>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm text-muted-foreground mb-2 font-semibold">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-accent rounded-full h-3 overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Processing {parsedRecords.length} records…</p>
          </div>
        </div>
      )}

      {/* STAGE: DONE */}
      {stage === 'done' && importResult && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-card rounded-3xl border border-border shadow-xl p-12 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl ${
              importResult.failed === 0 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
            }`}>
              {importResult.failed === 0
                ? <CheckCircle2 className="w-12 h-12" />
                : <AlertCircle className="w-12 h-12" />
              }
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-2">
              {importResult.failed === 0 ? 'Import Complete!' : 'Import Finished with Issues'}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">{importResult.message}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-3xl mb-10">
              {[
                { label: 'Imported', value: importResult.totalImported, color: 'text-green-500' },
                { label: 'Skipped', value: importResult.skipped, color: 'text-blue-500' },
                { label: 'Failed', value: importResult.failed, color: 'text-red-500' },
                { label: 'Backup Saved', value: importResult.backupCount, color: 'text-purple-500' },
                { label: 'Mode', value: importResult.existingDeleted ? 'Replace' : 'Append', color: 'text-brand-orange' },
              ].map(s => (
                <div key={s.label} className="bg-accent/50 p-4 rounded-2xl border border-border text-left">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">{s.label}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/admin/judges">
                <Button className="bg-foreground hover:bg-foreground/90 text-background font-bold px-8 h-12 rounded-xl">
                  <Users className="w-4 h-4 mr-2" /> View Judges
                </Button>
              </Link>
              {importResult.failed > 0 && (
                <Button onClick={handleDownloadErrorReport} variant="outline" className="px-6 h-12 rounded-xl font-bold text-red-500 border-red-500/30 hover:bg-red-500/10">
                  <Download className="w-4 h-4 mr-2" /> Error Report (.csv)
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="px-6 h-12 rounded-xl font-bold">
                <RotateCcw className="w-4 h-4 mr-2" /> New Import
              </Button>
            </div>
          </div>

          {/* Failed Records Detail */}
          {importResult.failed > 0 && (
            <div className="bg-card rounded-2xl border border-red-500/20 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-extrabold text-foreground">Failed Records ({importResult.failed})</h3>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-card border-b border-border text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {importResult.failedRecords.map((f, i) => (
                      <tr key={i} className="hover:bg-accent/30">
                        <td className="px-4 py-3 font-semibold text-foreground">{f.record.fullName || f.record.name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{f.record.email || '—'}</td>
                        <td className="px-4 py-3 text-red-500 text-xs font-medium">{f.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
