import React, { useState, useEffect, useRef } from 'react';
import { MoodType, EmotionalJournalEntry } from '../types';

export const MOOD_OPTIONS: { id: MoodType; emoji: string; label: string; color: string }[] = [
  { id: 'happy', emoji: '😊', label: 'Feliz', color: 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300' },
  { id: 'calm', emoji: '😌', label: 'Calmo', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' },
  { id: 'focused', emoji: '🎯', label: 'Focado', color: 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300' },
  { id: 'curious', emoji: '🧐', label: 'Curioso', color: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300' },
  { id: 'excited', emoji: '🤩', label: 'Empolgado', color: 'bg-purple-500/15 border-purple-500/40 text-purple-700 dark:text-purple-300' },
  { id: 'creative', emoji: '🎨', label: 'Criativo', color: 'bg-pink-500/15 border-pink-500/40 text-pink-700 dark:text-pink-300' },
  { id: 'anxious', emoji: '😟', label: 'Ansioso', color: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-700 dark:text-yellow-300' },
  { id: 'tired', emoji: '🥱', label: 'Cansado', color: 'bg-slate-500/15 border-slate-500/40 text-slate-700 dark:text-slate-300' },
  { id: 'overwhelmed', emoji: '🤯', label: 'Agitado', color: 'bg-orange-500/15 border-orange-500/40 text-orange-700 dark:text-orange-300' },
  { id: 'sad', emoji: '😢', label: 'Triste', color: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-700 dark:text-cyan-300' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrado', color: 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300' },
];

const LOCAL_STORAGE_KEY = 'foco_emotional_journal_entries';

interface EmotionalJournalProps {
  onEntryAdded?: (entry: EmotionalJournalEntry) => void;
  className?: string;
}

export const EmotionalJournal: React.FC<EmotionalJournalProps> = ({ onEntryAdded, className = '' }) => {
  const [entries, setEntries] = useState<EmotionalJournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    // Default initial mock entries
    return [
      {
        id: '1',
        mood: 'happy',
        emoji: '😊',
        moodLabel: 'Feliz',
        note: 'Consegui terminar a primeira atividade de ciências logo cedo!',
        timestamp: 'Hoje às 09:15',
        isVoiceNote: false,
      },
      {
        id: '2',
        mood: 'calm',
        emoji: '😌',
        moodLabel: 'Calmo',
        note: 'Fiz a pausa guiada de respiração com o mascotinho Nori.',
        timestamp: 'Hoje às 11:30',
        isVoiceNote: true,
      },
    ];
  });

  const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
  const [noteText, setNoteText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [wasRecordedByVoice, setWasRecordedByVoice] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  // Speech Recognition Ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore
    }
  }, [entries]);

  // Handle Speech Recognition toggle
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Check browser SpeechRecognition support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser fallback simulation if API not available in iframe
      setIsRecording(true);
      const simulatedText = 'Estou me sentindo muito bem agora depois da aula!';
      let currentLen = 0;
      const interval = setInterval(() => {
        currentLen += 5;
        setNoteText(simulatedText.slice(0, currentLen));
        if (currentLen >= simulatedText.length) {
          clearInterval(interval);
          setIsRecording(false);
          setWasRecordedByVoice(true);
        }
      }, 200);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setNoteText(transcript);
        setWasRecordedByVoice(true);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() && !selectedMood) return;

    const currentMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood) || MOOD_OPTIONS[0];

    const now = new Date();
    const formattedTime = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEntry: EmotionalJournalEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      emoji: currentMoodObj.emoji,
      moodLabel: currentMoodObj.label,
      note: noteText.trim() || `Registrou um momento ${currentMoodObj.label.toLowerCase()}.`,
      timestamp: formattedTime,
      isVoiceNote: wasRecordedByVoice,
    };

    setEntries((prev) => [newEntry, ...prev]);
    if (onEntryAdded) {
      onEntryAdded(newEntry);
    }

    // Reset input
    setNoteText('');
    setWasRecordedByVoice(false);

    // Show reward toast
    setRewardToast('+10 Moedas adicionadas ao seu Mascote!');
    setTimeout(() => {
      setRewardToast(null);
    }, 3000);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedMoodObj = MOOD_OPTIONS.find((m) => m.id === selectedMood) || MOOD_OPTIONS[0];

  return (
    <section className={`flex flex-col gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-[2rem] border-2 border-outline-variant/60 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container/40 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">menu_book</span>
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-on-surface flex items-center gap-2">
              <span>Diário Emocional</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-tertiary-container/60 text-on-tertiary-container">
                {entries.length} registros
              </span>
            </h2>
            <p className="text-xs text-outline font-semibold">
              Registre como se sente ao longo do dia por texto ou voz
            </p>
          </div>
        </div>
      </div>

      {/* Toast Reward Banner */}
      {rewardToast && (
        <div className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-500">monetization_on</span>
            <span>{rewardToast}</span>
          </div>
          <span className="text-base">🌟</span>
        </div>
      )}

      {/* Entry Input Form */}
      <form onSubmit={handleSaveEntry} className="flex flex-col gap-3">
        <label className="text-xs font-black text-on-surface uppercase tracking-wider">
          1. Escolha o Sentimento Atual:
        </label>

        {/* Emotion Buttons Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? `${m.color} border-primary scale-102 shadow-xs ring-2 ring-primary/30`
                    : 'bg-surface-container/60 border-outline-variant/40 text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="text-2xl leading-none">{m.emoji}</span>
                <span className="font-black text-[11px] leading-tight">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note Textarea & Voice Recording Controls */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Nota rápida (Voz ou Texto):</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${selectedMoodObj.color}`}>
                {selectedMoodObj.emoji} {selectedMoodObj.label}
              </span>
            </label>

            {/* Voice Recording Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                isRecording
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-primary-container/40 hover:bg-primary-container/70 text-primary border-primary/30'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isRecording ? 'animate-bounce' : ''}`}>
                {isRecording ? 'mic' : 'mic_none'}
              </span>
              <span>{isRecording ? 'Ouvindo...' : 'Gravar Voz'}</span>
            </button>
          </div>

          {/* Recording pulse status feedback */}
          {isRecording && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Fale a sua nota em voz alta... O aplicativo está transcrevendo!</span>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => {
                setNoteText(e.target.value);
                setWasRecordedByVoice(false);
              }}
              placeholder={`Escreva como você se sente no momento com ${selectedMoodObj.label.toLowerCase()}... ou toque no microfone!`}
              className="w-full p-3.5 rounded-2xl bg-surface border-2 border-outline-variant/60 focus:border-primary text-on-surface text-sm font-semibold outline-hidden transition-colors resize-none placeholder:text-outline/70"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary/95 text-on-primary font-black text-sm border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">bookmark_add</span>
          <span>Registrar no Diário (+10 Bônus)</span>
        </button>
      </form>

      {/* History Timeline */}
      <div className="flex flex-col gap-3 mt-3 pt-4 border-t border-outline-variant/40">
        <h3 className="text-xs font-black text-outline uppercase tracking-wider flex items-center justify-between">
          <span>Histórico de Registros do Dia</span>
          <span>{entries.length} Entradas</span>
        </h3>

        {entries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant text-center text-outline text-xs font-semibold">
            Nenhum registro no diário ainda. Adicione o seu primeiro momento acima! ✨
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            {entries.map((item) => {
              const matchedMood = MOOD_OPTIONS.find((m) => m.id === item.mood);
              const badgeClass = matchedMood?.color || 'bg-surface-container text-on-surface';

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-surface border-2 border-outline-variant/40 flex items-start gap-3 shadow-2xs hover:border-outline-variant transition-all"
                >
                  <div className="text-3xl shrink-0 p-2 rounded-2xl bg-surface-container-high flex items-center justify-center border border-outline-variant/30">
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {item.emoji} {item.moodLabel}
                        </span>
                        {item.isVoiceNote && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-primary/20">
                            <span className="material-symbols-outlined text-[12px]">mic</span>
                            Voz
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-outline font-bold">{item.timestamp}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-on-surface font-semibold mt-1.5 leading-relaxed break-words">
                      "{item.note}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(item.id)}
                    title="Remover este registro"
                    className="p-1.5 text-outline hover:text-error hover:bg-error-container/20 rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
