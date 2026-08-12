import CurrencyPicker, { ALL_CURRENCIES } from "@/components/CurrencyPicker";
import { useSupabase } from "@/hooks/useSupabase";
import {
  OnboardingFormSchema,
  onboardingSchema,
} from "@/lib/schemas/onboarding";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = () => {
  const { user } = useUser();
  const authSupabase = useSupabase();
  const setCurrency = useUserStore((s) => s.setCurrency);
  const setNeedsOnboarding = useUserStore((s) => s.setNeedsOnboarding);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(
    ALL_CURRENCIES.find((curr) => curr.code === "INR") ?? ALL_CURRENCIES[0],
  );

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<OnboardingFormSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: "onBlur",
    defaultValues: {
      startingBalance: "",
    },
  });

  const handleSave = async ({ startingBalance }: OnboardingFormSchema) => {
    const parsed = parseFloat(startingBalance.replace(/,/g, ""));
    setSaving(true);
    setError("");

    const { error: updateError } = await authSupabase
      .from("users")
      .update({
        currency: selectedCurrency.code,
      })
      .eq("clerk_id", user!.id);

    if (updateError) {
      setSaving(false);
      setError("Something went wrong. Please try again!");
      return;
    }

    const { data: defaultAccount, error: accountFetchError } =
      await authSupabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", user!.id)
        .eq("is_default", true)
        .single();

    if (accountFetchError || !defaultAccount) {
      setSaving(false);
      setError("Something went wrong. Please try again!");
      return;
    }

    const { error: txtError } = await authSupabase.from("transactions").insert({
      user_id: user!.id,
      account_id: defaultAccount.id,
      type: "INCOME",
      amount: parsed,
      category: "other_income",
      description: "Starting balance",
      date: new Date().toISOString(),
      input_method: "MANUAL",
    });

    if (txtError) {
      setSaving(false);
      setError("Something went wrong. Please try again!");
      return;
    }

    const { error: balanceError } = await authSupabase
      .from("accounts")
      .update({ balance: defaultAccount.balance + parsed })
      .eq("id", defaultAccount.id);

    setSaving(false);

    if (balanceError) {
      setError("Something went wrong. Please try again!");
      return;
    }

    setCurrency(selectedCurrency.code);
    setNeedsOnboarding(false);
    router.replace("/(root)/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="px-4">
          <Text className="text-3xl font-bold text-brand-text leading-tight pt-4">
            Let's get you set-up
          </Text>
          <Text className="text-brand-text-muted text-base py-8">
            A couple of quick details to get started.
          </Text>

          <Text className="text-brand-bg font-medium mb-4">
            Starting balance
          </Text>
          <View className="flex-row bg-white items-center border border-[#E8E6DF] rounded-xl px-4 ">
            <Text className="text-brand-text-secondary mx-2">
              {selectedCurrency.symbol}
            </Text>
            <Controller
              control={control}
              name="startingBalance"
              render={({ field: { value, onChange } }) => {
                return (
                  <TextInput
                    className="bg-white rounded-xl px-4 py-4 text-[#1A1D26]"
                    placeholder="e.g. 5,000"
                    placeholderTextColor="#8A8D96"
                    keyboardType="numeric"
                    returnKeyType="done"
                    value={value}
                    onChangeText={(val) => {
                      setError("");
                      onChange(val);
                    }}
                  />
                );
              }}
            />
          </View>
          {formErrors.startingBalance && (
            <Text className="text-brand-coral text-sm py-2">
              {formErrors.startingBalance?.message}
            </Text>
          )}

          <Text className="text-brand-bg font-medium py-4">Currency</Text>
          <TouchableOpacity
            onPress={() => setPickerOpen(true)}
            className="flex-row items-center justify-between bg-white border border-[#E8E6DF] rounded-xl px-4 py-4"
          >
            <Text className="text-sm text-brand-bg">
              {selectedCurrency.symbol} {selectedCurrency.code} -{" "}
              {selectedCurrency.name}
            </Text>
            <Feather name="chevron-down" size={16} color="#8A8D96" />
          </TouchableOpacity>
          {error ? (
            <Text className="text-brand-coral text-xs my-4">{error}</Text>
          ) : null}

          <TouchableOpacity
            className="w-full bg-brand-bg my-6 py-4 rounded-xl items-center"
            onPress={handleSubmit(handleSave)}
            disabled={saving}
          >
            <Text className="text-white text-sm font-semibild">
              {saving ? "Saving..." : "Get Started"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <CurrencyPicker
        visible={pickerOpen}
        selectedCode={selectedCurrency.code}
        onSelect={(currency) => {
          setSelectedCurrency(currency);
          setPickerOpen(false);
        }}
        onClose={() => {
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

export default Onboarding;
