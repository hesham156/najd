/**
 * مكون تسجيل الصوت - Mobile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({
  onRecordingComplete,
  onCancel,
}: VoiceRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    startRecording();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // أنيميشن النبض
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // طلب الإذن
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('يجب السماح بالوصول للميكروفون');
        onCancel();
        return;
      }

      // إعداد الصوت
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // بدء التسجيل
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('فشل بدء التسجيل');
      onCancel();
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        onRecordingComplete(uri, recordingTime);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('فشل إيقاف التسجيل');
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error canceling:', error);
      }
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* أيقونة الميكروفون */}
        <Animated.View
          style={[
            styles.microphoneContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Icon name="microphone" size={40} color="#FFF" />
        </Animated.View>

        {/* معلومات التسجيل */}
        <View style={styles.info}>
          <Text style={styles.statusText}>
            {isRecording ? '🎙️ جاري التسجيل...' : '⏸️ متوقف'}
          </Text>
          <Text style={styles.timeText}>{formatTime(recordingTime)}</Text>
        </View>

        {/* أزرار التحكم */}
        <View style={styles.controls}>
          {/* إيقاف وإرسال */}
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopRecording}
            disabled={!isRecording}
          >
            <Icon name="stop" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* إلغاء */}
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={cancelRecording}
          >
            <Icon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.hint}>💡 تحدث بوضوح - الحد الأقصى 5 دقائق</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  microphoneContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});


