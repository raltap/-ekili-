export interface GiveawaySettings {
  title: string;
  winnerCount: number;
  substituteCount: number;
  duration: number;
  soundEnabled: boolean;
  confettiEnabled: boolean;
}

export interface Participant {
  id: string;
  name: string;
}

export interface DrawResult {
  id: string;
  timestamp: number;
  title: string;
  winners: string[];
  substitutes: string[];
}
