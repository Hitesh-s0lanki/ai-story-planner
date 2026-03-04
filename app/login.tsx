import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { saveProfile } from '@/lib/storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!username.trim()) {
      Alert.alert('Username required', 'Please enter a username to continue.');
      return;
    }
    setLoading(true);
    try {
      await saveProfile({ username: username.trim(), displayName: username.trim() });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F8F7FF', justifyContent: 'center', padding: 28 }}
    >
      {/* Hero */}
      <View style={{ alignItems: 'center', marginBottom: 52 }}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>⛩️</Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#1E1333', letterSpacing: 0.5 }}>
          MyStory
        </Text>
        <Text style={{ fontSize: 14, color: '#7C3AED', marginTop: 6, textAlign: 'center', fontWeight: '500' }}>
          AI-powered anime comic generator
        </Text>
      </View>

      {/* Form */}
      <View style={{ gap: 16 }}>
        <View>
          <Text style={{ color: '#6D28D9', fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 1 }}>
            USERNAME
          </Text>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 14,
              color: '#1E1333',
              fontSize: 16,
              borderWidth: 1.5,
              borderColor: '#DDD6FE',
            }}
            placeholder="Enter your username"
            placeholderTextColor="#C4B5FD"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleStart}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          onPress={handleStart}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#A78BFA' : '#7C3AED',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            {loading ? 'Starting...' : 'Begin Your Story'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
