import {
  CodeFormSchema,
  codeSchema,
  SignUpFormSchema,
  signUpSchema,
} from "@/lib/schemas/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const isLoading = fetchStatus === "fetching";
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<CodeFormSchema>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });
  const onSignUpPress = async (values: SignUpFormSchema) => {
    setEmail(values.email);
    const { error } = await signUp.password({
      firstName: values.firstName,
      lastName: values.lastName,
      emailAddress: values.email,
      password: values.password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
    }
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onCodeSubmit = async (values: CodeFormSchema) => {
    await signUp.verifications.verifyEmailCode({ code: values.code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign Up attempt unsuccessful!", signUp);
    }
  };
  // if (signUp.status === "complete" || isSignedIn) {
  //   return null;
  // }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields?.length === 0
  ) {
    return (
      <SafeAreaView className="px-4 flex-1 bg-brand-body">
        <Text className="text-3xl font-bold text-brand-text leading-tight pt-4">
          Verify your account
        </Text>
        <Text className="text-brand-text-muted text-base py-8">
          We sent a verification code to {email}. Please enter the code below to
          verify your account.
        </Text>
        <Controller
          control={codeControl}
          name="code"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl my-2 px-4 py-4 text-[#1A1D26]"
                placeholder="Enter Verification Code"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
              />
            );
          }}
        />
        {codeErrors.code && (
          <Text className="text-brand-coral text-sm pb-2">
            {codeErrors.code?.message}
          </Text>
        )}
        {errors.fields.code && (
          <Text className="text-brand-coral text-sm pb-2">
            {errors.fields.code.message}
          </Text>
        )}
        <TouchableOpacity
          className="w-full bg-brand-blue my-2 py-4 rounded-xl items-center"
          onPress={handleCodeSubmit(onCodeSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Verify</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center py-4"
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text className="text-brand-blue font-semibold">
            I need a new code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center py-4"
          onPress={() => signUp.reset()}
        >
          <Text className="text-brand-blue font-semibold">Start over</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-body"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-4">
        <Text className="text-3xl font-bold text-brand-text leading-tight pt-4">
          Sign Up
        </Text>
        <Text className="text-brand-text-muted text-base py-8">
          Create an account to get started.
        </Text>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl my-2 px-4 py-4 text-[#1A1D26]"
                placeholder="First Name"
                placeholderTextColor="#8A8D96"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
              />
            );
          }}
        />
        {(formErrors.firstName || formErrors.firstName) && (
          <Text className="text-brand-coral text-sm pb-2">
            {formErrors.firstName?.message || formErrors.firstName?.message}
          </Text>
        )}
        <Controller
          control={control}
          name="lastName"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl my-2 px-4 py-4 text-[#1A1D26]"
                placeholder="Last Name"
                placeholderTextColor="#8A8D96"
                autoCapitalize="words"
                value={value}
                onChangeText={onChange}
              />
            );
          }}
        />
        {(formErrors.lastName || formErrors.lastName) && (
          <Text className="text-brand-coral text-sm pb-2">
            {formErrors.lastName?.message || formErrors.lastName?.message}
          </Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl my-2 px-4 py-4 text-[#1A1D26]"
                placeholder="Email Address"
                placeholderTextColor="#8A8D96"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
              />
            );
          }}
        />
        {formErrors.email && (
          <Text className="text-brand-coral text-sm pb-2">
            {formErrors.email?.message}
          </Text>
        )}
        {errors.fields.emailAddress && (
          <Text className="text-brand-coral text-sm pb-2">
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="border border-[#E8E6DF] bg-white rounded-xl my-2 px-4 py-4 text-[#1A1D26]"
                placeholder="Password"
                placeholderTextColor="#8A8D96"
                value={value}
                onChangeText={onChange}
                secureTextEntry
              />
            );
          }}
        />
        {formErrors.password && (
          <Text className="text-brand-coral text-sm pb-2">
            {formErrors.password?.message}
          </Text>
        )}
        {errors.fields.password && (
          <Text className="text-brand-coral text-sm pb-2">
            {errors.fields.password.message}
          </Text>
        )}
        <TouchableOpacity
          className="w-full bg-brand-blue my-2 py-4 rounded-xl items-center"
          onPress={handleSubmit(onSignUpPress)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center my-4 gap-2">
          <Text className="text-brand-text-muted">
            Already have an account?
          </Text>
          <Link href="/(auth)/SignIn">
            <Text className="text-brand-blue font-semibold">Sign In</Text>
          </Link>
        </View>
      </View>
      <View nativeID="clerk-captcha" />
    </KeyboardAvoidingView>
  );
}
