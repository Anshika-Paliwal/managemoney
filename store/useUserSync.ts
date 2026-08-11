import { useUser } from "@clerk/expo";
import { useUserStore } from "./userStore";
import { useSupabase } from "@/hooks/useSupabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setUser = useUserStore((state) => state.currency);
  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);
};
