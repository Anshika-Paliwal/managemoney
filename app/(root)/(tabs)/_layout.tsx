import { Platform } from "react-native";

import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

const useNativeTabs = Platform.OS === "ios";

export default function TabLayout() {
  if (useNativeTabs) {
    return (
      <NativeTabs
        backgroundColor="#0B0E14"
        tintColor="#4A9EFF"
        iconColor={{ selected: "#4A9EFF", default: "#ffffff" }}
      >
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf="house.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="transactions">
          <Label>Transactions</Label>
          <Icon sf="list.bullet" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="add-transactions">
          <Label>Add</Label>
          <Icon sf="plus.circle.fill" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="assistant">
          <Label>Assistant</Label>
          <Icon sf="brain.head.profile" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>Profile</Label>
          <Icon sf="person.fill" />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4A9EFF",
        tabBarInactiveTintColor: "#ffffff",
        tabBarStyle: {
          backgroundColor: "#0B0E14",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="home" sf="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <Feather size={size} name="list" sf="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-transactions"
        options={{
          title: "Add",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="plus"
              size={size}
              sf="plus.circle.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color, size }) => (
            <Feather
              name="bell"
              size={size}
              sf="brain.head.profile"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} sf="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
