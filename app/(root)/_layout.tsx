import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";

export default function RootGroupLayout() {
  // const { isSignedIn, isLoaded } = useAuth();
  // if (!isLoaded) {
  //   return null;
  // }
  // if (isSignedIn) {
  //   return <Redirect href="/(root)/(tabs)" />;
  // }
  return <Slot />;
}
