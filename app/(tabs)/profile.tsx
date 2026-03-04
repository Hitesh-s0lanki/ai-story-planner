import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { loadProfile, saveProfile, loadStories } from '@/lib/storage';
import { UserProfile } from '@/lib/types';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [storyCount, setStoryCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useFocusEffect(useCallback(() => {
    async function load() {
      const [p, stories] = await Promise.all([loadProfile(), loadStories()]);
      setProfile(p);
      setStoryCount(stories.length);
      if (p) setDisplayName(p.displayName);
    }
    load();
  }, []));

  async function handleSave() {
    if (!profile) return;
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty.');
      return;
    }
    const updated = { ...profile, displayName: displayName.trim() };
    await saveProfile(updated);
    setProfile(updated);
    setEditing(false);
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F7FF', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 24 }}>
          <Text style={{ color: '#1E1333', fontSize: 28, fontWeight: '800' }}>Profile</Text>
        </View>

        {/* Avatar + Name */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: '#EDE9FE',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            borderWidth: 2,
            borderColor: '#7C3AED',
          }}>
            <Text style={{ fontSize: 40 }}>⛩️</Text>
          </View>
          <Text style={{ color: '#1E1333', fontSize: 22, fontWeight: '700' }}>{profile.displayName}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>@{profile.username}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 24 }}>
          <View style={{
            flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#EDE9FE',
            shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ color: '#7C3AED', fontSize: 28, fontWeight: '800' }}>{storyCount}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Stories</Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#EDE9FE',
            shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Text style={{ color: '#EC4899', fontSize: 28, fontWeight: '800' }}>{storyCount * 5}</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>Panels</Text>
          </View>
        </View>

        {/* Edit display name */}
        <View style={{
          marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: '#EDE9FE',
          shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#1E1333', fontSize: 16, fontWeight: '700' }}>Settings</Text>
            <TouchableOpacity
              onPress={() => editing ? handleSave() : setEditing(true)}
              style={{
                backgroundColor: editing ? '#7C3AED' : '#F5F3FF',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: editing ? '#7C3AED' : '#DDD6FE',
              }}
            >
              <Text style={{ color: editing ? '#FFFFFF' : '#6D28D9', fontSize: 13, fontWeight: '600' }}>
                {editing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text style={{ color: '#6D28D9', fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 1 }}>
              DISPLAY NAME
            </Text>
            <TextInput
              style={{
                backgroundColor: editing ? '#FFFFFF' : '#F8F7FF',
                borderRadius: 10,
                padding: 12,
                color: '#1E1333',
                fontSize: 15,
                borderWidth: 1.5,
                borderColor: editing ? '#7C3AED' : '#EDE9FE',
              }}
              value={displayName}
              onChangeText={setDisplayName}
              editable={editing}
              autoCapitalize="words"
            />
          </View>

          {editing && (
            <TouchableOpacity
              onPress={() => { setEditing(false); setDisplayName(profile.displayName); }}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: '#9CA3AF', textAlign: 'center', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
