import { useEffect, useState } from 'react';
import { PreMeetingSetup } from '@/components/meeting/PreMeetingSetup';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { CreateJoinMeeting } from '@/components/meeting/CreateJoinMeeting';
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateJoinMeeting />
    </div>
  );
};

export default Index;