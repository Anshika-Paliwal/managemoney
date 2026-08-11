import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = () => {
  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <Text>Onboarding</Text>
    </SafeAreaView>
  );
};

export default Onboarding;
