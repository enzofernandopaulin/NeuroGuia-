import React, { useMemo, useState } from 'react';
import {
  AutonomyLevel,
  CommunicationPreference,
  RoutineChangeDifficulty,
  SensoryTrigger,
  SupportLevel,
  TeaProfile,
} from '../types';
import { applySupportPreset, getSupportPreset } from '../lib/supportPresets';

interface Props {
  initialProfile: TeaProfile;
  isEditing: boolean;
  onBack: () => void;
  onComplete: (profile: TeaProfile) => Promise<void> | void;
}

const sensoryOptions: { value: SensoryTrigger; label: string }[] = [
  { value: 'cores', label: 'Cores muito fortes' },
  { value: 'brilho', label: 'Luz ou brilho' },
  { value: 'animacoes', label: 'Animações ou movimentos' },
  { value: 'sons', label: 'Sons' },
  { value: 'vibracao', label: 'Vibração' },
  { value: 'excesso-informacao', label: 'Muitas informações na tela' },
];

export const ResponsibleOnboarding: React.FC<Props> = ({ initialProfile, isEditing, onBack, onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<TeaProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const supportPreset = getSupportPreset(profile.supportLevel);

  const total = 7;
  const progress = useMemo(() => Math.round(((step + 1) / total) * 100), [step]);

  const toggleSensory = (item: SensoryTrigger) => {
    setProfile((current) => ({
      ...current,
      sensoryTriggers: current.sensoryTriggers.includes(item)
        ? current.sensoryTriggers.filter((trigger) => trigger !== item)
        : [...current.sensoryTriggers, item],
    }));
  };

  const selectSupportLevel = (level: SupportLevel) => {
    if (level === profile.supportLevel) return;
    if (isEditing && !window.confirm('Aplicar as sugestões deste nível? Seus ajustes individuais atuais serão substituídos.')) return;
    setProfile(current => applySupportPreset(current, level));
  };

  const finish = async () => {
    setSaving(true);
    setSaveError('');

    try {
      if (!profile.name.trim()) throw new Error('Informe o nome ou apelido do estudante.');
      await onComplete(profile);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o perfil. Tente novamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen px-5 py-8 max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm font-bold text-primary mb-5">← Voltar</button>

      <div className="mb-6">
        <div className="flex justify-between text-xs font-bold text-outline mb-2">
          <span>Personalização inicial</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-outline-variant/60 p-6 shadow-sm">
        {step === 0 && (
          <>
            <h1 className="text-2xl font-extrabold">Quem vai usar o NeuroGuia?</h1>
            <p className="text-sm text-on-surface-variant mt-2 mb-5">Use apenas as informações necessárias para personalizar a experiência.</p>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Nome ou apelido"
              className="w-full rounded-2xl border-2 border-outline-variant p-4 mb-4"
            />
            <div className="grid grid-cols-3 gap-2">
              {(['crianca', 'adolescente', 'adulto'] as const).map((age) => (
                <button key={age} onClick={() => setProfile({ ...profile, ageGroup: age })} className={`p-3 rounded-2xl border-2 font-bold text-sm capitalize ${profile.ageGroup === age ? 'border-primary bg-primary-fixed' : 'border-outline-variant'}`}>
                  {age}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-2xl font-extrabold">Qual nível de suporte foi indicado?</h1>
            <p className="text-sm text-on-surface-variant mt-2 mb-5">O NeuroGuia não realiza diagnóstico. Essa resposta só ajuda a sugerir uma configuração inicial.</p>
            <div className="space-y-2">
              {([
                ['nivel-1', 'Nível 1 — requer suporte'],
                ['nivel-2', 'Nível 2 — requer suporte substancial'],
                ['nivel-3', 'Nível 3 — requer suporte muito substancial'],
                ['nao-informado', 'Não sei / prefiro não informar'],
              ] as [SupportLevel, string][]).map(([value, label]) => (
                <button key={value} onClick={() => selectSupportLevel(value)} className={`w-full text-left p-4 rounded-2 border-2 ${profile.supportLevel === value ? 'border-primary bg-primary-fixed' : 'border-outline-variant'}`}>
                  <span className="font-bold block">{label}</span>
                  <span className="text-xs text-on-surface-variant block mt-1">{getSupportPreset(value).description}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-2xl font-extrabold">Como {profile.name || 'a pessoa'} entende melhor uma tarefa?</h1>
            <div className="grid gap-2 mt-5">
              {([
                ['texto', 'Texto'],
                ['imagem', 'Símbolos'],
                ['texto-imagem', 'Texto + símbolos'],
                ['audio', 'Áudio'],
                ['nao-sei', 'Ainda não sabemos'],
              ] as [CommunicationPreference, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setProfile({ ...profile, communicationPreference: value, audioInstructions: value === 'audio' ? true : profile.audioInstructions })} className={`p-4 rounded-2xl border-2 font-bold text-left ${profile.communicationPreference === value ? 'border-secondary bg-secondary-fixed' : 'border-outline-variant'}`}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-2xl font-extrabold">Quanto auxílio costuma ser necessário?</h1>
            <div className="grid gap-2 mt-5">
              {([
                ['alguns-lembretes', 'Apenas alguns lembretes'],
                ['orientacao-etapas', 'Orientação em algumas etapas'],
                ['orientacao-frequente', 'Orientação frequente'],
                ['acompanhamento-total', 'Acompanhamento durante toda a tarefa'],
              ] as [AutonomyLevel, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setProfile({ ...profile, autonomy: value })} className={`p-4 rounded-2xl border-2 font-bold text-left ${profile.autonomy === value ? 'border-primary bg-primary-fixed' : 'border-outline-variant'}`}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-2xl font-extrabold">Há estímulos que costumam causar desconforto?</h1>
            <p className="text-sm text-on-surface-variant mt-2">Marque o que o responsável considera relevante. Isso poderá ser alterado depois.</p>
            <div className="grid gap-2 mt-5">
              {sensoryOptions.map((item) => {
                const selected = profile.sensoryTriggers.includes(item.value);
                return (
                  <button key={item.value} onClick={() => toggleSensory(item.value)} className={`p-4 rounded-2xl border-2 font-bold text-left flex justify-between ${selected ? 'border-tertiary bg-tertiary-fixed' : 'border-outline-variant'}`}>
                    <span>{item.label}</span><span>{selected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="text-2xl font-extrabold">Mudanças inesperadas na rotina costumam ser difíceis?</h1>
            <div className="grid gap-2 mt-5">
              {([
                ['nao', 'Não'],
                ['as-vezes', 'Às vezes'],
                ['frequentemente', 'Frequentemente'],
              ] as [RoutineChangeDifficulty, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setProfile({ ...profile, routineChangeDifficulty: value })} className={`p-4 rounded-2xl border-2 font-bold text-left ${profile.routineChangeDifficulty === value ? 'border-primary bg-primary-fixed' : 'border-outline-variant'}`}>
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="text-2xl font-extrabold">Configuração sugerida</h1>
            <p className="text-sm text-on-surface-variant mt-2">{supportPreset.title}</p>
            <p className="text-sm text-on-surface-variant mt-1 mb-5">O nível define apenas o ponto de partida. Ajuste cada opção antes de salvar.</p>
            <div className="space-y-3">
              <p className="font-bold">Comunicação: {profile.communicationPreference.replace('-', ' + ')}</p>
              {([
                ['audioInstructions', 'Ler instruções em voz alta'],
                ['softVisualMode', 'Cores suaves'],
                ['largeText', 'Texto maior'],
                ['reduceMotion', 'Reduzir animações'],
                ['stepByStep', 'Mostrar uma etapa por vez'],
                ['helpButton', 'Exibir botão “Me perdi”'],
                ['routineChangeWarning', 'Mostrar aviso sobre mudanças na rotina'],
              ] as [keyof Pick<TeaProfile, 'audioInstructions' | 'softVisualMode' | 'largeText' | 'reduceMotion' | 'stepByStep' | 'helpButton' | 'routineChangeWarning'>, string][]).map(([key, label]) => (
                <label key={key} className="flex justify-between gap-4 items-center rounded-2xl bg-surface-container-low p-4 font-bold">
                  <span>{label}</span>
                  <input type="checkbox" checked={profile[key]} onChange={e => setProfile({ ...profile, [key]: e.target.checked })} />
                </label>
              ))}
              <label className="block rounded-2xl bg-surface-container-low p-4 font-bold">Outras tarefas visíveis ao mesmo tempo
                <select value={profile.maxLaterTasks} onChange={e => setProfile({ ...profile, maxLaterTasks: Number(e.target.value) })}
                  className="block w-full mt-2 p-2 rounded-xl border-2">
                  {[0, 1, 2, 4, 8].map(count => <option value={count} key={count}>{count === 0 ? 'Nenhuma: só a tarefa atual' : count}</option>)}
                </select>
              </label>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-7">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-2xl border-2 border-outline-variant py-3.5 font-extrabold">Anterior</button>}
          {step < total - 1 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 rounded-2xl bg-primary text-white py-3.5 font-extrabold">Continuar</button>
          ) : (
            <button disabled={saving} onClick={finish} className="flex-1 rounded-2xl bg-primary text-white py-3.5 font-extrabold disabled:opacity-60">
              {saving ? 'Salvando...' : 'Usar esta configuração'}
            </button>
          )}
        </div>
        {saveError && (
          <div className="mt-4 rounded-2xl bg-error-container text-on-error-container p-3 text-sm font-bold">
            {saveError}
          </div>
        )}
      </section>
    </main>
  );
};
