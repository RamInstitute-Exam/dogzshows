"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { UploadCloud, X, Crop as CropIcon, Check, Loader2, Image as ImageIcon, Trash2, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import api from "@/lib/api";
import OptimizedImage from '@/components/shared/OptimizedImage';

interface ImageUploaderProps {
  currentImage?: string;
  onUploadSuccess?: (url: string, payload?: any) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  folder?: string;
  label?: string;
  aspectRatio?: number;
  helpText?: string;
  dropzoneClassName?: string;
  previewClassName?: string;
  imageClassName?: string;
  highResolution?: boolean;
  enableCropping?: boolean;
}

export default function ImageUploader({
  currentImage,
  onUploadSuccess,
  onRemove,
  maxSizeMB = 50,
  folder = "general",
  label = "Image",
  aspectRatio = 1,
  helpText = "PNG, JPG, WEBP. Maximum Size: 50 MB",
  dropzoneClassName,
  previewClassName,
  imageClassName,
  highResolution = false,
  enableCropping = true,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Crop State
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);
  const [currentAspect, setCurrentAspect] = useState<number>(aspectRatio || 1);
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
      
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      
      const objectUrl = URL.createObjectURL(selectedFile);
      blobUrlRef.current = objectUrl;
      setFile(selectedFile);
      setPreview(objectUrl);
      
      if (enableCropping) {
        setIsCropping(true);
      } else {
        handleUpload(selectedFile);
      }
    }
  }, [enableCropping]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false
  });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any, fileName: string): Promise<File> => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    await new Promise(resolve => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = highResolution ? pixelCrop.width : 600;
    canvas.height = highResolution ? pixelCrop.height : Math.round(600 / aspectRatio);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const fileType = highResolution ? 'image/png' : 'image/jpeg';
    const fileExtension = highResolution ? '.png' : '.jpg';

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const croppedFile = new File(
          [blob], 
          fileName.replace(/\.[^/.]+$/, "") + fileExtension, 
          { type: fileType, lastModified: Date.now() }
        );
        resolve(croppedFile);
      }, fileType, highResolution ? 1.0 : 0.95);
    });
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !file || !preview) return;
    
    setIsUploading(true);
    setError(null);
    try {
      const croppedFile = await getCroppedImg(preview, croppedAreaPixels, file.name);
      
      if (!highResolution && croppedFile.size > 500 * 1024) {
        // further compress if larger than 500kb
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 600,
          useWebWorker: true,
          initialQuality: 0.9,
        };
        const compressedFile = await imageCompression(croppedFile, options);
        setFile(compressedFile);
        handleUpload(compressedFile);
      } else {
        setFile(croppedFile);
        handleUpload(croppedFile);
      }
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      setError("Unable to crop image. Please try again.");
      setIsUploading(false);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
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
        setPreview(response.url); 
        if (onUploadSuccess) onUploadSuccess(response.url, response);
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
            ${isDragActive ? 'border-border bg-foreground/5' : 'border-border bg-card/50 hover:bg-card hover:border-border/50'}
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

      {/* Cropper Modal View */}
      {preview && isCropping && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card w-[95vw] max-w-[1200px] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
              <div>
                <h4 className="font-bold text-lg text-foreground">Crop Image</h4>
                <p className="text-sm text-muted-foreground">Adjust the image to fit the required aspect ratio.</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsCropping(false);
                  handleRemove();
                }}
                className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative w-full h-[75vh] min-h-[500px] max-h-[800px] bg-black">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={currentAspect}
                minZoom={0.2}
                restrictPosition={false}
                onCropChange={setCrop}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                onZoomChange={setZoom}
                onMediaLoaded={(mediaSize) => {
                  const ratio = mediaSize.width / mediaSize.height;
                  setOriginalAspect(ratio);
                }}
                showGrid={true}
              />
            </div>
            
            <div className="p-5 border-t border-border bg-muted/10 space-y-5">
              <div className="flex items-center space-x-4 max-w-md mx-auto">
                <ZoomOut className="w-5 h-5 text-muted-foreground" />
                <input
                  type="range"
                  value={zoom}
                  min={0.2}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                />
                <ZoomIn className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); }}
                  className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCropping(false);
                    handleRemove();
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Ratios & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border/50">
                  <button 
                    type="button"
                    onClick={() => setCurrentAspect(aspectRatio || 1)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentAspect === aspectRatio ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Portrait Form
                  </button>
                  <button 
                    type="button"
                    onClick={() => { if(originalAspect) setCurrentAspect(originalAspect); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${currentAspect === originalAspect ? 'bg-foreground text-background shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Original Ratio
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (file) {
                        setIsCropping(false);
                        handleUpload(file);
                      }
                    }}
                    disabled={isUploading}
                    className="px-5 py-2.5 text-sm font-bold text-muted-foreground bg-card border border-border hover:bg-accent rounded-xl transition-colors disabled:opacity-70"
                  >
                    Skip Cropping
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={isUploading}
                    className="px-6 py-2.5 text-sm font-bold bg-foreground text-white rounded-xl flex items-center space-x-2 hover:bg-foreground shadow-lg shadow-black/20 transition-all disabled:opacity-70"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing image...</span></>
                    ) : (
                      <><CropIcon className="w-4 h-4" /><span>Apply & Upload</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview View */}
      {preview && !isCropping && (
        <div className={previewClassName || "relative group rounded-xl overflow-hidden border border-border bg-card inline-block"}>
          <div className={previewClassName ? "w-full h-full" : "w-[180px] h-[180px] rounded-[24px] overflow-hidden border-[3px] border-[#1f2937] bg-[#f8fafc] shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-center p-0"}>
            <OptimizedImage 
              src={preview} 
              alt="Preview" 
              className={imageClassName || "w-full h-full object-cover object-center"}
            />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3">
            {!isUploading && (
              <div className="flex flex-col space-y-3">
                <div {...getRootProps()} className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full transition flex items-center text-xs font-bold" title="Replace Image">
                   <input {...getInputProps()} />
                   <UploadCloud className="w-4 h-4 mr-1.5" /> Change Photo
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="bg-red-500/80 hover:bg-red-500 backdrop-blur-sm text-white px-3 py-1.5 rounded-full transition flex items-center text-xs font-bold"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-[24px]">
              <div className="flex items-center justify-between text-white text-xs mb-2">
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground transition-all duration-300"
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
        <p className="text-sm text-red-500 flex items-center mt-2 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <X className="w-4 h-4 mr-1.5" />
          {error}
        </p>
      )}
    </div>
  );
}
