import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { MascotState, MascotType, MascotItem, MascotInfo, UserRole, Classroom } from '../types';
import { MascotAvatar } from './MascotAvatars';

interface MascotScreenProps {
  mascotState: MascotState;
  setMascotState: React.Dispatch<React.SetStateAction<MascotState>>;
  role?: UserRole;
  classrooms?: Classroom[];
}

export const MASCOTS_INFO: MascotInfo[] = [
  {
    id: 'lumo',
    name: 'Lumo',
    species: 'Coruja Futurista',
    guardianTitle: 'Guardião do Foco',
    neuroFocus: 'TDAH & Concentração',
    description: 'Coruja inteligente em tons azul e lilás. Ajuda a focar no presente com calma e clareza.',
    emoji: '🦉',
    perk: '+15% de Foco e Clareza Mental',
    unlockPrice: 0,
    themeColor: 'from-purple-600/30 via-indigo-600/20 to-blue-500/10',
    texture: 'Borracha fosca e toque acetinado suave',
    habitat: {
      name: 'Floresta Bioluminescente',
      description: 'Árvores cintilantes com tons sutis de azul, cogumelos luminosos e plataformas flutuantes de concentração.',
      ambientVibe: 'Iluminação azul suave, brilho relaxante e poucas distrações visuais.',
      bgGradient: 'from-indigo-950 via-purple-900 to-slate-900',
      accentColor: 'text-purple-300',
      ambientSoundLabel: 'Frequência Suave de Foco (432Hz)',
    },
  },
  {
    id: 'nori',
    name: 'Nori',
    species: 'Capivara da Calma',
    guardianTitle: 'Guardião da Calma',
    neuroFocus: 'TEA (Espectro Autista)',
    description: 'Capivara verde-água acolhedora com folhinhas nas costas. Transmite paz e segurança absoluta.',
    emoji: '🦫',
    perk: '-20% de Sobrecarga Sensorial',
    unlockPrice: 120,
    themeColor: 'from-teal-600/30 via-emerald-600/20 to-cyan-500/10',
    texture: 'Pelúcia leve e plástico acetinado tátil',
    habitat: {
      name: 'Jardim Sensorial do Silêncio',
      description: 'Lago espelhado calmo, bambus ao vento suave, pedras lisas de rio e flores discretas sem poluição visual.',
      ambientVibe: 'Sons suaves da natureza, pouquíssimos estímulos e espaço para autorregulação.',
      bgGradient: 'from-teal-950 via-emerald-900 to-slate-900',
      accentColor: 'text-teal-300',
      ambientSoundLabel: 'Brisa e Água Corrente Calmante',
    },
  },
  {
    id: 'pixel',
    name: 'Pixel',
    species: 'Raposa Tecnológica',
    guardianTitle: 'Guardião da Organização',
    neuroFocus: 'Dislexia & Metas Visuais',
    description: 'Raposa laranja e branca com mochila inteligente. Adora organizar tarefas em passos simples e visuais.',
    emoji: '🦊',
    perk: '+10% de Bônus de Moedas em Metas',
    unlockPrice: 150,
    themeColor: 'from-orange-600/30 via-amber-600/20 to-yellow-500/10',
    texture: 'Plástico acetinado e detalhes em borracha',
    habitat: {
      name: 'Biblioteca da Árvore Gigante',
      description: 'Estantes circulares integradas à natureza, hologramas organizados e trilhas luminosas conectando objetivos.',
      ambientVibe: 'Organização estruturada, ordem agradável e sensação contínua de progresso.',
      bgGradient: 'from-orange-950 via-amber-900 to-amber-950',
      accentColor: 'text-amber-300',
      ambientSoundLabel: 'Acústica Confortável de Leitura',
    },
  },
  {
    id: 'soli',
    name: 'Soli',
    species: 'Axolote Dourado',
    guardianTitle: 'Guardião das Emoções',
    neuroFocus: 'Autorregulação & Ansiedade',
    description: 'Axolote dourado reluzente com sorriso doce. Guia exercícios de respiração e acolhimento emocional.',
    emoji: '🦎',
    perk: '+20% de Recuperação de Humor e Calma',
    unlockPrice: 200,
    themeColor: 'from-amber-500/30 via-yellow-500/20 to-orange-400/10',
    texture: 'Borracha macia translúcida com brilho sutil',
    habitat: {
      name: 'Caverna de Cristais Aquáticos',
      description: 'Água cristalina com reflexos calmantes e cristais coloridos com brilho pastel suave.',
      ambientVibe: 'Ambiente seguro e aconchegante para acalmar a mente nos momentos difíceis.',
      bgGradient: 'from-amber-950 via-yellow-900 to-stone-900',
      accentColor: 'text-amber-200',
      ambientSoundLabel: 'Ondas Aquáticas Relaxantes (528Hz)',
    },
  },
  {
    id: 'kibo',
    name: 'Kibo',
    species: 'Guaxinim Explorador',
    guardianTitle: 'Guardião da Motivação',
    neuroFocus: 'Superação & Recompensas',
    description: 'Guaxinim explorador roxo e amarelo com mochila espacial. Comemora cada conquista do estudante!',
    emoji: '🦝',
    perk: '+25% de XP em Sequências de Estudos',
    unlockPrice: 250,
    themeColor: 'from-purple-600/30 via-fuchsia-600/20 to-pink-500/10',
    texture: 'Pelúcia macia e veludo sintetizado',
    habitat: {
      name: 'Ilha Flutuante dos Sonhos',
      description: 'Observatório espacial com telescópio clássico, constelações no céu e foguetes de papel flutuantes.',
      ambientVibe: 'Sensação de descoberta, alegria inspiradora e curiosidade sem sobrecarga.',
      bgGradient: 'from-purple-950 via-fuchsia-950 to-slate-900',
      accentColor: 'text-fuchsia-300',
      ambientSoundLabel: 'Harmonia Cósmica do Espaço',
    },
  },
  {
    id: 'dog',
    name: 'Rex',
    species: 'Cachorrinho Leal',
    guardianTitle: 'Companheiro do Dia a Dia',
    neuroFocus: 'Companheirismo',
    description: 'Companheiro fiel que celebra cada pequena conquista com muita alegria!',
    emoji: '🐶',
    perk: '+10% de Bônus de Moedas em Tarefas',
    unlockPrice: 100,
    themeColor: 'from-amber-700/20 to-yellow-600/10',
    texture: 'Pelúcia macia',
    habitat: {
      name: 'Parque Ensolarado',
      description: 'Gramado calmo para descanso e brincadeiras.',
      ambientVibe: 'Espaço aberto e alegre.',
      bgGradient: 'from-amber-900 via-yellow-900 to-slate-900',
      accentColor: 'text-yellow-300',
      ambientSoundLabel: 'Passarinhos e Brisa do Dia',
    },
  },
  {
    id: 'cat',
    name: 'Mimi',
    species: 'Gatinha Calma',
    guardianTitle: 'Guardiã do Sossego',
    neuroFocus: 'Paz Interior',
    description: 'Mestre da tranquilidade, ajuda a manter o ambiente de estudo em paz.',
    emoji: '🐱',
    perk: '+15% de Recuperação de Humor',
    unlockPrice: 150,
    themeColor: 'from-blue-500/20 to-cyan-500/10',
    texture: 'Satin macio',
    habitat: {
      name: 'Canto da Leitura',
      description: 'Almofadas macias e luz quente confortável.',
      ambientVibe: 'Luz fraca e aconchegante.',
      bgGradient: 'from-blue-950 via-slate-900 to-slate-950',
      accentColor: 'text-blue-300',
      ambientSoundLabel: 'Ronronar Suave e Chuva Fraca',
    },
  },
];

