import { supabase } from "@/integrations/supabase/client";

interface UserPreferences {
  preferred_camera_id: string | null;
  preferred_microphone_id: string | null;
  camera_enabled: boolean;
  microphone_enabled: boolean;
}

export const usePreferences = () => {
  const loadPreferences = async (): Promise<UserPreferences | null> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || {
        preferred_camera_id: null,
        preferred_microphone_id: null,
        camera_enabled: true,
        microphone_enabled: false,
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  };

  const savePreferences = async (preferences: Partial<UserPreferences> & { user_id: string }) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  };

  return { loadPreferences, savePreferences };
};