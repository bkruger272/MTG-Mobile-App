import React, { useState, useEffect, useRef } from 'react'; // Added useRef here
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission, 
  useFrameProcessor, 
  runOnJS 
} from 'react-native-vision-camera';
import { COLORS } from '../Styles/theme';
import MlkitOcr from 'react-native-mlkit-ocr';



export default function ScannerView({ onCardDetected, onClose }) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [detectedName, setDetectedName] = useState("");
  const camera = useRef(null); // This is now valid
  const [isScanning, setIsScanning] = useState(false);


  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

const handleManualScan = () => {
    // This allows us to trigger the scan on demand
    if (detectedName && detectedName !== "Scanning...") {
      onCardDetected(detectedName);
    } else {
      console.log("Still looking for a name... try adjusting the card.");
    }
  };



// ... inside your ScannerView component ...

const takeSnapshot = async () => {
  if (camera.current && !isScanning) {
    try {
      setIsScanning(true);
      setDetectedName("Consulting the Grimoire...");

      // 1. Capture a high-res photo
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      // 2. Run the high-accuracy OCR on the file path
      // Note: We use 'file://' prefix for Android paths
      const result = await MlkitOcr.detectFromFile(`file://${photo.path}`);

      if (result && result.length > 0) {
        // Magic card names are almost always in the first detected block
        const cardName = result[0].text.split('\n')[0];
        
        console.log("Found Card:", cardName);
        setDetectedName(cardName);

        // 3. Send to main app to trigger Trample/Haste banners!
        onCardDetected(cardName);
      } else {
        alert("The Grimoire couldn't read the name. Try centering it in the box!");
      }
    } catch (e) {
      console.log("OCR Error:", e);
      setDetectedName("Scan failed. Try again!");
    } finally {
      setIsScanning(false);
    }
  }
};

  // 2. Disable the "Live" frame processor to stop the error flooding
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Keeping it empty to stop the 'Internal Error' logs
  }, []);
  if (!hasPermission) return <View style={styles.container}><Text style={styles.info}>Waiting for Permission...</Text></View>;
  if (device == null) return <View style={styles.container}><Text style={styles.info}>Waking up lens...</Text></View>;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera} // CRITICAL: This connects the ref to the hardware
          style={styles.camera}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
          photo={true} // Enable photo capture mode
        />
        <View style={styles.viewfinder} />
      </View>
      
      <View style={styles.controls}>
        <Text style={styles.scanText}>
           Manual Test Mode: Press Confirm to Snapshot
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={takeSnapshot}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? "Reading..." : "Confirm Scan"}
            </Text>
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
    top: 40,           // Move it to the top of the camera window
    alignSelf: 'center',
    width: '90%',      
    height: 45,        // Thin box just for the name
    borderWidth: 2, 
    borderColor: COLORS.gold, 
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