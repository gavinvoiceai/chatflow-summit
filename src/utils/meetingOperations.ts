import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const createNewMeeting = async (userId: string) => {
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      host_id: userId,
      meeting_name: `Meeting ${new Date().toLocaleString()}`,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const joinExistingMeeting = async (meetingId: string, userId: string) => {
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .single();

  if (meetingError) throw meetingError;
  if (!meeting) {
    throw new Error('Meeting not found');
  }

  const { error: participantError } = await supabase
    .from('meeting_participants')
    .insert({
      meeting_id: meeting.id,
      user_id: userId,
      is_host: meeting.host_id === userId
    });

  if (participantError) throw participantError;
  return meeting;
};