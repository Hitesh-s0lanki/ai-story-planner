import AsyncStorage from '@react-native-async-storage/async-storage';
import { Story, UserProfile } from './types';

const KEYS = {
  STORIES: 'mystory_stories',
  PROFILE: 'mystory_profile',
};

// Profile
export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.PROFILE);
  return raw ? JSON.parse(raw) : null;
}

// Stories
export async function loadStories(): Promise<Story[]> {
  const raw = await AsyncStorage.getItem(KEYS.STORIES);
  return raw ? JSON.parse(raw) : [];
}

export async function saveStory(story: Story): Promise<void> {
  const stories = await loadStories();
  const exists = stories.findIndex(s => s.id === story.id);
  if (exists >= 0) {
    stories[exists] = story;
  } else {
    stories.unshift(story);
  }
  await AsyncStorage.setItem(KEYS.STORIES, JSON.stringify(stories));
}

export async function deleteStory(id: string): Promise<void> {
  const stories = await loadStories();
  const filtered = stories.filter(s => s.id !== id);
  await AsyncStorage.setItem(KEYS.STORIES, JSON.stringify(filtered));
}

export async function loadStory(id: string): Promise<Story | null> {
  const stories = await loadStories();
  return stories.find(s => s.id === id) ?? null;
}
