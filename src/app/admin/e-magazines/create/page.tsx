'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function CreateMagazinePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [edition, setEdition] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('DRAFT');

  // Files
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  // Viewer Settings
  const [enableDownload, setEnableDownload] = useState(true);
  const [enablePrint, setEnablePrint] = useState(true);
  const [enableShare, setEnableShare] = useState(true);
  const [enableZoom, setEnableZoom] = useState(true);
  const [enableFullscreen, setEnableFullscreen] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const [enablePageSound, setEnablePageSound] = useState(true);
  const [enableAutoFlip, setEnableAutoFlip] = useState(false);
  const [enableRtl, setEnableRtl] = useState(false);

  // SEO Settings
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Magazine title is required.');
      return;
    }
    if (!pdfFile) {
      setError('PDF file is required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('edition', edition);
      formData.append('month', month);
      formData.append('year', year);
      formData.append('description', description);
      formData.append('displayOrder', displayOrder);
      formData.append('featured', String(featured));
      formData.append('status', status);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDescription', seoDescription);

      // Files
      formData.append('pdfFile', pdfFile);
      if (coverImage) formData.append('coverImage', coverImage);
      if (bannerImage) formData.append('bannerImage', bannerImage);

      // Viewer Settings
      formData.append('enableDownload', String(enableDownload));
      formData.append('enablePrint', String(enablePrint));
      formData.append('enableShare', String(enableShare));
      formData.append('enableZoom', String(enableZoom));
      formData.append('enableFullscreen', String(enableFullscreen));
      formData.append('enableSearch', String(enableSearch));
      formData.append('enablePageSound', String(enablePageSound));
      formData.append('enableAutoFlip', String(enableAutoFlip));
      formData.append('enableRtl', String(enableRtl));

      const res = await api.post('/magazines', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        alert('Magazine created! PDF rendering and page generation started in the background.');
        router.push('/admin/e-magazines');
      } else {
        setError(res.message || 'Failed to create magazine.');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create magazine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation Row */}
      <div className="flex items-center gap-4">
        <Link href="/admin/e-magazines">
          <Button variant="outline" size="icon" className="h-10 w-10 border-border rounded-xl hover:bg-accent text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create E-Magazine</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Publish a new flipbook publication from a PDF.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 p-4 rounded-xl text-red-500 text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info and Files (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information Card */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-foreground">General Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Magazine Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dog Show Special Edition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Edition</label>
                <input
                  type="text"
                  placeholder="e.g. Annual, June Issue, Vol. 4"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
                >
                  <option value="">Select Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Year</label>
                <input
                  type="number"
                  placeholder="2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Short Description</label>
              <textarea
                rows={4}
                placeholder="Write a brief overview of this magazine issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all resize-none"
              />
            </div>
          </div>

          {/* Upload Section Card */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-foreground">Files Upload</h2>

            {/* PDF Upload (Required) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">PDF Document * (Will auto-render pages)</label>
              <div className="relative border-2 border-dashed border-border hover:border-red-500/50 rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center cursor-pointer bg-background">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => handleFileChange(e, setPdfFile)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <span className="text-sm font-bold text-foreground">
                  {pdfFile ? pdfFile.name : 'Upload PDF Publication'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF files up to 50MB'}
                </span>
              </div>
            </div>

            {/* Custom Cover Image (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Custom Cover Image (Optional)</label>
                <div className="relative border-2 border-dashed border-border hover:border-red-500/50 rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer bg-background h-32">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setCoverImage)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-7 h-7 text-muted-foreground mb-1" />
                  <span className="text-xs font-bold text-foreground truncate max-w-full px-2">
                    {coverImage ? coverImage.name : 'Choose Cover Image'}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Will auto-generate from PDF if left blank
                  </span>
                </div>
              </div>

              {/* Optional Banner Image */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Banner Image (Optional)</label>
                <div className="relative border-2 border-dashed border-border hover:border-red-500/50 rounded-2xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer bg-background h-32">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setBannerImage)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-7 h-7 text-muted-foreground mb-1" />
                  <span className="text-xs font-bold text-foreground truncate max-w-full px-2">
                    {bannerImage ? bannerImage.name : 'Choose Banner Image'}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Header banner for the magazine page
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-foreground">SEO Information</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">SEO Title</label>
              <input
                type="text"
                placeholder="Meta title tags for search results..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">SEO Description</label>
              <textarea
                rows={3}
                placeholder="Meta description summary for search indexes..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Viewer Settings (Span 1) */}
        <div className="space-y-8">
          {/* Configuration Card */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-foreground">Viewer Configurations</h2>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable PDF Download</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Allow readers to save PDF</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableDownload}
                  onChange={(e) => setEnableDownload(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Printing</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Allow readers to print pages</span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePrint}
                  onChange={(e) => setEnablePrint(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Sharing</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Expose copy link/social icons</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableShare}
                  onChange={(e) => setEnableShare(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Zoom Controls</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Enable mouse wheel/pinch zoom</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableZoom}
                  onChange={(e) => setEnableZoom(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Fullscreen</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Open flipbook in fullscreen</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableFullscreen}
                  onChange={(e) => setEnableFullscreen(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Inner Search</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Expose in-page search box</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Page Sounds</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Sound effects on page turn</span>
                </div>
                <input
                  type="checkbox"
                  checked={enablePageSound}
                  onChange={(e) => setEnablePageSound(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enable Auto-Flip</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Automatically cycle pages</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAutoFlip}
                  onChange={(e) => setEnableAutoFlip(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Right-To-Left (RTL)</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Enable RTL flip order</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableRtl}
                  onChange={(e) => setEnableRtl(e.target.checked)}
                  className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Publishing & Sorting Card */}
          <div className="bg-card p-6 rounded-2xl border border-border shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-foreground">Publish Options</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all cursor-pointer"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-foreground">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="px-4 py-3 bg-background border border-border focus:border-red-500 text-foreground rounded-xl outline-none text-sm font-semibold transition-all"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Featured Magazine</span>
                <span className="text-xs text-muted-foreground mt-0.5">Show highlighted on home/listing</span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 accent-red-500 rounded cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Uploading and Creating...
                </>
              ) : (
                'Create Magazine'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
