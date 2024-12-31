import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

export const CreateJoinMeeting = () => {
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [meetingId, setMeetingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateMeeting = async () => {
    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please sign in to create a meeting');
        return;
      }

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          host_id: user.data.user.id,
          meeting_name: `Meeting ${new Date().toLocaleString()}`,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      navigate(`/meeting/${data.id}`);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    try {
      setIsLoading(true);
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Please sign in to join the meeting');
        return;
      }

      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;
      if (!meeting) {
        toast.error('Meeting not found');
        return;
      }

      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meeting.id,
          user_id: user.data.user.id,
          is_host: meeting.host_id === user.data.user.id
        });

      if (participantError) throw participantError;
      
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="flex justify-center gap-4">
        <Button onClick={() => setMode('create')}>New Meeting</Button>
        <Button onClick={() => setMode('join')} variant="outline">Join Meeting</Button>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="space-y-4">
        <Button onClick={() => setMode(null)} variant="ghost" className="mb-4">
          ← Back
        </Button>
        <div className="flex gap-4">
          <Input
            placeholder="Enter meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
          <Button 
            onClick={handleJoinMeeting}
            disabled={!meetingId || isLoading}
          >
            Join
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setMode(null)} variant="ghost" className="mb-4">
        ← Back
      </Button>
      <Button 
        onClick={handleCreateMeeting}
        disabled={isLoading}
        className="w-full"
      >
        Create New Meeting
      </Button>
    </div>
  );
};