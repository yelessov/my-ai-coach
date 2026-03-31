'use client';

import { useState, useEffect } from 'react';
import { calculateNextTarget, DUP_CONFIG, Phase, Exercise } from '@/lib/wokout-logic';
import { ChevronRight, RotateCcw, BrainCircuit, Settings, Plus, Trash2 } from 'lucide-react';

export default function GymApp() {
  const [activeTab, setActiveTab] = useState<'workout' | 'ai' | 'settings'>('workout');
  const [history, setHistory] = useState<Exercise[]>([]);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [workoutType, setWorkoutType] = useState<'A' | 'B'>('A');
  const [apiKey, setApiKey] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Your default science-based split
  const [exercises, setExercises] = useState({
    A: ["Leg Press", "Incline DB Press", "Dumbbell Row", "Seated Leg Curl", "Shoulder Press", "Back Extension", "Lat Raises", "Preacher Curl"],
    B: ["Squats", "Lat Pulldown", "Chest Press", "Romanian Deadlift", "Butterfly", "Skullcrusher"]
  });

  const phases: Phase[] = ['Hypertrophy', 'Strength', 'Endurance'];
  const currentPhase = phases[phaseIdx];

  // Load data on start
  useEffect(() => {
    const saved = localStorage.getItem('gym-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setHistory(parsed.history || []);
      setPhaseIdx(parsed.phaseIdx || 0);
      setWorkoutType(parsed.workoutType || 'A');
      setExercises(parsed.exercises || exercises);
      setApiKey(localStorage.getItem('gemini-key') || '');
    }
  }, []);

  const saveAll = (newHistory: Exercise[], newPhase: number, newType: 'A' | 'B', newEx: any) => {
    localStorage.setItem('gym-data', JSON.stringify({ history: newHistory, phaseIdx: newPhase, workoutType: newType, exercises: newEx }));
  };

  const handleLog = (index: number, weight: number, reps: number) => {
    const entry: Exercise = {
      name: exercises[workoutType][index],
      type: exercises[workoutType][index].toLowerCase().includes('raises') || exercises[workoutType][index].toLowerCase().includes('curl') ? 'isolation' : 'compound',
      weight,
      reps,
      date: new Date().toISOString(),
      phase: currentPhase
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    saveAll(newHistory, phaseIdx, workoutType, exercises);
  };

  const finishWorkout = () => {
    let nextType: 'A' | 'B' = workoutType === 'A' ? 'B' : 'A';
    let nextPhase = phaseIdx;
    if (workoutType === 'B') nextPhase = (phaseIdx + 1) % 3;
    
    setWorkoutType(nextType);
    setPhaseIdx(nextPhase);
    saveAll(history, nextPhase, nextType, exercises);
    window.scrollTo(0,0);
  };

  const getAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        body: JSON.stringify({ history, apiKey })
      });
      const data = await res.json();
      setAiAdvice(data.advice || data.error);
    } catch (e) {
      setAiAdvice("Connection error.");
    }
    setLoadingAi(false);
  };

  const swapExercise = (index: number) => {
    const newName = prompt("Enter new exercise name:");
    if (newName) {
      const newEx = { ...exercises };
      newEx[workoutType][index] = newName;
      setExercises(newEx);
      saveAll(history, phaseIdx, workoutType, newEx);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#0a0a0c] pb-24">
      {/* Header */}
      <header className="p-6 pt-12 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Workout {workoutType}</h2>
            <h1 className="text-2xl font-bold text-white">{currentPhase}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Target Range</p>
            <p className="text-sm font-mono text-cyan-400">{DUP_CONFIG[currentPhase].min}-{DUP_CONFIG[currentPhase].max} Reps</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="p-4 flex-1">
        {activeTab === 'workout' && (
          <div className="space-y-4">
            {exercises[workoutType].map((ex, i) => {
              const recommendation = calculateNextTarget(history.filter(h => h.name === ex), currentPhase);
              return (
                <div key={i} className="bg-[#16161a] border border-white/5 rounded-3xl p-5 shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <button onClick={() => swapExercise(i)} className="text-sm font-bold text-white hover:text-cyan-400 transition-colors text-left">
                      {ex} <span className="text-[10px] text-slate-600 block">Tap to Swap</span>
                    </button>
                    <div className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-1 rounded-full font-black">
                       TARGET: {recommendation.weight || '??'} LB
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-4 italic">{recommendation.note}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" id={`w-${i}`} placeholder="Weight" 
                      className="bg-black/40 border border-white/10 rounded-xl p-3 text-center text-sm font-bold focus:border-cyan-500 outline-none transition-all"
                    />
                    <input 
                      type="number" id={`r-${i}`} placeholder="Reps" 
                      onBlur={(e) => {
                        const w = (document.getElementById(`w-${i}`) as HTMLInputElement).value;
                        if(w && e.target.value) handleLog(i, parseFloat(w), parseInt(e.target.value));
                      }}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 text-center text-sm font-bold focus:border-cyan-500 outline-none transition-all text-cyan-400"
                    />
                  </div>
                </div>
              );
            })}
            <button 
              onClick={finishWorkout}
              className="w-full py-5 bg-cyan-500 text-black font-black rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95 transition-all uppercase tracking-widest text-sm"
            >
              Complete Session
            </button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="text-cyan-400 w-6 h-6" />
                <h2 className="text-lg font-bold">Coach Analysis</h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-300 italic">
                {aiAdvice || "Ready to audit your progress. Hit the button below to analyze your recent trends."}
              </p>
              <button 
                onClick={getAiInsight}
                disabled={loadingAi}
                className="mt-6 text-xs font-bold text-cyan-400 flex items-center gap-2 hover:opacity-70"
              >
                {loadingAi ? "THINKING..." : "GENERATE SESSION AUDIT →"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-[#16161a] rounded-3xl p-6 border border-white/5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Gemini API Key</label>
              <input 
                type="password" value={apiKey} 
                onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('gemini-key', e.target.value); }}
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-mono text-cyan-400"
                placeholder="Enter key..."
              />
            </div>
            <button 
              onClick={() => { if(confirm("Erase all progress?")) { localStorage.clear(); location.reload(); }}}
              className="w-full p-4 border border-red-500/20 text-red-500 text-xs font-black rounded-2xl uppercase tracking-widest"
            >
              Reset All Training Data
            </button>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0c]/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center">
        <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'workout' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <RotateCcw size={20} />
          <span className="text-[8px] font-black uppercase">Lift</span>
        </button>
        <button onClick={() => setActiveTab('ai')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'ai' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <BrainCircuit size={20} />
          <span className="text-[8px] font-black uppercase">Coach</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-cyan-400 scale-110' : 'text-slate-600'}`}>
          <Settings size={20} />
          <span className="text-[8px] font-black uppercase">Prefs</span>
        </button>
      </nav>
    </div>
  );
}