import { COLORS } from "@/constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ReceiptScannerModal = ({
  visible,
  onClose,
  onCaptured,
}: {
  visible: boolean;
  onClose: () => void;
  onCaptured: (base64: string, mimeType: string) => void;
}) => {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) requestPermission();
  }, [visible, permission?.granted, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      });
      if (photo?.base64) onCaptured(photo.base64, "image/jpeg");
    } catch (error) {
      console.error("Error capturing photo:", error);
    } finally {
      setCapturing(false);
    }
  };

  const handlePickFormLibrary = async () => {
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (libraryPermission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        base64: true,
      });

      if (result?.canceled) return;

      const asset = result.assets[0];
      if (asset.base64)
        onCaptured(asset.base64, asset.mimeType ?? "image/jpeg");
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View className="flex-1 bg-black">
        {permission?.granted && (
          <CameraView ref={cameraRef} facing="back" style={{ flex: 1 }} />
        )}

        <View className="absolute inset-0 px-10 items-center justify-center">
          <View
            className="w-full aspect-[3/4] rounded-2xl border-2 border-white/70"
            style={{ borderStyle: "dashed" }}
          />
        </View>

        <SafeAreaView className="absolute inset-0" edges={["top", "bottom"]}>
          <View className="flex-row items-center justify-between px-6 pt-4">
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/50"
            >
              <Feather name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
              <MaterialCommunityIcons
                name="robot-outline"
                size={12}
                color={COLORS.teal}
                onPress={handlePickFormLibrary}
              />
              <Text className="text-white text-[12px] font-medium">
                Align the Receipt
              </Text>
            </View>
          </View>

          <View className="flex-1" />
          <View className="flex-row items-center justify-between px-10 pb-6">
            <TouchableOpacity
              onPress={handlePickFormLibrary}
              disabled={capturing}
              className="w-10 h-10 items-center justify-center rounded-full bg-black/50"
            >
              <MaterialCommunityIcons
                name="image-plus"
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              disabled={capturing || !permission?.granted}
              activeOpacity={0.85}
              className="w-[70px] h-[70px] items-center justify-center rounded-full bg-black/50"
              style={{ borderWidth: 2, borderColor: "#FFFFFF" }}
            >
              {capturing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons
                  name="camera"
                  size={24}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
            <View className="w-12 h-12" />
          </View>
        </SafeAreaView>

        {!permission?.granted && permission?.canAskAgain === false && (
          <View className="absolute inset-0 items-center justify-center px-10 bg-black/80">
            <Feather name="camera-off" size={32} color="#8A8D96" />
            <Text className="text-white/70 text-sm mt-4 font-medium text-center">
              Camera permission is required to scan receipts. Please enable it
              in your device settings.
            </Text>
            <TouchableOpacity className="mt-6" onPress={onClose}>
              <Text className="text-white text-sm font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ReceiptScannerModal;
