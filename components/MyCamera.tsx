import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, Image } from "react-native";
import { Camera, CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";

const CameraComponent: React.FC = () => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [cameraPermissionStatus, requestCameraPermission] =
    useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [mediaPermissionsStatus, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [backgroundPermissionStatus, requestBackgroundPermission] =
    Location.useBackgroundPermissions();

  useEffect(() => {
    if (!cameraPermissionStatus || !cameraPermissionStatus.granted) {
      requestCameraPermission();
    }
  }, [cameraPermissionStatus]);

  useEffect(() => {
    if (!mediaPermissionsStatus || !mediaPermissionsStatus.granted) {
      requestMediaPermission();
    }
  }, [mediaPermissionsStatus]);

  useEffect(() => {
    async function getLocationPermission() {
      const result = await Location.requestForegroundPermissionsAsync();
      return result;
    }

    if (!backgroundPermissionStatus || !backgroundPermissionStatus.granted) {
      getLocationPermission();
    }
  }, [backgroundPermissionStatus]);

  const takePicture = async () => {
    if (cameraRef.current && isCameraEnabled) {
      // Check if camera is enabled
      const location = await Location.getCurrentPositionAsync();
      console.log(location);
      const locationExif = {
        GPSLatitude: location.coords.latitude,
        GPSLongitude: location.coords.longitude,
        GPSAltitude: location.coords.altitude,
        GPSSpeed: location.coords.speed,
        GPSTimeStamp: location.timestamp,
      };
      let photo = await cameraRef.current.takePictureAsync({
        exif: true,
        additionalExif: {
          location: locationExif,
        },
        onPictureSaved(photo) {
          console.log(photo.uri);
          setCapturedPhoto(photo.uri);
          savePhoto(photo.uri);
        },
      });
    }
  };

  const savePhoto = async (uri: string) => {
    if (mediaPermissionsStatus.granted) {
      await MediaLibrary.saveToLibraryAsync(uri);
    } else {
      console.log("Permission denied to save photo to device");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {isCameraEnabled && (
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
              justifyContent: "space-between",
              margin: 20,
            }}
          >
            <Button title="Take Picture" onPress={takePicture} />
          </View>
        </CameraView>
      )}
      {capturedPhoto && (
        <Image source={{ uri: capturedPhoto }} style={{ flex: 1 }} />
      )}
    </View>
  );
};

export default CameraComponent;
