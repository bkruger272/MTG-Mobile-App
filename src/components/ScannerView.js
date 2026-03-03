import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useFrameProcessor, 
  runOnJS 
} from 'react-native-vision-camera';
import { scanText } from 'react-native-vision-camera-ocr-plus';
import { COLORS } from '../Styles/theme';

export default function ScannerView({ onCardDetected, onClose }) {
  // 1. ALL Hooks must be inside the function
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [detectedName, setDetectedName] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // "Wait" status

  // 2. Handle permissions inside the component lifecycle
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // 3. The Frame Processor using the modern runOnJS bridge
  const frameProcessor = useFrameProcessor((frame) => {
      'worklet';
      if (isProcessing) return;

      // Safety check: only run if the function actually exists in this thread
      if (typeof scanText !== 'undefined') {
        try {
          const data = scanText(frame);
          if (data?.result?.blocks?.length > 0) {
            const cardName = data.result.blocks[0].text.split('\n')[0];
            runOnJS(setDetectedName)(cardName);
          }
        } catch (e) {
          // Log sparingly to stop the churn
        }
      }
  }, [isProcessing]);

  // 4. Loading state if device isn't ready
  if (!hasPermission) return <View style={styles.container}><Text style={styles.info}>Waiting for Camera Permission...</Text></View>;
  // Safety check for the camera hardware
  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Waking up the camera lens...</Text>
      </View>
    );
  }
return (
    <View style={styles.mainContainer}>
      {/* This is the "Window" for the camera */}
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />
        {/* Viewfinder stays inside the camera window */}
        <View style={styles.viewfinder} />
      </View>
      
      {/* Controls stay outside the window at the bottom */}
      <View style={styles.controls}>
        <Text style={styles.scanText}>
          {detectedName ? `Found: ${detectedName}` : "Point at Card Name"}
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.confirmButton, !detectedName && {opacity: 0.5}]} 
            onPress={() => detectedName && onCardDetected(detectedName)}
            disabled={!detectedName}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 50
  },
  cameraContainer: {
    width: '85%',
    aspectRatio: 3/4, // TCG card shape
    borderRadius: 20,
    overflow: 'hidden', 
    borderWidth: 2,
    borderColor: COLORS.gold,
    backgroundColor: 'black',
    position: 'relative', // Keeps the viewfinder inside
  },
  camera: {
    flex: 1,
  },
  viewfinder: { 
    position: 'absolute',
    top: '10%', // Position it over the card's name area
    alignSelf: 'center',
    width: '80%', 
    height: 40, 
    borderWidth: 1, 
    borderColor: 'rgba(255,215,0,0.5)', 
    borderRadius: 5, 
    backgroundColor: 'rgba(255,215,0,0.1)' 
  },
  info: { color: 'white', textAlign: 'center', marginTop: 100 },
  controls: { 
    width: '100%', 
    alignItems: 'center', 
    padding: 30,
    marginTop: 20
  },
  scanText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 20 },
  confirmButton: { backgroundColor: COLORS.gold, padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  cancelButton: { backgroundColor: '#444', padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});