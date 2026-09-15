import { AI_GRADIENT, COLORS, RECORDING_GRADIENT } from "@/constants/theme";
import {
    ExtractedTransaction,
    extractTransactionFromVoice,
} from "@/lib/services/extractTransaction";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { File } from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Status = "idle" | "recording" | "processing" | "error";

const VoiceRecorderModal = ({
  visible,
  onClose,
  onExtracted,
}: {
  visible: boolean;
  onClose: () => void;
  onExtracted: (result: ExtractedTransaction) => void;
}) => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStatus("idle");
      setSeconds(0);
      return;
    }
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setStatus("error");
        return;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();
  }, [visible]);

  useEffect(() => {
    if (status !== "recording") return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const startRecording = async () => {
    setSeconds(0);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus("recording");
  };

  const stopRecording = async () => {
    setStatus("processing");
    await recorder.stop();

    try {
      const uri = recorder.uri;
      if (!uri) throw new Error("No recording captured");

      const file = new File(uri);
      const base64 = await file.base64();
      const result = await extractTransactionFromVoice(base64, "audio/m4a");
      onExtracted(result);
      onClose();
    } catch (error) {
      console.error("Voice extraction failed: ", error);
      setStatus("error");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <BlurView intensity={40} tint="dark" className="absolute inset-0" />
        <View
          style={{
            width: "100%",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: "#14162A",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          {status === "error" ? (
            <>
              <Feather name="alert-circle" size={32} color="#FF6B4A" />
              <Text className="text-white/60 rounded-xl text-sm my-4 text-center px-4">
                Couldn't process that. Check your microphone permissions and try
                again.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/10 px-6 py-4 rounded-full"
              >
                <Text className="text-white text-sm font-semibold">Close</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={14}
                  color={COLORS.teal}
                />
                <Text
                  style={{ color: COLORS.teal }}
                  className="text-[12px] font-semibold tracking-wide uppercase"
                >
                  AI voice log
                </Text>
              </View>

              <Text className="text-white text-base font-semibold mb-2">
                {status === "recording"
                  ? "Recording..."
                  : status === "processing"
                    ? "Processing..."
                    : "Ready to record, please tell me about a transaction."}
              </Text>

              <Text className="text-white/50 text-xs mb-8 text-center px-4">
                {status === "recording"
                  ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
                  : status === "processing"
                    ? "Transcribing or extracting the details..."
                    : '"I spent 400 on groceries yesterday."'}
              </Text>

              <View className="w-24 h-24 items-center justify-center my-4">
                {status === "processing" ? (
                  <ActivityIndicator size="large" color={COLORS.teal} />
                ) : (
                  <TouchableOpacity
                      onPress={status === "recording" ? stopRecording : startRecording}
                    activeOpacity={0.85}
                    className="w-16 h-16 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        status === "recording"
                          ? RECORDING_GRADIENT[0]
                          : AI_GRADIENT[0],
                    }}
                  >
                    <Feather
                      name={status === "recording" ? "stop-circle" : "mic"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={onClose}
                disabled={status === "processing"}
              >
                <Text className="text-white/40 text-sm">Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default VoiceRecorderModal;
