export type Phase = 'Hypertrophy' | 'Strength' | 'Endurance';
export type ExerciseType = 'compound' | 'isolation';

export interface Exercise {
  name: string;
  type: ExerciseType;
  weight: number;
  reps: number;
  date: string;
  phase: Phase;
}

export const DUP_CONFIG = {
  Hypertrophy: { min: 8, max: 12, sets: 3 },
  Strength: { min: 4, max: 6, sets: 4 },
  Endurance: { min: 15, max: 20, sets: 2 },
};

// The Science: Calculate the next target weight
export function calculateNextTarget(history: Exercise[], currentPhase: Phase) {
  const phaseConfig = DUP_CONFIG[currentPhase];
  
  // Get the last two sessions for this specific phase
  const relevantHistory = history
    .filter((h) => h.phase === currentPhase)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (relevantHistory.length < 2) return { weight: null, note: "Need 2 sessions for baseline." };

  const last = relevantHistory[0];
  const prev = relevantHistory[1];

  // 2-for-2 Rule: If you hit 2 reps over the max for two consecutive sessions
  if (last.reps >= phaseConfig.max + 2 && prev.reps >= phaseConfig.max + 2) {
    const increment = last.type === 'compound' ? 5 : 2.5;
    return { 
      weight: last.weight + increment, 
      note: `🚀 Progression! +${increment}lb jump earned.` 
    };
  }

  return { 
    weight: last.weight, 
    note: `Stay at ${last.weight}lb. Goal: ${phaseConfig.max + 2} reps twice.` 
  };
}