import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { loadStories, deleteStory } from '@/lib/storage';
import { Story } from '@/lib/types';

function StoryCard({ story, onDelete }: { story: Story; onDelete: () => void }) {
  const date = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  function confirmDelete() {
    Alert.alert('Delete Story', `Delete "${story.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/story/${story.id}`)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EDE9FE',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {story.characters.map((c, i) => (
              <View key={i} style={{ backgroundColor: '#EDE9FE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#6D28D9', fontSize: 11, fontWeight: '600' }}>
                  {c.name}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ color: '#1E1333', fontSize: 17, fontWeight: '700', marginBottom: 6 }} numberOfLines={2}>
            {story.title}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
            {story.panels.length} panels · {date}
          </Text>
        </View>
        <View style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          backgroundColor: '#F5F3FF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 24 }}>📖</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => router.push(`/story/${story.id}`)}
          style={{ flex: 1, backgroundColor: '#7C3AED', borderRadius: 10, padding: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>Read Story</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmDelete}
          style={{ backgroundColor: '#FFF1F2', borderRadius: 10, padding: 10, paddingHorizontal: 16, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStories = useCallback(async () => {
    const data = await loadStories();
    setStories(data);
  }, []);

  useFocusEffect(useCallback(() => {
    fetchStories();
  }, [fetchStories]));

  async function handleRefresh() {
    setRefreshing(true);
    await fetchStories();
    setRefreshing(false);
  }

  async function handleDelete(id: string) {
    await deleteStory(id);
    await fetchStories();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <StatusBar barStyle="dark-content" />

      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ color: '#1E1333', fontSize: 28, fontWeight: '800' }}>My Stories</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
          {stories.length} {stories.length === 1 ? 'story' : 'stories'} created
        </Text>
      </View>

      {stories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🌸</Text>
          <Text style={{ color: '#1E1333', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            No stories yet
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>
            Tap the Create tab to generate your first anime story
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/create')}
            style={{ backgroundColor: '#7C3AED', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Create Story</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          renderItem={({ item }) => (
            <StoryCard story={item} onDelete={() => handleDelete(item.id)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7C3AED" />
          }
        />
      )}
    </View>
  );
}
