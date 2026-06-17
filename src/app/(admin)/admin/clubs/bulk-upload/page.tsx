'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  UploadCloud, FileJson, Loader2, ArrowLeft, CheckCircle2, AlertCircle,
  X, Download, Eye, EyeOff, ChevronRight, Database, Users, AlertTriangle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/services/api';

interface ParsedClub {
  clubName: string;
  secretaryName: string;
  designation: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  phone: string;
  mobile: string;
  fax: string;
  email: string | string[];
  website: string;
  description: string;
  logo: string;
  banner: string;
  status: string;
  featured: boolean;
  slug: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export default function BulkUploadClubsPage() {
  const router = useRouter();

  // States
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedClub[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // UI States
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON file
  const handleFileUpload = (selectedFile: File) => {
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();

    if (fileType !== 'json' && fileType !== 'csv') {
      toast.error('Only JSON and CSV files are currently supported.');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (fileType === 'json') {
          const data = JSON.parse(content);
          if (!Array.isArray(data)) {
            throw new Error('JSON file must contain an array of clubs.');
          }
          setParsedData(data);
          toast.success(`Successfully parsed ${data.length} records.`);
        } else if (fileType === 'csv') {
          // Basic CSV Parsing
          const rows = content.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          const data = [];
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            const values = rows[i].split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            data.push(obj);
          }
          setParsedData(data);
          toast.success(`Successfully parsed ${data.length} records from CSV.`);
        }
      } catch (err: any) {
        toast.error('Failed to parse file: ' + err.message);
        setFile(null);
        setParsedData([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
      setIsParsing(false);
    };

    reader.readAsText(selectedFile);
  };

  // Drag & Drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  // Validation Logic
  const validateRecord = (record: ParsedClub): ValidationResult => {
    const errors: string[] = [];
    if (!record.clubName && !(record as any).name) errors.push('Club Name is required');

    // Check email structure if exists
    if (record.email) {
      const emailStr = Array.isArray(record.email) ? record.email[0] : record.email;
      if (emailStr && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
        errors.push('Invalid email format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validationStats = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    parsedData.forEach(record => {
      if (validateRecord(record).isValid) valid++;
      else invalid++;
    });
    return { valid, invalid, total: parsedData.length };
  }, [parsedData]);

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    if (validationStats.invalid > 0) {
      const confirm = window.confirm(`${validationStats.invalid} records have validation errors and might fail. Do you want to proceed?`);
      if (!confirm) return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Initial progress

    try {
      // Simulate progress for UI
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/clubs/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsedData)
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        setUploadResult(data);
        toast.success(data.message || 'Import successful!');
      } else {
        throw new Error(data.message || 'Import failed');
      }
    } catch (error: any) {
      toast.error(error.message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sample = [
      {
        "clubName": "AMRITSAR KENNEL CLUB",
        "secretaryName": "MR AGAMJIT SINGH",
        "designation": "Hony Secretary",
        "address": "53, Kennedy Avenue",
        "city": "Amritsar",
        "state": "Punjab",
        "country": "India",
        "zipcode": "",
        "phone": "",
        "mobile": "9814242424",
        "fax": "",
        "email": [
          "asrkennelclub@gmail.com",
          "agam24@gmail.com"
        ],
        "website": "",
        "description": "",
        "logo": "",
        "banner": "",
        "status": "ACTIVE",
        "featured": false,
        "slug": "amritsar-kennel-club"
      }
    ];

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "kci_clubs_sample.json");
    dlAnchorElem.click();
  };

  const downloadErrorReport = () => {
    if (!uploadResult?.errors || uploadResult.errors.length === 0) return;

    // Create CSV content
    let csvContent = "Row,Club Name,Reason\n";
    uploadResult.errors.forEach((err: any) => {
      // Escape commas and quotes for CSV
      const escape = (str: string) => `"${(str || '').toString().replace(/"/g, '""')}"`;
      csvContent += `${err.row},${escape(err.clubName)},${escape(err.reason)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "club_import_errors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/admin/clubs" className="hover:text-white transition-colors">Clubs</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Bulk Upload</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-500" />
            Bulk Upload Clubs
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Import official KCI clubs via JSON or CSV. This will backup and replace all current dummy clubs.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/clubs"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clubs
          </Link>
          <button
            onClick={downloadSampleTemplate}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
          >
            <Download className="w-4 h-4" />
            Sample JSON
          </button>
        </div>
      </div>

      {/* --- Step 1: Upload Zone --- */}
      {!file && !uploadResult && (
        <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging
              ? 'border-brand-500 bg-brand-500/10'
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
              }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-brand-500' : 'text-gray-500'}`} />
            <h3 className="text-xl font-bold text-white mb-2">Drag & Drop your file here</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Support for JSON and CSV files. Make sure your file follows the official KCI Club schema.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              accept=".json,.csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
              {isParsing ? 'Parsing...' : 'Browse Files'}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Auto-slug generation
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Duplicate detection
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Safe Backup
            </div>
          </div>
        </div>
      )}

      {/* --- Step 2: Uploading Progress --- */}
      {isUploading && (
        <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
            <div
              className="h-full bg-brand-500 transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Importing Clubs...</h2>
            <p className="text-gray-400 mb-8">
              Please don't close this window. We are processing {validationStats.total} records, cleaning old data, and mapping KCI clubs securely.
            </p>

            <div className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm font-medium">Progress</span>
              <span className="text-white font-bold">{uploadProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* --- Step 3: Success/Result Report --- */}
      {uploadResult && !isUploading && (
        <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-gray-800">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${uploadResult.errors?.length === 0 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
              }`}>
              {uploadResult.errors?.length === 0 ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Import Completed</h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              {uploadResult.message}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-800 border-b border-gray-800">
            <div className="p-6 text-center bg-green-500/5">
              <div className="text-4xl font-bold text-green-500 mb-1">{uploadResult.imported || 0}</div>
              <div className="text-sm font-medium text-gray-400">Successfully Imported</div>
            </div>
            <div className="p-6 text-center bg-yellow-500/5">
              <div className="text-4xl font-bold text-yellow-500 mb-1">{uploadResult.duplicates || 0}</div>
              <div className="text-sm font-medium text-gray-400">Duplicates Skipped</div>
            </div>
            <div className="p-6 text-center bg-red-500/5">
              <div className="text-4xl font-bold text-red-500 mb-1">{uploadResult.failed || 0}</div>
              <div className="text-sm font-medium text-gray-400">Failed Records</div>
            </div>
          </div>

          <div className="p-8 flex items-center justify-center gap-4">
            <Link
              href="/admin/clubs"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20"
            >
              View All Clubs
            </Link>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <button
                onClick={downloadErrorReport}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 border border-gray-700"
              >
                <Download className="w-5 h-5" />
                Download Error Report
              </button>
            )}

            <button
              onClick={clearFile}
              className="px-6 py-3 bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl font-medium transition-colors"
            >
              Import More
            </button>
          </div>

          {/* Failed Records Detail Table */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="border-t border-gray-800 bg-gray-900/50">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-white">Failed Records Log</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800/50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-gray-400 font-medium">Row</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Club Name</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Error Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {uploadResult.errors.map((err: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-800/20">
                        <td className="px-6 py-3 text-gray-300">#{err.row}</td>
                        <td className="px-6 py-3 text-white font-medium">{err.clubName}</td>
                        <td className="px-6 py-3 text-red-400">{err.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- Step 1b: Data Preview --- */}
      {file && parsedData.length > 0 && !isUploading && !uploadResult && (
        <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
          {/* Preview Header */}
          <div className="p-4 md:p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white text-lg">{file.name}</h3>
                  <button onClick={clearFile} className="p-1 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-red-400 transition-colors" title="Remove file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {validationStats.total} Total Records
                  </span>
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {validationStats.valid} Valid
                  </span>
                  {validationStats.invalid > 0 && (
                    <span className="text-yellow-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validationStats.invalid} Warnings
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
              >
                {showPreview ? <><EyeOff className="w-4 h-4" /> Hide Preview</> : <><Eye className="w-4 h-4" /> Show Preview</>}
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
              >
                Import {validationStats.total} Clubs
              </button>
            </div>
          </div>

          {/* Preview Table */}
          {showPreview && (
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">Club Name</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">Secretary</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">City</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">State</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">Mobile</th>
                    <th className="px-6 py-4 text-gray-400 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {parsedData.slice(0, 100).map((record, index) => {
                    const validation = validateRecord(record);
                    const email = Array.isArray(record.email) ? record.email[0] : record.email;

                    return (
                      <tr key={index} className={`hover:bg-gray-800/30 transition-colors ${!validation.isValid ? 'bg-red-500/5' : ''}`}>
                        <td className="px-6 py-3">
                          {validation.isValid ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md w-fit cursor-help" title={validation.errors.join(', ')}>
                              <AlertCircle className="w-3 h-3" /> Warning
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-white">{record.clubName || (record as any).name || '-'}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-300">{record.secretaryName || record.secretaryName || '-'}</td>
                        <td className="px-6 py-3 text-gray-300">{record.city || '-'}</td>
                        <td className="px-6 py-3 text-gray-300">{record.state || '-'}</td>
                        <td className="px-6 py-3 text-gray-300">{record.mobile || record.phone || '-'}</td>
                        <td className="px-6 py-3 text-gray-300">{email || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {parsedData.length > 100 && (
                <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-800">
                  Showing first 100 of {parsedData.length} records.
                </div>
              )}
            </div>
          )}
          {!showPreview && (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
              <EyeOff className="w-12 h-12 opacity-50" />
              <p>Preview is hidden. Click "Show Preview" to view the table.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
