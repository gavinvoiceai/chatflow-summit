import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export class AIAssistantService {
  private meetingId: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(meetingId: string) {
    this.meetingId = meetingId;
  }

  private async callAIFunction(type: 'processCommand' | 'analyzeTranscript' | 'generateSummary', content: string) {
    let attempts = 0;
    
    while (attempts < this.retryAttempts) {
      try {
        const response = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, content, meetingId: this.meetingId }),
        });

        if (!response.ok) throw new Error('AI request failed');
        
        const data = await response.json();
        return data.result;
      } catch (error) {
        attempts++;
        if (attempts === this.retryAttempts) {
          toast.error('AI processing failed. Please try again.');
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempts));
      }
    }
  }

  async processCommand(command: string): Promise<{ type: string; payload: string }> {
    try {
      const result = await this.callAIFunction('processCommand', command);
      const parsed = JSON.parse(result);
      return {
        type: parsed.type,
        payload: parsed.payload,
      };
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

      const result = await this.callAIFunction('analyzeTranscript', taskDetails);
      const { title, dueDate, assignee } = JSON.parse(result);

      const { error } = await supabase
        .from('action_items')
        .insert({
          meeting_id: this.meetingId,
          content: title,
          due_date: dueDate,
          assigned_by: user.id,
          assigned_to: assignee,
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
      const result = await this.callAIFunction('processCommand', details);
      const { date, time, participants } = JSON.parse(result);
      
      // Here you would integrate with a calendar API
      toast.success('Follow-up scheduled successfully');
    } catch (error) {
      console.error('Error scheduling followup:', error);
      toast.error('Failed to schedule follow-up');
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
      const summary = await this.callAIFunction('generateSummary', fullTranscript);
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
      throw error;
    }
  }

  async analyzeTranscriptInRealtime(transcript: string): Promise<void> {
    try {
      const result = await this.callAIFunction('analyzeTranscript', transcript);
      const { actionItems, keyPoints } = JSON.parse(result);

      // Store action items if found
      if (actionItems?.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('action_items').insert(
          actionItems.map((item: string) => ({
            meeting_id: this.meetingId,
            content: item,
            assigned_by: user.id,
            completed: false,
          }))
        );
      }
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      // Don't show toast for real-time analysis errors to avoid spam
    }
  }
}