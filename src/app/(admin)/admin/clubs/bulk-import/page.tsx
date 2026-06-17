"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, FileJson, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function BulkImportClubsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data');
      return;
    }

    let parsedData = [];
    try {
      parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData)) {
        toast.error('Data must be a JSON array of objects');
        return;
      }
    } catch (e) {
      toast.error('Invalid JSON format');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/clubs/bulk-upload', parsedData);
      if (res?.success) {
        toast.success('Clubs imported successfully!');
        router.push('/admin/clubs');
      } else {
        toast.error(res?.message || 'Failed to import clubs');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'An error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = [
    {
      "name": "Madras Canine Club",
      "slug": "madras-canine-club",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "president": "Mr. C.V. Sudarsan",
      "email": "madrascanineclub@gmail.com",
      "registrationNumber": "KCI-MCC-01"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight">Bulk Import Clubs</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileJson className="w-5 h-5 text-brand-orange" />
              Paste JSON Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Paste an array of JSON objects containing club details. This action will clear the existing clubs table and replace it.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "name": "Club Name",\n    "city": "City"\n  }\n]`}
              className="w-full h-[400px] p-4 font-mono text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all outline-none"
            />
            
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={loading || !jsonInput.trim()}
                className="bg-brand-orange hover:bg-[#E88C05] text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Supported fields in the JSON object:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><code className="text-brand-orange">name</code> (required)</li>
                <li><code className="text-brand-orange">slug</code> (optional, auto-generated)</li>
                <li><code className="text-brand-orange">city</code></li>
                <li><code className="text-brand-orange">state</code></li>
                <li><code className="text-brand-orange">country</code></li>
                <li><code className="text-brand-orange">president</code></li>
                <li><code className="text-brand-orange">secretary</code></li>
                <li><code className="text-brand-orange">email</code></li>
                <li><code className="text-brand-orange">phone</code></li>
                <li><code className="text-brand-orange">registrationNumber</code></li>
              </ul>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-semibold mb-2 text-foreground">Sample Format:</p>
              <pre className="text-xs p-3 bg-accent rounded-lg overflow-x-auto text-muted-foreground border border-border">
                {JSON.stringify(sampleJson, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
