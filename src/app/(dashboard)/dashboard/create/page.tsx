'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    description: '',
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setError('You can only upload up to 5 photos.');
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
      
      // Create previews
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Free memory
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('breed', formData.breed);
      data.append('age', formData.age);
      data.append('description', formData.description);
      
      files.forEach(file => {
        data.append('photos', file);
      });

      await api.post('/dogs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-muted-foregroundxl font-bold text-foreground">Create Dog Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the details below to create a public profile for a dog.
          </p>
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-card focus:bg-card"
                  placeholder="e.g. Max"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Breed</label>
                <input
                  type="text"
                  name="breed"
                  required
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-card focus:bg-card"
                  placeholder="e.g. Golden Retriever"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Age (years)</label>
              <input
                type="number"
                name="age"
                min="0"
                required
                value={formData.age}
                onChange={handleChange}
                className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-card focus:bg-card"
                placeholder="e.g. 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-card focus:bg-card resize-none"
                placeholder="Tell us about the dog's personality, habits, and ideal home..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Photos (Up to 5)</label>
              
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-2xl hover:bg-card transition-colors relative">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="flex text-sm text-muted-foreground justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={files.length >= 5}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
                </div>
              </div>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square bg-input border border-border">
                      <img src={src} alt="Preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-card/80 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Link
                href="/dashboard"
                className="bg-card text-muted-foreground px-6 py-3 rounded-xl font-medium border border-border hover:bg-card transition-colors mr-4"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-foreground bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

