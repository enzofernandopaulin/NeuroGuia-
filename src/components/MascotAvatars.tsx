import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MascotType } from '../types';

interface MascotAvatarProps {
  type: MascotType;
  mood?: number;
  energy?: number;
  accessory?: string;
  className?: string;
  isEating?: boolean;
  eatingFoodEmoji?: string;
  onEatComplete?: () => void;
}

export const MascotAvatar: React.FC<MascotAvatarProps> = ({
  type,
  mood = 80,
  energy = 70,
  accessory,
  className = 'w-48 h-48',
  isEating = false,
  eatingFoodEmoji,
  onEatComplete,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthStage, setMouthStage] = useState<'normal' | 'open' | 'chew'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);
  const foodFlyingRef = useRef<HTMLDivElement>(null);

  const isSleeping = energy < 20;
  const isSad = mood < 30;

  // Periodic Natural Blinking Effect (Gives them life!)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const scheduleBlink = () => {
      const nextBlinkIn = Math.random() * 3500 + 2000; // blink every 2.0s - 5.5s
      timer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, nextBlinkIn);
    };

    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  // GSAP Lightweight Idle & Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!avatarWrapperRef.current) return;

      // Kill previous tweens on wrapper
      gsap.killTweensOf(avatarWrapperRef.current);

      // Lightweight smooth entrance
      gsap.fromTo(
        avatarWrapperRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Simple, lightweight floating idle animation (gentle Y translation only)
      gsap.to(avatarWrapperRef.current, {
        y: -5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [type]);

  // Fast & simple interactive eating animation
  useEffect(() => {
    if (!isEating || !avatarWrapperRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setMouthStage('normal');
          if (onEatComplete) onEatComplete();
        },
      });

      tl.call(() => setMouthStage('open'));

      if (foodFlyingRef.current) {
        tl.fromTo(
          foodFlyingRef.current,
          { scale: 0, x: -60, y: 60, opacity: 0 },
          { scale: 1.3, x: 0, y: -10, opacity: 1, duration: 0.35, ease: 'power2.out' }
        )
        .to(foodFlyingRef.current, {
          scale: 0.2,
          y: 15,
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
        });
      }

      // Simple 1-step chew
      tl.call(() => setMouthStage('chew'))
      .to(avatarWrapperRef.current, {
        scaleY: 0.95,
        scaleX: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 2,
        ease: 'sine.inOut',
      })
      .to(avatarWrapperRef.current, {
        scale: 1,
        y: 0,
        duration: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isEating, eatingFoodEmoji]);

  // Simple click poke feedback
  const handlePokeMascot = () => {
    if (!avatarWrapperRef.current) return;
    gsap.timeline()
      .to(avatarWrapperRef.current, { scale: 1.08, duration: 0.1, ease: 'power1.out' })
      .to(avatarWrapperRef.current, { scale: 1, duration: 0.15, ease: 'power1.in' });
  };

  // Render Vector SVG Accessories perfectly fitted on character body/face
  const renderAccessory = (mascotType?: string) => {
    if (!accessory) return null;

    // Adjust Y offset slightly per mascot type if needed
    const crownY = mascotType === 'lumo' || mascotType === 'pixel' ? -2 : 0;
    const hatY = mascotType === 'lumo' || mascotType === 'pixel' ? -2 : 0;

    if (accessory === 'glasses') {
      // ÓCULOS DE LEITURA (fitted precisely over eyes leftX=72, rightX=128, eyeY=80)
      return (
        <g className="mascot-accessory-glasses">
          <circle cx="72" cy="80" r="22" fill="rgba(255, 255, 255, 0.2)" stroke="#1E293B" strokeWidth="4.5" />
          <circle cx="128" cy="80" r="22" fill="rgba(255, 255, 255, 0.2)" stroke="#1E293B" strokeWidth="4.5" />
          <path d="M94,78 Q100,72 106,78" stroke="#1E293B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M50,80 L30,76 M150,80 L170,76" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <path d="M62,69 L73,63" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
          <path d="M118,69 L129,63" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
        </g>
      );
    }

    if (accessory === 'scarf') {
      // CACHECOL QUENTINHO (Snug & static around neck line below mouth at y=104)
      return (
        <g className="mascot-accessory-scarf">
          <path d="M44,110 C68,100 132,100 156,110 C164,122 154,134 100,137 C46,134 36,122 44,110 Z" fill="#E53935" stroke="#B71C1C" strokeWidth="2.5" />
          <path d="M50,116 Q100,126 150,116" stroke="#EF5350" strokeWidth="3.5" fill="none" />
          <path d="M118,128 C118,128 123,166 111,173 C103,177 91,173 91,160 C91,144 104,132 118,128 Z" fill="#C62828" stroke="#B71C1C" strokeWidth="2" />
          <path d="M93,173 L93,181 M98,174 L98,182 M103,174 L103,182 M108,172 L108,180" stroke="#FFCDD2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="60" y1="112" x2="66" y2="128" stroke="#FFCDD2" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          <line x1="140" y1="112" x2="134" y2="128" stroke="#FFCDD2" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          <line x1="98" y1="145" x2="112" y2="151" stroke="#FFCDD2" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
          <line x1="96" y1="156" x2="108" y2="162" stroke="#FFCDD2" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        </g>
      );
    }

    if (accessory === 'crown') {
      // COROA DE OURO (Top of head)
      return (
        <g className="mascot-accessory-crown" transform={`translate(0, ${crownY})`}>
          <path d="M68,36 L132,36 L138,14 L120,25 L100,8 L80,25 L62,14 Z" fill="#FFD54F" stroke="#FF8F00" strokeWidth="3" strokeLinejoin="round" />
          <path d="M70,36 C70,22 130,22 130,36 Z" fill="#C2185B" opacity="0.85" />
          <rect x="66" y="32" width="68" height="6" rx="2" fill="#FFC107" stroke="#FF8F00" strokeWidth="1.5" />
          <circle cx="100" cy="18" r="4" fill="#E91E63" stroke="#880E4F" strokeWidth="1" />
          <circle cx="76" cy="22" r="3" fill="#00E676" stroke="#004D40" strokeWidth="1" />
          <circle cx="124" cy="22" r="3" fill="#00E676" stroke="#004D40" strokeWidth="1" />
          <circle cx="70" cy="35" r="1.5" fill="#FFFFFF" />
          <circle cx="100" cy="35" r="1.5" fill="#FFFFFF" />
          <circle cx="130" cy="35" r="1.5" fill="#FFFFFF" />
        </g>
      );
    }

    if (accessory === 'hat') {
      // CHAPÉU MÁGICO / CARTOLA (Top of head)
      return (
        <g className="mascot-accessory-hat" transform={`translate(0, ${hatY})`}>
          <ellipse cx="100" cy="34" rx="46" ry="11" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M70,33 L74,6 C74,4 126,4 126,6 L130,33 Z" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M70,31 Q100,35 130,31 L129,24 Q100,28 71,24 Z" fill="#E53935" />
          <rect x="94" y="23" width="12" height="9" rx="1.5" fill="#FFD54F" stroke="#FF8F00" strokeWidth="1" />
          <rect x="97" y="25" width="6" height="5" rx="1" fill="#1E293B" />
        </g>
      );
    }

    if (accessory === 'tie') {
      // GRAVATA ELEGANTE (Neck/Chest line)
      return (
        <g className="mascot-accessory-tie">
          <path d="M74,114 L100,123 L126,114 L120,108 L100,114 L80,108 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <polygon points="93,118 107,118 109,127 91,127" fill="#1E40AF" stroke="#1E3A8A" strokeWidth="1.5" />
          <polygon points="92,127 108,127 113,158 100,168 87,158" fill="#2563EB" stroke="#1E3A8A" strokeWidth="1.5" />
          <line x1="94" y1="135" x2="106" y2="139" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <line x1="91" y1="146" x2="109" y2="151" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    }

    return null;
  };

  // Helper for big shiny Kawaii Eyes with Blinking & Happy Eye Expressions
  const renderEyes = (eyeY: number, leftX: number = 72, rightX: number = 128) => {
    if (isSleeping) {
      return (
        <g stroke="#2C3E50" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d={`M${leftX - 10},${eyeY} Q${leftX},${eyeY + 10} ${leftX + 10},${eyeY}`} />
          <path d={`M${rightX - 10},${eyeY} Q${rightX},${eyeY + 10} ${rightX + 10},${eyeY}`} />
        </g>
      );
    }

    // Blinking or Chewing Happy Closed Eyes (^ ^)
    if (isBlinking || (isEating && mouthStage === 'chew')) {
      return (
        <g stroke="#2C3E50" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d={`M${leftX - 11},${eyeY + 3} Q${leftX},${eyeY - 9} ${leftX + 11},${eyeY + 3}`} />
          <path d={`M${rightX - 11},${eyeY + 3} Q${rightX},${eyeY - 9} ${rightX + 11},${eyeY + 3}`} />
        </g>
      );
    }

    if (isSad) {
      return (
        <g>
          <circle cx={leftX} cy={eyeY} r="12" fill="#2C3E50" />
          <circle cx={leftX - 3} cy={eyeY - 3} r="4" fill="#FFFFFF" />
          <circle cx={rightX} cy={eyeY} r="12" fill="#2C3E50" />
          <circle cx={rightX - 3} cy={eyeY - 3} r="4" fill="#FFFFFF" />
          <path d={`M${leftX - 12},${eyeY - 16} Q${leftX},${eyeY - 10} ${leftX + 10},${eyeY - 14}`} stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d={`M${rightX - 10},${eyeY - 14} Q${rightX},${eyeY - 10} ${rightX + 12},${eyeY - 16}`} stroke="#2C3E50" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    return (
      <g>
        <circle cx={leftX} cy={eyeY} r="15" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="2" />
        <circle cx={leftX} cy={eyeY} r="11" fill="#1A252C" />
        <circle cx={leftX - 3} cy={eyeY - 3} r="4.5" fill="#FFFFFF" />
        <circle cx={leftX + 4} cy={eyeY + 4} r="2" fill="#FFFFFF" />

        <circle cx={rightX} cy={eyeY} r="15" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="2" />
        <circle cx={rightX} cy={eyeY} r="11" fill="#1A252C" />
        <circle cx={rightX - 3} cy={eyeY - 3} r="4.5" fill="#FFFFFF" />
        <circle cx={rightX + 4} cy={eyeY + 4} r="2" fill="#FFFFFF" />
      </g>
    );
  };

  const renderMouth = (mouthY: number) => {
    if (isSleeping) {
      return <ellipse cx="100" cy={mouthY} rx="4" ry="5" fill="#2C3E50" />;
    }

    // ANIMATED MOUTH STATES WHEN EATING (Open wide then Chew!)
    if (isEating) {
      if (mouthStage === 'open') {
        // WIDE OPEN MOUTH waiting for food!
        return (
          <g>
            <ellipse cx="100" cy={mouthY + 8} rx="16" ry="20" fill="#2C3E50" />
            <ellipse cx="100" cy={mouthY + 12} rx="12" ry="12" fill="#1A252C" />
            <path d={`M88,${mouthY + 16} Q100,${mouthY + 27} 112,${mouthY + 16} Z`} fill="#FF6B81" />
            {/* Cute tooth */}
            <path d={`M94,${mouthY - 2} L98,${mouthY + 3} L102,${mouthY - 2}`} fill="#FFFFFF" />
          </g>
        );
      }
      if (mouthStage === 'chew') {
        // Chewing nom nom mouth
        return (
          <g>
            <ellipse cx="100" cy={mouthY + 5} rx="13" ry="9" fill="#2C3E50" />
            <path d={`M90,${mouthY + 6} Q100,${mouthY + 12} 110,${mouthY + 6} Z`} fill="#FF7A8A" />
          </g>
        );
      }
    }

    if (isSad) {
      return (
        <path
          d={`M92,${mouthY + 6} Q100,${mouthY - 2} 108,${mouthY + 6}`}
          stroke="#2C3E50"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      );
    }

    return (
      <g>
        <path d={`M90,${mouthY} Q100,${mouthY + 14} 110,${mouthY} Z`} fill="#2C3E50" />
        <path d={`M93,${mouthY + 4} Q100,${mouthY + 12} 107,${mouthY + 4} Z`} fill="#FF7A8A" />
      </g>
    );
  };

  const renderCheeks = (cheekY: number, leftX: number = 54, rightX: number = 146) => (
    <g>
      <ellipse cx={leftX} cy={cheekY} rx="9" ry="6" fill="#FF6B81" opacity="0.65" />
      <ellipse cx={rightX} cy={cheekY} rx="9" ry="6" fill="#FF6B81" opacity="0.65" />
    </g>
  );

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center select-none ${className}`}>
      
      {/* GSAP Flying Food Item during Feeding */}
      {isEating && eatingFoodEmoji && (
        <div
          ref={foodFlyingRef}
          className="absolute z-50 text-4xl filter drop-shadow-md pointer-events-none"
        >
          {eatingFoodEmoji}
        </div>
      )}

      <div
        ref={avatarWrapperRef}
        onClick={handlePokeMascot}
        className="relative w-full h-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
      >
        
        {/* SVG Vector Lightweight Chibi Render */}
        <>
            {/* LUMO (Coruja do Foco - Owl) */}
            {type === 'lumo' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background glow */}
                <circle cx="100" cy="100" r="75" fill="#7C4DFF" opacity="0.15" />
                {/* Owl Folded Wings */}
                <path d="M26,105 C10,135 45,158 55,148 C62,141 55,120 48,105 Z" fill="#5E35B1" />
                <path d="M174,105 C190,135 155,158 145,148 C138,141 145,120 152,105 Z" fill="#5E35B1" />
                {/* Owl Feathered Ear Tufts */}
                <polygon points="52,48 28,12 72,30" fill="#5E35B1" />
                <polygon points="148,48 172,12 128,30" fill="#5E35B1" />
                <polygon points="54,46 38,20 68,34" fill="#7E57C2" />
                <polygon points="146,46 162,20 132,34" fill="#7E57C2" />
                {/* Owl Main Head/Body */}
                <path d="M100,28 C148,28 168,155 100,165 C32,155 52,28 100,28 Z" fill="#7E57C2" />
                {/* Big Owl Eye-Discs */}
                <circle cx="72" cy="80" r="28" fill="#EDE7F6" stroke="#D1C4E9" strokeWidth="2" />
                <circle cx="128" cy="80" r="28" fill="#EDE7F6" stroke="#D1C4E9" strokeWidth="2" />
                {/* Belly Feather Pattern */}
                <ellipse cx="100" cy="128" rx="36" ry="30" fill="#F3E5F5" />
                <path d="M85,120 Q100,126 115,120 M88,132 Q100,138 112,132 M92,144 Q100,148 108,144" stroke="#B39DDB" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Golden Beak */}
                <path d="M94,92 L106,92 L100,103 Z" fill="#FFB74D" stroke="#F57C00" strokeWidth="1.5" strokeLinejoin="round" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(104)}
                {renderAccessory('lumo')}
              </svg>
            )}

            {/* NORI (Capivara da Calma - Capybara) */}
            {type === 'nori' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background glow */}
                <circle cx="100" cy="100" r="75" fill="#26A69A" opacity="0.15" />
                {/* Capybara Small Folded Ears */}
                <ellipse cx="38" cy="40" rx="12" ry="10" fill="#26A69A" />
                <ellipse cx="38" cy="40" rx="7" ry="5" fill="#80CBC4" />
                <ellipse cx="162" cy="40" rx="12" ry="10" fill="#26A69A" />
                <ellipse cx="162" cy="40" rx="7" ry="5" fill="#80CBC4" />
                {/* Capybara Main Head & Chubby Body */}
                <path d="M100,28 C158,28 172,160 100,165 C28,160 42,28 100,28 Z" fill="#4DB6AC" />
                {/* Belly */}
                <ellipse cx="100" cy="125" rx="42" ry="34" fill="#E0F2F1" />
                {/* Broad Capybara Snout */}
                <path d="M76,82 C76,76 124,76 124,82 L122,104 C122,108 78,108 78,104 Z" fill="#26A69A" />
                {/* Dark Capybara Nose/Nostrils */}
                <ellipse cx="100" cy="90" rx="12" ry="6" fill="#004D40" />
                <circle cx="95" cy="91" r="2" fill="#00251A" />
                <circle cx="105" cy="91" r="2" fill="#00251A" />
                {/* Cute Sprout Leaf on Head */}
                <path d="M96,28 C86,12 98,8 100,8 C102,8 114,12 104,28 Z" fill="#66BB6A" />
                <path d="M100,28 L100,12" stroke="#388E3C" strokeWidth="2" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(104)}
                {renderAccessory('nori')}
              </svg>
            )}

            {/* PIXEL (Raposa da Organização - Fox) */}
            {(type === 'pixel' || type === 'fox') && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Bushy Fox Tail with White Tip Curling behind Right Side */}
                <path d="M152,130 C195,115 192,60 168,70 C148,80 142,112 152,130 Z" fill="#E64A19" stroke="#D84315" strokeWidth="2" />
                <path d="M188,68 C192,58 176,64 168,70 C172,76 182,78 188,68 Z" fill="#FFFFFF" />
                {/* Triangular Fox Ears */}
                <polygon points="52,60 18,8 78,36" fill="#E64A19" />
                <polygon points="50,56 26,18 70,36" fill="#FFCCBC" />
                <polygon points="148,60 182,8 122,36" fill="#E64A19" />
                <polygon points="150,56 174,18 130,36" fill="#FFCCBC" />
                {/* Main Fox Head & Body */}
                <path d="M100,28 C152,28 172,160 100,165 C28,160 48,28 100,28 Z" fill="#FF7043" />
                {/* White Cheek Fluff Patches (Fox Mask) */}
                <path d="M42,95 Q70,90 100,102 Q130,90 158,95 Q168,145 100,165 Q32,145 42,95 Z" fill="#FFF8E1" />
                {/* Fox Cute Black Nose */}
                <ellipse cx="100" cy="94" rx="7" ry="5" fill="#1E293B" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(102)}
                {renderAccessory('pixel')}
              </svg>
            )}

            {/* SOLI (Axolote das Emoções - Axolotl) */}
            {type === 'soli' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background Glow */}
                <circle cx="100" cy="100" r="75" fill="#FFB300" opacity="0.15" />
                {/* 6 Frilly Axolotl Gill Branches (3 Left, 3 Right) */}
                {/* Left Gill Branches */}
                <path d="M48,62 C18,48 12,68 40,76" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M42,80 C10,80 10,96 38,96" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M45,100 C18,112 22,128 46,112" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="20" cy="54" r="5" fill="#E65100" />
                <circle cx="12" cy="88" r="5" fill="#E65100" />
                <circle cx="20" cy="120" r="5" fill="#E65100" />

                {/* Right Gill Branches */}
                <path d="M152,62 C182,48 188,68 160,76" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M158,80 C190,80 190,96 162,96" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path d="M155,100 C182,112 178,128 154,112" stroke="#FF8F00" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="180" cy="54" r="5" fill="#E65100" />
                <circle cx="188" cy="88" r="5" fill="#E65100" />
                <circle cx="180" cy="120" r="5" fill="#E65100" />

                {/* Smooth Axolotl Body */}
                <path d="M100,28 C150,28 168,160 100,165 C32,160 50,28 100,28 Z" fill="#FFCA28" />
                {/* Soft Belly */}
                <ellipse cx="100" cy="122" rx="40" ry="34" fill="#FFF8E1" />
                {/* Axolotl Tiny Paws */}
                <ellipse cx="68" cy="132" rx="7" ry="5" fill="#FFB300" />
                <ellipse cx="132" cy="132" rx="7" ry="5" fill="#FFB300" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(102)}
                {renderAccessory('soli')}
              </svg>
            )}

            {/* KIBO (Guaxinim da Motivação - Raccoon) */}
            {type === 'kibo' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Raccoon Striped Tail Curling on Left Side */}
                <path d="M45,135 C15,125 10,85 30,85 C42,85 48,110 45,135 Z" fill="#7B1FA2" stroke="#4A148C" strokeWidth="2" />
                <path d="M18,118 Q30,122 38,114" stroke="#E1BEE7" strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M22,100 Q32,104 42,96" stroke="#E1BEE7" strokeWidth="5" fill="none" strokeLinecap="round" />
                {/* Round Raccoon Ears */}
                <circle cx="48" cy="38" r="18" fill="#8E24AA" />
                <circle cx="48" cy="38" r="10" fill="#F3E5F5" />
                <circle cx="152" cy="38" r="18" fill="#8E24AA" />
                <circle cx="152" cy="38" r="10" fill="#F3E5F5" />
                {/* Main Raccoon Head & Body */}
                <path d="M100,28 C152,28 172,160 100,165 C28,160 48,28 100,28 Z" fill="#AB47BC" />
                {/* Dark Raccoon Bandit Mask across Eyes */}
                <path d="M42,68 C70,82 130,82 158,68 C148,102 100,98 100,98 C100,98 52,102 42,68 Z" fill="#3B0764" />
                {/* White Snout & Belly */}
                <ellipse cx="100" cy="125" rx="40" ry="34" fill="#F3E5F5" />
                <ellipse cx="100" cy="96" rx="14" ry="9" fill="#FFFFFF" />
                <ellipse cx="100" cy="92" rx="6" ry="4" fill="#1E293B" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(102)}
                {renderAccessory('kibo')}
              </svg>
            )}

            {/* Rex (Cachorrinho Leal - Dog) */}
            {type === 'dog' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background Glow */}
                <circle cx="100" cy="100" r="75" fill="#8D6E63" opacity="0.15" />

                {/* Rex Floppy Ears (Left & Right) */}
                {/* Left Ear Outer */}
                <path d="M58,36 C28,26 12,68 26,110 C34,122 52,114 56,95 C60,78 62,52 58,36 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="2" strokeLinejoin="round" />
                {/* Left Ear Inner Fluff */}
                <path d="M52,46 C34,38 22,70 32,100 C38,108 48,104 50,88 C52,74 54,58 52,46 Z" fill="#8D6E63" />

                {/* Right Ear Outer */}
                <path d="M142,36 C172,26 188,68 174,110 C166,122 148,114 144,95 C140,78 138,52 142,36 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="2" strokeLinejoin="round" />
                {/* Right Ear Inner Fluff */}
                <path d="M148,46 C166,38 178,70 168,100 C162,108 152,104 150,88 C148,74 146,58 148,46 Z" fill="#8D6E63" />

                {/* Main Head & Body */}
                <path d="M100,28 C152,28 170,160 100,165 C30,160 48,28 100,28 Z" fill="#A1887F" />

                {/* White Chest / Belly */}
                <ellipse cx="100" cy="125" rx="40" ry="34" fill="#F5F5F5" />

                {/* Dog Snout Muzzle */}
                <ellipse cx="100" cy="98" rx="25" ry="16" fill="#FFF8E1" stroke="#E0E0E0" strokeWidth="1.5" />

                {/* Heart-shaped Dog Nose */}
                <path d="M93,90 C93,85 107,85 107,90 C107,96 100,101 100,101 C100,101 93,96 93,90 Z" fill="#3E2723" />

                {/* Cute Paws */}
                <ellipse cx="68" cy="138" rx="8" ry="6" fill="#8D6E63" />
                <ellipse cx="132" cy="138" rx="8" ry="6" fill="#8D6E63" />

                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(103)}
                {renderAccessory('dog')}
              </svg>
            )}

            {/* Mimi (Gatinha Calma - Cat) */}
            {type === 'cat' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <polygon points="50,55 30,16 75,36" fill="#90A4AE" />
                <polygon points="48,50 34,22 68,36" fill="#CFD8DC" />
                <polygon points="150,55 170,16 125,36" fill="#90A4AE" />
                <polygon points="152,50 166,22 132,36" fill="#CFD8DC" />
                <path d="M100,32 C150,32 172,160 100,165 C28,160 50,32 100,32 Z" fill="#B0BEC5" />
                <ellipse cx="100" cy="120" rx="42" ry="38" fill="#ECEFF1" />
                <polygon points="96,92 104,92 100,97" fill="#EC407A" />
                {renderEyes(80)}
                {renderCheeks(94)}
                {renderMouth(102)}
                {renderAccessory('cat')}
              </svg>
            )}

            {/* DINO */}
            {type === 'dino' && (
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <path d="M100,32 C150,32 172,160 100,165 C28,160 50,32 100,32 Z" fill="#66BB6A" />
                <ellipse cx="100" cy="120" rx="42" ry="38" fill="#DCEDC8" />
                {renderEyes(78)}
                {renderCheeks(94)}
                {renderMouth(103)}
                {renderAccessory('dino')}
              </svg>
            )}
          </>

      </div>
    </div>
  );
};

