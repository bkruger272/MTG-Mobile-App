import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { scanText } from 'react-native-vision-camera-ocr-plus';
import { runAtTargetFps, Worklets } from 'react-native-worklets-core';
import { COLORS } from '../Styles/theme';

export default function ScannerView({ onCardDetected, onClose }) {
  const device = useCameraDevice('back');
  const [detectedName, setDetectedName] = useState("");

  // This bridge allows the high-speed camera thread to talk to your React UI
  const updateUI = Worklets.createRunOnJS((text) => {
    setDetectedName(text);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAtTargetFps(3, () => {
      const data = scanText(frame);
      // Logic: The card name is almost always the first block of text found
      if (data.blocks && data.blocks.length > 0) {
        const topText = data.blocks[0].text.split('\n')[0]; 
        updateUI(topText);
      }
    });
  }, [updateUI]);

  if (device == null) return <View style={styles.container}><Text style={styles.info}>Initializing Camera...</Text></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv" // Most efficient for OCR
      />
      
      {/* Viewfinder Overlay */}
      <View style={styles.overlay}>
        <View style={styles.viewfinder} />
        
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
              <Text style={styles.buttonText}>Confirm Name</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  info: { color: 'white', textAlign: 'center', marginTop: 100 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  viewfinder: { width: '80%', height: 60, borderWidth: 2, borderColor: COLORS.gold, borderRadius: 8, backgroundColor: 'rgba(255,215,0,0.1)' },
  controls: { width: '100%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  scanText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 20 },
  confirmButton: { backgroundColor: COLORS.gold, padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  cancelButton: { backgroundColor: '#444', padding: 15, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});