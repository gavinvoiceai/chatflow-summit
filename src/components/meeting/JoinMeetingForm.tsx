import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JoinMeetingFormProps {
  meetingId: string;
  onMeetingIdChange: (value: string) => void;
  onJoin: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const JoinMeetingForm = ({
  meetingId,
  onMeetingIdChange,
  onJoin,
  onBack,
  isLoading
}: JoinMeetingFormProps) => {
  return (
    <div className="space-y-4">
      <Button onClick={onBack} variant="ghost" className="mb-4">
        ← Back
      </Button>
      <div className="flex gap-4">
        <Input
          placeholder="Enter meeting ID"
          value={meetingId}
          onChange={(e) => onMeetingIdChange(e.target.value)}
        />
        <Button 
          onClick={onJoin}
          disabled={!meetingId || isLoading}
        >
          Join
        </Button>
      </div>
    </div>
  );
};