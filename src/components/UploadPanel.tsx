import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isGenerating: boolean;
  error: string | null;
}

export function UploadPanel({ onUpload, isGenerating, error }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Meeting Prep</h1>
        <p className="text-sm text-neutral-500 mt-1">Upload a document to generate your agenda.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
          ${isGenerating ? 'opacity-50 pointer-events-none' : ''}
          ${selectedFile ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept=".pdf,.txt,.docx,.md"
        />
        
        {selectedFile ? (
          <>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-900 truncate max-w-full px-4">{selectedFile.name}</p>
            <p className="text-xs text-neutral-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isGenerating}
            >
              Remove
            </Button>
          </>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-500">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-neutral-900">Click or drag document</p>
            <p className="text-xs text-neutral-500 mt-1">PDF, TXT, DOCX</p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start text-red-600">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button 
          className="w-full" 
          size="lg"
          disabled={!selectedFile || isGenerating}
          onClick={handleUploadClick}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Agenda"
          )}
        </Button>
      </div>
    </div>
  );
}
