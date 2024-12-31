import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MeetingSetupScreen } from '@/components/meeting';
import { VideoGrid } from '@/components/VideoGrid';
import { PreMeetingSetup } from '@/components/meeting/PreMeetingSetup';
import { EndMeetingDialog } from '@/components/meeting/EndMeetingDialog';
import { CreateJoinMeeting } from '@/components/meeting/CreateJoinMeeting';
import { LobbyView } from '@/components/meeting/LobbyView';
import { MeetingControls } from '@/components/meeting/MeetingControls';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PreMeetingSetup onJoinMeeting={async () => {}} />} />
        <Route path="/meeting/:meetingId" element={<MeetingSetupScreen />} />
        <Route path="/video-grid" element={<VideoGrid participants={[]} />} />
        <Route path="/end-meeting" element={<EndMeetingDialog />} />
        <Route path="/create-join-meeting" element={<CreateJoinMeeting />} />
        <Route path="/lobby" element={<LobbyView />} />
        <Route path="/meeting-controls" element={<MeetingControls />} />
      </Routes>
    </Router>
  );
}

export default App;
