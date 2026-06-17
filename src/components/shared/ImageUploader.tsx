"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import imageCompression from "browser-image-compression";
import { UploadCloud, X, Crop as CropIcon, Check, Loader2, Image as ImageIcon, Trash2, Maximize2 } from "lucide-react";
import api from "@/lib/api";

interface ImageUploaderProps {
  currentImage?: string;
  onUploadSuccess?: (url: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  folder?: string; // used to send specific folder to backend if backend supports it
  label?: string;
  aspectRatio?: number; // e.g. 1 for square, 16/9 for banner
  helpText?: string;
  dropzoneClassName?: string;
  previewClassName?: string;
  imageClassName?: string;
}

export default function ImageUploader({
  currentImage,
  onUploadSuccess,
  onRemove,
  maxSizeMB = 10,
  folder = "general",
  label = "Image",
  aspectRatio,
  helpText = "PNG, JPG, WEBP. Maximum Size: 10 MB",
  dropzoneClassName,
  previewClassName,
  imageClassName,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Crop State
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const blobUrlRef = useRef<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      const msg = fileRejections[0].errors[0].message;
      setError(`Upload failed: ${msg}`);
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Cleanup previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      
      const objectUrl = URL.createObjectURL(selectedFile);
      blobUrlRef.current = objectUrl;
      setFile(selectedFile);
      setPreview(objectUrl);
      
      // If aspectRatio is provided, open cropper by default
      if (aspectRatio) {
        setIsCropping(true);
      } else {
        // Proceed to direct upload
        handleUpload(selectedFile);
      }
    }
  }, [aspectRatio]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height
        ),
        width,
        height
      );
      setCrop(crop);
    }
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<File> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
        resolve(croppedFile);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleApplyCrop = async () => {
    try {
      if (imgRef.current && completedCrop?.width && completedCrop?.height && file) {
        const croppedFile = await getCroppedImg(imgRef.current, completedCrop, file.name);
        setFile(croppedFile);
        setIsCropping(false);
        handleUpload(croppedFile);
      } else {
        setIsCropping(false);
        if (file) handleUpload(file);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to crop image.");
      setIsCropping(false);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Compress Image
      let finalFile = fileToUpload;
      if (!fileToUpload.type.includes('svg')) {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        finalFile = await imageCompression(fileToUpload, options);
      }

      // 2. Upload to S3 via backend API
      const formData = new FormData();
      formData.append('file', finalFile);
      if (folder) formData.append('folder', folder);

      const response = await api.post('/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      if (response?.success && response?.url) {
        
        setUploadProgress(100);
        setPreview(response.url); // Bind uploaded S3 url to preview
        
        if (onUploadSuccess) onUploadSuccess(response.url);
        
        // Show success toast
        import('sonner').then(({ toast }) => {
          toast.success('Image uploaded successfully.');
        });
        
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
    setError(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = "";
    }
    
    if (onRemove) onRemove();
  };

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-foreground mb-1">{label}</label>}
      
      {!preview && !isCropping && (
        <div
          {...getRootProps()}
          className={dropzoneClassName || `
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-brand-orange bg-brand-orange/5' : 'border-border bg-card/50 hover:bg-card hover:border-brand-orange/50'}
            ${error ? 'border-red-500 bg-red-500/5' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Drag & Drop Image Here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {helpText}
            </p>
          </div>
        </div>
      )}

      {/* Cropper View */}
      {preview && isCropping && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Crop Image</h4>
            <button 
              type="button"
              onClick={() => setIsCropping(false)}
              className="p-1 hover:bg-muted rounded-full text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex justify-center bg-black/10 rounded-lg overflow-hidden border border-border">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[500px]"
            >
              <img
                ref={imgRef}
                src={preview}
                alt="Crop me"
                onLoad={onImageLoad}
                className="max-h-[500px] w-auto object-contain"
                crossOrigin="anonymous"
              />
            </ReactCrop>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCropping(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-4 py-2 text-sm font-medium bg-brand-orange text-white rounded-lg flex items-center space-x-2 hover:bg-orange-600"
            >
              <CropIcon className="w-4 h-4" />
              <span>Apply & Upload</span>
            </button>
          </div>
        </div>
      )}

      {/* Preview View */}
      {preview && !isCropping && (
        <div className={previewClassName || "relative group rounded-xl overflow-hidden border border-border bg-card"}>
          <div className={previewClassName ? "w-full h-full" : "aspect-video w-full bg-black/5 flex items-center justify-center p-4"}>
            <img 
              src={preview} 
              alt="Preview" 
              className={imageClassName || "max-w-full max-h-[300px] object-contain rounded shadow-sm"}
            />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3">
            {!isUploading && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCropping(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition"
                  title="Crop Image"
                >
                  <CropIcon className="w-5 h-5" />
                </button>
                <div {...getRootProps()} className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition" title="Replace Image">
                   <input {...getInputProps()} />
                   <UploadCloud className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => window.open(preview, '_blank')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition"
                  title="View Full"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white p-2 rounded-full transition"
                  title="Remove Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between text-white text-xs mb-2">
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Uploading to S3...</span>
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-orange transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success State */}
          {!isUploading && uploadProgress === 100 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center mt-2">
          <X className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}
