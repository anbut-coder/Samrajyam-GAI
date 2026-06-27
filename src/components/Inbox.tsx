import React, { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, FileText, Loader2, Type } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'none' | 'text'>('none');
  const [pastedText, setPastedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (inputMode === 'text') return; // Don't intercept paste if in text mode
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) processFile(blob);
          break;
        } else if (items[i].type.indexOf("text/plain") !== -1) {
          items[i].getAsString((text) => {
             setInputMode('text');
             setPastedText(text);
          });
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [inputMode]);

  useEffect(() => {
    if (initialFile && !isAnalyzing) {
      processFile(initialFile);
      if (onClearInitialFile) {
        onClearInitialFile();
      }
    }
  }, [initialFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (isAnalyzing) return;
    
    if (file.type && !file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    
    setError(null);
    setInputMode('none');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      await analyzeContent(result, file.type || "image/jpeg", undefined);
    };
    reader.readAsDataURL(file);
  };

  const analyzeContent = async (base64Image?: string, mimeType?: string, text?: string) => {
    setIsAnalyzing(true);
    setExtractedData(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image, mimeType, text, clientDate: new Date().toString() }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze content.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextAnalyze = () => {
    if (!pastedText.trim()) return;
    analyzeContent(undefined, undefined, pastedText);
  };

  const handleReset = () => {
    setImagePreview(null);
    setInputMode('none');
    setPastedText("");
    setExtractedData(null);
    setError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const hasContent = imagePreview || inputMode === 'text';

  return (
    <div className="flex-1 p-4 md:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 overflow-hidden h-full">
      <div className={`${hasContent ? 'lg:col-span-5' : 'lg:col-span-12'} h-auto lg:h-full flex flex-col flex-shrink-0 lg:flex-shrink overflow-visible lg:overflow-hidden`}>
      <div className="mb-4 hidden">
        <h2 className="text-lg font-medium text-on-background">AI Inbox</h2>
      </div>

      {!imagePreview && inputMode === 'none' ? (
        <div className="w-full lg:flex-1 min-h-[300px] lg:min-h-[480px] lg:max-h-[480px] flex flex-col items-center justify-center p-6 md:p-8 transition-all">
          <h3 className="text-xl font-medium text-on-background mb-8 text-center">How would you like to capture?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 bg-surface-elevated border border-border-inner rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
              disabled={isAnalyzing}
            >
              <div className="w-16 h-16 bg-surface-inner rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={32} className="text-primary" />
              </div>
              <span className="font-medium">Camera</span>
            </button>

            <button 
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 bg-surface-elevated border border-border-inner rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
              disabled={isAnalyzing}
            >
              <div className="w-16 h-16 bg-surface-inner rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon size={32} className="text-primary" />
              </div>
              <span className="font-medium">Gallery</span>
            </button>

            <button 
              onClick={() => setInputMode('text')}
              className="flex flex-col items-center justify-center p-8 bg-surface-elevated border border-border-inner rounded-2xl hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50"
              disabled={isAnalyzing}
            >
              <div className="w-16 h-16 bg-surface-inner rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText size={32} className="text-primary" />
              </div>
              <span className="font-medium">Paste Text</span>
            </button>
          </div>
          <p className="text-sm text-secondary-text text-center mt-8 max-w-md">
            Gemini will automatically extract Tasks, Meetings, Reminders, and Notes from your content.
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={galleryInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : inputMode === 'text' ? (
          <div className="bg-surface-elevated border border-border-inner h-[350px] lg:h-[480px] rounded-xl flex flex-col p-4 w-full mx-auto relative lg:max-w-[700px]">
            <h3 className="text-sm font-medium text-secondary-text mb-3">Paste Text</h3>
            <textarea 
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={isAnalyzing}
              placeholder="Paste your text here from WhatsApp, Telegram, Email, etc..."
              className="flex-1 w-full bg-surface-inner border border-border-subtle rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-on-background mb-4"
            />
            <div className="flex gap-3 justify-end mt-auto">
              <Button variant="secondary" onClick={handleReset} disabled={isAnalyzing}>Cancel</Button>
              <Button onClick={handleTextAnalyze} disabled={isAnalyzing || !pastedText.trim()}>
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>
      ) : (
          <div className="bg-surface-elevated border border-border-inner h-[200px] lg:h-[480px] rounded-xl flex flex-col items-center justify-center text-center p-4 relative overflow-hidden flex-shrink-0 mx-auto w-full lg:max-w-[700px]">
             <img src={imagePreview!} alt="Uploaded" className="w-full h-full object-contain" />
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

      {hasContent && (
        <div className="lg:col-span-7 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar lg:h-full mt-2 lg:mt-0 pb-24 lg:pb-0">
            {isAnalyzing ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-secondary-text space-y-4 py-8 bg-surface-elevated rounded-xl border border-border-inner">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-center px-4">Gemini is analyzing your content...</p>
              </div>
            ) : error ? (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-error space-y-4 py-8 px-4 text-center bg-error/5 rounded-xl border border-error/20">
                <p>Unable to analyze content.<br/>Please try again.</p>
                <div className="flex gap-4">
                  <Button variant="danger" onClick={() => analyzeContent(imagePreview || undefined, imagePreview ? "image/jpeg" : undefined, inputMode === 'text' ? pastedText : undefined)}>
                    Retry
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    Start Over
                  </Button>
                </div>
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
