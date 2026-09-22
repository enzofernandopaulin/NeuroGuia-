import React, { useState } from 'react';
import { RoutineTask } from '../types';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: RoutineTask) => void;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:30');
  const [estimatedTime, setEstimatedTime] = useState('25 min');
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Estudo',
    'Artes',
    'Lanche',
    'Descanso',
    'Exercício',
    'Jogos',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Estudo');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  if (!isOpen) return null;

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (trimmed && !categoriesList.includes(trimmed)) {
      setCategoriesList((prev) => [...prev, trimmed]);
      setSelectedCategory(trimmed);
      setCustomCategoryInput('');
      setIsAddingCustom(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: RoutineTask = {
      id: Date.now().toString(),
      title: title.trim(),
      time: time.trim() || '14:30',
      estimatedTime: estimatedTime.trim() || '25 min',
      completed: false,
      category: selectedCategory,
    };

    onAddTask(newTask);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-md border-2 border-outline-variant shadow-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
            <div>
              <h3 className="font-extrabold text-lg text-on-surface">Nova Atividade Acadêmica</h3>
              <p className="text-[11px] text-outline font-semibold">
                Tarefa de estudo ou rotina diária (Atividade ≠ Missão Gamificada)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-high cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Info Banner: Atividade vs Missão */}
        <div className="bg-primary-container/30 border border-primary/20 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-primary font-bold">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>
            Ao concluir esta <strong>Atividade de Estudo</strong>, você também somará progresso para suas <strong>Missões Gamificadas</strong>!
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nome da Atividade */}
          <div>
            <label className="block text-xs font-extrabold text-on-surface mb-1">
              Nome da Atividade
            </label>
            <input
              type="text"
              placeholder="Ex: Leitura de História, Exercício de Matemática..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Horário e Tempo Estimado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                <span>Horário</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 14:30 ou 09:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
                <span>Tempo Estimado</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 25 min, 1 hora"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-3.5 py-3 bg-surface-container-low border border-outline-variant rounded-2xl text-xs font-semibold text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Presets Rápidos de Tempo Estimado */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-outline">Atalhos de tempo:</span>
            {['15 min', '25 min', '45 min', '1h'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEstimatedTime(preset)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  estimatedTime === preset
                    ? 'bg-secondary text-on-secondary shadow-2xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Categorias Personalizáveis */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">category</span>
                <span>Categoria da Atividade</span>
              </label>

              {!isAddingCustom && (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Nova Categoria</span>
                </button>
              )}
            </div>

            {/* Adicionar nova categoria personalizada */}
            {isAddingCustom && (
              <div className="flex gap-2 bg-primary-container/20 p-2.5 rounded-2xl border border-primary/30">
                <input
                  type="text"
                  placeholder="Nome da categoria (ex: Robótica, Música...)"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-surface rounded-xl border border-outline-variant text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-3 py-1.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-2.5 py-1.5 bg-surface-container text-outline font-bold text-xs rounded-xl hover:text-on-surface cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Lista de categorias selecionáveis */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-xs border-2 border-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/50'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-primary text-on-primary font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 shadow-md cursor-pointer hover:bg-primary/95 transition-all"
          >
            Adicionar Atividade
          </button>
        </form>
      </div>
    </div>
  );
};

