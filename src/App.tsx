/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UploadPanel } from "./components/UploadPanel";
import { AgendaPanel } from "./components/AgendaPanel";
import { ChatPanel } from "./components/ChatPanel";
import { AgendaData } from "./types";

export default function App() {
  const [agendaData, setAgendaData] = useState<AgendaData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsGenerating(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        // The result is like "data:application/pdf;base64,JVBERi..."
        const parts = result.split(",");
        const mimeType = parts[0].split(":")[1].split(";")[0];
        const base64Data = parts[1];

        const response = await fetch("/api/generate-agenda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileData: base64Data, mimeType }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to generate agenda");
        }

        const data: AgendaData = await response.json();
        setAgendaData(data);
        setIsGenerating(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-white flex flex-col shrink-0 md:overflow-y-auto max-h-[40vh] md:max-h-full">
        <UploadPanel onUpload={handleUpload} isGenerating={isGenerating} error={error} />
      </div>
      
      <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-4 md:p-8">
        <AgendaPanel data={agendaData} isGenerating={isGenerating} />
      </div>

      <div className="w-full md:w-96 border-t md:border-t-0 md:border-l bg-white flex flex-col shrink-0 h-[50vh] md:h-full">
        <ChatPanel contextData={agendaData} />
      </div>
    </div>
  );
}

