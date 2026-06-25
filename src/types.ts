export interface Topic {
  title: string;
  description: string;
  timeMinutes: number;
}

export interface AgendaData {
  stakeholders: string[];
  topics: Topic[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}
