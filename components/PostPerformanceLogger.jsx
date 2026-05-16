'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';
import { validate, urlSchema } from '@/lib/validators';
import FieldHint from './FieldHint';

// Lets the user paste a published-post URL + engagement numbers. The feedback
// flows into the post_performance table and (later) into hook ranking.
export default function PostPerformanceLogger() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ url: '', platform: 'LinkedIn', hook: '', impressions: '', likes: '', comments: '', shares: '', dms: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      const r = await fetch('/api/post-performance', { credentials: 'include' });
      const data = await r.json();
      setRows(data.rows || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const submit = async () => {
    const urlCheck = validate(urlSchema, form.url);
    if (!urlCheck.ok) {
      setErrors({ url: urlCheck.errors._ || urlCheck.errors.url || 'Invalid URL' });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const r = await fetch('/api/post-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${r.status}`);
      }
      setForm({ url: '', platform: 'LinkedIn', hook: '', impressions: '', likes: '', comments: '', shares: '', dms: '' });
      setOpen(false);
      refresh();
    } catch (e) {
      window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: e.message } }));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const ok = await (window.brandConfirm ? window.brandConfirm('Delete this performance record?') : Promise.resolve(window.confirm('Delete?')));
    if (!ok) return;
    await fetch(`/api/post-performance?id=${id}`, { method: 'DELETE', credentials: 'include' });
    refresh();
  };

  return (
    <div className="bg-white border border-stone-200 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">Feedback loop</div>
          <div className="font-display text-2xl font-light text-stone-900" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            What actually worked
          </div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="px-4 py-2 bg-stone-900 text-stone-50 text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log a post
        </button>
      </div>

      {open && (
        <div className="bg-stone-50 border border-stone-200 p-5 mb-5 space-y-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-stone-600">Post URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://linkedin.com/posts/..."
              className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 text-sm"
            />
            <FieldHint error={errors.url} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-stone-600">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 text-sm"
              >
                <option>LinkedIn</option>
                <option>X</option>
                <option>YouTube</option>
                <option>Instagram</option>
                <option>Newsletter</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-stone-600">Hook (first line)</label>
              <input
                value={form.hook}
                onChange={(e) => setForm({ ...form, hook: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[['impressions','Imps'],['likes','Likes'],['comments','Comments'],['shares','Shares'],['dms','DMs']].map(([k,l]) => (
              <div key={k}>
                <label className="font-mono text-[10px] uppercase tracking-wider text-stone-600">{l}</label>
                <input
                  type="number"
                  min="0"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-stone-300 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="px-4 py-2 border border-stone-300 text-sm">Cancel</button>
            <button onClick={submit} disabled={saving} className="px-4 py-2 bg-stone-900 text-stone-50 text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-stone-500 italic">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-stone-500 italic">No posts logged yet. Paste a URL + engagement from anywhere you publish.</div>
      ) : (
        <div className="divide-y divide-stone-200">
          {rows.map((r) => (
            <div key={r.id} className="py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-stone-900 truncate">{r.hook || r.url}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-1">
                  {r.platform || '—'} · {r.impressions ?? '?'} imps · {r.likes ?? 0} likes · {r.comments ?? 0} comments
                </div>
              </div>
              <button onClick={() => remove(r.id)} aria-label="Delete" className="p-1.5 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
