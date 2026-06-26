import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { ExtractedData } from "../types";
import { ExtractedResults } from "./ExtractedResults";
import { AppData } from "../store";
import { Button } from "./ui/Button";

interface InboxProps {
  onApprove: (data: Partial<AppData>) => void;
  initialFile?: File | null;
  onClearInitialFile?: () => void;
}

export function Inbox({ onApprove, initialFile, onClearInitialFile }: InboxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) processFile(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    if (initialFile && !isAnalyzing) {
      processFile(initialFile);
      if (onClearInitialFile) {
        onClearInitialFile();
      }
    }
  }, [initialFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (isAnalyzing) return; // Prevent duplicate uploads
    
    // Check if it's an image. Sometimes Android returns empty mime type, fallback to checking if it's a file.
    if (file.type && !file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    
    setError(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      // Use fallback mime type if empty
      await analyzeImage(result, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setExtractedData(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image, mimeType }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 overflow-hidden h-full">
      <div className={`${imagePreview ? 'lg:col-span-5' : 'lg:col-span-12'} h-auto lg:h-full flex flex-col flex-shrink-0 lg:flex-shrink overflow-visible lg:overflow-hidden`}>
      <div className="mb-4 hidden">
        <h2 className="text-lg font-medium text-on-background">AI Inbox</h2>
      </div>

      {!imagePreview ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          className={`w-full lg:flex-1 min-h-[300px] lg:min-h-[480px] lg:max-h-[480px] border border-dashed rounded-xl flex flex-col items-center justify-center p-6 md:p-8 transition-all ${
            isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          } ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border-inner bg-surface-elevated hover:bg-surface-hover"
          }`}
        >
          <div className="w-16 h-16 bg-surface-inner rounded-full flex items-center justify-center mb-4 border border-border-inner">
            <UploadCloud size={32} className="text-secondary-text" />
          </div>
          <h3 className="text-lg font-medium text-on-background mb-2">Paste or Drop Image</h3>
          <p className="text-sm text-secondary-text text-center max-w-sm">
            Gemini Vision will automatically extract entities from your screenshot.
          </p>
          <Button variant="secondary" onClick={(e) => { e.stopPropagation(); if(!isAnalyzing) fileInputRef.current?.click(); }} className="mt-6" disabled={isAnalyzing}>
            Select File
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isAnalyzing}
          />
        </div>
      ) : (
          <div className="bg-surface-elevated border border-border-inner h-[200px] lg:h-[480px] rounded-xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden flex-shrink-0 mx-auto w-full lg:max-w-[700px]">
             <img src={imagePreview} alt="Uploaded" className="w-full h-full object-contain" />
             <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                disabled={isAnalyzing}
                className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md"
              >
                Clear
              </Button>
          </div>
      )}
      </div>

      {imagePreview && (
        <div className="lg:col-span-7 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar lg:h-full mt-2 lg:mt-0 pb-24 lg:pb-0">
            {isAnalyzing ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-secondary-text space-y-4 py-8 bg-surface-elevated rounded-xl border border-border-inner">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-center px-4">Gemini Vision is analyzing the image...</p>
              </div>
            ) : error ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-error space-y-4 py-8 px-4 text-center bg-error/5 rounded-xl border border-error/20">
                <p>{error}</p>
                <Button variant="danger" onClick={() => analyzeImage(imagePreview, "image/png")}>
                  Retry Analysis
                </Button>
              </div>
            ) : extractedData ? (
              <ExtractedResults data={extractedData} onApprove={(data) => {
                onApprove(data);
                handleReset();
              }} />
            ) : null}
        </div>
      )}
    </div>
  );
}