export const SHOP_FOOD_ITEMS: MascotItem[] = [
  {
    id: 'apple',
    name: 'Maçã Fresca',
    category: 'food',
    price: 15,
    icon: 'nutrition',
    emoji: '🍎',
    effectDescription: '+15 Energia, +5 Humor',
    energyGain: 15,
    moodGain: 5,
    expGain: 5,
  },
  {
    id: 'cookie',
    name: 'Biscoito Crocante',
    category: 'food',
    price: 25,
    icon: 'cookie',
    emoji: '🍪',
    effectDescription: '+25 Energia, +15 Humor',
    energyGain: 25,
    moodGain: 15,
    expGain: 10,
  },
  {
    id: 'pizza',
    name: 'Pizza Especial',
    category: 'food',
    price: 45,
    icon: 'local_pizza',
    emoji: '🍕',
    effectDescription: '+45 Energia, +25 Humor, +15 XP',
    energyGain: 45,
    moodGain: 25,
    expGain: 15,
  },
  {
    id: 'potion',
    name: 'Poção Mágica de Foco',
    category: 'food',
    price: 70,
    icon: 'science',
    emoji: '🧪',
    effectDescription: '+100 Energia, +100 Humor, +50 XP',
    energyGain: 100,
    moodGain: 100,
    expGain: 50,
  },
];

export const SHOP_ACCESSORIES: MascotItem[] = [
  {
    id: 'scarf',
    name: 'Cachecol Quentinho',
    category: 'accessory',
    price: 50,
    icon: 'checkroom',
    emoji: '🧣',
    effectDescription: 'Acessório estiloso para dias frios',
  },
  {
    id: 'glasses',
    name: 'Óculos de Leitura',
    category: 'accessory',
    price: 100,
    icon: 'visibility',
    emoji: '👓',
    effectDescription: 'Visual inteligente de estudante',
  },
  {
    id: 'tie',
    name: 'Gravata Elegante',
    category: 'accessory',
    price: 120,
    icon: 'apparel',
    emoji: '👔',
    effectDescription: 'Para ocasiões e exames importantes',
  },
  {
    id: 'hat',
    name: 'Chapéu Mágico',
    category: 'accessory',
    price: 200,
    icon: 'auto_awesome',
    emoji: '🎩',
    effectDescription: 'Dá um toque de mistério e magia',
  },
  {
    id: 'crown',
    name: 'Coroa de Ouro',
    category: 'accessory',
    price: 350,
    icon: 'crown',
    emoji: '👑',
    effectDescription: 'Reservada para os reis da concentração',
  },
];

