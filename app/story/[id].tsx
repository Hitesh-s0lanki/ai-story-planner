import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { loadStory } from '@/lib/storage';
import { Story, Panel } from '@/lib/types';

const { width } = Dimensions.get('window');

const PANEL_ICONS = ['⚔️', '🌸', '🌙', '⚡', '🔮'];
const PANEL_COLORS = ['#EDE9FE', '#FDF2F8', '#EFF6FF', '#FFFBEB', '#F5F3FF'];

function PanelCard({ panel, index }: { panel: Panel; index: number }) {
  return (
    <View style={{
      marginBottom: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#EDE9FE',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }}>
      {/* Panel header */}
      <View style={{
        backgroundColor: '#F5F3FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
        <View style={{
          backgroundColor: '#7C3AED',
          borderRadius: 20,
          width: 26,
          height: 26,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{index + 1}</Text>
        </View>
        {panel.characterName && (
          <Text style={{ color: '#6D28D9', fontSize: 13, fontWeight: '600' }}>{panel.characterName}</Text>
        )}
      </View>

      {/* Character image or placeholder */}
      {panel.imageBase64 ? (
        <Image
          source={{ uri: panel.imageBase64 }}
          style={{ width: '100%', height: width * 0.65 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{
          width: '100%',
          height: width * 0.55,
          backgroundColor: PANEL_COLORS[index % PANEL_COLORS.length],
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {PANEL_ICONS[index % PANEL_ICONS.length]}
          </Text>
          <Text style={{ color: '#6D28D9', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            {panel.imageDescription}
          </Text>
        </View>
      )}

      {/* Dialogue bubble */}
      {panel.dialogue ? (
        <View style={{ margin: 14, marginBottom: 8 }}>
          <View style={{
            backgroundColor: '#EDE9FE',
            borderRadius: 16,
            borderBottomLeftRadius: 4,
            padding: 12,
          }}>
            <Text style={{ color: '#1E1333', fontSize: 14, fontWeight: '500', lineHeight: 20 }}>
              {panel.dialogue}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Narration */}
      {panel.narration ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: panel.dialogue ? 4 : 14 }}>
          <Text style={{ color: '#7C3AED', fontSize: 13, lineHeight: 20, fontStyle: 'italic' }}>
            {panel.narration}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory(id).then(s => {
      setStory(s);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F7FF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#7C3AED" size="large" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F7FF', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ color: '#1E1333', fontSize: 18, fontWeight: '600' }}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#7C3AED', fontSize: 15 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={{
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8F7FF',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: '#EDE9FE' }}
        >
          <Text style={{ color: '#1E1333', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#1E1333', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
            {story.title}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
            {story.characters.map(c => c.name).join(' & ')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40 }}>
        {/* Character chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {story.characters.map((c, i) => (
            <View key={i} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: '#EDE9FE',
            }}>
              <Text style={{ fontSize: 14 }}>{i === 0 ? '⚔️' : '✨'}</Text>
              <View>
                <Text style={{ color: '#1E1333', fontSize: 13, fontWeight: '600' }}>{c.name}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{c.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Panels */}
        {story.panels.map((panel, i) => (
          <PanelCard key={i} panel={panel} index={i} />
        ))}

        {/* End */}
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ fontSize: 32 }}>🌸</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>— End of Story —</Text>
        </View>
      </ScrollView>
    </View>
  );
}
