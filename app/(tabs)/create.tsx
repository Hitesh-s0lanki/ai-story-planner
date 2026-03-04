import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { saveStory } from '@/lib/storage';
import { generateStory, generateCharacterImage } from '@/lib/gemini';
import { StoryInput } from '@/lib/types';

const GENRES = ['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Drama'];
const TONES = ['Serious', 'Lighthearted', 'Dark', 'Epic', 'Wholesome'];

const EMPTY_FORM: StoryInput = {
  character1Name: '',
  character1Role: '',
  character2Name: '',
  character2Role: '',
  background: '',
  genre: '',
  tone: '',
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#6D28D9', fontSize: 11, fontWeight: '700', marginBottom: 6, letterSpacing: 1 }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 12,
          color: '#1E1333',
          fontSize: 15,
          borderWidth: 1.5,
          borderColor: '#DDD6FE',
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        placeholder={placeholder}
        placeholderTextColor="#C4B5FD"
        value={value}
        onChangeText={onChange}
        multiline={multiline}
      />
    </View>
  );
}

function ChipSelector({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#6D28D9', fontSize: 11, fontWeight: '700', marginBottom: 8, letterSpacing: 1 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(selected === opt ? '' : opt)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: selected === opt ? '#7C3AED' : '#FFFFFF',
              borderWidth: 1.5,
              borderColor: selected === opt ? '#7C3AED' : '#DDD6FE',
            }}
          >
            <Text style={{ color: selected === opt ? '#FFFFFF' : '#6D28D9', fontSize: 13, fontWeight: '600' }}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function CreateScreen() {
  const [form, setForm] = useState<StoryInput>(EMPTY_FORM);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState('');

  function update(key: keyof StoryInput) {
    return (value: string) => setForm(f => ({ ...f, [key]: value }));
  }

  async function handleGenerate() {
    if (!form.character1Name.trim() || !form.character1Role.trim()) {
      Alert.alert('Missing info', 'Please fill in Character 1 name and role.');
      return;
    }
    if (!form.character2Name.trim() || !form.character2Role.trim()) {
      Alert.alert('Missing info', 'Please fill in Character 2 name and role.');
      return;
    }
    if (!form.background.trim()) {
      Alert.alert('Missing info', 'Please describe the story background.');
      return;
    }
    if (!form.genre) {
      Alert.alert('Missing info', 'Please select a genre.');
      return;
    }

    setGenerating(true);
    try {
      setStep('Crafting your story...');
      const { title, panels } = await generateStory(form);

      setStep('Generating character images...');
      const char1Image = await generateCharacterImage(
        { name: form.character1Name, role: form.character1Role },
        form.genre
      );
      const char2Image = await generateCharacterImage(
        { name: form.character2Name, role: form.character2Role },
        form.genre
      );

      const enrichedPanels = panels.map((panel, i) => ({
        ...panel,
        imageBase64: i % 2 === 0 ? (char1Image ?? undefined) : (char2Image ?? undefined),
      }));

      const story = {
        id: Date.now().toString(),
        title,
        characters: [
          { name: form.character1Name, role: form.character1Role },
          { name: form.character2Name, role: form.character2Role },
        ],
        panels: enrichedPanels,
        createdAt: new Date().toISOString(),
      };

      await saveStory(story);

      // Reset form after successful generation
      setForm(EMPTY_FORM);

      router.push(`/story/${story.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Generation failed', message);
    } finally {
      setGenerating(false);
      setStep('');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#F8F7FF' }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ color: '#1E1333', fontSize: 28, fontWeight: '800' }}>Create Story</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Define your characters and world</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Character 1 */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDE9FE' }}>
          <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700', marginBottom: 12 }}>✦ CHARACTER 1</Text>
          <Field label="NAME" value={form.character1Name} onChange={update('character1Name')} placeholder="e.g. Sakura Miyamoto" />
          <Field label="ROLE" value={form.character1Role} onChange={update('character1Role')} placeholder="e.g. Warrior princess" />
        </View>

        {/* Character 2 */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDE9FE' }}>
          <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700', marginBottom: 12 }}>✦ CHARACTER 2</Text>
          <Field label="NAME" value={form.character2Name} onChange={update('character2Name')} placeholder="e.g. Ryuu Tanaka" />
          <Field label="ROLE" value={form.character2Role} onChange={update('character2Role')} placeholder="e.g. Dark sorcerer" />
        </View>

        {/* Story Settings */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDE9FE' }}>
          <Text style={{ color: '#7C3AED', fontSize: 13, fontWeight: '700', marginBottom: 12 }}>✦ STORY WORLD</Text>
          <Field
            label="BACKGROUND"
            value={form.background}
            onChange={update('background')}
            placeholder="Describe the setting, world, or situation..."
            multiline
          />
          <ChipSelector label="GENRE" options={GENRES} selected={form.genre} onSelect={update('genre')} />
          <ChipSelector label="TONE (OPTIONAL)" options={TONES} selected={form.tone} onSelect={update('tone')} />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          style={{
            backgroundColor: generating ? '#A78BFA' : '#7C3AED',
            borderRadius: 16,
            padding: 18,
            alignItems: 'center',
            marginTop: 8,
          }}
          activeOpacity={0.8}
        >
          {generating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{step || 'Generating...'}</Text>
            </View>
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>✨ Generate Story</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
