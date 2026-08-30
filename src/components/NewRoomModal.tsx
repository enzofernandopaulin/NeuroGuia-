import React, { useState } from 'react';
import { Classroom } from '../types';

interface NewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (room: Classroom) => void;
}

export const NewRoomModal: React.FC<NewRoomModalProps> = ({
  isOpen,
  onClose,
  onAddRoom,
}) => {
  const [name, setName] = useState('');
  const [students, setStudents] = useState('10');

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      if (i === 3) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRoom: Classroom = {
      id: Date.now().toString(),
      name: name.trim(),
      activeStudents: 0,
      code: generateRandomCode(),
      hostName: 'Anfitrião',
      teacherName: 'Anfitrião',
      broadcastMessage: 'Bem-vindos à nossa sala de foco! Acompanhem as orientações.',
      currentActivity: {
        title: 'Sessão de Foco em Grupo',
        description: 'Trabalho focado e em silêncio.',
        durationMinutes: 25,
        category: 'study',
      },
      studentsList: [],
      materials: [],
      wallMessages: [],
    };

    onAddRoom(newRoom);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-sm border-2 border-outline-variant shadow-xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-on-surface">Criar Nova Sala de Foco</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Nome da Sala
            </label>
            <input
              type="text"
              placeholder="Ex: Sala Foco Silencioso, Espaço Criativo..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3.5 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Estimativa de Membros
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={students}
              onChange={(e) => setStudents(e.target.value)}
              className="w-full p-3.5 bg-surface-container-low border-2 border-outline-variant/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-3 bg-secondary-container/20 rounded-2xl border border-secondary-container/40 text-xs text-on-surface-variant">
            💡 Um código de acesso de 6 dígitos será gerado automaticamente para os membros entrarem na sala.
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-primary text-on-primary font-bold text-sm py-3.5 rounded-2xl border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 shadow-md cursor-pointer hover:bg-primary/95"
          >
            Gerar Sala e Código
          </button>
        </form>
      </div>
    </div>
  );
};
