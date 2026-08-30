import React, { useState, useRef, useEffect } from 'react';
import { AppView } from '../types';

interface JoinRoomProps {
  onJoinSuccess: (code: string) => void;
  setCurrentView: (view: AppView) => void;
}

export const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinSuccess, setCurrentView }) => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = code.every((char) => char.trim().length === 1);

  const handleChange = (index: number, value: string) => {
    const uppercaseValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!uppercaseValue) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    const char = uppercaseValue[uppercaseValue.length - 1];
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Auto-advance
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < 6 && i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextFocus = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleJoin = () => {
    if (!isComplete) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setJoinedSuccess(true);
      setTimeout(() => {
        onJoinSuccess(code.join(''));
        setCurrentView('student-room');
      }, 1000);
    }, 1200);
  };

  return (
    <div className="pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col items-center">
      {/* Hero 3D Door Illustration */}
      <div className="relative w-full max-w-[260px] aspect-square flex justify-center items-center my-2">
        <div className="absolute inset-0 bg-secondary-fixed/40 opacity-60 rounded-full blur-2xl transform scale-75"></div>
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZPrhEd0RDN0yON8Wskav9qtXMg0CJxM-8zq6yu2XpshTvwZyN15ISEXHGOtRT8cudcacK7lJgVhNszOKnKnfHhnV7Syws0XgqSptIInmwAe2lre8c-JplyRp8-CcMMzN2kh8GV5Dk_cAu-s8LXWudrk8Sedqc0qEDOrXjNRuhCixk3LGzD-K-H1f8ITZI0tgKY7cNTu1N98DYcqPKjMNuJeU6t2Byhl5ZEimWhfr-4eYQoNnzx1Pm"
          alt="Porta Mágica da Turma"
          className="relative z-10 w-full h-full object-contain animate-float"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Title & Description */}
      <div className="text-center px-2 flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Entrar em uma Sala de Foco</h1>
        <p className="text-sm text-on-surface-variant max-w-[300px] leading-relaxed">
          Digite o código de 6 caracteres fornecido pelo seu anfitrião para entrar na sala.
        </p>
      </div>

      {/* Code Input Area */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex gap-2 justify-center w-full" dir="ltr">
          {code.map((char, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={char}
              placeholder="•"
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-16 sm:w-14 sm:h-16 bg-surface-container-lowest text-primary font-bold text-2xl text-center uppercase rounded-xl border-2 border-outline-variant border-b-4 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-fixed-dim transition-all caret-transparent placeholder:text-outline-variant"
            />
          ))}
        </div>

        {/* Success badge when complete */}
        <div className={`h-8 flex items-center justify-center transition-opacity ${isComplete ? 'opacity-100' : 'opacity-0'}`}>
          <span className="flex items-center gap-1.5 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-bold text-xs shadow-sm">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Código preenchido!</span>
          </span>
        </div>

        {/* Join Button */}
        <button
          type="button"
          onClick={handleJoin}
          disabled={!isComplete || isLoading}
          className={`w-full max-w-[320px] h-14 bg-primary text-on-primary font-bold text-base rounded-2xl border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            joinedSuccess ? 'bg-tertiary border-on-tertiary-fixed-variant' : ''
          }`}
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              <span>Entrando na sala...</span>
            </>
          ) : joinedSuccess ? (
            <>
              <span className="material-symbols-outlined text-[20px]">celebration</span>
              <span>Sucesso! Bem-vindo(a)</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">meeting_room</span>
              <span>Entrar na Sala</span>
            </>
          )}
        </button>

        {/* Secondary Link */}
        <div className="mt-4 text-center">
          <p className="text-xs text-on-surface-variant flex flex-col items-center gap-1">
            Não tem um código?
            <button
              type="button"
              onClick={() => alert('Solicite ao anfitrião o código de 6 caracteres da sala!')}
              className="text-primary font-bold underline underline-offset-4 hover:text-on-primary-container p-1 rounded-lg cursor-pointer"
            >
              Peça ao seu anfitrião
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
