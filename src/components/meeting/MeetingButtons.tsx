import { Button } from "@/components/ui/button";

interface MeetingButtonsProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export const MeetingButtons = ({ onCreateClick, onJoinClick }: MeetingButtonsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button onClick={onCreateClick}>New Meeting</Button>
      <Button onClick={onJoinClick} variant="outline">Join Meeting</Button>
    </div>
  );
};