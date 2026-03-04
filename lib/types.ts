export interface Character {
  name: string;
  role: string;
}

export interface Panel {
  imageBase64?: string;
  imageDescription: string;
  dialogue: string;
  narration: string;
  characterName?: string;
}

export interface Story {
  id: string;
  title: string;
  characters: Character[];
  panels: Panel[];
  createdAt: string;
}

export interface StoryInput {
  character1Name: string;
  character1Role: string;
  character2Name: string;
  character2Role: string;
  background: string;
  genre: string;
  tone: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
}
