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

export const ResponsibleOnboarding: React.FC<Props> = ({ initialProfile, onBack, onComplete }) => {
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

  const finish = async () => {
    const visualSensitive = profile.sensoryTriggers.some((item) =>
      ['cores', 'brilho', 'animacoes', 'excesso-informacao'].includes(item)
    );

    const needsSteps =
      profile.supportLevel === 'nivel-2' ||
      profile.supportLevel === 'nivel-3' ||
      profile.autonomy !== 'alguns-lembretes';

    setSaving(true);
    setSaveError('');

    try {
      await onComplete({
        ...profile,
        softVisualMode: visualSensitive,
        stepByStep: needsSteps,
        helpButton: true,
        routineChangeWarning: profile.routineChangeDifficulty !== 'nao',
      });
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
                <button key={value} onClick={() => setProfile((current) => applySupportPreset(current, value))} className={`w-full text-left p-4 rounded-2xl border-2 ${profile.supportLevel === value ? 'border-primary bg-primary-fixed' : 'border-outline-variant'}`}>
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
                ['imagem', 'Imagens'],
                ['texto-imagem', 'Texto + imagens'],
                ['audio', 'Áudio'],
                ['nao-sei', 'Ainda não sabemos'],
              ] as [CommunicationPreference, string][]).map(([value, label]) => (
                <button key={value} onClick={() => setProfile({ ...profile, communicationPreference: value })} className={`p-4 rounded-2xl border-2 font-bold text-left ${profile.communicationPreference === value ? 'border-secondary bg-secondary-fixed' : 'border-outline-variant'}`}>
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
            <p className="text-sm text-on-surface-variant mt-1 mb-5">O nível define apenas o ponto de partida. O responsável continua no controle e poderá alterar tudo depois.</p>
            <div className="space-y-3">
              <div className="rounded-2xl bg-surface-container-low p-4"><strong>Interface sensorial:</strong> {profile.sensoryTriggers.length ? 'modo suave quando necessário' : 'padrão'}</div>
              <div className="rounded-2xl bg-surface-container-low p-4"><strong>Apresentação:</strong> {profile.communicationPreference.replace('-', ' + ')}</div>
              <div className="rounded-2xl bg-surface-container-low p-4"><strong>Passo a passo:</strong> {profile.autonomy === 'alguns-lembretes' && profile.supportLevel === 'nivel-1' ? 'opcional' : 'recomendado'}</div>
              <div className="rounded-2xl bg-surface-container-low p-4"><strong>Botão “Me perdi”:</strong> ativado</div>
              <div className="rounded-2xl bg-surface-container-low p-4"><strong>Aviso de mudança de rotina:</strong> {profile.routineChangeDifficulty === 'nao' ? 'opcional' : 'ativado'}</div>
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
