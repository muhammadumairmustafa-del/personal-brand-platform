'use client';

// Inline validation hint. Renders below an input when an error exists.
// Usage: <FieldHint error={errors.email} />
export default function FieldHint({ error }) {
  if (!error) return null;
  return (
    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-red-700" role="alert" aria-live="polite">
      {error}
    </div>
  );
}
