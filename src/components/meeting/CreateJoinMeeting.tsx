import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { MeetingButtons } from './MeetingButtons';
import { JoinMeetingForm } from './JoinMeetingForm';
import { createNewMeeting, joinExistingMeeting } from '@/utils/meetingOperations';

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

      const meeting = await createNewMeeting(user.data.user.id);
      navigate(`/meeting/${meeting.id}`);
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

      const meeting = await joinExistingMeeting(meetingId, user.data.user.id);
      navigate(`/meeting/${meeting.id}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
      toast.error('Failed to join meeting');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mode) {
    return <MeetingButtons onCreateClick={() => setMode('create')} onJoinClick={() => setMode('join')} />;
  }

  if (mode === 'join') {
    return (
      <JoinMeetingForm
        meetingId={meetingId}
        onMeetingIdChange={setMeetingId}
        onJoin={handleJoinMeeting}
        onBack={() => setMode(null)}
        isLoading={isLoading}
      />
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