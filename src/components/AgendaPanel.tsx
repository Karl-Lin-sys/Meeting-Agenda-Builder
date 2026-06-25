import { AgendaData } from "../types";
import { Users, Clock, Loader2, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import * as motion from "motion/react-client";

export function AgendaPanel({ data, isGenerating }: { data: AgendaData | null, isGenerating: boolean }) {
  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        <p className="text-sm font-medium">Analyzing document and structuring agenda...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
          <Calendar className="w-8 h-8 text-neutral-300" />
        </div>
        <p className="text-sm">Upload a document to see the generated agenda here.</p>
      </div>
    );
  }

  const totalTime = data.topics.reduce((acc, t) => acc + t.timeMinutes, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Meeting Agenda</h2>
        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
          <Clock className="w-4 h-4 mr-2 inline" />
          {totalTime} minutes total
        </Badge>
      </div>

      <Card className="shadow-sm border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
          <CardTitle className="text-sm font-medium text-neutral-500 flex items-center uppercase tracking-wider">
            <Users className="w-4 h-4 mr-2" />
            Stakeholders & Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex flex-wrap gap-2">
          {data.stakeholders.length > 0 ? (
            data.stakeholders.map((person, idx) => (
              <Badge key={idx} variant="outline" className="bg-white border-neutral-200 text-neutral-700 py-1 px-3">
                {person}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-neutral-500 italic">No specific stakeholders identified.</p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Timeline
        </h3>
        
        <div className="relative border-l-2 border-neutral-200 ml-3 space-y-8 py-2">
          {data.topics.map((topic, idx) => (
            <div key={idx} className="relative pl-8">
              <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-white border-4 border-blue-500 shadow-sm" />
              
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2 gap-4">
                  <h4 className="text-base font-semibold text-neutral-900">{topic.title}</h4>
                  <Badge className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent font-medium">
                    {topic.timeMinutes} min
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {topic.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
