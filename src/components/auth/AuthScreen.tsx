import { Button } from "@/components/ui/button";
import { Mail, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthScreen = () => {
  const handleSignIn = async (provider: string) => {
    try {
      if (provider === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } else {
        // For demo purposes, we'll use the magic link signin
        const email = prompt('Please enter your email:');
        if (!email) return;
        
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        else toast.success('Check your email for the login link!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  const signInMethods = [
    {
      provider: 'google',
      icon: <Chrome className="h-4 w-4" />,
      label: 'Continue with Google'
    },
    {
      provider: 'email',
      icon: <Mail className="h-4 w-4" />,
      label: 'Continue with Email'
    }
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sign in to join meeting</h1>
      <div className="w-full max-w-sm space-y-4">
        {signInMethods.map(method => (
          <Button 
            key={method.provider}
            onClick={() => handleSignIn(method.provider)}
            className="w-full"
            variant="outline"
          >
            {method.icon}
            <span className="ml-2">{method.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AuthScreen;