export const MascotScreen: React.FC<MascotScreenProps> = ({
  mascotState,
  setMascotState,
  role,
  classrooms,
}) => {
  const isHostRole = role === 'tutor' || role === 'anfitriao';
  const [hostMascotViewMode, setHostMascotViewMode] = useState<'alunos' | 'demo'>(
    isHostRole ? 'alunos' : 'demo'
  );

  const stageCardRef = useRef<HTMLDivElement>(null);
  const [particle, setParticle] = useState<{ text: string; color: string; id: number } | null>(null);
  const [reactionIcon, setReactionIcon] = useState<string | null>(null);

  // GSAP Feeding Animation States
  const [isEating, setIsEating] = useState(false);
  const [eatingFoodEmoji, setEatingFoodEmoji] = useState<string>('🍎');
  
  // Modals & Store State
  const [activeTab, setActiveTab] = useState<'mascots' | 'food' | 'accessories'>('mascots');
  const [showShopModal, setShowShopModal] = useState(false);
  const [showMascotSelectorModal, setShowMascotSelectorModal] = useState(false);
  const [showHabitatModal, setShowHabitatModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false); // Aba de Alimentar/Despensa
  const [isPlayingAmbientSound, setIsPlayingAmbientSound] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Students observation list for host role (only students actually present in classrooms)
  const roomStudentsList = (classrooms || []).flatMap((c) =>
    (c.studentsList || []).map((s) => ({ ...s, roomName: c.name }))
  );

  const studentsForObservation = roomStudentsList.map((s, idx) => ({
    id: s.id,
    name: s.name,
    roomName: s.roomName,
    mascotType: (['lumo', 'pixel', 'nori', 'soli', 'kibo'][idx % 5]) as MascotType,
    level: (idx % 3) + 2,
    exp: 100 + idx * 30,
    maxExp: 200,
    mood: s.status === 'pausa' ? 75 : 90,
    energy: s.status === 'ajuda' ? 50 : 85,
    status: s.status === 'foco' ? '🟢 Em Foco' : s.status === 'pausa' ? '🟡 Em Pausa' : '🔴 Solicitou Apoio',
    currentTask: s.currentTask || 'Sessão de Foco Guiada',
    avatarEmoji: s.avatarEmoji || '🧑‍🎓',
  }));

  const currentMascot =
    MASCOTS_INFO.find((m) => m.id === mascotState.selectedMascot) || MASCOTS_INFO[0];

  const triggerAnimation = (text: string, color: string, icon: string) => {
    setParticle({ text, color, id: Date.now() });
    setReactionIcon(icon);
    setTimeout(() => {
      setParticle(null);
      setReactionIcon(null);
    }, 1500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // GSAP Stage Card Pulse on Action
  const animateStageCard = () => {
    if (!stageCardRef.current) return;
    gsap.fromTo(
      stageCardRef.current,
      { scale: 0.98 },
      { scale: 1, duration: 0.4, ease: 'back.out(2)' }
    );
  };

  // Check XP for Level Up
  const checkLevelUp = (currentExp: number, maxExp: number, currentLevel: number, currentCoins: number) => {
    if (currentExp >= maxExp) {
      const nextLevel = currentLevel + 1;
      const nextMaxExp = Math.round(maxExp * 1.3);
      const remainingExp = currentExp - maxExp;
      const bonusCoins = 100;
      
      triggerAnimation(`🎉 Nível ${nextLevel}! +${bonusCoins} Moedas!`, 'text-primary font-black', 'stars');
      showToast(`🏆 PARABÉNS! Seu mascote subiu para o Nível ${nextLevel}! Ganhou +${bonusCoins} Moedas!`);

      return {
        level: nextLevel,
        exp: remainingExp,
        maxExp: nextMaxExp,
        coins: currentCoins + bonusCoins,
      };
    }
    return {
      level: currentLevel,
      exp: currentExp,
      maxExp,
      coins: currentCoins,
    };
  };

  // Recompensa Diária (+50 Moedas)
  const handleClaimDailyReward = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (mascotState.lastDailyRewardDate === todayStr) {
      showToast('⚠️ Você já resgatou sua recompensa de hoje! Volte amanhã.');
      return;
    }

    setMascotState((prev) => ({
      ...prev,
      coins: prev.coins + 50,
      lastDailyRewardDate: todayStr,
    }));

    triggerAnimation('+50 Moedas!', 'text-amber-500 font-extrabold', 'monetization_on');
    showToast('🪙 Recompensa Diária Coletada: +50 Moedas adicionadas!');
  };

  // EXECUTA ANIMAÇÃO GSAP DE ALIMENTAÇÃO COM QUALQUER COMIDA DA DESPENSA
  const handleFeedWithItem = (food: MascotItem) => {
    const qty = mascotState.inventory[food.id] || 0;
    if (qty <= 0) {
      showToast(`Você não possui ${food.name}. Compre na loja com suas moedas!`);
      return;
    }

    // Fecha modal da despensa para focar no mascote
    setShowPantryModal(false);

    // Rola a tela suavemente para cima até o cartão do mascote para mostrar ele comendo
    setTimeout(() => {
      if (stageCardRef.current) {
        stageCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);

    // Direct GSAP eating sequence trigger
    setEatingFoodEmoji(food.emoji);
    setIsEating(true);
    animateStageCard();

    // Deduct item and increase stats
    setMascotState((prev) => {
      const newInventory = { ...prev.inventory };
      if (newInventory[food.id] > 1) {
        newInventory[food.id] -= 1;
      } else {
        delete newInventory[food.id];
      }

      const newEnergy = Math.min(100, prev.energy + (food.energyGain || 15));
      const newMood = Math.min(100, prev.mood + (food.moodGain || 10));
      const newExp = prev.exp + (food.expGain || 10);

      const lvlData = checkLevelUp(newExp, prev.maxExp, prev.level, prev.coins);

      return {
        ...prev,
        ...lvlData,
        energy: newEnergy,
        mood: newMood,
        inventory: newInventory,
      };
    });

    triggerAnimation(`${food.emoji} Nhom Nhom! +${food.energyGain || 15} Energia`, 'text-secondary font-bold', 'restaurant');
  };

  // Brincar (GSAP Animation)
  const handlePlay = () => {
    if (mascotState.energy < 10) {
      showToast('😴 Seu mascote está muito cansado! Alimente-o ou deixe-o descansar.');
      return;
    }

    animateStageCard();

    setMascotState((prev) => {
      const newMood = Math.min(100, prev.mood + 20);
      const newEnergy = Math.max(0, prev.energy - 10);
      const newExp = prev.exp + 15;

      const lvlData = checkLevelUp(newExp, prev.maxExp, prev.level, prev.coins);

      return {
        ...prev,
        ...lvlData,
        mood: newMood,
        energy: newEnergy,
      };
    });

    triggerAnimation('+20 Humor e +15 XP', 'text-tertiary font-bold', 'favorite');
  };

  // Descansar / Sesta (GSAP Animation)
  const handleRest = () => {
    if (mascotState.energy >= 100) {
      showToast('⚡ Energia total! Seu mascote está totalmente acordado e disposto.');
      return;
    }

    animateStageCard();

    setMascotState((prev) => ({
      ...prev,
      energy: Math.min(100, prev.energy + 30),
      mood: Math.min(100, prev.mood + 10),
    }));

    triggerAnimation('💤 +30 Energia', 'text-primary font-bold', 'bedtime');
  };

  // Comprar Comida na Loja
  const handleBuyFood = (food: MascotItem) => {
    if (mascotState.coins < food.price) {
      showToast('❌ Moedas insuficientes! Realize missões e estudos para ganhar moedas.');
      return;
    }

    setMascotState((prev) => {
      const currentQty = prev.inventory[food.id] || 0;
      return {
        ...prev,
        coins: prev.coins - food.price,
        inventory: {
          ...prev.inventory,
          [food.id]: currentQty + 1,
        },
      };
    });

    showToast(`Comprado: ${food.emoji} ${food.name}! Guardado na sua Despensa.`);
  };

  // Comprar ou Equipar Acessório na Loja (Com Animação GSAP)
  const handleBuyOrEquipAccessory = (acc: MascotItem) => {
    const isOwned = (mascotState.inventory[acc.id] || 0) > 0 || mascotState.accessory === acc.id;

    if (isOwned) {
      const isEquipped = mascotState.accessory === acc.id;
      setMascotState((prev) => ({
        ...prev,
        accessory: isEquipped ? undefined : acc.id,
      }));
      animateStageCard();
      showToast(isEquipped ? 'Acessório desequipado!' : `Equipado: ${acc.emoji} ${acc.name}!`);
      return;
    }

    if (mascotState.coins < acc.price) {
      showToast('❌ Moedas insuficientes! Estude e cumpra tarefas para acumular moedas.');
      return;
    }

    setMascotState((prev) => ({
      ...prev,
      coins: prev.coins - acc.price,
      accessory: acc.id,
      inventory: {
        ...prev.inventory,
        [acc.id]: 1,
      },
    }));

    animateStageCard();
    showToast(`Comprado e Equipado: ${acc.emoji} ${acc.name}!`);
  };

  // Selecionar ou Desbloquear Mascote
  const handleSelectOrUnlockMascot = (m: MascotInfo) => {
    const isUnlocked = mascotState.unlockedMascots.includes(m.id);

    if (isUnlocked) {
      setMascotState((prev) => ({
        ...prev,
        selectedMascot: m.id,
      }));
      animateStageCard();
      showToast(`Mascote alterado para ${m.emoji} ${m.name}!`);
      setShowMascotSelectorModal(false);
      return;
    }

    if (mascotState.coins < m.unlockPrice) {
      showToast(`❌ Moedas insuficientes! Você precisa de ${m.unlockPrice} Moedas.`);
      return;
    }

    setMascotState((prev) => ({
      ...prev,
      coins: prev.coins - m.unlockPrice,
      selectedMascot: m.id,
      unlockedMascots: [...prev.unlockedMascots, m.id],
    }));

    animateStageCard();
    showToast(`🎉 Desbloqueado! ${m.emoji} ${m.name} é o seu novo mascote!`);
    setShowMascotSelectorModal(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyRewardClaimed = mascotState.lastDailyRewardDate === todayStr;

  // Calculando itens de comida no estoque
  const ownedFoodList = SHOP_FOOD_ITEMS.filter(
    (item) => (mascotState.inventory[item.id] || 0) > 0
  );

  return (
    <div className="pt-20 pb-28 px-4 max-w-xl mx-auto flex flex-col gap-5">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-md mx-auto bg-on-surface text-surface px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-outline cursor-pointer">✕</button>
        </div>
      )}

      {/* Module Header Badge & View Switcher (For Host / Tutor Role) */}
      {isHostRole && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-secondary-container/30 border border-secondary/20 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">school</span>
              <span className="font-extrabold text-xs text-secondary uppercase tracking-wider">
                Módulo Anfitrião / Professor
              </span>
            </div>
            <span className="text-[11px] font-bold text-outline">Acompanhamento de Mascotes</span>
          </div>

          <div className="flex p-1 bg-surface-container rounded-2xl border border-outline-variant/60">
            <button
              type="button"
              onClick={() => setHostMascotViewMode('alunos')}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hostMascotViewMode === 'alunos'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>Observar Mascotes dos Alunos ({studentsForObservation.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHostMascotViewMode('demo')}
              className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hostMascotViewMode === 'demo'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">pets</span>
              <span>Meu Mascote (Demo)</span>
            </button>
          </div>
        </div>
      )}

      {/* When in Host Observer Mode ('alunos') */}
      {isHostRole && hostMascotViewMode === 'alunos' ? (
        <div className="flex flex-col gap-5">
          <div className="bg-surface-container-lowest border-2 border-outline-variant/80 rounded-3xl p-5 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center gap-2 text-secondary font-black text-sm">
              <span className="material-symbols-outlined text-[20px]">visibility</span>
              <span>Observação do Mascote de cada Aluno</span>
            </div>
            <p className="text-xs text-outline font-medium leading-relaxed">
              Como Anfitrião, você apenas observa o andamento, nível, energia e humor do mascote de cada participante.
            </p>
          </div>

          {/* Grid of Student Mascot Cards or Empty State */}
          {studentsForObservation.length === 0 ? (
            <div className="bg-surface-container-lowest border-2 border-outline-variant/80 rounded-[2rem] p-8 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-secondary-container/40 text-secondary flex items-center justify-center text-3xl">
                <span className="material-symbols-outlined text-[36px]">pets</span>
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-on-surface">Nenhum mascote na sala no momento</h3>
                <p className="text-xs text-outline font-medium mt-1.5 max-w-sm leading-relaxed">
                  Não há alunos ativos nas suas salas de foco neste momento. Quando um aluno entrar na sua sala através do código de acesso, o mascote dele aparecerá aqui automaticamente para você acompanhar o progresso.
                </p>
              </div>
              <div className="bg-surface-container/60 px-4 py-2.5 rounded-2xl border border-outline-variant/60 text-xs text-on-surface-variant font-bold flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-secondary text-[18px]">key</span>
                <span>Compartilhe o código de acesso da sala com os alunos</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {studentsForObservation.map((obs) => {
                const mascotInfo =
                  MASCOTS_INFO.find((m) => m.id === obs.mascotType) || MASCOTS_INFO[0];

                return (
                  <div
                    key={obs.id}
                    className={`bg-surface-container-lowest border-2 border-outline-variant/80 rounded-[2rem] p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden bg-gradient-to-br ${mascotInfo.themeColor}`}
                  >
                    {/* Card Header with EXACT title requested: "Mascote de (Nome da pessoa)" */}
                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-surface/80 border border-outline-variant/60 flex items-center justify-center text-xl shadow-2xs">
                          {obs.avatarEmoji}
                        </div>
                        <div>
                          {/* EXACT REQUIRED FORMAT: Mascote de (Nome da pessoa) */}
                          <h3 className="font-black text-base text-on-surface">
                            Mascote de {obs.name}
                          </h3>
                          <p className="text-[11px] font-bold text-outline">
                            {obs.roomName} • {obs.status}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-wider bg-secondary-container/80 text-on-secondary-container px-2.5 py-1 rounded-full border border-secondary/30">
                        👁️ Modo Observação
                      </span>
                    </div>

                    {/* Mascot Stage Banner & Avatar */}
                    <div className="flex items-center justify-between bg-surface/60 rounded-2xl p-4 border border-outline-variant/40">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                          <MascotAvatar mascotType={obs.mascotType} size="md" isMoving={true} />
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl">{mascotInfo.emoji}</span>
                            <span className="font-extrabold text-sm text-on-surface">{mascotInfo.name}</span>
                            <span className="text-[10px] font-bold bg-primary-container/40 text-primary px-2 py-0.5 rounded-full">
                              Nível {obs.level}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-outline">{mascotInfo.species}</span>
                          <span className="text-[11px] font-bold text-primary mt-0.5">
                            {mascotInfo.guardianTitle} ({mascotInfo.neuroFocus})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mascot Stats Bars */}
                    <div className="grid grid-cols-2 gap-3 bg-surface-container/30 p-3 rounded-2xl border border-outline-variant/40">
                      {/* Mood Bar */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-on-surface">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-amber-500 text-[14px]">sentiment_satisfied</span>
                            <span>Humor</span>
                          </span>
                          <span className="text-amber-600 dark:text-amber-300">{obs.mood}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${obs.mood}%` }}
                          />
                        </div>
                      </div>

                      {/* Energy Bar */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px] font-bold text-on-surface">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-teal-500 text-[14px]">bolt</span>
                            <span>Energia</span>
                          </span>
                          <span className="text-teal-600 dark:text-teal-300">{obs.energy}%</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: `${obs.energy}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Student Current Focus Activity */}
                    <div className="flex items-center justify-between text-xs bg-surface-container-lowest/90 px-3.5 py-2.5 rounded-xl border border-outline-variant/50">
                      <span className="text-outline font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">edit_note</span>
                        <span>Tarefa em Andamento:</span>
                      </span>
                      <span className="font-bold text-on-surface truncate max-w-[200px]">{obs.currentTask}</span>
                    </div>

                    {/* Host Encouragement Action */}
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`✨ Elogio enviado com sucesso ao Mascote de ${obs.name}!`);
                      }}
                      className="w-full py-2.5 bg-secondary text-on-secondary font-black text-xs rounded-xl hover:bg-secondary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      <span>Enviar Elogio ao Mascote (+5 Moedas para {obs.name})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Top Bar Header: Level, Coins & Mascot Selector */}
      <div className="flex justify-between items-center px-1 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Level Pill */}
          <div className="flex items-center gap-1.5 bg-primary-container/40 px-3.5 py-1.5 rounded-full border border-primary-container/60">
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-black text-sm text-on-surface">Nível {mascotState.level}</span>
          </div>

          {/* Daily Reward Claim Button */}
          <button
            type="button"
            onClick={handleClaimDailyReward}
            disabled={isDailyRewardClaimed}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black transition-all border cursor-pointer ${
              isDailyRewardClaimed
                ? 'bg-surface-container text-outline border-outline-variant cursor-not-allowed'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
            }`}
            title="Recompensa Diária de Moedas"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isDailyRewardClaimed ? 'check' : 'card_giftcard'}
            </span>
            <span>{isDailyRewardClaimed ? 'Resgatado' : '+50 Bônus'}</span>
          </button>
        </div>

        {/* Coins Badge & Store Link */}
        <button
          type="button"
          onClick={() => setShowShopModal(true)}
          className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 px-3.5 py-1.5 rounded-full border border-amber-500/30 transition-all cursor-pointer shadow-2xs"
        >
          <span
            className="material-symbols-outlined text-[20px] text-amber-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            monetization_on
          </span>
          <span className="font-black text-sm sm:text-base">{mascotState.coins}</span>
          <span className="material-symbols-outlined text-[18px] text-outline">store</span>
        </button>
      </div>

      {/* Mascot Card Stage (GSAP Animated 3D Render + Habitat Backdrop) */}
      <div
        ref={stageCardRef}
        className={`relative w-full h-72 sm:h-80 rounded-[2.2rem] overflow-hidden flex flex-col items-center justify-center shadow-md border-2 border-outline-variant/60 bg-gradient-to-b ${currentMascot.themeColor}`}
      >
        
        {/* Top Header & Controls */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
          {/* Switch Mascot */}
          <button
            type="button"
            onClick={() => setShowMascotSelectorModal(true)}
            className="bg-surface-container-lowest/95 hover:bg-surface-container-high text-on-surface px-3.5 py-2 rounded-full border border-outline-variant/60 shadow-xs text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="text-lg">{currentMascot.emoji}</span>
            <span>{currentMascot.name}</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>

          {/* Habitat Explorer Button */}
          <button
            type="button"
            onClick={() => setShowHabitatModal(true)}
            className="bg-primary/90 text-on-primary font-black px-3.5 py-2 rounded-full shadow-xs text-xs sm:text-sm flex items-center gap-1.5 transition-all hover:bg-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">park</span>
            <span>Habitat</span>
          </button>
        </div>

        {/* Mascot Avatar Stage with GSAP Animations */}
        <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 mt-6 sm:mt-6 flex items-center justify-center">
          <MascotAvatar
            type={mascotState.selectedMascot}
            mood={mascotState.mood}
            energy={mascotState.energy}
            accessory={mascotState.accessory}
            isEating={isEating}
            eatingFoodEmoji={eatingFoodEmoji}
            onEatComplete={() => setIsEating(false)}
            className="w-full h-full"
          />

          {/* Reaction Overlay */}
          {reactionIcon && (
            <div className="absolute -top-2 right-2 z-30 bg-surface-container-lowest rounded-full p-2 shadow-md border border-outline-variant animate-bounce">
              <span
                className="material-symbols-outlined text-tertiary text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {reactionIcon}
              </span>
            </div>
          )}

          {/* Floating Particle */}
          {particle && (
            <div className={`absolute -top-7 z-30 font-extrabold text-xs bg-surface-container-lowest px-2.5 py-1 rounded-full shadow-sm border border-outline-variant ${particle.color}`}>
              {particle.text}
            </div>
          )}
        </div>

        {/* Stage Floor Curve */}
        <div className="absolute bottom-0 w-full h-1/5 bg-surface-container-highest/40 rounded-t-[2.5rem]" />
      </div>

      {/* Status Bars Container */}
      <div className="flex flex-col gap-3 bg-surface-container-lowest p-5 rounded-3xl border-2 border-outline-variant/60 shadow-xs">
        {/* Mood */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs sm:text-sm font-black">
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-tertiary">mood</span>
              Humor
            </span>
            <span className="text-tertiary font-black">{mascotState.mood}%</span>
          </div>
          <div className="w-full h-4 bg-surface-variant/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary rounded-full transition-all duration-300"
              style={{ width: `${mascotState.mood}%` }}
            />
          </div>
        </div>

        {/* Energy */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs sm:text-sm font-black">
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-secondary">bolt</span>
              Energia
            </span>
            <span className="text-secondary font-black">{mascotState.energy}%</span>
          </div>
          <div className="w-full h-4 bg-surface-variant/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-300"
              style={{ width: `${mascotState.energy}%` }}
            />
          </div>
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs sm:text-sm font-black">
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-primary">school</span>
              Experiência (XP)
            </span>
            <span className="text-primary font-black">
              {mascotState.exp} / {mascotState.maxExp} XP
            </span>
          </div>
          <div className="w-full h-4 bg-surface-variant/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (mascotState.exp / mascotState.maxExp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Action Buttons Grid (Inclui Botão Dedicado "Despensa & Refeições") */}
      <div className="grid grid-cols-3 gap-3">
        {/* Botão de Alimentação / Abrir Despensa */}
        <button
          type="button"
          onClick={() => setShowPantryModal(true)}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-surface-container-lowest text-on-surface border-2 border-outline-variant border-b-4 active:border-b-2 active:translate-y-0.5 transition-all shadow-xs cursor-pointer hover:border-tertiary"
        >
          <div className="w-12 h-12 rounded-full bg-tertiary-container/30 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-tertiary text-[28px]">restaurant</span>
          </div>
          <span className="font-black text-sm">Alimentar</span>
          <span className="text-xs text-outline font-bold mt-0.5">
            {ownedFoodList.reduce((acc, f) => acc + (mascotState.inventory[f.id] || 0), 0)} na Despensa
          </span>
        </button>

        {/* Brincar */}
        <button
          type="button"
          onClick={handlePlay}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-primary text-on-primary border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all shadow-md cursor-pointer hover:bg-primary/95"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <span
              className="material-symbols-outlined text-on-primary text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sports_esports
            </span>
          </div>
          <span className="font-black text-sm">Brincar</span>
          <span className="text-xs text-on-primary/90 font-bold mt-0.5">+20 Humor</span>
        </button>

        {/* Descansar */}
        <button
          type="button"
          onClick={handleRest}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-surface-container-lowest text-on-surface border-2 border-outline-variant border-b-4 active:border-b-2 active:translate-y-0.5 transition-all shadow-xs cursor-pointer hover:border-secondary"
        >
          <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-secondary text-[28px]">bedtime</span>
          </div>
          <span className="font-black text-sm">Descansar</span>
          <span className="text-xs text-outline font-bold mt-0.5">+30 Energia</span>
        </button>
      </div>

      {/* MODAL / ABA DEDICADA DE DESPENSA & ALIMENTAÇÃO INTERATIVA GSAP */}
      {showPantryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto border-2 border-outline-variant/60 shadow-xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentMascot.emoji}</span>
                <div>
                  <h2 className="font-black text-base text-on-surface">Despensa de Refeições</h2>
                  <span className="text-[10px] text-outline font-semibold">
                    Escolha o alimento para animar com GSAP!
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPantryModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {ownedFoodList.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center gap-3 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                <span className="text-4xl">🧺</span>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Sua despensa está vazia!</h3>
                  <p className="text-xs text-outline mt-1">
                    Compre deliciosas refeições na Loja do Mascote usando suas moedas de estudo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPantryModal(false);
                    setShowShopModal(true);
                    setActiveTab('food');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">store</span>
                  <span>Ir para a Loja de Comidas</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant">
                  Clique em qualquer alimento para dar ao {currentMascot.name}! O mascote irá comer com animação GSAP ao vivo!
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {ownedFoodList.map((food) => {
                    const qty = mascotState.inventory[food.id] || 0;

                    return (
                      <div
                        key={food.id}
                        className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between gap-3 hover:border-primary/60 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl shrink-0 filter drop-shadow-xs">{food.emoji}</span>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                              <span>{food.name}</span>
                              <span className="bg-primary/20 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                {qty} em estoque
                              </span>
                            </h4>
                            <span className="text-[10px] text-secondary font-semibold block mt-0.5">
                              {food.effectDescription}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleFeedWithItem(food);
                            setShowPantryModal(false);
                          }}
                          className="bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <span>Dar Alimento</span>
                          <span className="material-symbols-outlined text-[16px]">restaurant</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL HABITAT 3D EXPLORER */}
      {showHabitatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-outline-variant/60 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentMascot.emoji}</span>
                <div>
                  <h2 className="font-black text-base text-on-surface">
                    Habitat de {currentMascot.name}: {currentMascot.habitat.name}
                  </h2>
                  <span className="text-[10px] text-outline font-semibold">
                    NeuroGuia • Coleção 3D Neurodivergente
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHabitatModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Habitat Render Image Banner */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-outline-variant/60 shadow-md">
              {currentMascot.image3d ? (
                <img
                  src={currentMascot.image3d}
                  alt={currentMascot.habitat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${currentMascot.habitat.bgGradient} flex items-center justify-center text-white p-6 text-center`}>
                  <p className="font-bold text-sm">{currentMascot.habitat.description}</p>
                </div>
              )}

              {/* Habitat Badge */}
              <div className="absolute top-3 left-3 bg-black/60 text-white backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                🏡 {currentMascot.habitat.name}
              </div>
            </div>

            {/* Habitat Details & Ambient Sound Control */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/50 flex flex-col gap-2.5">
              <h3 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">spa</span>
                <span>Atmosfera Sensorial & Acolhimento</span>
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {currentMascot.habitat.description}
              </p>
              <div className="text-[11px] text-outline font-semibold bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
                💡 <strong>Clima do Ambiente:</strong> {currentMascot.habitat.ambientVibe}
              </div>

              {/* Ambient Sound Simulation */}
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">graphic_eq</span>
                  <div>
                    <div className="text-xs font-bold text-on-surface">Som de Fundo Confortável</div>
                    <div className="text-[10px] text-outline">{currentMascot.habitat.ambientSoundLabel}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlayingAmbientSound(!isPlayingAmbientSound);
                    showToast(
                      isPlayingAmbientSound
                        ? '🔊 Som de habitat pausado.'
                        : `🎧 Reproduzindo: ${currentMascot.habitat.ambientSoundLabel}`
                    );
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    isPlayingAmbientSound
                      ? 'bg-amber-500 text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isPlayingAmbientSound ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isPlayingAmbientSound ? 'Pausar' : 'Ouvir Som'}</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="button"
              onClick={() => {
                setShowHabitatModal(false);
                showToast(`✨ Habitat ${currentMascot.habitat.name} ativado como seu refúgio de estudos!`);
              }}
              className="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-2xl shadow-sm hover:bg-primary/90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span>Usar este Habitat como Tema do App</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE SELEÇÃO DE MASCOTE (1 Mascote por Scroll Snap) */}
      {showMascotSelectorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-5 max-w-lg w-full max-h-[90vh] border-2 border-outline-variant/60 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✨</span>
                <div>
                  <h2 className="font-black text-lg sm:text-xl text-on-surface">Coleção de Mascotes</h2>
                  <span className="text-xs text-outline font-semibold">
                    Deslize para ver 1 mascote por vez
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMascotSelectorModal(false)}
                className="p-2 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Mascot Scroll Snap List (1 Card Per Scroll) */}
            <div className="flex flex-col gap-4 overflow-y-auto snap-y snap-mandatory scroll-smooth max-h-[68vh] p-1 pr-1">
              {MASCOTS_INFO.map((m) => {
                const isSelected = mascotState.selectedMascot === m.id;
                const isUnlocked = mascotState.unlockedMascots.includes(m.id);

                return (
                  <div
                    key={m.id}
                    className={`snap-start snap-always w-full shrink-0 p-5 rounded-3xl border-2 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary shadow-md'
                        : isUnlocked
                        ? 'bg-surface-container-low border-outline-variant/70 hover:border-primary/60'
                        : 'bg-surface-container-highest/30 border-outline-variant/40'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface-container flex items-center justify-center overflow-hidden border-2 border-outline-variant/40 shrink-0 shadow-inner">
                        <MascotAvatar
                          type={m.id}
                          mood={80}
                          energy={80}
                          className="w-24 h-24 sm:w-28 sm:h-28"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <h3 className="font-black text-xl sm:text-2xl text-on-surface flex items-center gap-1.5 leading-tight">
                            <span>{m.emoji}</span>
                            <span>{m.name}</span>
                          </h3>

                          {isSelected ? (
                            <span className="bg-primary text-on-primary text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Ativo
                            </span>
                          ) : isUnlocked ? (
                            <span className="bg-surface-container-high text-on-surface text-xs font-bold px-2.5 py-1 rounded-full">
                              Possui
                            </span>
                          ) : (
                            <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">monetization_on</span>
                              {m.unlockPrice}
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-outline">
                          {m.species} • {m.guardianTitle}
                        </div>

                        <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs font-bold">
                          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                            🧠 {m.neuroFocus}
                          </span>
                          <span className="bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full border border-outline-variant/40">
                            🏡 {m.habitat.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mascot Story Description */}
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-semibold bg-surface-container-lowest/80 p-3.5 rounded-2xl border border-outline-variant/30">
                      {m.description}
                    </p>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectOrUnlockMascot(m)}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary/20 text-primary border border-primary/40 cursor-default'
                          : isUnlocked
                          ? 'bg-primary hover:bg-primary/90 text-on-primary'
                          : 'bg-amber-500 hover:bg-amber-600 text-on-primary'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span>Mascote Atual Selecionado</span>
                        </>
                      ) : isUnlocked ? (
                        <>
                          <span className="material-symbols-outlined text-[20px]">pets</span>
                          <span>Escolher {m.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">monetization_on</span>
                          <span>Desbloquear {m.name} ({m.unlockPrice} Moedas)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOJA & SISTEMA MONETÁRIO */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto border-2 border-outline-variant/60 shadow-lg flex flex-col gap-4">
            
            {/* Header com Saldo de Moedas */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">store</span>
                </div>
                <div>
                  <h2 className="font-black text-base text-on-surface">Loja do Mascote</h2>
                  <span className="text-[10px] text-outline font-semibold">
                    Alimentos, Acessórios e Mascotes
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">
                    monetization_on
                  </span>
                  <span className="font-extrabold text-xs text-on-surface">
                    {mascotState.coins} Moedas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowShopModal(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex bg-surface-container p-1 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('mascots')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'mascots'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                ✨ Mascotes 3D
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('food')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'food'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                🍎 Comida
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('accessories')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'accessories'
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                🧣 Acessórios
              </button>
            </div>

            {/* TAB 1: MASCOTES */}
            {activeTab === 'mascots' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant">
                  Escolha um novo mascote da coleção 3D para acompanhar seus estudos:
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {MASCOTS_INFO.map((m) => {
                    const isSelected = mascotState.selectedMascot === m.id;
                    const isUnlocked = mascotState.unlockedMascots.includes(m.id);

                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                            <MascotAvatar type={m.id} className="w-12 h-12" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface flex items-center gap-1">
                              <span>{m.name}</span>
                              <span className="text-[10px] text-outline font-normal">
                                ({m.species})
                              </span>
                            </h4>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">
                              {m.description}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-xl inline-block">
                              Em Uso
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectOrUnlockMascot(m)}
                              className="bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              {isUnlocked ? (
                                'Selecionar'
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[14px]">
                                    monetization_on
                                  </span>
                                  <span>{m.unlockPrice}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COMIDA */}
            {activeTab === 'food' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant">
                  Compre alimentos com moedas para guardar na sua despensa e alimentar seu mascote:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SHOP_FOOD_ITEMS.map((food) => {
                    const ownedQty = mascotState.inventory[food.id] || 0;

                    return (
                      <div
                        key={food.id}
                        className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl shrink-0">{food.emoji}</span>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface">{food.name}</h4>
                            <span className="text-[10px] text-secondary font-bold block mt-0.5">
                              {food.effectDescription}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30 mt-1">
                          <span className="text-[10px] font-bold text-outline">
                            Possui: {ownedQty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleBuyFood(food)}
                            className="bg-amber-500 hover:bg-amber-600 text-on-primary font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              monetization_on
                            </span>
                            <span>{food.price}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ACESSÓRIOS */}
            {activeTab === 'accessories' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-on-surface-variant">
                  Personalize seu mascote com chapéus, óculos, coroas e gravatas com animação GSAP:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SHOP_ACCESSORIES.map((acc) => {
                    const isEquipped = mascotState.accessory === acc.id;
                    const isOwned = (mascotState.inventory[acc.id] || 0) > 0 || isEquipped;

                    return (
                      <div
                        key={acc.id}
                        className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/50 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl shrink-0">{acc.emoji}</span>
                          <div>
                            <h4 className="font-bold text-xs text-on-surface">{acc.name}</h4>
                            <span className="text-[10px] text-outline font-normal block mt-0.5">
                              {acc.effectDescription}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-outline-variant/30 mt-1">
                          <button
                            type="button"
                            onClick={() => handleBuyOrEquipAccessory(acc)}
                            className={`font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              isEquipped
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : isOwned
                                ? 'bg-primary text-on-primary hover:bg-primary/90'
                                : 'bg-amber-500 hover:bg-amber-600 text-on-primary'
                            }`}
                          >
                            {isEquipped ? (
                              'Equipado'
                            ) : isOwned ? (
                              'Equipar'
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[14px]">
                                  monetization_on
                                </span>
                                <span>{acc.price}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};

