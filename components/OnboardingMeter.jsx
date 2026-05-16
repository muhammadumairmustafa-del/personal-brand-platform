'use client';

import { computeCompletion } from '@/lib/onboarding';

const VIEW_MAP = {
  profile: 'profile',
  dna: 'dna',
  icp: 'icp',
  story: 'stories',
  hook: 'hooks',
  content: 'content',
};

export default function OnboardingMeter({ state, setActiveView }) {
  const { steps, completed, total, pct, nextStep } = computeCompletion(state);

  if (completed === total) return null;

  return (
    <div className="bg-white border border-stone-200 p-5 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">Brand setup</div>
          <div className="font-display text-2xl font-light text-stone-900" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            {completed} of {total} foundations laid
          </div>
        </div>
        <div className="font-mono text-sm text-stone-700">{pct}%</div>
      </div>
      <div className="h-1.5 bg-stone-200 mb-4 overflow-hidden">
        <div className="h-full bg-stone-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveView && VIEW_MAP[s.id] && setActiveView(VIEW_MAP[s.id])}
            disabled={s.done}
            className={`flex items-center gap-2 text-left px-3 py-2 text-xs border ${s.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800 cursor-default' : 'border-stone-200 hover:border-stone-400 text-stone-700'}`}
          >
            <span className={`inline-block w-3 h-3 rounded-full ${s.done ? 'bg-emerald-600' : 'border border-stone-300'}`} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      {nextStep && (
        <button
          onClick={() => setActiveView && VIEW_MAP[nextStep.id] && setActiveView(VIEW_MAP[nextStep.id])}
          className="px-4 py-2 bg-stone-900 text-stone-50 text-sm hover:bg-stone-800"
        >
          Next: {nextStep.label} →
        </button>
      )}
    </div>
  );
}
