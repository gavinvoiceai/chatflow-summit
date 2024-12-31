import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AICommand {
  type: 'createTask' | 'scheduleFollowup' | 'summarize';
  payload: string;
}

export class AIAssistantService {
  private meetingId: string;

  constructor(meetingId: string) {
    this.meetingId = meetingId;
  }

  async processCommand(command: AICommand): Promise<void> {
    try {
      const response = await fetch('/api/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, meetingId: this.meetingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to process command');
      }

      const result = await response.json();
      toast.success('Command processed successfully');
      return result;
    } catch (error) {
      console.error('Error processing command:', error);
      toast.error('Failed to process command');
      throw error;
    }
  }

  async createTask(taskDetails: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('action_items')
        .insert({
          meeting_id: this.meetingId,
          content: taskDetails,
          assigned_by: user.id,
          completed: false,
        });

      if (error) throw error;
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  }

  async scheduleFollowup(details: string): Promise<void> {
    try {
      const response = await fetch('/api/schedule-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details, meetingId: this.meetingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule followup');
      }

      toast.success('Follow-up scheduled successfully');
    } catch (error) {
      console.error('Error scheduling followup:', error);
      toast.error('Failed to schedule followup');
      throw error;
    }
  }

  async generateSummary(): Promise<string> {
    try {
      const { data: transcripts, error } = await supabase
        .from('meeting_transcripts')
        .select('content')
        .eq('meeting_id', this.meetingId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const fullTranscript = transcripts.map(t => t.content).join(' ');
      
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fullTranscript }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const { summary } = await response.json();
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
      throw error;
    }
  }
}