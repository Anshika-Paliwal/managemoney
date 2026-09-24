import AccountModal from "@/components/AccountModal";
import CurrencyPicker from "@/components/CurrencyPicker";
import { useSetDeafultAccount } from "@/hooks/mutations/useAccountMutation";
import { useAccountsQuery } from "@/hooks/queries/useAccountsQuery";
import { useSupabase } from "@/hooks/useSupabase";
import { AccountType } from "@/lib/services/accounts";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { useAuth, useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const accountIcon: Record<AccountType, keyof typeof Feather.glyphMap> = {
  CASH: "dollar-sign",
  BANK: "home",
  CREDIT_CARD: "credit-card",
  SAVINGS: "shield",
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-brand-text-muted text-[12px] uppercase tracking-wide mx-6 mb-2 mt-6 ">
      {children}
    </Text>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center bg-white px-4 py-3.5 border-b border-[#F0EEE7] last:border-b-0"
    >
      <View className="w-8 h-8 rounded-full bg-[#F5F4F0] items-center justify-center mr-3">
        <Feather name={icon} size={15} color={danger ? "#FF6B4A" : "#5C5F68"} />
      </View>
      <Text
        numberOfLines={1}
        className={`flex-1 text-sm ${
          danger ? "text-brand-coral" : "text-brand-bg"
        }`}
      >
        {label}
      </Text>
      {value && (
        <Text
          numberOfLines={1}
          className="text-brand-text-secondary text-xs mr-2 ml-4"
        >
          {value}
        </Text>
      )}
      {showChevron && onPress && (
        <Feather name="chevron-right" size={16} color="#BDC3C7" />
      )}
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const supabase = useSupabase();
  const currency = useUserStore((state) => state.currency);
  const setCurrency = useUserStore((state) => state.setCurrency);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    data: accounts = [],
    isLoading: loadingAccounts,
    isError: accountsError,
  } = useAccountsQuery();
  const { mutateAsync: setDefaultAccount } = useSetDeafultAccount();

  const handlePickAvatar = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to set a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;

    setUploadingAvatar(true);

    try {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${asset.base64}`;

      await user.setProfileImage({ file: dataUrl });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      Alert.alert("Error", "Couldn't upload your photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMadeDefault = async () => {
    if (!editingAccount) return;

    try {
      await setDefaultAccount(editingAccount.id);
      closeModal();
    } catch {
      Alert.alert("Error", "Couldn't set this as the default account.");
    }
  };

  const handleCurrecySelection = async (selected: { code: string }) => {};
  const handleSignOut = () => {
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

  const closeModal = () => {
    setModalVisible(false);
    setEditingAccount(null);
  };

  const handleCurrencySelection = async (selected: { code: string }) => {
    setCurrencyPickerOpen(false);
    if (!user) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ currency: selected.code })
        .eq("clerk_id", user.id);
      if (error) throw error;
      setCurrency(selected.code);
    } catch {
      Alert.alert("Error", "Couldn't update your currency.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="px-6 py-2">
          <Text className="text-brand-bg text-xl font-semibold">Profile</Text>
        </View>

        <View className="mx-6 px-6 bg-brand-bg rounded-2xl py-6 items-center">
          <TouchableOpacity
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
            activeOpacity={0.85}
            className="w-20 h-20 rounded-full bg-[#1A1D26] items-center justify-center overflow-hidden border-2 border-[#2A2E3A]"
          >
            {uploadingAvatar ? (
              <ActivityIndicator color="#8A8D96" />
            ) : user?.imageUrl && user?.hasImage ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 80, height: 80 }}
                contentFit="cover"
              />
            ) : (
              <Feather name="user" size={30} color="#8A8D96" />
            )}
            <View className="absolute bottom-0 inset-x-0 h-6 bg-black/50 items-center justify-center">
              <Feather name="camera" size={14} color="#F2EFE9" />
            </View>
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold my-1">
            {user?.firstName} {user?.lastName}
          </Text>
          <View className="flex-row items-center gap-2">
            <Feather name="mail" size={12} color="#8A8D96" />
            <Text
              className="text-brand-text-secondary text-sm"
              numberOfLines={1}
            >
              {user?.emailAddresses?.[0]?.emailAddress}
            </Text>
          </View>
        </View>

        <SectionLabel>Accounts</SectionLabel>
        <View className="mx-6 rounded-2xl overflow-hidden border border-[#E8E6DF]">
          {loadingAccounts ? (
            <View className="bg-white px-4 py-6 items-center">
              <ActivityIndicator color="#5C5F68" />
            </View>
          ) : accountsError ? (
            <View className="bg-white px-4 py-6 items-center">
              <Text className="text-brand-text-muted text-xs">
                Couldn't load your accounts.
              </Text>
            </View>
          ) : (
            accounts.map((account) => (
              <Row
                key={account.id}
                icon={accountIcon[account.type]}
                label={account.name + (account.is_default ? " (default)" : "")}
                value={formatPrice(account.balance, currency)}
                onPress={() => {
                  setEditingAccount(account);
                  setModalVisible(true);
                }}
              />
            ))
          )}
          <Row
            icon="plus"
            label="Add account"
            onPress={() => {
              setEditingAccount(null);
              setModalVisible(true);
            }}
          />
        </View>

        <SectionLabel>Preferences</SectionLabel>
        <View className="mx-5 rounded-2xl overflow-hidden border border-[#E8E6DF]">
          <Row
            icon="dollar-sign"
            label="Currency"
            value={currency}
            onPress={() => setCurrencyPickerOpen(true)}
          />
        </View>

        <SectionLabel>User actions</SectionLabel>

        <View className="mx-6 rounded-2xl overflow-hidden border border-[#E8E6DF]">
          <Row
            icon="log-out"
            label="Sign out"
            onPress={handleSignOut}
            showChevron={false}
            danger
          />
        </View>
      </ScrollView>

      {user && (
        <AccountModal
          visible={modalVisible}
          account={editingAccount}
          onClose={closeModal}
          onSaved={closeModal}
          onDeleted={closeModal}
          onMadeDefault={handleMadeDefault}
        />
      )}

      <CurrencyPicker
        visible={currencyPickerOpen}
        selectedCode={currency}
        onSelect={handleCurrencySelection}
        onClose={() => setCurrencyPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
