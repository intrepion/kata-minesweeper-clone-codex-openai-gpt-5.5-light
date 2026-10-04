import type { Difficulty, DifficultyName } from "./types";

export const DIFFICULTIES: Record<DifficultyName, Difficulty> = {
  beginner: {
    name: "beginner",
    label: "Beginner",
    width: 9,
    height: 9,
    mines: 10
  },
  intermediate: {
    name: "intermediate",
    label: "Intermediate",
    width: 16,
    height: 16,
    mines: 40
  },
  expert: {
    name: "expert",
    label: "Expert",
    width: 30,
    height: 16,
    mines: 99
  }
};

export function getDifficulty(name: DifficultyName): Difficulty {
  return DIFFICULTIES[name];
}
