'use client';

import React from 'react';

// Per-view ErrorBoundary. The app/error.jsx route boundary catches page-level
// crashes; this one isolates a single view inside the platform shell so a
// rendering bug in, say, Conversion Lab doesn't blank out the whole app.
export default class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined') {
      console.error(`View "${this.props.viewName}" crashed:`, error, info);
      window.dispatchEvent(new CustomEvent('brand-toast', {
        detail: { type: 'error', message: `The "${this.props.viewName}" view hit a problem. Try refreshing.` }
      }));
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="p-8 lg:p-12 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-white border border-stone-200 p-7">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-red-700 mb-3">View error</div>
          <div className="font-display text-2xl font-light text-stone-900 mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
            This view couldn't render.
          </div>
          <p className="text-sm text-stone-700 leading-relaxed mb-5">
            Your data is safe. Try the button below — if it keeps happening, jump to another view.
          </p>
          <details className="mb-5 font-mono text-[11px] text-stone-500">
            <summary className="cursor-pointer">Technical detail</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words bg-stone-50 border border-stone-200 p-3">
              {String(this.state.error?.message || this.state.error || 'Unknown error')}
            </pre>
          </details>
          <button
            onClick={this.reset}
            className="px-5 py-2.5 bg-stone-900 text-stone-50 text-sm hover:bg-stone-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
