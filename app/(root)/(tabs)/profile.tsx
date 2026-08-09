import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const hanldeSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/SignIn");
        },
      },
    ]);
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity
        className="w-full bg-brand-blue my-2 py-4 rounded-xl items-center"
        onPress={hanldeSignOut}
      >
        <Text className="text-white text-base font-semibold">Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
