import {
  CodeFormSchema,
  codeSchema,
  SignInFormSchema,
  signInSchema,
} from "@/lib/schemas/auth";
import { useSignIn } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const isLoading = fetchStatus === "fetching";

  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignInFormSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
    defaultValues: {
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
  const onSignInPress = async (values: SignInFormSchema) => {
    const { error } = await signIn.password({
      emailAddress: values.email,
      password: values.password,
    });
    if (error) return;
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      await signIn.mfa.sendPhoneCode();
    } else if (signIn.status === "needs_client_trust") {
      const emailCode = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCode) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-In attempt is not complete.", signIn);
    }
  };

  const onCodeSubmit = async (values: CodeFormSchema) => {
    await signIn.mfa.verifyEmailCode({ code: values.code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign In attempt unsuccessful!", signIn);
    }
  };
  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView className="px-4 flex-1 bg-brand-body">
        <Text className="text-3xl font-bold text-brand-text leading-tight pt-4">
          Verify your account
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
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text className="text-brand-blue font-semibold">
            I need a new code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center py-4"
          onPress={() => signIn.reset()}
        >
          <Text className="text-brand-blue font-semibold">Start over</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-brand-body">
      <View className="px-4">
        <Text className="text-3xl font-bold text-brand-text leading-tight pt-4">
          Welcome back
        </Text>
        <Text className="text-brand-text-muted text-base py-8">
          Sign In to your account
        </Text>

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
        {errors.fields.identifier && (
          <Text className="text-brand-coral text-sm pb-2">
            {errors.fields.identifier.message}
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
          onPress={handleSubmit(onSignInPress)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center my-4 gap-2">
          <Text className="text-brand-text-muted">Don't have an account?</Text>
          <Link href="/(auth)/SignUp">
            <Text className="text-brand-blue font-semibold">Sign Up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
