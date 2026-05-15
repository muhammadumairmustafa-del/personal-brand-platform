'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Compass, BookOpen, Sparkles, Calendar, TrendingUp, Target,
  Mic, Zap, ArrowRight, Plus, Edit3, Trash2, Save, X, 
  ChevronRight, ChevronLeft, Lightbulb, Heart, AlertCircle, Trophy, Newspaper,
  Loader2, Send, Brain, Layers, BarChart3, CheckCircle2, Circle,
  PenTool, FileText, Video, Headphones, MessageSquare, Bookmark,
  ChevronDown, Settings, User, Award, Flame, Rocket, Eye,
  Search, Filter, Copy, Check, ExternalLink, Linkedin, Twitter,
  Youtube, Instagram, Globe, Hash, Clock, TrendingDown, Activity,
  Users, Crosshair, Microscope, Library, BookMarked, Wand2,
  Repeat, GitBranch, Briefcase, MapPin, Quote, Anchor, Minus,
  ArrowUpRight, Star, Bell, ListChecks, BarChart, PieChart,
  CalendarDays, FileSpreadsheet, Download, Upload, Tag,
  ArrowDown, ArrowUp, Maximize2, Layout, Columns, Grid,
  ScrollText, Mountain, Coffee, Sunrise, Moon,
  Fingerprint, Telescope, Camera, Aperture, DollarSign, Calculator,
  Banknote, Gauge, Bot, Radar, Crown, Flag, HeartHandshake, Network,
  ListOrdered, Workflow, Magnet, Inbox, ChevronsRight, Scale, ShieldCheck,
  Mail, Pause, Play, Mic2, Speaker, Trash, Pin, PinOff,
  Share2, Link2, ImagePlus, Quote as QuoteIcon, MicOff, Phone,
  Headset, Briefcase as BriefcaseIcon, Megaphone, Hourglass, Sparkles as SparkleIcon,
  Shapes, Files, Newspaper as News2, Stamp, BadgeCheck, GraduationCap,
  CircleDollarSign, ThumbsUp, Reply, MessageCircle, ScanLine
} from 'lucide-react';

// ============= SHARED HOOKS & UTILITIES =============

// useEscape — call onEscape when user presses ESC. Idempotent.
function useEscape(onEscape) {
  useEffect(() => {
    if (typeof window === 'undefined' || !onEscape) return;
    const handler = (e) => { if (e.key === 'Escape') onEscape(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape]);
}

// useBodyScrollLock — lock body scroll while a modal/drawer is open.
function useBodyScrollLock(locked) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (locked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [locked]);
}

// useDocTitle — set <title> for the current view.
function useDocTitle(title) {
  useEffect(() => {
    if (typeof document === 'undefined' || !title) return;
    const prev = document.title;
    document.title = `${title} · Brand OS`;
    return () => { document.title = prev; };
  }, [title]);
}

// Defensive first-name helper. Falls back to a placeholder.
function firstNameOf(profile) {
  const n = profile?.name?.trim();
  if (!n) return 'there';
  const first = n.split(/\s+/)[0];
  return first || 'there';
}

// AI rate-limit defaults — must match the values in app/api/ai/route.js
const AI_HOUR_LIMIT = 30;
const AI_DAY_LIMIT = 150;

// useAiUsage — fetch and refresh the rate-limit counter from storage.
// Auto-refreshes after every "brand-ai-success" event (dispatched by the fetch shim).
function useAiUsage() {
  const [usage, setUsage] = useState({ hourCount: 0, dayCount: 0, loaded: false });

  const refresh = async () => {
    try {
      if (typeof window === 'undefined' || !window.storage) return;
      const r = await window.storage.get('_aiUsage');
      const parsed = r?.value ? JSON.parse(r.value) : {};
      const now = Date.now();
      const inHour = (now - (parsed.hourStart || 0)) < 60 * 60 * 1000;
      const inDay = (now - (parsed.dayStart || 0)) < 24 * 60 * 60 * 1000;
      setUsage({
        hourCount: inHour ? (parsed.hourCount || 0) : 0,
        dayCount: inDay ? (parsed.dayCount || 0) : 0,
        loaded: true
      });
    } catch {
      setUsage((u) => ({ ...u, loaded: true }));
    }
  };

  useEffect(() => {
    refresh();
    const onAi = () => { setTimeout(refresh, 300); };
    if (typeof window !== 'undefined') {
      window.addEventListener('brand-ai-call', onAi);
      return () => window.removeEventListener('brand-ai-call', onAi);
    }
  }, []);

  return { ...usage, refresh };
}

// AiUsageMeter — small visual indicator. Drop anywhere a user might wonder
// "why isn't the AI button doing anything?"
function AiUsageMeter({ compact = false }) {
  const { hourCount, dayCount, loaded } = useAiUsage();
  if (!loaded) return null;

  const hourPct = Math.min(100, (hourCount / AI_HOUR_LIMIT) * 100);
  const dayPct = Math.min(100, (dayCount / AI_DAY_LIMIT) * 100);
  const tone = hourPct >= 90 || dayPct >= 90 ? 'bg-red-600' : hourPct >= 70 || dayPct >= 70 ? 'bg-amber-500' : 'bg-emerald-600';

  if (compact) {
    return (
      <div className="font-mono text-[10px] text-stone-500 flex items-center gap-1.5" title={`AI calls used — ${hourCount}/${AI_HOUR_LIMIT} this hour, ${dayCount}/${AI_DAY_LIMIT} today`}>
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone}`} />
        AI {hourCount}/{AI_HOUR_LIMIT}h · {dayCount}/{AI_DAY_LIMIT}d
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">AI usage</div>
      <div className="space-y-2.5">
        <div>
          <div className="flex justify-between font-sans text-xs text-stone-600 mb-1">
            <span>This hour</span>
            <span className="font-mono">{hourCount}/{AI_HOUR_LIMIT}</span>
          </div>
          <div className="h-1.5 bg-stone-200">
            <div className={`h-full transition-all ${tone}`} style={{ width: `${hourPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-sans text-xs text-stone-600 mb-1">
            <span>Today</span>
            <span className="font-mono">{dayCount}/{AI_DAY_LIMIT}</span>
          </div>
          <div className="h-1.5 bg-stone-200">
            <div className={`h-full transition-all ${tone}`} style={{ width: `${dayPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= MAIN APP =============
export default function PersonalBrandPlatform() {
  const [activeView, setActiveView] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [contentPieces, setContentPieces] = useState([]);
  const [funnels, setFunnels] = useState([]);
  const [calendar, setCalendar] = useState({});
  const [icps, setIcps] = useState([]);
  const [hooks, setHooks] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [batches, setBatches] = useState([]);
  const [dna, setDna] = useState({});
  const [photoMining, setPhotoMining] = useState({});
  const [optins, setOptins] = useState([]);
  const [revenuePlan, setRevenuePlan] = useState({});
  const [aio, setAio] = useState({ topics: [], queries: [] });
  const [ideas, setIdeas] = useState([]);
  const [briefing, setBriefing] = useState({});
  const [conversations, setConversations] = useState([]);
  const [outbound, setOutbound] = useState([]);
  const [swipeFile, setSwipeFile] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [proof, setProof] = useState([]);
  const [publicProfile, setPublicProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the user navigates to a new view
  useEffect(() => { setMobileNavOpen(false); }, [activeView]);
  useBodyScrollLock(mobileNavOpen);

  // Set the browser tab title based on the active view
  const viewTitles = {
    dashboard: 'Dashboard', health: 'Brand Health', profile: 'Profile', dna: 'Brand DNA',
    icp: 'ICP Lab', ideas: 'Idea Inbox', mining: 'Photo Mining', stories: 'Story Vault',
    hooks: 'Hook Library', coach: 'AI Coach', content: 'Content Engine',
    repurpose: 'Repurposing Studio', newsletter: 'Newsletter Studio', batch: 'Batch Workflow',
    conversations: 'Conversations', outbound: 'Outbound', funnels: 'Funnels',
    conversion: 'Conversion Lab', revenue: 'Revenue Planner', calendar: 'Calendar',
    analytics: 'Analytics', aio: 'AI Search', public: 'Public Profile', swipe: 'Swipe File',
    proof: 'Proof Vault'
  };
  useDocTitle(viewTitles[activeView] || null);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        const keys = ['profile', 'stories', 'content', 'funnels', 'calendar', 'icps', 'hooks', 'analytics', 'batches', 'dna', 'photoMining', 'optins', 'revenuePlan', 'aio', 'ideas', 'briefing', 'conversations', 'outbound', 'swipeFile', 'newsletters', 'proof', 'publicProfile'];
        const setters = { profile: setProfile, stories: setStories, content: setContentPieces, funnels: setFunnels, calendar: setCalendar, icps: setIcps, hooks: setHooks, analytics: setAnalytics, batches: setBatches, dna: setDna, photoMining: setPhotoMining, optins: setOptins, revenuePlan: setRevenuePlan, aio: setAio, ideas: setIdeas, briefing: setBriefing, conversations: setConversations, outbound: setOutbound, swipeFile: setSwipeFile, newsletters: setNewsletters, proof: setProof, publicProfile: setPublicProfile };
        const defaults = { stories: [], content: [], funnels: [], calendar: {}, icps: [], hooks: [], analytics: {}, batches: [], dna: {}, photoMining: {}, optins: [], revenuePlan: {}, aio: { topics: [], queries: [] }, ideas: [], briefing: {}, conversations: [], outbound: [], swipeFile: [], newsletters: [], proof: [], publicProfile: {} };
        
        for (const k of keys) {
          try {
            const r = await window.storage.get(`brand:${k}`);
            if (r?.value) setters[k](JSON.parse(r.value));
            else if (defaults[k] !== undefined) setters[k](defaults[k]);
          } catch (e) {
            if (defaults[k] !== undefined) setters[k](defaults[k]);
          }
        }
        
        const profileResult = await window.storage.get('brand:profile').catch(() => null);
        if (!profileResult?.value) setShowOnboarding(true);
      } catch (e) {
        console.error('Load error:', e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const saver = (key, setter) => async (val) => {
    setter(val);
    try {
      await window.storage.set(`brand:${key}`, JSON.stringify(val));
    } catch (e) { console.error('Save error:', e); }
  };

  const saveProfile = saver('profile', setProfile);
  const saveStories = saver('stories', setStories);
  const saveContent = saver('content', setContentPieces);
  const saveFunnels = saver('funnels', setFunnels);
  const saveCalendar = saver('calendar', setCalendar);
  const saveIcps = saver('icps', setIcps);
  const saveHooks = saver('hooks', setHooks);
  const saveAnalytics = saver('analytics', setAnalytics);
  const saveBatches = saver('batches', setBatches);
  const saveDna = saver('dna', setDna);
  const savePhotoMining = saver('photoMining', setPhotoMining);
  const saveOptins = saver('optins', setOptins);
  const saveRevenuePlan = saver('revenuePlan', setRevenuePlan);
  const saveAio = saver('aio', setAio);
  const saveIdeas = saver('ideas', setIdeas);
  const saveBriefing = saver('briefing', setBriefing);
  const saveConversations = saver('conversations', setConversations);
  const saveOutbound = saver('outbound', setOutbound);
  const saveSwipeFile = saver('swipeFile', setSwipeFile);
  const saveNewsletters = saver('newsletters', setNewsletters);
  const saveProof = saver('proof', setProof);
  const savePublicProfile = saver('publicProfile', setPublicProfile);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-900 mx-auto mb-4" />
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">Loading your brand</div>
        </div>
      </div>
    );
  }

  if (showOnboarding || !profile) {
    return <Onboarding onComplete={(p) => { saveProfile(p); setShowOnboarding(false); }} />;
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      <GlobalStyles />
      <CommandPalette setActiveView={setActiveView} viewTitles={viewTitles} />

      {/* Mobile top bar — only visible on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
          className="p-2 -ml-2 hover:bg-stone-100"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500">Brand OS</div>
        <div className="w-9" />{/* spacer for balance */}
      </div>

      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-40"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        profile={profile}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        stories={stories}
        contentPieces={contentPieces}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <main className={`${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} ml-0 pt-14 lg:pt-0 min-h-screen transition-all duration-300`}>
        {activeView === 'dashboard' && (
          <Dashboard
            profile={profile} stories={stories} contentPieces={contentPieces}
            funnels={funnels} calendar={calendar} setActiveView={setActiveView}
            analytics={analytics} icps={icps} batches={batches}
            dna={dna} photoMining={photoMining} optins={optins} revenuePlan={revenuePlan} aio={aio}
            ideas={ideas} briefing={briefing} saveBriefing={saveBriefing}
            conversations={conversations} outbound={outbound} swipeFile={swipeFile}
            newsletters={newsletters} proof={proof}
          />
        )}
        {activeView === 'ideas' && (
          <IdeaInbox ideas={ideas} saveIdeas={saveIdeas} stories={stories} saveStories={saveStories} profile={profile} />
        )}
        {activeView === 'conversations' && (
          <ConversationsHub conversations={conversations} saveConversations={saveConversations} profile={profile} contentPieces={contentPieces} />
        )}
        {activeView === 'outbound' && (
          <OutboundPipeline outbound={outbound} saveOutbound={saveOutbound} profile={profile} stories={stories} />
        )}
        {activeView === 'repurpose' && (
          <RepurposingStudio stories={stories} contentPieces={contentPieces} saveContent={saveContent} profile={profile} icps={icps} setActiveView={setActiveView} />
        )}
        {activeView === 'swipe' && (
          <SwipeFile swipeFile={swipeFile} saveSwipeFile={saveSwipeFile} profile={profile} />
        )}
        {activeView === 'newsletter' && (
          <NewsletterStudio newsletters={newsletters} saveNewsletters={saveNewsletters} stories={stories} profile={profile} setActiveView={setActiveView} />
        )}
        {activeView === 'proof' && (
          <ProofVault proof={proof} saveProof={saveProof} contentPieces={contentPieces} profile={profile} />
        )}
        {activeView === 'public' && (
          <PublicProfileBuilder publicProfile={publicProfile} savePublicProfile={savePublicProfile} profile={profile} dna={dna} stories={stories} optins={optins} />
        )}
        {activeView === 'health' && (
          <BrandHealth profile={profile} dna={dna} stories={stories} contentPieces={contentPieces} icps={icps} optins={optins} aio={aio} analytics={analytics} ideas={ideas} conversations={conversations} setActiveView={setActiveView} />
        )}
        {activeView === 'dna' && (
          <BrandDNALab dna={dna} saveDna={saveDna} profile={profile} saveProfile={saveProfile} />
        )}
        {activeView === 'mining' && (
          <PhotoMiningRitual photoMining={photoMining} savePhotoMining={savePhotoMining} stories={stories} saveStories={saveStories} profile={profile} />
        )}
        {activeView === 'conversion' && (
          <ConversionLab optins={optins} saveOptins={saveOptins} profile={profile} icps={icps} stories={stories} />
        )}
        {activeView === 'revenue' && (
          <RevenuePlanner revenuePlan={revenuePlan} saveRevenuePlan={saveRevenuePlan} profile={profile} analytics={analytics} contentPieces={contentPieces} />
        )}
        {activeView === 'aio' && (
          <AIOTracker aio={aio} saveAio={saveAio} profile={profile} contentPieces={contentPieces} />
        )}
        {activeView === 'stories' && (
          <StoryVault stories={stories} saveStories={saveStories} profile={profile} />
        )}
        {activeView === 'icp' && (
          <ICPLab icps={icps} saveIcps={saveIcps} profile={profile} />
        )}
        {activeView === 'hooks' && (
          <HookLibrary hooks={hooks} saveHooks={saveHooks} profile={profile} />
        )}
        {activeView === 'content' && (
          <ContentEngine
            contentPieces={contentPieces} saveContent={saveContent}
            stories={stories} profile={profile} hooks={hooks} icps={icps}
            setActiveView={setActiveView}
          />
        )}
        {activeView === 'batch' && (
          <BatchWorkflow 
            batches={batches} saveBatches={saveBatches} 
            stories={stories} contentPieces={contentPieces} 
            saveContent={saveContent} profile={profile}
          />
        )}
        {activeView === 'funnels' && (
          <FunnelBuilder funnels={funnels} saveFunnels={saveFunnels} profile={profile} />
        )}
        {activeView === 'calendar' && (
          <ContentCalendar 
            calendar={calendar} saveCalendar={saveCalendar} 
            contentPieces={contentPieces} saveContent={saveContent}
            analytics={analytics} saveAnalytics={saveAnalytics}
          />
        )}
        {activeView === 'analytics' && (
          <Analytics 
            analytics={analytics} saveAnalytics={saveAnalytics}
            contentPieces={contentPieces} stories={stories} calendar={calendar}
            profile={profile}
          />
        )}
        {activeView === 'coach' && (
          <AICoach profile={profile} stories={stories} saveStories={saveStories} />
        )}
        {activeView === 'profile' && (
          <ProfileSettings profile={profile} saveProfile={saveProfile} setShowOnboarding={setShowOnboarding} />
        )}
      </main>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
      .font-display { font-family: 'Fraunces', Georgia, serif; font-variation-settings: "opsz" 144; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      .font-sans { font-family: 'Inter', sans-serif; }
      .grain::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
        pointer-events: none;
        mix-blend-mode: overlay;
      }
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #f5f5f4; }
      ::-webkit-scrollbar-thumb { background: #d6d3d1; }
      ::-webkit-scrollbar-thumb:hover { background: #a8a29e; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .animate-slideIn { animation: slideIn 0.4s ease-out; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
    `}</style>
  );
}

// ============= ONBOARDING =============
const ONBOARDING_STORAGE_KEY = 'brand:onboarding:draft';

const ONBOARDING_BLANK = {
  name: '',
  title: '',
  location: '',
  industries: [],
  audiences: [],
  expertise: [],
  transformation: '',
  pains: [],
  prizes: [],
  voice: '',
  tone: [],
  voiceTaboos: [],
  primaryGoal: '',
  secondaryGoals: [],
  platforms: [],
  primaryPlatform: '',
  postingCadence: 'three_per_week',
  timeAvailable: '',
  competitorVoices: [],
  differentiators: ''
};

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(ONBOARDING_BLANK);
  const [restored, setRestored] = useState(false);

  // Restore in-progress draft from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.data) {
          setData({ ...ONBOARDING_BLANK, ...saved.data });
          setStep(typeof saved.step === 'number' ? saved.step : 0);
          setRestored(true);
        }
      }
    } catch {}
  }, []);

  // Persist draft on every change so a browser crash doesn't lose progress
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ data, step, savedAt: Date.now() }));
    } catch {}
  }, [data, step]);

  const update = (k, v) => setData({ ...data, [k]: v });

  const steps = [
    { title: 'Welcome', subtitle: "Let's build your personal brand engine" },
    { title: 'Identity', subtitle: 'Who are you, professionally?' },
    { title: 'Audience', subtitle: 'Who are you speaking to?' },
    { title: 'Expertise', subtitle: 'What do you know better than most?' },
    { title: 'Transformation', subtitle: 'What change do you create for people?' },
    { title: 'Pain & Prize', subtitle: 'The emotional anchors of your audience' },
    { title: 'Voice', subtitle: 'How you sound — and how you don\'t' },
    { title: 'Differentiation', subtitle: 'Why you, not them' },
    { title: 'Platforms & Cadence', subtitle: 'Where and how often' },
    { title: 'Goals', subtitle: 'What does success look like?' }
  ];

  const canProceed = () => {
    if (step === 1) return data.title.length > 0 && data.industries.length > 0;
    if (step === 2) return data.audiences.length > 0;
    if (step === 3) return data.expertise.length >= 3;
    if (step === 4) return data.transformation.length > 20;
    if (step === 5) return data.pains.length >= 2 && data.prizes.length >= 2;
    if (step === 6) return data.voice.length > 0 && data.tone.length > 0;
    if (step === 7) return data.differentiators.length > 10;
    if (step === 8) return data.platforms.length > 0 && data.primaryPlatform.length > 0;
    if (step === 9) return data.primaryGoal.length > 0;
    return true;
  };

  // What's missing on this step? Used to render a friendly hint under the form
  // when "Continue" is disabled, so the user understands WHY.
  const validationHint = () => {
    if (step === 1) {
      if (!data.title) return 'Add your professional title to continue.';
      if (data.industries.length === 0) return 'Add at least one industry tag.';
    }
    if (step === 2 && data.audiences.length === 0) return 'Add at least one audience to continue.';
    if (step === 3 && data.expertise.length < 3) return `Add ${3 - data.expertise.length} more area${data.expertise.length === 2 ? '' : 's'} of expertise (need 3 minimum).`;
    if (step === 4) {
      if (data.transformation.length === 0) return 'Write your transformation statement to continue.';
      if (data.transformation.length <= 20) return `${21 - data.transformation.length} more character${21 - data.transformation.length === 1 ? '' : 's'} needed — be a little more specific.`;
    }
    if (step === 5) {
      if (data.pains.length < 2) return `Add ${2 - data.pains.length} more pain${data.pains.length === 1 ? '' : 's'} (need 2 minimum).`;
      if (data.prizes.length < 2) return `Add ${2 - data.prizes.length} more prize${data.prizes.length === 1 ? '' : 's'} (need 2 minimum).`;
    }
    if (step === 6) {
      if (!data.voice) return 'Pick a voice archetype to continue.';
      if (data.tone.length === 0) return 'Add at least one tone descriptor.';
    }
    if (step === 7 && data.differentiators.length <= 10) return 'Write a bit more on what makes you different (longer than 10 characters).';
    if (step === 8) {
      if (data.platforms.length === 0) return 'Pick at least one platform.';
      if (!data.primaryPlatform) return 'Select your primary platform.';
    }
    if (step === 9 && !data.primaryGoal) return 'Add your primary goal to finish.';
    return null;
  };

  const clearDraft = () => {
    try { localStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch {}
  };

  const saveAndExit = () => {
    // The draft is already auto-saved on every change — this just gives the user
    // a deliberate exit point. They can come back later by re-loading the platform.
    if (typeof window !== 'undefined') {
      alert("Your progress is saved. Close this tab — when you return, you'll pick up where you left off.");
    }
  };

  const startOver = () => {
    if (typeof window === 'undefined' || !window.confirm('Start onboarding over? Your in-progress draft will be cleared.')) return;
    clearDraft();
    setData(ONBOARDING_BLANK);
    setStep(0);
    setRestored(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      <GlobalStyles />
      
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-200 rounded-full blur-3xl opacity-50" />

      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-200 z-50">
        <div className="h-full bg-stone-900 transition-all duration-700" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-8 pt-20 pb-16">
        <div className="mb-10 animate-fadeIn">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-3">
            <span className="text-stone-900 font-semibold">{String(step + 1).padStart(2, '0')}</span>
            <span className="mx-2">/</span>
            <span>{String(steps.length).padStart(2, '0')}</span>
            <span className="mx-3">·</span>
            <span>{steps[step].title}</span>
          </div>
          <h1 className="font-display text-6xl font-light text-stone-900 leading-[1.05] tracking-tight">
            {steps[step].subtitle}
          </h1>
        </div>

        <div className="bg-white border border-stone-200 p-10 rounded-sm shadow-[0_2px_30px_rgba(0,0,0,0.04)] animate-slideIn">
          {step === 0 && <OnboardWelcome />}
          {step === 1 && <OnboardIdentity data={data} update={update} />}
          {step === 2 && <OnboardAudience data={data} update={update} />}
          {step === 3 && <OnboardExpertise data={data} update={update} />}
          {step === 4 && <OnboardTransformation data={data} update={update} />}
          {step === 5 && <OnboardPainPrize data={data} update={update} />}
          {step === 6 && <OnboardVoice data={data} update={update} />}
          {step === 7 && <OnboardDifferentiation data={data} update={update} />}
          {step === 8 && <OnboardPlatforms data={data} update={update} />}
          {step === 9 && <OnboardGoals data={data} update={update} />}
        </div>

        {/* Restored-from-draft banner */}
        {restored && step > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="font-sans text-xs text-stone-700">
              <span className="font-mono uppercase tracking-wider text-amber-800 text-[10px]">Picking up where you left off</span>
              <span className="mx-2 text-stone-400">·</span>
              You can edit any answer or start fresh.
            </div>
            <button onClick={startOver} className="font-sans text-xs text-stone-600 hover:text-stone-900 underline">Start over</button>
          </div>
        )}

        {/* Validation hint when "Continue" is disabled */}
        {validationHint() && (
          <div className="mt-3 font-sans text-xs text-stone-500 italic">{validationHint()}</div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center mt-6 gap-3">
          <div className="flex gap-3 items-center">
            <button
              onClick={() => step > 0 && setStep(step - 1)}
              disabled={step === 0}
              className="font-sans text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30 flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step > 0 && (
              <>
                <span className="text-stone-300">·</span>
                <button
                  onClick={saveAndExit}
                  className="font-sans text-xs text-stone-500 hover:text-stone-900"
                  title="Your progress is auto-saved. Close the tab and come back anytime."
                >
                  Save & exit
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => {
              if (step === steps.length - 1) {
                onComplete({ ...data, createdAt: new Date().toISOString() });
                clearDraft();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!canProceed()}
            className="px-6 sm:px-8 py-3 bg-stone-900 text-stone-50 font-sans text-sm tracking-wide hover:bg-stone-800 disabled:opacity-30 flex items-center justify-center gap-2 group"
          >
            {step === steps.length - 1 ? 'Build my platform' : 'Continue'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardWelcome() {
  return (
    <div className="space-y-6">
      <p className="font-display text-2xl text-stone-800 leading-snug font-light">
        Built around the framework: <em className="text-stone-900">relatable beats impressive</em>.
      </p>
      <p className="text-base text-stone-700 leading-relaxed font-sans">
        The goal isn't celebrity. It's extracting the lessons from <em>your</em> lived experience and turning them into a content engine that works 24/7 — even as AI-generated content floods the feed.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
        {[
          { icon: BookOpen, label: 'Story Vault', desc: 'Your unique stories' },
          { icon: Crosshair, label: 'ICP Lab', desc: 'Audience research' },
          { icon: Library, label: 'Hook Library', desc: 'Proven openers' },
          { icon: Sparkles, label: 'Content Engine', desc: 'Pain · Prize · News' },
          { icon: Repeat, label: 'Batch Workflow', desc: 'Plan a week in 30 min' },
          { icon: BarChart3, label: 'Analytics', desc: 'What\'s working' }
        ].map((item, i) => (
          <div key={i} className="p-4 bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all">
            <item.icon className="w-4 h-4 text-stone-700 mb-2" />
            <div className="font-medium text-sm text-stone-900">{item.label}</div>
            <div className="font-sans text-[11px] text-stone-500 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200">
        <div className="font-sans text-xs uppercase tracking-wider text-amber-800 font-semibold mb-1">10-minute setup</div>
        <p className="text-sm text-stone-700 font-sans leading-relaxed">
          The next 10 questions shape every word the engine generates. Be honest, specific, and don't smooth your edges — that's where the relatable comes from.
        </p>
      </div>
    </div>
  );
}

function OnboardIdentity({ data, update }) {
  return (
    <div className="space-y-6">
      <Field label="Your name">
        <Input value={data.name} onChange={v => update('name', v)} />
      </Field>
      <Field label="Professional title — how you'd introduce yourself at a conference">
        <Input value={data.title} onChange={v => update('title', v)} placeholder="e.g. BD & Partnerships at stc / Founder at TonePerks" />
      </Field>
      <Field label="Where you operate from">
        <Input value={data.location} onChange={v => update('location', v)} placeholder="e.g. Riyadh, KSA / Lahore, PK" />
      </Field>
      <ChipInput
        label="Industries you operate in"
        items={data.industries}
        setItems={v => update('industries', v)}
        suggestions={['Telecom', 'Fintech', 'BD & Partnerships', 'SaaS', 'Loan Recovery', 'Voice Advertising', 'Strategy Consulting', 'GCC Markets', 'Pakistan Markets', 'AI/ML', 'Banking']}
      />
    </div>
  );
}

function OnboardAudience({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-stone-100 border-l-4 border-stone-900">
        <p className="text-sm text-stone-700 font-sans leading-relaxed">
          <strong>Specificity wins.</strong> "Business owners" is dead air. "Telecom BD heads in MENA trying to monetize voice channels" is gold — the algorithm rewards the latter.
        </p>
      </div>
      <ChipInput
        label="Primary audiences (the people who should care)"
        items={data.audiences}
        setItems={v => update('audiences', v)}
        suggestions={[
          'Telecom BD & Partnerships leaders',
          'Founders in MENA / South Asia',
          'Fintech & loan recovery teams',
          'Banking heads of collections',
          'Strategy professionals at telcos',
          'Aspiring BD professionals',
          'Pakistan-based founders',
          'GCC corporate strategists',
          'CMOs of growth-stage startups',
          'VAS product managers'
        ]}
      />
      <Field label="Describe your dream reader in one sentence">
        <Textarea 
          rows={3}
          value={data.idealReader || ''}
          onChange={v => update('idealReader', v)}
          placeholder="e.g. A 35-year-old BD lead at a tier-1 telco, frustrated that good ideas die in legal, looking for proof that partnerships can actually ship."
        />
      </Field>
    </div>
  );
}

function OnboardExpertise({ data, update }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600 font-sans">
        Add at least 3. These become the backbone of your "process" content — the long-form pieces that turn followers into leads.
      </p>
      <ChipInput
        label="Areas where you have hard-won expertise"
        items={data.expertise}
        setItems={v => update('expertise', v)}
        suggestions={[
          'Telco partnership structuring',
          'RRBT / voice advertising platforms',
          'Loan recovery via voice',
          'Multi-stakeholder BD deals',
          'Cross-border deal-making (KSA-PK)',
          'Revenue share negotiation',
          'Building BD CRMs from scratch',
          'Going from zero to MOU',
          'Vendor RFI responses',
          'Strategy deck storytelling',
          'GCC market entry',
          'Voice AI productization'
        ]}
      />
    </div>
  );
}

function OnboardTransformation({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200">
        <div className="font-sans text-xs uppercase tracking-wider text-amber-800 font-semibold mb-1">The Transformation Formula</div>
        <p className="font-display text-lg text-stone-800 italic leading-snug">
          "I help <span className="bg-amber-200 px-1">[audience]</span> go from <span className="bg-amber-200 px-1">[before]</span> to <span className="bg-amber-200 px-1">[after]</span> by <span className="bg-amber-200 px-1">[your method]</span>."
        </p>
      </div>
      <Field label="Your transformation statement">
        <Textarea
          rows={5}
          value={data.transformation}
          onChange={v => update('transformation', v)}
          placeholder="e.g. I help telecom BD professionals go from feature-pitching to structuring partnerships that ship — by combining operator-side empathy with founder-grade execution."
        />
      </Field>
    </div>
  );
}

function OnboardPainPrize({ data, update }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600 font-sans">
        These become the hooks for every Monday (Pain) and Friday (Prize) post. Be visceral.
      </p>
      <ChipInput
        label="Pains (problems they'd pay to solve)"
        items={data.pains}
        setItems={v => update('pains', v)}
        accent="red"
        suggestions={[
          'Deals that stall in legal for months',
          'Telco BDs going nowhere',
          'Pitch decks that don\'t convert',
          'Recoveries missing collection targets',
          'Revenue shares that get gamed',
          'Internal politics killing good projects',
          'Vendor RFIs that read like brochures',
          'Sales cycles measured in quarters',
          'Partnership pipelines that look full but ship nothing'
        ]}
      />
      <ChipInput
        label="Prizes (outcomes they desire)"
        items={data.prizes}
        setItems={v => update('prizes', v)}
        accent="green"
        suggestions={[
          'A signed MOU within 90 days',
          'A BD pipeline that compounds',
          'Deals that ship, not just slide',
          '4x ROI on collection campaigns',
          'A partnership that scales to 8 figures',
          'Recognition as the deal-closer',
          'A repeatable BD playbook',
          'Inbound deal flow',
          'Equity in something real'
        ]}
      />
    </div>
  );
}

function OnboardVoice({ data, update }) {
  return (
    <div className="space-y-6">
      <Field label="Your voice archetype">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { v: 'analytical', label: 'Analytical & frameworks-driven', desc: 'Like , Lex Fridman' },
            { v: 'storyteller', label: 'Story-led & emotional', desc: 'Like Steven Bartlett' },
            { v: 'contrarian', label: 'Contrarian & bold', desc: 'Like Naval, Codie Sanchez' },
            { v: 'practitioner', label: 'In-the-trenches operator', desc: 'Like Shaan Puri' },
            { v: 'professorial', label: 'Professorial & deep', desc: 'Like Galloway, Wolfe' },
            { v: 'wry', label: 'Wry & deadpan', desc: 'Like Patrick Collison' }
          ].map(o => (
            <button
              key={o.v}
              onClick={() => update('voice', o.v)}
              className={`p-4 text-left border transition-all ${
                data.voice === o.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 hover:border-stone-500 bg-stone-50'
              }`}
            >
              <div className="font-medium text-sm">{o.label}</div>
              <div className={`font-sans text-xs mt-1 ${data.voice === o.v ? 'text-stone-300' : 'text-stone-500'}`}>{o.desc}</div>
            </button>
          ))}
        </div>
      </Field>
      <ChipInput
        label="Tone descriptors (pick 3-5)"
        items={data.tone}
        setItems={v => update('tone', v)}
        suggestions={['Dry', 'Direct', 'Warm', 'Sharp', 'Honest', 'Curious', 'Confident', 'Humble', 'Witty', 'Measured', 'Provocative', 'Generous']}
      />
      <ChipInput
        label="Voice taboos (what you'd never say or write)"
        items={data.voiceTaboos}
        setItems={v => update('voiceTaboos', v)}
        accent="red"
        suggestions={[
          'No "thrilled to announce"',
          'No "in this thread"',
          'No emojis',
          'No "guys" / "gals"',
          'No fake humility',
          'No buzzwords (synergy, leverage)',
          'No #hashtags spam',
          'No ALL CAPS hooks',
          'No motivational fluff'
        ]}
      />
    </div>
  );
}

function OnboardDifferentiation({ data, update }) {
  return (
    <div className="space-y-6">
      <ChipInput
        label="Voices in your space you respect (or want to compete with)"
        items={data.competitorVoices}
        setItems={v => update('competitorVoices', v)}
        suggestions={['Steven Bartlett', 'Codie Sanchez', 'Justin Welsh', 'Sahil Bloom', 'Alex Hormozi', 'Naval Ravikant']}
      />
      <Field label="What makes you different from them?">
        <Textarea
          rows={5}
          value={data.differentiators}
          onChange={v => update('differentiators', v)}
          placeholder="e.g. I'm not a pundit — I'm running deals every week at scale in two emerging markets. My stories are operator stories, not consultant stories."
        />
      </Field>
    </div>
  );
}

function OnboardPlatforms({ data, update }) {
  const platforms = [
    { v: 'LinkedIn', icon: Linkedin },
    { v: 'X', icon: Twitter },
    { v: 'YouTube', icon: Youtube },
    { v: 'Instagram', icon: Instagram },
    { v: 'Newsletter', icon: FileText },
    { v: 'Podcast', icon: Headphones }
  ];
  return (
    <div className="space-y-6">
      <Field label="Where will you publish? (pick all that apply)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {platforms.map(p => {
            const sel = data.platforms.includes(p.v);
            return (
              <button
                key={p.v}
                onClick={() => update('platforms', sel ? data.platforms.filter(x => x !== p.v) : [...data.platforms, p.v])}
                className={`px-3 py-3 text-sm border transition-all flex items-center gap-2 ${
                  sel ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 bg-stone-50 hover:border-stone-500'
                }`}
              >
                <p.icon className="w-4 h-4" />
                {p.v}
              </button>
            );
          })}
        </div>
      </Field>
      {data.platforms.length > 0 && (
        <Field label="Primary platform (where you'll go all-in first)">
          <div className="flex flex-wrap gap-2">
            {data.platforms.map(p => (
              <button
                key={p}
                onClick={() => update('primaryPlatform', p)}
                className={`px-4 py-2 text-sm border ${data.primaryPlatform === p ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
      )}
      <Field label="Posting cadence">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { v: 'three_per_week', label: '3/week', desc: 'Mon · Wed · Fri' },
            { v: 'daily', label: 'Daily', desc: '\'s recommendation' },
            { v: 'multiple_daily', label: 'Multiple/day', desc: 'Maximalist mode' }
          ].map(c => (
            <button
              key={c.v}
              onClick={() => update('postingCadence', c.v)}
              className={`p-3 text-left border ${data.postingCadence === c.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}
            >
              <div className="font-medium text-sm">{c.label}</div>
              <div className={`font-sans text-xs mt-0.5 ${data.postingCadence === c.v ? 'text-stone-300' : 'text-stone-500'}`}>{c.desc}</div>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Time you can realistically commit per week">
        <Input value={data.timeAvailable} onChange={v => update('timeAvailable', v)} placeholder="e.g. 4 hours, batched on Sunday morning" />
      </Field>
    </div>
  );
}

function OnboardGoals({ data, update }) {
  return (
    <div className="space-y-6">
      <Field label="Primary outcome from your personal brand (12 months)">
        <Textarea
          rows={3}
          value={data.primaryGoal}
          onChange={v => update('primaryGoal', v)}
          placeholder="e.g. Inbound deal flow for TonePerks — 3 qualified telco intros per month."
        />
      </Field>
      <ChipInput
        label="Secondary goals"
        items={data.secondaryGoals}
        setItems={v => update('secondaryGoals', v)}
        suggestions={[
          'Be the go-to voice on telco BD in MENA',
          'Build an audience of 10K relevant followers',
          'Launch a paid product / course',
          'Get speaking invitations',
          'Attract A-tier hires',
          'Build optionality outside my day job',
          'Document my playbook for myself'
        ]}
      />
    </div>
  );
}

// ============= UI PRIMITIVES =============
function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-stone-500 mb-2">{label}</label>
      {children}
      {hint && <div className="font-sans text-xs text-stone-500 mt-1.5">{hint}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      className={`w-full px-4 py-3 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-stone-900 transition-colors ${className}`}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, className = '' }) {
  return (
    <textarea
      rows={rows}
      className={`w-full px-4 py-3 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-stone-900 leading-relaxed transition-colors ${className}`}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function ChipInput({ label, items = [], setItems, suggestions = [], accent = 'stone' }) {
  const [val, setVal] = useState('');
  const accentColors = {
    stone: 'bg-stone-900 text-stone-50',
    red: 'bg-red-900 text-red-50',
    green: 'bg-emerald-900 text-emerald-50',
    amber: 'bg-amber-900 text-amber-50'
  };
  const add = (v) => { 
    if (v && !items.includes(v)) setItems([...items, v]); 
    setVal(''); 
  };
  return (
    <Field label={label}>
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 px-4 py-2 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-stone-900 text-sm"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(val); } }}
          placeholder="Type and press Enter"
        />
        <button onClick={() => add(val)} className="px-4 py-2 bg-stone-100 border border-stone-300 hover:bg-stone-200">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {suggestions.length > 0 && items.length < 4 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.filter(s => !items.includes(s)).slice(0, 8).map(s => (
            <button key={s} onClick={() => add(s)} className="font-sans text-xs px-2.5 py-1 bg-white border border-stone-300 hover:border-stone-500 text-stone-700">
              + {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div key={i} className={`${accentColors[accent]} px-3 py-1 text-sm font-sans flex items-center gap-2`}>
            {item}
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </Field>
  );
}

// Parse AI responses defensively. The model sometimes wraps JSON in markdown
// (```json ... ```), sometimes returns prose around it, sometimes returns
// truncated output. This helper handles all three and dispatches a toast on
// failure so the user knows what happened instead of seeing a frozen button.
function safeAIParse(text) {
  if (!text || typeof text !== 'string') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: 'AI returned an empty response. Try again.' } }));
    }
    throw new Error('AI returned empty');
  }
  const cleaned = text.replace(/```json|```/g, '').trim();
  // If the response contains prose around JSON, try to extract the first {...} or [...] block.
  let candidate = cleaned;
  if (!candidate.startsWith('{') && !candidate.startsWith('[')) {
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    const arrMatch = candidate.match(/\[[\s\S]*\]/);
    if (objMatch) candidate = objMatch[0];
    else if (arrMatch) candidate = arrMatch[0];
  }
  try {
    return JSON.parse(candidate);
  } catch (e) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: 'AI response was malformed. Try regenerating.' } }));
    }
    throw e;
  }
}

function Pill({ children, color = 'stone' }) {
  const colors = {
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    violet: 'bg-violet-50 text-violet-800 border-violet-200'
  };
  return <span className={`inline-block px-2 py-0.5 text-[11px] font-sans border ${colors[color]}`}>{children}</span>;
}

function StatCard({ label, value, hint, trend, icon: Icon }) {
  return (
    <div className="bg-white border border-stone-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-stone-500">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-stone-400" />}
      </div>
      <div className="font-display text-4xl font-light text-stone-900 leading-none mb-2">{value}</div>
      {hint && <div className="font-sans text-xs text-stone-500">{hint}</div>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 font-sans text-xs ${trend > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

function SectionHeader({ kicker, title, description, action }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        {kicker && <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-2">{kicker}</div>}
        <h1 className="font-display text-5xl font-light text-stone-900 leading-tight tracking-tight">{title}</h1>
        {description && <p className="text-base text-stone-600 mt-3 max-w-2xl leading-relaxed font-sans">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white border border-stone-200 border-dashed p-16 text-center">
      <Icon className="w-10 h-10 text-stone-400 mx-auto mb-4" />
      <div className="font-display text-2xl font-light text-stone-800 mb-2">{title}</div>
      <div className="font-sans text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-5">{description}</div>
      {action}
    </div>
  );
}

// ============= SIDEBAR =============
function Sidebar({ activeView, setActiveView, profile, collapsed, setCollapsed, stories, contentPieces, mobileNavOpen, setMobileNavOpen }) {
  const groups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', icon: Compass, label: 'Dashboard' },
        { id: 'health', icon: ShieldCheck, label: 'Brand Health' },
      ]
    },
    {
      label: 'Know Yourself',
      items: [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'dna', icon: Fingerprint, label: 'Brand DNA Lab' },
        { id: 'icp', icon: Crosshair, label: 'ICP Lab' },
      ]
    },
    {
      label: 'Capture',
      items: [
        { id: 'ideas', icon: Inbox, label: 'Idea Inbox' },
        { id: 'mining', icon: Camera, label: 'Photo Mining' },
        { id: 'swipe', icon: Files, label: 'Swipe File' },
        { id: 'proof', icon: BadgeCheck, label: 'Proof Vault' },
      ]
    },
    {
      label: 'Source Material',
      items: [
        { id: 'stories', icon: BookOpen, label: 'Story Vault', badge: stories.length },
        { id: 'hooks', icon: Library, label: 'Hook Library' },
        { id: 'coach', icon: Brain, label: 'AI Coach' },
      ]
    },
    {
      label: 'Production',
      items: [
        { id: 'content', icon: Sparkles, label: 'Content Engine', badge: contentPieces.length },
        { id: 'repurpose', icon: Shapes, label: 'Repurposing Studio' },
        { id: 'newsletter', icon: Mail, label: 'Newsletter Studio' },
        { id: 'batch', icon: Repeat, label: 'Batch Workflow' },
      ]
    },
    {
      label: 'Pipeline',
      items: [
        { id: 'conversations', icon: MessageCircle, label: 'DM & Conversations' },
        { id: 'outbound', icon: Megaphone, label: 'Outbound' },
      ]
    },
    {
      label: 'Conversion',
      items: [
        { id: 'funnels', icon: Target, label: 'Funnels' },
        { id: 'conversion', icon: Magnet, label: 'Conversion Lab' },
        { id: 'revenue', icon: DollarSign, label: 'Revenue Planner' },
      ]
    },
    {
      label: 'Distribution',
      items: [
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'aio', icon: Bot, label: 'AI Search (AIO)' },
        { id: 'public', icon: Globe, label: 'Public Profile' },
      ]
    }
  ];

  const today = new Date();
  const day = today.getDay();
  const dayLabel = { 1: 'Pain Monday', 2: 'Reflection', 3: 'News Wednesday', 4: 'Reflection', 5: 'Prize Friday', 6: 'Weekend', 0: 'Weekend' }[day];

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? 'lg:w-20' : 'lg:w-72'} w-72 bg-stone-950 text-stone-100 flex flex-col z-50 lg:z-40 transition-all duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div className={`${collapsed ? 'p-4' : 'p-6'} border-b border-stone-800`}>
        <div className="flex items-center justify-between mb-1">
          {!collapsed && <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase">Brand OS</div>}
          {/* Mobile close */}
          {setMobileNavOpen && (
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              className="lg:hidden p-1 hover:bg-stone-800 ml-auto mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Desktop collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 hover:bg-stone-800 hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="font-display text-2xl font-light leading-tight">
              {firstNameOf(profile) || 'You'}<span className="text-stone-500">.</span>
            </div>
            <div className="font-sans text-[11px] text-stone-400 mt-1.5 leading-relaxed">{profile.title}</div>
          </>
        )}
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        {groups.map((group, gi) => (
          <div key={gi} className="mb-5">
            {!collapsed && (
              <div className="px-6 font-mono text-[9px] tracking-[0.25em] uppercase text-stone-600 mb-2">{group.label}</div>
            )}
            <div className="space-y-0.5 px-3">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={collapsed ? item.label : ''}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all font-sans text-sm group ${
                    activeView === item.id
                      ? 'bg-stone-50 text-stone-900'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 ${activeView === item.id ? 'bg-stone-200 text-stone-700' : 'bg-stone-800 text-stone-400'}`}>{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-6 border-t border-stone-800 space-y-4">
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-500 mb-2">Today</div>
            <div className="text-sm leading-relaxed">
              {day === 1 && <><span className="text-red-400">●</span> Pain post day</>}
              {day === 3 && <><span className="text-amber-400">●</span> News post day</>}
              {day === 5 && <><span className="text-emerald-400">●</span> Prize post day</>}
              {(day === 2 || day === 4) && <><span className="text-stone-500">●</span> Reflection / batch</>}
              {(day === 0 || day === 6) && <><span className="text-stone-500">●</span> Story-mining day</>}
            </div>
          </div>
          <SidebarAiMeter />
          <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-stone-600 flex items-center gap-2">
            <kbd className="bg-stone-800 border border-stone-700 px-1.5 py-0.5 text-stone-300">⌘K</kbd>
            <span>Quick switcher</span>
          </div>
        </div>
      )}
    </aside>
  );
}

// Dark-themed AI usage meter for inside the sidebar.
function SidebarAiMeter() {
  const { hourCount, dayCount, loaded } = useAiUsage();
  if (!loaded) return null;
  const hourPct = Math.min(100, (hourCount / AI_HOUR_LIMIT) * 100);
  const dayPct = Math.min(100, (dayCount / AI_DAY_LIMIT) * 100);
  const tone = hourPct >= 90 || dayPct >= 90 ? 'bg-red-500' : hourPct >= 70 || dayPct >= 70 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-500 mb-2">AI usage</div>
      <div className="space-y-1.5">
        <div>
          <div className="flex justify-between font-mono text-[10px] text-stone-400 mb-0.5">
            <span>Hour</span><span>{hourCount}/{AI_HOUR_LIMIT}</span>
          </div>
          <div className="h-1 bg-stone-800"><div className={`h-full transition-all ${tone}`} style={{ width: `${hourPct}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[10px] text-stone-400 mb-0.5">
            <span>Day</span><span>{dayCount}/{AI_DAY_LIMIT}</span>
          </div>
          <div className="h-1 bg-stone-800"><div className={`h-full transition-all ${tone}`} style={{ width: `${dayPct}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

// ============= DASHBOARD =============
function Dashboard({ profile, stories, contentPieces, funnels, calendar, setActiveView, analytics, icps, batches, dna = {}, photoMining = {}, optins = [], revenuePlan = {}, aio = { topics: [], queries: [] }, ideas = [], briefing = {}, saveBriefing = () => {}, conversations = [], outbound = [], swipeFile = [], newsletters = [], proof = [] }) {
  const completion = useMemo(() => {
    const profileScore = profile?.transformation && profile.audiences?.length && profile.pains?.length ? 100 : 60;
    const storiesScore = Math.min(100, (stories.length / 10) * 100);
    const icpScore = Math.min(100, (icps.length / 2) * 100);
    const contentScore = Math.min(100, (contentPieces.length / 12) * 100);
    const funnelScore = Math.min(100, (funnels.length / 1) * 100);
    const calendarKeys = Object.keys(calendar);
    const upcomingScheduled = calendarKeys.filter(k => new Date(k) >= new Date()).length;
    const calendarScore = Math.min(100, (upcomingScheduled / 4) * 100);
    return { profileScore, storiesScore, icpScore, contentScore, funnelScore, calendarScore };
  }, [profile, stories, icps, contentPieces, funnels, calendar]);

  const overall = Math.round((completion.profileScore + completion.storiesScore + completion.icpScore + completion.contentScore + completion.funnelScore + completion.calendarScore) / 6);

  const today = new Date();
  const day = today.getDay();
  const dayMap = { 1: 'pain', 3: 'news', 5: 'prize' };
  const todayType = dayMap[day];
  const todayKey = today.toISOString().split('T')[0];
  const todayScheduled = calendar[todayKey];
  const todayPiece = todayScheduled ? contentPieces.find(p => p.id === todayScheduled) : null;

  const totalImpressions = Object.values(analytics).reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalEngagements = Object.values(analytics).reduce((sum, a) => sum + (a.likes || 0) + (a.comments || 0), 0);
  const totalDMs = Object.values(analytics).reduce((sum, a) => sum + (a.dms || 0), 0);
  const postedCount = Object.values(analytics).filter(a => a.posted).length;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const last4Weeks = useMemo(() => {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const data = weekDays.map((_, di) => {
        const d = new Date();
        d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1) - w * 7 + di);
        const key = d.toISOString().split('T')[0];
        return { 
          day: weekDays[di], 
          posted: !!analytics[key]?.posted,
          scheduled: !!calendar[key]
        };
      });
      weeks.push(data);
    }
    return weeks;
  }, [analytics, calendar]);

  const stage = overall < 30 ? 'foundation' : overall < 60 ? 'building' : overall < 85 ? 'producing' : 'compounding';
  const stageMessages = {
    foundation: { title: 'Laying the foundation', sub: 'Profile + stories + ICPs come first. Don\'t skip ahead to content yet.' },
    building: { title: 'Brand is taking shape', sub: 'You have raw material. Time to start producing content consistently.' },
    producing: { title: 'In production rhythm', sub: 'Keep the cadence. Now think about funnels and converting attention.' },
    compounding: { title: 'Compounding nicely', sub: 'Optimize. Double down on what works. Build paid offerings.' }
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      {/* Hero */}
      <div className="mb-10 animate-fadeIn">
        <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-3">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {profile.location || 'Studio'}
        </div>
        <h1 className="font-display text-7xl font-light text-stone-900 leading-[1.02] tracking-tight">
          Hello, {firstNameOf(profile)}<span className="text-stone-400">.</span>
        </h1>
        <p className="text-xl text-stone-600 mt-4 max-w-3xl leading-relaxed font-sans">
          {stageMessages[stage].sub}
        </p>
      </div>

      {/* First-time user welcome state — shows when there's nothing to display.
          Replaces a graveyard of zeros with a single, clear next action. */}
      {stories.length === 0 && contentPieces.length === 0 ? (
        <div className="bg-white border border-stone-200 p-6 md:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-700 mb-2">Welcome</div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-stone-900 leading-tight mb-3">
                Capture your first story.<br /><span className="text-stone-500">Everything else flows from this.</span>
              </h2>
              <p className="font-sans text-base text-stone-600 leading-relaxed mb-5">
                Tap the mic, talk for 30 seconds about something that happened this week — in any language. AI translates, structures it, and turns it into ready-to-publish posts.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveView('stories')}
                  className="px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 inline-flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" /> Speak my first story
                </button>
                <button
                  onClick={() => setActiveView('coach')}
                  className="px-6 py-3 border border-stone-300 hover:border-stone-900 font-sans text-sm text-stone-800 inline-flex items-center gap-2"
                >
                  <Brain className="w-4 h-4" /> Or chat with the AI Coach
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-stone-50 border border-stone-200 p-5">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Suggested order</div>
              <ol className="space-y-2">
                {[
                  { n: 1, t: 'Capture 3 stories', v: 'stories' },
                  { n: 2, t: 'Generate your first post', v: 'content' },
                  { n: 3, t: 'Set up your public profile', v: 'public' },
                  { n: 4, t: 'Log your first inbound DM', v: 'conversations' }
                ].map((s) => (
                  <li key={s.n} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-stone-400 mt-0.5">{String(s.n).padStart(2, '0')}</span>
                    <button onClick={() => setActiveView(s.v)} className="text-left font-sans text-sm text-stone-700 hover:text-stone-900 hover:underline">
                      {s.t}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        /* Returning-user stats row */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatCard label="Brand Build" value={`${overall}%`} hint={stageMessages[stage].title} icon={Activity} />
          <StatCard label="Stories" value={stories.length} hint={`Goal: 10+`} icon={BookOpen} />
          <StatCard label="Posts Created" value={contentPieces.length} hint={`${postedCount} published`} icon={Sparkles} />
          <StatCard label="Total Reach" value={totalImpressions > 1000 ? `${Math.round(totalImpressions/1000)}k` : totalImpressions} hint={`${totalEngagements} engagements`} icon={Eye} />
          <StatCard label="DMs Received" value={totalDMs} hint="Inbound conversations" icon={MessageSquare} />
        </div>
      )}

      {/* Hero card + identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {/* Today's action - larger */}
        <div className="col-span-2 bg-stone-950 text-stone-50 p-10 relative overflow-hidden grain">
          <div className="absolute top-0 right-0 w-96 h-96 bg-stone-900 rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-400">Today's Move</div>
              {todayType && (
                <Pill color={todayType === 'pain' ? 'red' : todayType === 'prize' ? 'green' : 'amber'}>
                  {todayType.toUpperCase()} DAY
                </Pill>
              )}
            </div>
            
            {todayPiece ? (
              <>
                <h2 className="font-display text-4xl font-light mb-4 leading-tight">Ready to ship.</h2>
                <p className="text-stone-300 mb-2 font-sans text-sm">You have a post scheduled for today:</p>
                <div className="bg-stone-900 border border-stone-800 p-5 mb-6">
                  <div className="text-base font-medium leading-snug mb-2">{todayPiece.hook}</div>
                  <div className="font-sans text-sm text-stone-400 line-clamp-2">{todayPiece.body}</div>
                </div>
                <button
                  onClick={() => setActiveView('calendar')}
                  className="bg-stone-50 text-stone-900 px-6 py-3 font-sans text-sm hover:bg-stone-200 inline-flex items-center gap-2 group"
                >
                  Open & post <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            ) : todayType ? (
              <>
                <h2 className="font-display text-5xl font-light mb-4 leading-[1.05]">
                  {todayType === 'pain' && 'Drop a Pain hook'}
                  {todayType === 'news' && 'Tie news to your work'}
                  {todayType === 'prize' && 'Show a Prize win'}
                </h2>
                <p className="text-stone-300 mb-6 leading-relaxed text-base font-sans max-w-xl">
                  {todayType === 'pain' && 'Open with a problem your audience feels in their bones. Then teach the lesson from one of your stories.'}
                  {todayType === 'news' && 'What\'s in the headlines this week? Connect it to one of your processes — your contrarian take.'}
                  {todayType === 'prize' && 'What outcome do they want? Show one client/partner who got it — with the lesson.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveView('content')}
                    className="bg-stone-50 text-stone-900 px-6 py-3 font-sans text-sm hover:bg-stone-200 inline-flex items-center gap-2 group"
                  >
                    Generate now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setActiveView('hooks')}
                    className="bg-stone-900 border border-stone-700 text-stone-100 px-6 py-3 font-sans text-sm hover:bg-stone-800"
                  >
                    Browse hooks
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-5xl font-light mb-4 leading-tight">Reflection day</h2>
                <p className="text-stone-300 mb-6 leading-relaxed text-base font-sans max-w-xl">
                  Pause-Reflect-Document. Open your photos, scroll the last 30 days, find one story with a lesson worth sharing.
                </p>
                <button
                  onClick={() => setActiveView('stories')}
                  className="bg-stone-50 text-stone-900 px-6 py-3 font-sans text-sm hover:bg-stone-200 inline-flex items-center gap-2 group"
                >
                  Add a story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Identity card */}
        <div className="bg-white border border-stone-200 p-8">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-5">Brand Identity</div>
          <div className="space-y-5">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">Voice archetype</div>
              <div className="font-display text-xl font-medium text-stone-900 capitalize">{profile.voice || '—'}</div>
              {profile.tone && profile.tone.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.tone.slice(0, 4).map(t => <Pill key={t}>{t}</Pill>)}
                </div>
              )}
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">Speaking to</div>
              <div className="space-y-1">
                {(profile.audiences || []).slice(0, 3).map((a, i) => (
                  <div key={i} className="text-sm text-stone-700 font-sans">→ {a}</div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-200">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">North Star</div>
              <div className="font-display italic text-base text-stone-700 leading-snug">"{profile.primaryGoal || profile.transformation || 'Define this'}"</div>
            </div>
          </div>
        </div>
      </div>

      {/* Build Progress */}
      <div className="bg-white border border-stone-200 p-8 mb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-1">Build Progress</div>
            <div className="font-display text-3xl font-light text-stone-900">Six dimensions of your brand</div>
          </div>
          <div className="font-display text-7xl font-light text-stone-900 leading-none">
            {overall}<span className="text-stone-300 text-5xl">%</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { k: 'profileScore', label: 'Profile', view: 'profile', desc: 'Identity defined' },
            { k: 'icpScore', label: 'ICPs', view: 'icp', desc: `${icps.length} researched` },
            { k: 'storiesScore', label: 'Stories', view: 'stories', desc: `${stories.length} captured` },
            { k: 'contentScore', label: 'Content', view: 'content', desc: `${contentPieces.length} pieces` },
            { k: 'funnelScore', label: 'Funnels', view: 'funnels', desc: `${funnels.length} mapped` },
            { k: 'calendarScore', label: 'Calendar', view: 'calendar', desc: `${Object.keys(calendar).length} scheduled` }
          ].map(item => (
            <button key={item.k} onClick={() => setActiveView(item.view)} className="text-left group">
              <div className="flex justify-between font-sans text-xs text-stone-600 mb-2">
                <span>{item.label}</span>
                <span className="font-mono">{Math.round(completion[item.k])}%</span>
              </div>
              <div className="h-1 bg-stone-200 mb-2 group-hover:bg-stone-300 transition-colors">
                <div className="h-full bg-stone-900 transition-all" style={{ width: `${completion[item.k]}%` }} />
              </div>
              <div className="font-sans text-[11px] text-stone-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Posting consistency calendar */}
      <div className="bg-white border border-stone-200 p-8 mb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-1">Last 4 Weeks</div>
            <div className="font-display text-3xl font-light text-stone-900">Posting consistency</div>
          </div>
          <div className="flex gap-3 font-mono text-[10px] text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-900 inline-block"></span> Posted</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-300 inline-block"></span> Scheduled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-100 inline-block"></span> Empty</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(d => <div key={d} className="font-mono text-[10px] uppercase tracking-wider text-stone-500 text-center">{d}</div>)}
          </div>
          {last4Weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => (
                <div 
                  key={di} 
                  className={`aspect-square ${day.posted ? 'bg-stone-900' : day.scheduled ? 'bg-stone-300' : 'bg-stone-100'}`}
                  title={`${day.day} - ${day.posted ? 'Posted' : day.scheduled ? 'Scheduled' : 'Empty'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Briefing card */}
      <DailyBriefingCard
        profile={profile} stories={stories} ideas={ideas}
        briefing={briefing} saveBriefing={saveBriefing}
        setActiveView={setActiveView}
      />

      {/* Brand Mastery Map — six-system overview */}
      <div className="bg-white border border-stone-200 p-8 mb-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-1">Brand Mastery Map</div>
            <div className="font-display text-3xl font-light text-stone-900">Six systems · One brand</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'dna', icon: Fingerprint, label: 'Brand DNA', value: (() => { let s=0; if(dna.origin?.moments?.length>=3)s+=17; if(dna.values?.core?.length>=3)s+=17; if(dna.archetype?.primary)s+=17; if(dna.voice?.fingerprint)s+=17; if(dna.timeline?.events?.length>=5)s+=16; if(dna.manifesto?.manifesto)s+=16; return s; })(), unit: '%', sub: 'Decoded' },
            { id: 'mining', icon: Camera, label: 'Photo Mining', value: Object.keys(photoMining||{}).length, unit: '/60', sub: 'Months mined' },
            { id: 'conversion', icon: Magnet, label: 'Conversion', value: optins.length, unit: '', sub: 'Opt-ins built' },
            { id: 'revenue', icon: DollarSign, label: 'Revenue Plan', value: revenuePlan.annualGoal ? `$${(revenuePlan.annualGoal/1000000).toFixed(1)}M` : '—', unit: '', sub: 'Annual target' },
            { id: 'aio', icon: Bot, label: 'AIO', value: (aio.topics||[]).length, unit: '', sub: 'Topic clusters' },
            { id: 'funnels', icon: Target, label: 'Funnels', value: funnels.length, unit: '', sub: 'Mapped' }
          ].map(c => (
            <button key={c.id} onClick={() => setActiveView(c.id)} className="bg-stone-50 border border-stone-200 p-4 text-left hover:border-stone-900 group transition-all">
              <c.icon className="w-4 h-4 text-stone-700 mb-2" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">{c.label}</div>
              <div className="font-display text-2xl font-light text-stone-900 leading-none">{c.value}<span className="text-stone-400 text-base">{c.unit}</span></div>
              <div className="font-sans text-[10px] text-stone-500 mt-1">{c.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Three step framework */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">The Three-Step Framework</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: '01', title: 'Discover Stories', desc: 'Pause-Reflect-Document. Mine your last 60 months for stories with lessons.', cta: 'Story Vault', view: 'stories', progress: completion.storiesScore, supporting: 'AI Coach · Hook Library' },
            { num: '02', title: 'Test & Get Traction', desc: 'Pain / Prize / News short-form. Long-form processes. DM call-to-action.', cta: 'Content Engine', view: 'content', progress: completion.contentScore, supporting: 'Batch Workflow · Calendar' },
            { num: '03', title: 'Scale to 7-8 Figures', desc: 'Build the funnel: short → long → opt-in → meeting. Daily rhythm.', cta: 'Funnel Builder', view: 'funnels', progress: completion.funnelScore, supporting: 'Analytics · Performance' }
          ].map(s => (
            <button key={s.num} onClick={() => setActiveView(s.view)} className="bg-white border border-stone-200 p-7 text-left hover:border-stone-900 transition-all group">
              <div className="flex justify-between items-start mb-5">
                <div className="font-mono text-xs text-stone-400">{s.num}</div>
                <div className="font-mono text-[10px] text-stone-400 uppercase tracking-wider">{Math.round(s.progress)}%</div>
              </div>
              <div className="font-display text-2xl font-light text-stone-900 mb-2 leading-tight">{s.title}</div>
              <div className="font-sans text-sm text-stone-600 leading-relaxed mb-4">{s.desc}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-3">{s.supporting}</div>
              <div className="font-sans text-xs text-stone-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                {s.cta} <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500">Latest Stories</div>
            <button onClick={() => setActiveView('stories')} className="font-sans text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {stories.length === 0 ? (
            <div className="text-sm text-stone-500 font-sans py-8 text-center">No stories yet — start capturing</div>
          ) : (
            <div className="space-y-3">
              {stories.slice(0, 4).map(s => (
                <div key={s.id} className="border-l-2 border-stone-300 pl-4 py-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">{s.month} · {s.category}</div>
                  <div className="text-sm text-stone-900 leading-snug mb-1">{s.title}</div>
                  <div className="font-sans text-xs text-stone-500 italic line-clamp-1">→ {s.lesson}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-stone-200 p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500">Recent Content</div>
            <button onClick={() => setActiveView('content')} className="font-sans text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {contentPieces.length === 0 ? (
            <div className="text-sm text-stone-500 font-sans py-8 text-center">No content yet — generate your first piece</div>
          ) : (
            <div className="space-y-3">
              {contentPieces.slice(0, 4).map(p => (
                <div key={p.id} className="border-l-2 border-stone-300 pl-4 py-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">{p.type} · {p.platform || 'multi'}</div>
                  <div className="text-sm text-stone-900 leading-snug line-clamp-2">{p.hook}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= STORY VAULT =============
function StoryVault({ stories, saveStories, profile }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  // Detect Web Speech API support upfront so we can show users the right message
  // BEFORE they click and hit a dead button.
  const voiceSupported = typeof window !== 'undefined' && (
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );

  const months = useMemo(() => {
    const m = [];
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      m.push(d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    return m;
  }, []);

  const filtered = useMemo(() => {
    let list = stories;
    if (filter !== 'all') list = list.filter(s => s.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        s.title?.toLowerCase().includes(q) || 
        s.lesson?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'recent') list = [...list].sort((a, b) => (b.id || 0) - (a.id || 0));
    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [stories, filter, search, sortBy]);

  const stats = {
    total: stories.length,
    pain: stories.filter(s => s.category === 'pain').length,
    prize: stories.filter(s => s.category === 'prize').length,
    news: stories.filter(s => s.category === 'news').length,
    used: stories.filter(s => s.timesUsed > 0).length,
    avgRating: stories.length ? (stories.reduce((sum, s) => sum + (s.rating || 0), 0) / stories.length).toFixed(1) : 0
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Step One · Source Material"
        title="Story Vault"
        description="Pause-Reflect-Document. Scroll your photos month-by-month and capture stories with the lesson each one taught you. Relatable beats impressive."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowVoice(true)}
              disabled={!voiceSupported}
              title={voiceSupported ? 'Speak a story in any language' : 'Voice capture requires Chrome, Edge, or Safari — switch browser or use New Story instead'}
              className="px-5 py-2.5 bg-amber-500 text-stone-950 font-sans text-sm hover:bg-amber-400 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mic className="w-4 h-4" /> Speak a story{!voiceSupported ? ' (Chrome/Safari)' : ''}
            </button>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New story
            </button>
          </div>
        }
      />

      {showVoice && (
        <VoiceStoryCapture
          profile={profile}
          months={months}
          onComplete={(structured) => {
            setShowVoice(false);
            setEditing({ ...structured, framework: 'general', rating: 0, timesUsed: 0 });
            setShowForm(true);
          }}
          onCancel={() => setShowVoice(false)}
        />
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Stories" value={stats.total} hint="Goal: 10+" icon={BookOpen} />
        <StatCard label="Pain" value={stats.pain} hint="Monday hooks" icon={AlertCircle} />
        <StatCard label="Prize" value={stats.prize} hint="Friday hooks" icon={Trophy} />
        <StatCard label="News-tied" value={stats.news} hint="Wednesday hooks" icon={Newspaper} />
        <StatCard label="Used" value={stats.used} hint="In content" icon={Activity} />
        <StatCard label="Avg Rating" value={stats.avgRating} hint="Your assessment" icon={Star} />
      </div>

      {/* Filters & search */}
      <div className="bg-white border border-stone-200 p-5 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
          <Search className="w-4 h-4 text-stone-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search stories, lessons, tags..."
            className="bg-transparent outline-none flex-1 font-sans text-sm"
          />
        </div>
        <div className="flex gap-1">
          {[
            { v: 'all', label: 'All' },
            { v: 'pain', label: 'Pain', color: 'red' },
            { v: 'prize', label: 'Prize', color: 'green' },
            { v: 'news', label: 'News', color: 'amber' }
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-3 py-2 font-sans text-xs border ${filter === f.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 bg-white hover:border-stone-500'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 border border-stone-300 bg-white font-sans text-xs">
          <option value="recent">Most recent</option>
          <option value="rating">Highest rated</option>
        </select>
        <div className="flex border border-stone-300">
          <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-stone-900 text-stone-50' : 'bg-white'}`}>
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-stone-900 text-stone-50' : 'bg-white'}`}>
            <Layout className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/*  prompts */}
      {stories.length < 5 && (
        <div className="bg-amber-50 border border-amber-200 p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-2">Story Prompts</div>
          <div className="font-display text-xl font-light text-stone-900 mb-4">Try answering one of these to unlock a story</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "When did you last get a remarkable result and how did you do it?",
              "What's a deal/project that almost died but came back?",
              "When did you have to deliver bad news? What did you learn?",
              "What's something you do without thinking that took 5+ years to learn?",
              "What's the most embarrassing professional moment you've recovered from?",
              "When did a customer/partner teach you something you'd never forget?",
              "What's a contrarian belief about your industry you actually live by?",
              "When did following the rulebook fail you?"
            ].map((p, i) => (
              <button 
                key={i}
                onClick={() => { setEditing({ promptUsed: p }); setShowForm(true); }}
                className="text-left p-3 bg-white border border-amber-200 hover:border-amber-400 font-sans text-sm text-stone-700 leading-snug"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <StoryForm
          story={editing}
          months={months}
          profile={profile}
          onSave={(story) => {
            if (story.id) saveStories(stories.map(s => s.id === story.id ? story : s));
            else saveStories([{ ...story, id: Date.now(), createdAt: new Date().toISOString() }, ...stories]);
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {filtered.length === 0 && !showForm && (
        <EmptyState
          icon={BookOpen}
          title={search || filter !== 'all' ? 'No matches' : 'No stories yet'}
          description={search || filter !== 'all' ? 'Try changing the filters or search.' : 'Open your phone, set photos to month-by-month view, scroll to last month. What happened that contained a lesson?'}
          action={!search && filter === 'all' && (
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Capture your first story
            </button>
          )}
        />
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={() => { setEditing(story); setShowForm(true); }}
              onDelete={async () => { if (await window.brandConfirm('Delete this story permanently? This cannot be undone.')) saveStories(stories.filter(s => s.id !== story.id)); }}
              onUpdate={(updated) => saveStories(stories.map(s => s.id === updated.id ? updated : s))}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 divide-y divide-stone-200">
          {filtered.map(story => (
            <StoryRow
              key={story.id}
              story={story}
              onEdit={() => { setEditing(story); setShowForm(true); }}
              onDelete={async () => { if (await window.brandConfirm('Delete this story permanently? This cannot be undone.')) saveStories(stories.filter(s => s.id !== story.id)); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StoryCard({ story, onEdit, onDelete, onUpdate }) {
  const colors = {
    pain: 'border-l-red-700',
    prize: 'border-l-emerald-700',
    news: 'border-l-amber-700'
  };
  return (
    <div className={`bg-white border border-stone-200 border-l-4 ${colors[story.category] || 'border-l-stone-700'} p-6 group hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Pill color={story.category === 'pain' ? 'red' : story.category === 'prize' ? 'green' : 'amber'}>
            {story.category}
          </Pill>
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{story.month}</span>
          {story.timesUsed > 0 && <Pill>used {story.timesUsed}x</Pill>}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button aria-label="Edit" onClick={onEdit} className="p-1.5 hover:bg-stone-100"><Edit3 className="w-3.5 h-3.5 text-stone-600" /></button>
          <button aria-label="Delete" onClick={onDelete} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
        </div>
      </div>
      <div className="font-display text-xl text-stone-900 leading-snug mb-3 font-medium">{story.title}</div>
      
      {story.emotion && (
        <div className="font-sans text-xs text-stone-500 italic mb-3">felt: {story.emotion}</div>
      )}

      {story.context && (
        <div className="text-sm text-stone-600 leading-relaxed mb-3 font-sans line-clamp-2">{story.context}</div>
      )}
      
      <div className="border-t border-stone-200 pt-3 mb-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">Lesson</div>
        <div className="text-sm text-stone-700 leading-relaxed">{story.lesson}</div>
      </div>

      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {story.tags.map(t => <Pill key={t}>#{t}</Pill>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onUpdate({ ...story, rating: n })}
              className={`w-3.5 h-3.5 ${n <= (story.rating || 0) ? 'text-amber-500' : 'text-stone-300'}`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-stone-400">{story.framework || 'general'}</span>
      </div>
    </div>
  );
}

function StoryRow({ story, onEdit, onDelete }) {
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-stone-50">
      <Pill color={story.category === 'pain' ? 'red' : story.category === 'prize' ? 'green' : 'amber'}>{story.category}</Pill>
      <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 w-20">{story.month}</div>
      <div className="flex-1">
        <div className="text-sm text-stone-900 font-medium leading-tight">{story.title}</div>
        <div className="font-sans text-xs text-stone-500 mt-0.5 line-clamp-1">→ {story.lesson}</div>
      </div>
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 ${n <= (story.rating || 0) ? 'text-amber-500 fill-current' : 'text-stone-200 fill-current'}`} />)}
      </div>
      <div className="flex gap-1">
        <button aria-label="Edit" onClick={onEdit} className="p-1.5 hover:bg-stone-100"><Edit3 className="w-3.5 h-3.5 text-stone-600" /></button>
        <button aria-label="Delete" onClick={onDelete} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
      </div>
    </div>
  );
}

function StoryForm({ story, months, profile, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [s, setS] = useState(story || { 
    title: '', lesson: '', emotion: '', month: months[0], category: 'pain',
    context: '', conflict: '', resolution: '', tags: [], framework: 'general',
    rating: 0, timesUsed: 0
  });
  const [activeFramework, setActiveFramework] = useState(s.framework || 'general');
  const [generating, setGenerating] = useState(false);

  const frameworks = {
    general: { label: 'Free-form', desc: 'Just title + lesson' },
    StoryArc: { label: 'Story Arc', desc: 'Context → Conflict → Resolution → Lesson' },
    BeforeAfter: { label: 'Before/After', desc: 'State before → action → state after' },
    Failure: { label: 'Failure → Insight', desc: 'What went wrong → what I learned' },
    Contrarian: { label: 'Contrarian', desc: 'Common belief → my experience → my take' }
  };

  const refineWithAI = async () => {
    if (!s.title || !s.lesson) return;
    setGenerating(true);
    const prompt = `You're a personal branding story coach trained on the framework — relatable beats impressive.

This is ${profile.name}'s draft story:
Title: ${s.title}
Context: ${s.context || 'not provided'}
Lesson: ${s.lesson}
Emotion: ${s.emotion || 'not specified'}
Category: ${s.category}

Their voice: ${profile.voice}, ${profile.tone?.join(', ')}
Audience: ${profile.audiences?.join(', ')}

Help refine this story. Return ONLY valid JSON:
{
  "refinedTitle": "A sharper, more specific title (one line)",
  "context": "1-2 sentence context that sets up the story",
  "conflict": "The central tension/challenge (1-2 sentences)",
  "resolution": "What happened (1-2 sentences)",
  "refinedLesson": "The takeaway in their voice — relatable not impressive",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "rating": 1-5
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setS({ ...s, 
        title: parsed.refinedTitle, 
        context: parsed.context, 
        conflict: parsed.conflict, 
        resolution: parsed.resolution, 
        lesson: parsed.refinedLesson,
        tags: parsed.suggestedTags,
        rating: parsed.rating
      });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <div className="bg-stone-950 text-stone-50 p-8 mb-6 animate-slideIn">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">{s.id ? 'Editing story' : 'New story'}</div>
          <div className="font-display text-3xl font-light">{s.id ? 'Refine' : 'Capture'} a story</div>
        </div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>

      {/* Framework selector */}
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Story framework</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.entries(frameworks).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { setActiveFramework(k); setS({ ...s, framework: k }); }}
              className={`p-3 text-left border transition-all ${activeFramework === k ? 'border-stone-50 bg-stone-50 text-stone-900' : 'border-stone-700 hover:border-stone-500'}`}
            >
              <div className="font-medium text-xs">{v.label}</div>
              <div className={`font-sans text-[10px] mt-0.5 ${activeFramework === k ? 'text-stone-600' : 'text-stone-500'}`}>{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {s.promptUsed && (
        <div className="mb-4 p-3 bg-stone-900 border border-stone-800">
          <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Prompt</div>
          <div className="font-display italic text-stone-200 text-sm">"{s.promptUsed}"</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Month</label>
            <select value={s.month} onChange={e => setS({ ...s, month: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Category</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { v: 'pain', label: 'Pain', desc: 'A struggle' },
                { v: 'prize', label: 'Prize', desc: 'A win' },
                { v: 'news', label: 'News', desc: 'Tied to event' }
              ].map(c => (
                <button key={c.v} onClick={() => setS({ ...s, category: c.v })} className={`p-3 border text-left ${s.category === c.v ? 'border-stone-50 bg-stone-50 text-stone-900' : 'border-stone-700 hover:border-stone-500'}`}>
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="font-sans text-[10px] opacity-70 mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Emotion (what did it feel like?)</label>
            <input value={s.emotion || ''} onChange={e => setS({ ...s, emotion: e.target.value })} placeholder="e.g. exhausted, vindicated, terrified-then-relieved" className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Tags (comma separated)</label>
            <input 
              value={(s.tags || []).join(', ')} 
              onChange={e => setS({ ...s, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} 
              placeholder="negotiation, jazz, rfi"
              className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" 
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Your rating (how strong is this story?)</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setS({ ...s, rating: n })} className={`p-1 ${n <= (s.rating || 0) ? 'text-amber-400' : 'text-stone-700'}`}>
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Story title (one line)</label>
            <input value={s.title} onChange={e => setS({ ...s, title: e.target.value })} placeholder="e.g. The Jazz RFI we won by reframing the question" className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </div>
          
          {(activeFramework === 'StoryArc' || activeFramework === 'BeforeAfter' || activeFramework === 'Failure') && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Context — what was the setup?</label>
              <textarea rows={2} value={s.context || ''} onChange={e => setS({ ...s, context: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
            </div>
          )}
          
          {activeFramework === 'StoryArc' && (
            <>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Conflict — what was at stake?</label>
                <textarea rows={2} value={s.conflict || ''} onChange={e => setS({ ...s, conflict: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Resolution — what happened?</label>
                <textarea rows={2} value={s.resolution || ''} onChange={e => setS({ ...s, resolution: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
              </div>
            </>
          )}
          
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">The lesson (what would others gain?)</label>
            <textarea rows={5} value={s.lesson} onChange={e => setS({ ...s, lesson: e.target.value })} placeholder="Make it relatable, not impressive. Specific enough to be useful." className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm leading-relaxed" />
          </div>

          <button 
            onClick={refineWithAI}
            disabled={!s.title || !s.lesson || generating}
            className="w-full px-4 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 font-sans text-xs disabled:opacity-30 inline-flex items-center justify-center gap-2"
          >
            {generating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Refining...</> : <><Wand2 className="w-3.5 h-3.5" /> Refine with AI Coach</>}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400 hover:text-stone-50">Cancel</button>
        <button onClick={() => onSave(s)} disabled={!s.title || !s.lesson} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm hover:bg-stone-200 disabled:opacity-30 inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> Save story
        </button>
      </div>
    </div>
  );
}

// ============= ICP LAB =============
function ICPLab({ icps, saveIcps, profile }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateICP = async (seed) => {
    setGenerating(true);
    const prompt = `You're an ICP (Ideal Customer Profile) research expert. Build a deep ICP for ${profile.name}'s personal brand.

Their context:
- Title: ${profile.title}
- Industries: ${profile.industries?.join(', ')}
- Audience hint: ${seed}
- Their transformation: ${profile.transformation}
- Pains they've identified: ${profile.pains?.join('; ')}
- Prizes they've identified: ${profile.prizes?.join('; ')}

Build a deep, specific ICP. Return ONLY valid JSON:
{
  "name": "Short label like 'BD Lead Burning Out at MENA Telco'",
  "title": "Specific job title",
  "demographics": "Age, location, seniority, company size",
  "psychographics": "What they believe, fear, aspire to",
  "dailyReality": "What their typical day looks like",
  "topPains": ["pain 1 (visceral)", "pain 2", "pain 3", "pain 4"],
  "topGoals": ["goal 1", "goal 2", "goal 3", "goal 4"],
  "objections": ["why they wouldn't engage", "objection 2", "objection 3"],
  "wateringHoles": ["where they hang out online", "newsletter they read", "events"],
  "vocabulary": ["words/phrases they actually use"],
  "vocabularyToAvoid": ["jargon they hate"],
  "buyingTriggers": ["what makes them open to a new approach"],
  "successMetrics": "What they measure their work by"
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      saveIcps([{ ...parsed, id: Date.now(), createdAt: new Date().toISOString() }, ...icps]);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Foundation · Audience Research"
        title="ICP Lab"
        description="Ideal Customer Profiles — the people you write for. Build 1-3 deep ICPs and your content sharpens by 10x. Generic content speaks to no one; specific content speaks to everyone like them."
        action={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Build ICP manually
          </button>
        }
      />

      {/* AI Generation panel */}
      <div className="bg-gradient-to-br from-stone-950 to-stone-900 text-stone-50 p-8 mb-8 relative overflow-hidden grain">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900 opacity-20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">AI ICP Builder</div>
          <div className="font-display text-3xl font-light mb-4">Generate a deep ICP from a seed</div>
          <p className="text-stone-300 mb-5 max-w-2xl text-sm font-sans leading-relaxed">
            Describe one of your audiences in a sentence. The AI will research and build a complete profile — pains, goals, vocabulary, watering holes, buying triggers.
          </p>
          <ICPSeedGenerator onGenerate={generateICP} generating={generating} suggestions={profile.audiences} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="ICPs Built" value={icps.length} hint="Goal: 1-3 deep" icon={Crosshair} />
        <StatCard label="Total Pains" value={icps.reduce((sum, i) => sum + (i.topPains?.length || 0), 0)} hint="Hook material" icon={AlertCircle} />
        <StatCard label="Vocabulary Words" value={icps.reduce((sum, i) => sum + (i.vocabulary?.length || 0), 0)} hint="Their language" icon={Quote} />
        <StatCard label="Watering Holes" value={icps.reduce((sum, i) => sum + (i.wateringHoles?.length || 0), 0)} hint="Where to find them" icon={MapPin} />
      </div>

      {showForm && (
        <ICPForm 
          icp={editing} 
          onSave={(icp) => {
            if (icp.id) saveIcps(icps.map(i => i.id === icp.id ? icp : i));
            else saveIcps([{ ...icp, id: Date.now() }, ...icps]);
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {icps.length === 0 && !showForm && (
        <EmptyState
          icon={Crosshair}
          title="No ICPs yet"
          description="Build your first ICP using the AI generator above, or click 'Build manually' if you want full control."
        />
      )}

      <div className="grid grid-cols-1 gap-4">
        {icps.map(icp => (
          <ICPCard 
            key={icp.id} 
            icp={icp} 
            onEdit={() => { setEditing(icp); setShowForm(true); }}
            onDelete={async () => { if (await window.brandConfirm('Delete this ICP? This cannot be undone.')) saveIcps(icps.filter(i => i.id !== icp.id)); }}
          />
        ))}
      </div>
    </div>
  );
}

function ICPSeedGenerator({ onGenerate, generating, suggestions }) {
  const [seed, setSeed] = useState('');
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={seed}
          onChange={e => setSeed(e.target.value)}
          placeholder="e.g. Tier-1 telco BD leaders in MENA stuck in legal limbo"
          className="flex-1 bg-stone-900 border border-stone-700 px-4 py-3 font-sans text-sm text-stone-50 placeholder:text-stone-500 outline-none"
          onKeyDown={e => { if (e.key === 'Enter') onGenerate(seed); }}
        />
        <button
          onClick={() => onGenerate(seed)}
          disabled={!seed || generating}
          className="px-5 bg-stone-50 text-stone-900 font-sans text-sm hover:bg-stone-200 disabled:opacity-30 inline-flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Build
        </button>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.slice(0, 5).map(s => (
            <button key={s} onClick={() => setSeed(s)} className="font-sans text-xs px-3 py-1 border border-stone-700 hover:border-stone-500 text-stone-300">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ICPCard({ icp, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-stone-200 overflow-hidden group">
      <div className="p-7">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1.5">Ideal Customer Profile</div>
            <div className="font-display text-3xl font-light text-stone-900 leading-tight">{icp.name}</div>
            <div className="font-sans text-sm text-stone-600 mt-1">{icp.title}</div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button aria-label="Edit" onClick={onEdit} className="p-2 hover:bg-stone-100"><Edit3 className="w-4 h-4 text-stone-600" /></button>
            <button aria-label="Delete" onClick={onDelete} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">Demographics</div>
            <div className="text-sm text-stone-700 font-sans leading-relaxed">{icp.demographics}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1.5">Psychographics</div>
            <div className="text-sm text-stone-700 font-sans leading-relaxed">{icp.psychographics}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div className="bg-red-50 border border-red-200 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-800 font-semibold mb-2">Top Pains</div>
            <ul className="space-y-1.5">
              {(icp.topPains || []).map((p, i) => (
                <li key={i} className="text-sm text-stone-700 font-sans leading-relaxed flex gap-2">
                  <span className="text-red-700 font-mono">↳</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800 font-semibold mb-2">Top Goals</div>
            <ul className="space-y-1.5">
              {(icp.topGoals || []).map((g, i) => (
                <li key={i} className="text-sm text-stone-700 font-sans leading-relaxed flex gap-2">
                  <span className="text-emerald-700 font-mono">↳</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {expanded && (
          <>
            {icp.dailyReality && (
              <div className="mb-5 p-4 bg-stone-50 border border-stone-200">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1.5">Daily Reality</div>
                <div className="text-sm text-stone-700 font-sans leading-relaxed">{icp.dailyReality}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Vocabulary they use</div>
                <div className="flex flex-wrap gap-1.5">
                  {(icp.vocabulary || []).map((v, i) => <Pill key={i} color="green">{v}</Pill>)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Vocabulary to avoid</div>
                <div className="flex flex-wrap gap-1.5">
                  {(icp.vocabularyToAvoid || []).map((v, i) => <Pill key={i} color="red">{v}</Pill>)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Watering holes</div>
                <ul className="space-y-1">
                  {(icp.wateringHoles || []).map((w, i) => (
                    <li key={i} className="text-sm text-stone-700 font-sans flex gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-2">Buying triggers</div>
                <ul className="space-y-1">
                  {(icp.buyingTriggers || []).map((b, i) => (
                    <li key={i} className="text-sm text-stone-700 font-sans flex gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {icp.objections && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 font-semibold mb-2">Objections</div>
                <ul className="space-y-1">
                  {icp.objections.map((o, i) => (
                    <li key={i} className="text-sm text-stone-700 font-sans">⚠ {o}</li>
                  ))}
                </ul>
              </div>
            )}

            {icp.successMetrics && (
              <div className="p-4 bg-stone-100 border-l-4 border-stone-900">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">How they measure success</div>
                <div className="text-sm text-stone-700 font-sans leading-relaxed">{icp.successMetrics}</div>
              </div>
            )}
          </>
        )}

        <button 
          onClick={() => setExpanded(!expanded)} 
          className="mt-4 font-sans text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
        >
          {expanded ? 'Show less' : 'Show full profile'} 
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}

function ICPForm({ icp, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [s, setS] = useState(icp || { 
    name: '', title: '', demographics: '', psychographics: '', dailyReality: '',
    topPains: [], topGoals: [], objections: [], wateringHoles: [],
    vocabulary: [], vocabularyToAvoid: [], buyingTriggers: [], successMetrics: ''
  });

  return (
    <div className="bg-stone-950 text-stone-50 p-8 mb-6 animate-slideIn">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display text-3xl font-light">{s.id ? 'Edit ICP' : 'New ICP'}</div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Short name (e.g. 'BD Lead at Tier-1 Telco')">
            <input value={s.name} onChange={e => setS({ ...s, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="Specific job title">
            <input value={s.title} onChange={e => setS({ ...s, title: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="Demographics (age, location, company size)">
            <textarea rows={2} value={s.demographics} onChange={e => setS({ ...s, demographics: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="Psychographics (beliefs, fears, aspirations)">
            <textarea rows={3} value={s.psychographics} onChange={e => setS({ ...s, psychographics: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="Daily reality">
            <textarea rows={3} value={s.dailyReality} onChange={e => setS({ ...s, dailyReality: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="How they measure success">
            <textarea rows={2} value={s.successMetrics} onChange={e => setS({ ...s, successMetrics: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
        </div>

        <div className="space-y-4">
          <ChipInput label="Top pains" items={s.topPains} setItems={v => setS({ ...s, topPains: v })} accent="red" />
          <ChipInput label="Top goals" items={s.topGoals} setItems={v => setS({ ...s, topGoals: v })} accent="green" />
          <ChipInput label="Objections to your message" items={s.objections} setItems={v => setS({ ...s, objections: v })} accent="amber" />
          <ChipInput label="Watering holes (where they hang out)" items={s.wateringHoles} setItems={v => setS({ ...s, wateringHoles: v })} />
          <ChipInput label="Their vocabulary" items={s.vocabulary} setItems={v => setS({ ...s, vocabulary: v })} />
          <ChipInput label="Vocabulary to avoid" items={s.vocabularyToAvoid} setItems={v => setS({ ...s, vocabularyToAvoid: v })} accent="red" />
          <ChipInput label="Buying triggers" items={s.buyingTriggers} setItems={v => setS({ ...s, buyingTriggers: v })} accent="amber" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400">Cancel</button>
        <button onClick={() => onSave(s)} disabled={!s.name} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> Save ICP
        </button>
      </div>
    </div>
  );
}

// ============= HOOK LIBRARY =============
const HOOK_TEMPLATES = [
  // PAIN
  { id: 'p1', category: 'pain', template: '[Number] mistakes I made [doing X] before [breakthrough].', example: '5 mistakes I made structuring telco partnerships before my first signed MOU.' },
  { id: 'p2', category: 'pain', template: 'I spent [time] [doing X]. It almost broke me. Here\'s what I learned.', example: 'I spent 8 months chasing a Jazz partnership. It almost broke me. Here\'s what I learned.' },
  { id: 'p3', category: 'pain', template: 'The [adjective] truth about [topic] no one tells you:', example: 'The brutal truth about MENA partnerships no one tells you:' },
  { id: 'p4', category: 'pain', template: 'If you\'re [doing X], stop. Here\'s why.', example: 'If you\'re sending decks before doing discovery calls, stop. Here\'s why.' },
  { id: 'p5', category: 'pain', template: '[Common belief] is wrong. Here\'s what actually [worked/works]:', example: '"Build the deck first" is wrong. Here\'s what actually got my last 3 deals signed:' },
  { id: 'p6', category: 'pain', template: 'I almost lost [X] because I [did Y]. Don\'t make my mistake.', example: 'I almost lost a 6-figure deal because I optimized the wrong KPI. Don\'t make my mistake.' },
  
  // PRIZE
  { id: 'pr1', category: 'prize', template: 'How I went from [before] to [after] in [timeframe]:', example: 'How I went from cold outreach to inbound deal flow in 90 days:' },
  { id: 'pr2', category: 'prize', template: 'The [specific action] that [unexpected result]:', example: 'The 14-line email that landed me a meeting with a tier-1 telco CCO:' },
  { id: 'pr3', category: 'prize', template: '[Result/outcome]. Here\'s the exact playbook:', example: '4x ROI on a collection campaign. Here\'s the exact playbook:' },
  { id: 'pr4', category: 'prize', template: 'I just [achievement]. Here are the [N] things that mattered:', example: 'I just signed an MOU in 47 days. Here are the 6 things that mattered:' },
  { id: 'pr5', category: 'prize', template: 'You don\'t need [common requirement] to [outcome]. You need [your insight].', example: 'You don\'t need a Big-4 background to get into telco BD. You need to ship one good RFI response.' },
  { id: 'pr6', category: 'prize', template: 'A [adjective] way to [achieve outcome] (that nobody talks about):', example: 'A counterintuitive way to win telco RFIs (that nobody talks about):' },
  
  // NEWS
  { id: 'n1', category: 'news', template: '[Recent event/news]. Here\'s what it actually means for [audience]:', example: 'Saudi Telecom\'s rebrand. Here\'s what it actually means for partnership pipelines:' },
  { id: 'n2', category: 'news', template: 'Everyone\'s talking about [X]. Almost everyone is wrong.', example: 'Everyone\'s talking about AI in telco. Almost everyone is wrong about where the value is.' },
  { id: 'n3', category: 'news', template: '[Public figure] said [X]. I disagree. Here\'s why:', example: 'A telco CEO said "BD is dying." I disagree. Here\'s why:' },
  { id: 'n4', category: 'news', template: 'A [event] happened this week. Three lessons for [audience]:', example: 'The Ufone-Telenor merger closed this week. Three lessons for telco BDs:' },
  { id: 'n5', category: 'news', template: '[Industry trend] is being misread. The real signal is [Y].', example: 'The "5G monetization problem" is being misread. The real signal is in voice services.' },
  { id: 'n6', category: 'news', template: 'I\'ve watched [X] play out [N] times. Here\'s what usually happens next:', example: 'I\'ve watched telco mergers play out 4 times. Here\'s what usually happens to partnerships:' }
];

function HookLibrary({ hooks, saveHooks, profile }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [view, setView] = useState('templates'); // templates | mine

  const allHooks = view === 'templates' ? HOOK_TEMPLATES : hooks;

  const filtered = useMemo(() => {
    let list = allHooks;
    if (filter !== 'all') list = list.filter(h => h.category === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h => h.template?.toLowerCase().includes(q) || h.example?.toLowerCase().includes(q));
    }
    return list;
  }, [allHooks, filter, search]);

  const generateHooks = async (cat) => {
    setGenerating(true);
    const prompt = `You're a personal branding hook expert trained on the framework.

Generate 5 ${cat.toUpperCase()} hooks for ${profile.name}.

Their context:
- Title: ${profile.title}
- Industries: ${profile.industries?.join(', ')}
- Audience: ${profile.audiences?.join(', ')}
- Voice: ${profile.voice}, ${profile.tone?.join(', ')}
- Pains they address: ${profile.pains?.slice(0, 3).join('; ')}
- Prizes they deliver: ${profile.prizes?.slice(0, 3).join('; ')}

${cat === 'pain' ? 'Pain hooks open with a problem the audience feels in their bones.' : ''}
${cat === 'prize' ? 'Prize hooks open with the outcome the audience desires.' : ''}
${cat === 'news' ? 'News hooks tie to current events or industry trends.' : ''}

Return ONLY valid JSON:
{
  "hooks": [
    { "template": "Hook with [variable] placeholders", "example": "Filled example specific to their world" },
    { "template": "...", "example": "..." },
    { "template": "...", "example": "..." },
    { "template": "...", "example": "..." },
    { "template": "...", "example": "..." }
  ]
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      const newHooks = parsed.hooks.map(h => ({ ...h, id: Date.now() + Math.random(), category: cat, custom: true, createdAt: new Date().toISOString() }));
      saveHooks([...newHooks, ...hooks]);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const copy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Source Material · Hook Library"
        title="Hook Library"
        description="Proven opening lines, organized by Pain / Prize / News. Use as starting points — don't ship templates verbatim."
      />

      {/* AI generate row */}
      <div className="bg-gradient-to-br from-stone-950 to-stone-900 text-stone-50 p-7 mb-8 grain relative">
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Generate Custom Hooks</div>
          <div className="font-display text-2xl font-light mb-4">Tailored to your voice and audience</div>
          <div className="flex gap-2">
            {[
              { v: 'pain', label: 'Pain hooks', icon: AlertCircle, color: 'bg-red-900' },
              { v: 'prize', label: 'Prize hooks', icon: Trophy, color: 'bg-emerald-900' },
              { v: 'news', label: 'News hooks', icon: Newspaper, color: 'bg-amber-900' }
            ].map(b => (
              <button
                key={b.v}
                onClick={() => generateHooks(b.v)}
                disabled={generating}
                className={`${b.color} hover:opacity-90 px-5 py-2.5 font-sans text-sm flex items-center gap-2 disabled:opacity-30`}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <b.icon className="w-4 h-4" />}
                Generate 5 {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setView('templates')}
            className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'templates' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}
          >
            <Library className="w-4 h-4" /> Master Templates ({HOOK_TEMPLATES.length})
          </button>
          <button
            onClick={() => setView('mine')}
            className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'mine' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}
          >
            <BookMarked className="w-4 h-4" /> My Hooks ({hooks.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 p-4 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
          <Search className="w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hooks..." className="bg-transparent outline-none flex-1 font-sans text-sm" />
        </div>
        <div className="flex gap-1">
          {[
            { v: 'all', label: 'All' },
            { v: 'pain', label: 'Pain', icon: AlertCircle },
            { v: 'prize', label: 'Prize', icon: Trophy },
            { v: 'news', label: 'News', icon: Newspaper }
          ].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3 py-2 font-sans text-xs border flex items-center gap-1.5 ${filter === f.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 bg-white'}`}>
              {f.icon && <f.icon className="w-3 h-3" />} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hooks grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Library}
          title={view === 'mine' ? 'No custom hooks yet' : 'No matches'}
          description={view === 'mine' ? 'Generate AI hooks tailored to your voice using the panel above.' : 'Try adjusting your filter or search.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(hook => (
            <div key={hook.id} className="bg-white border border-stone-200 p-5 hover:border-stone-400 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <Pill color={hook.category === 'pain' ? 'red' : hook.category === 'prize' ? 'green' : 'amber'}>
                  {hook.category.toUpperCase()}
                </Pill>
                {hook.custom && <Pill>AI</Pill>}
              </div>
              <div className="font-display text-base text-stone-900 leading-snug mb-3 font-medium">
                {hook.template}
              </div>
              {hook.example && (
                <div className="bg-stone-50 border-l-2 border-stone-300 p-3 mb-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">Example for you</div>
                  <div className="text-sm text-stone-700 font-sans italic leading-relaxed">"{hook.example}"</div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => copy(hook.example || hook.template, hook.id)} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                  {copiedId === hook.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                {hook.custom && (
                  <button onClick={async () => { if (await window.brandConfirm('Delete this hook?')) saveHooks(hooks.filter(h => h.id !== hook.id)); }} className="px-3 py-1.5 hover:bg-red-50 font-sans text-xs text-red-700">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= CONTENT ENGINE =============
function ContentEngine({ contentPieces, saveContent, stories, profile, hooks, icps, setActiveView }) {
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedICP, setSelectedICP] = useState(null);
  const [contentType, setContentType] = useState('pain');
  const [platform, setPlatform] = useState(profile.primaryPlatform || 'LinkedIn');
  const [format, setFormat] = useState('post');
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(null);

  const formats = {
    LinkedIn: [
      { v: 'post', label: 'LinkedIn Post', desc: '150-300 words', icon: FileText },
      { v: 'carousel', label: 'Carousel Slides', desc: '6-8 slides', icon: Layers },
      { v: 'newsletter', label: 'Newsletter', desc: '500-800 words', icon: ScrollText },
    ],
    'X': [
      { v: 'tweet', label: 'Single Tweet', desc: 'Under 280 chars', icon: MessageSquare },
      { v: 'thread', label: 'Thread', desc: '5-9 tweets', icon: GitBranch },
    ],
    YouTube: [
      { v: 'short_script', label: 'Short Script', desc: '60-second video', icon: Video },
      { v: 'long_script', label: 'Long Script', desc: '8-15 min video', icon: Video },
    ],
    Instagram: [
      { v: 'caption', label: 'Caption', desc: 'Story + lesson', icon: FileText },
      { v: 'carousel', label: 'Carousel', desc: '6-10 slides', icon: Layers },
    ],
    Newsletter: [
      { v: 'newsletter', label: 'Newsletter', desc: '500-1500 words', icon: ScrollText },
    ],
    Podcast: [
      { v: 'podcast_outline', label: 'Episode Outline', desc: '20-45 min', icon: Headphones },
    ]
  };

  const availableFormats = formats[platform] || formats.LinkedIn;

  const filtered = useMemo(() => {
    let list = contentPieces;
    if (filter !== 'all') list = list.filter(c => c.type === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.hook?.toLowerCase().includes(q) || 
        c.body?.toLowerCase().includes(q) ||
        c.storyTitle?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [contentPieces, filter, search]);

  const generateContent = async () => {
    if (!selectedStory) {
      setError('Pick a story first');
      return;
    }
    setGenerating(true);
    setError(null);
    setGeneratedContent(null);

    const icpContext = selectedICP ? `

ICP TARGETED: ${selectedICP.name}
- Their top pains: ${selectedICP.topPains?.join('; ')}
- Their top goals: ${selectedICP.topGoals?.join('; ')}
- Their vocabulary: ${selectedICP.vocabulary?.join(', ')}
- Vocabulary to avoid: ${selectedICP.vocabularyToAvoid?.join(', ')}` : '';

    const formatInstructions = {
      post: 'A LinkedIn post: hook (1-2 lines that stop scroll), body (150-250 words, line breaks every 1-2 sentences), close (DM CTA).',
      carousel: 'A LinkedIn/Instagram carousel: 6-8 slides. Slide 1 = hook. Slides 2-7 = the lesson broken into beats. Slide 8 = CTA.',
      tweet: 'A single tweet under 280 characters. Punchy, ends with a question or contrarian statement.',
      thread: 'An X thread: 5-9 tweets. Tweet 1 = hook + promise. Middle tweets = the lesson in beats. Last tweet = CTA + soft pitch.',
      short_script: 'A 60-second YouTube Short script. Hook in first 3 seconds. Visual cues in [brackets]. Pacing notes.',
      long_script: 'An 8-15 minute YouTube long-form script outline with intro hook, 3-5 chapters, examples, and CTA.',
      caption: 'An Instagram caption: hook line, story in 2-3 paragraphs, takeaway, CTA. ~150 words.',
      newsletter: 'A newsletter piece: subject line, hook paragraph, story (3-4 paragraphs), the framework taught, CTA. 500-800 words.',
      podcast_outline: 'A podcast episode outline: title, hook (intro 2 min), 3-5 main sections with talking points, listener takeaway, CTA.'
    };

    const prompt = `You are a personal branding strategist trained on the framework. Turn ${profile.name}'s real story into ready-to-publish content.

ABOUT ${profile.name}:
- Title: ${profile.title}
- Industries: ${profile.industries?.join(', ')}
- Audiences: ${profile.audiences?.join(', ')}
- Voice: ${profile.voice} | Tone: ${profile.tone?.join(', ') || 'direct, honest'}
- Voice taboos (NEVER do these): ${profile.voiceTaboos?.join('; ') || 'no clichés, no buzzwords'}
- Transformation they create: ${profile.transformation}
- Differentiator: ${profile.differentiators}
${icpContext}

THE STORY:
- Title: ${selectedStory.title}
- Month: ${selectedStory.month}
- Category: ${selectedStory.category}
- Emotion: ${selectedStory.emotion || 'not specified'}
- Context: ${selectedStory.context || 'not provided'}
- Conflict: ${selectedStory.conflict || 'not provided'}
- Resolution: ${selectedStory.resolution || 'not provided'}
- Lesson: ${selectedStory.lesson}

CONTENT REQUEST:
- Platform: ${platform}
- Format: ${format} — ${formatInstructions[format]}
- Angle: ${contentType.toUpperCase()} 
${contentType === 'pain' ? '- Open with a pain the audience feels in their bones' : ''}
${contentType === 'prize' ? '- Open with the outcome the audience wants' : ''}
${contentType === 'news' ? '- Tie to current industry context with a contrarian angle' : ''}

PRIESTLEY'S RULES (NON-NEGOTIABLE):
- Relatable beats impressive
- Story is the vehicle for the lesson, never vanity
- Operator-grade tone — they live in this world, prove you do too
- End with: "If you want to discuss [specific], DM me" or similar low-friction CTA

Return ONLY valid JSON:
{
  "shortForm": {
    "hook": "First 1-2 lines that stop the scroll",
    "body": "The full content body in the requested format",
    "cta": "Specific DM-style call to action"
  },
  "longFormOutline": {
    "title": "Long-form companion piece title",
    "sections": ["Section 1 heading", "Section 2 heading", "Section 3 heading", "Section 4 heading"],
    "process": "The 3-5 step process this teaches"
  },
  "threeVariants": [
    "Alternative hook 1 — different angle",
    "Alternative hook 2",
    "Alternative hook 3"
  ],
  "hashtags": ["3-5 relevant hashtags without #"],
  "engagementPrediction": {
    "score": 1-10,
    "reasoning": "Why this will or won't land"
  }
}`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setGeneratedContent({ ...parsed, storyId: selectedStory.id, contentType, platform, format });
    } catch (e) {
      console.error(e);
      setError('Generation failed. Try again.');
    }
    setGenerating(false);
  };

  const saveGenerated = () => {
    if (!generatedContent) return;
    const piece = {
      id: Date.now(),
      type: generatedContent.contentType,
      platform: generatedContent.platform,
      format: generatedContent.format,
      storyId: generatedContent.storyId,
      storyTitle: selectedStory?.title,
      icpId: selectedICP?.id,
      icpName: selectedICP?.name,
      hook: generatedContent.shortForm.hook,
      body: generatedContent.shortForm.body,
      cta: generatedContent.shortForm.cta,
      longForm: generatedContent.longFormOutline,
      variants: generatedContent.threeVariants,
      hashtags: generatedContent.hashtags,
      engagementPrediction: generatedContent.engagementPrediction,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    saveContent([piece, ...contentPieces]);
    if (selectedStory) {
      // Mark story as used
      const updatedStory = { ...selectedStory, timesUsed: (selectedStory.timesUsed || 0) + 1 };
      // Note: stories are saved separately - we'd need to handle this differently in production
    }
    setGeneratedContent(null);
    setActiveTab('library');
  };

  const copyContent = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Step Two · Production"
        title="Content Engine"
        description="Turn each story into Pain / Prize / News content across platforms. AI drafts. You ship."
      />

      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-8">
          <button onClick={() => setActiveTab('generate')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${activeTab === 'generate' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Sparkles className="w-4 h-4" /> Generate
          </button>
          <button onClick={() => setActiveTab('library')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${activeTab === 'library' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Layers className="w-4 h-4" /> Library ({contentPieces.length})
          </button>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-6">
          {stories.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-amber-900 mb-1">Add stories first</div>
                <div className="font-sans text-sm text-amber-800 mb-3">The content engine pulls from your Story Vault. Capture at least one story — voice or typed — before generating content.</div>
                <button
                  onClick={() => setActiveView && setActiveView('stories')}
                  className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-xs hover:bg-stone-800 inline-flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Go to Story Vault
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Story */}
              <div className="bg-white border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">1. Pick a story</div>
                  {selectedStory && <span className="font-mono text-[10px] text-emerald-700">✓ Selected</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {stories.map(s => (
                    <button key={s.id} onClick={() => setSelectedStory(s)} className={`p-3 text-left border transition-all ${selectedStory?.id === s.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-400 bg-stone-50'}`}>
                      <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 ${selectedStory?.id === s.id ? 'text-stone-400' : 'text-stone-500'}`}>{s.month} · {s.category}</div>
                      <div className="text-sm leading-snug line-clamp-2">{s.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: ICP (optional) */}
              {icps.length > 0 && (
                <div className="bg-white border border-stone-200 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">2. Target an ICP <span className="text-stone-400">(optional but recommended)</span></div>
                    {selectedICP && <button onClick={() => setSelectedICP(null)} className="font-sans text-xs text-stone-500 hover:text-stone-900">Clear</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {icps.map(icp => (
                      <button key={icp.id} onClick={() => setSelectedICP(icp)} className={`p-3 text-left border transition-all ${selectedICP?.id === icp.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-400 bg-stone-50'}`}>
                        <Crosshair className="w-3.5 h-3.5 mb-1.5" />
                        <div className="text-sm leading-snug font-medium">{icp.name}</div>
                        <div className={`font-sans text-[10px] mt-0.5 ${selectedICP?.id === icp.id ? 'text-stone-400' : 'text-stone-500'}`}>{icp.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Angle */}
              <div className="bg-white border border-stone-200 p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">{icps.length > 0 ? '3' : '2'}. Pick angle</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { v: 'pain', label: 'Pain', icon: AlertCircle, color: 'red', desc: 'Problem hook · Mondays' },
                    { v: 'prize', label: 'Prize', icon: Trophy, color: 'emerald', desc: 'Outcome hook · Fridays' },
                    { v: 'news', label: 'News', icon: Newspaper, color: 'amber', desc: 'Event hook · Wednesdays' }
                  ].map(t => (
                    <button key={t.v} onClick={() => setContentType(t.v)} className={`p-4 text-left border transition-all ${contentType === t.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-400'}`}>
                      <t.icon className="w-5 h-5 mb-2" />
                      <div className="font-medium">{t.label}</div>
                      <div className={`font-sans text-xs mt-0.5 ${contentType === t.v ? 'text-stone-400' : 'text-stone-500'}`}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Platform & format */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-stone-200 p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">{icps.length > 0 ? '4a' : '3a'}. Platform</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.keys(formats).filter(p => profile.platforms?.includes(p) || p === 'LinkedIn').map(p => (
                      <button key={p} onClick={() => { setPlatform(p); setFormat(formats[p][0].v); }} className={`px-3 py-2.5 text-sm border ${platform === p ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-400'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-stone-200 p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">{icps.length > 0 ? '4b' : '3b'}. Format</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableFormats.map(f => (
                      <button key={f.v} onClick={() => setFormat(f.v)} className={`p-2.5 text-left border ${format === f.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-400'}`}>
                        <div className="flex items-center gap-2">
                          <f.icon className="w-3.5 h-3.5" />
                          <span className="text-sm font-medium">{f.label}</span>
                        </div>
                        <div className={`font-sans text-[10px] mt-0.5 ${format === f.v ? 'text-stone-400' : 'text-stone-500'}`}>{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={generateContent} disabled={!selectedStory || generating} className="px-7 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 disabled:opacity-30 inline-flex items-center gap-2">
                  {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Zap className="w-4 h-4" /> Generate content</>}
                </button>
              </div>

              {error && <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-800">{error}</div>}

              {generatedContent && (
                <GeneratedContentPreview 
                  content={generatedContent} 
                  story={selectedStory} 
                  onSave={saveGenerated}
                  onDiscard={() => setGeneratedContent(null)}
                  onCopy={(text) => copyContent(text, 'gen')}
                  copiedId={copied}
                />
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <div>
          <div className="bg-white border border-stone-200 p-4 mb-6 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
              <Search className="w-4 h-4 text-stone-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..." className="bg-transparent outline-none flex-1 font-sans text-sm" />
            </div>
            {['all', 'pain', 'prize', 'news'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 font-sans text-xs border ${filter === f ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Sparkles} title="Library is empty" description="Generate your first piece using the Generate tab." />
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <ContentLibraryItem 
                  key={p.id} 
                  piece={p} 
                  onCopy={(text) => copyContent(text, p.id)}
                  copied={copied === p.id}
                  onDelete={async () => { if (await window.brandConfirm('Delete this content piece? This cannot be undone.')) saveContent(contentPieces.filter(c => c.id !== p.id)); }}
                  onUpdate={(updated) => saveContent(contentPieces.map(c => c.id === updated.id ? updated : c))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GeneratedContentPreview({ content, story, onSave, onDiscard, onCopy, copiedId }) {
  useEscape(onDiscard);
  useBodyScrollLock(true);
  return (
    <div className="bg-stone-50 border-2 border-stone-900 p-8 space-y-6 animate-slideIn">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Generated draft</div>
          <div className="font-sans text-xs text-stone-600 mt-0.5">From: {story?.title}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDiscard} className="px-4 py-2 font-sans text-sm text-stone-600 hover:text-stone-900">Discard</button>
          <button onClick={onSave} className="px-5 py-2 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Bookmark className="w-4 h-4" /> Save to library
          </button>
        </div>
      </div>

      {/* Engagement prediction */}
      {content.engagementPrediction && (
        <div className="bg-white border border-stone-200 p-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Engagement Prediction</div>
            <div className="font-sans text-xs text-stone-600 mt-0.5">{content.engagementPrediction.reasoning}</div>
          </div>
          <div className="font-display text-4xl font-light">
            {content.engagementPrediction.score}<span className="text-stone-300 text-2xl">/10</span>
          </div>
        </div>
      )}

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Short-form content</div>
        <div className="bg-white border border-stone-200 p-6">
          <div className="text-xl font-display text-stone-900 mb-4 leading-snug font-medium">{content.shortForm.hook}</div>
          <div className="text-stone-700 whitespace-pre-wrap leading-relaxed mb-5 font-sans text-sm">{content.shortForm.body}</div>
          <div className="border-t border-stone-200 pt-4 font-sans text-sm text-stone-600 italic mb-3">{content.shortForm.cta}</div>
          {content.hashtags && content.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {content.hashtags.map(h => <span key={h} className="font-sans text-xs text-stone-500">#{h}</span>)}
            </div>
          )}
          <button 
            onClick={() => onCopy(`${content.shortForm.hook}\n\n${content.shortForm.body}\n\n${content.shortForm.cta}${content.hashtags ? '\n\n' + content.hashtags.map(h => '#' + h).join(' ') : ''}`)}
            className="mt-4 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs inline-flex items-center gap-1.5"
          >
            {copiedId === 'gen' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy full post</>}
          </button>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Long-form companion outline</div>
        <div className="bg-white border border-stone-200 p-5">
          <div className="font-display text-lg font-medium text-stone-900 mb-3">{content.longFormOutline.title}</div>
          <ol className="space-y-2 mb-4">
            {content.longFormOutline.sections.map((sec, i) => (
              <li key={i} className="font-sans text-sm text-stone-700 flex gap-3">
                <span className="font-mono text-xs text-stone-400">{String(i+1).padStart(2, '0')}</span>
                {sec}
              </li>
            ))}
          </ol>
          <div className="border-t border-stone-200 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">Process taught</div>
            <div className="text-sm text-stone-700 font-sans">{content.longFormOutline.process}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Alternative hooks (A/B test)</div>
        <div className="space-y-2">
          {content.threeVariants.map((v, i) => (
            <div key={i} className="bg-white border border-stone-200 p-3 font-sans text-sm text-stone-700 flex items-start gap-3">
              <span className="font-mono text-xs text-stone-400 mt-0.5">v{i+1}</span>
              <span className="flex-1">{v}</span>
              <button onClick={() => onCopy(v)} className="opacity-50 hover:opacity-100"><Copy className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentLibraryItem({ piece, onCopy, copied, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const colors = { pain: 'red', prize: 'green', news: 'amber' };
  return (
    <div className="bg-white border border-stone-200 p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill color={colors[piece.type]}>{piece.type}</Pill>
          {piece.platform && <Pill color="blue">{piece.platform}</Pill>}
          {piece.format && <Pill>{piece.format}</Pill>}
          {piece.icpName && <Pill color="violet">→ {piece.icpName}</Pill>}
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
            {new Date(piece.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onCopy(`${piece.hook}\n\n${piece.body}\n\n${piece.cta || ''}`)} className="p-1.5 hover:bg-stone-100">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-600" />}
          </button>
          <button aria-label="Delete" onClick={onDelete} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
        </div>
      </div>
      <div className="font-sans text-xs text-stone-500 mb-2">From: {piece.storyTitle}</div>
      <div className="font-display text-lg font-medium text-stone-900 mb-2 leading-snug">{piece.hook}</div>
      <div className="font-sans text-sm text-stone-600 leading-relaxed whitespace-pre-wrap line-clamp-3">{piece.body}</div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Full body</div>
            <div className="font-sans text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{piece.body}</div>
          </div>
          {piece.cta && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">CTA</div>
              <div className="font-sans text-sm text-stone-700 italic">{piece.cta}</div>
            </div>
          )}
          {piece.variants && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-2">Alternative hooks</div>
              <ul className="space-y-1">
                {piece.variants.map((v, i) => <li key={i} className="font-sans text-sm text-stone-700">v{i+1}: {v}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="mt-3 font-sans text-xs text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
        {expanded ? 'Collapse' : 'Expand'} <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

// ============= BATCH WORKFLOW =============
function BatchWorkflow({ batches, saveBatches, stories, contentPieces, saveContent, profile }) {
  const [step, setStep] = useState(0);
  const [batchData, setBatchData] = useState({
    name: '',
    weekOf: getMonday(new Date()).toISOString().split('T')[0],
    painStory: null,
    newsStory: null,
    prizeStory: null,
    platform: profile.primaryPlatform || 'LinkedIn',
    format: 'post',
    generated: null
  });
  const [generating, setGenerating] = useState(false);
  const [view, setView] = useState('new'); // new | history

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const generateBatch = async () => {
    setGenerating(true);
    const stories3 = [
      { story: batchData.painStory, type: 'pain', day: 'Monday' },
      { story: batchData.newsStory, type: 'news', day: 'Wednesday' },
      { story: batchData.prizeStory, type: 'prize', day: 'Friday' }
    ].filter(s => s.story);

    const prompt = `You're producing a week of personal-brand content for ${profile.name}.

ABOUT THEM:
- Title: ${profile.title}
- Voice: ${profile.voice}, ${profile.tone?.join(', ')}
- Audience: ${profile.audiences?.join(', ')}
- Voice taboos: ${profile.voiceTaboos?.join('; ')}
- Transformation: ${profile.transformation}

PLATFORM: ${batchData.platform} — ${batchData.format} format

WEEK PLAN:
${stories3.map(s => `${s.day} (${s.type.toUpperCase()}): "${s.story.title}" — Lesson: ${s.story.lesson}`).join('\n')}

Generate complete short-form content for each. Make them feel like a coherent week — interconnected themes, varied hooks, building narrative arc. Rule: relatable beats impressive.

Return ONLY valid JSON:
{
  "weekTheme": "What ties these 3 posts together",
  "posts": [
    {
      "day": "Monday",
      "type": "pain",
      "hook": "1-2 line opener",
      "body": "Full post body",
      "cta": "DM call to action",
      "hashtags": ["tag1", "tag2", "tag3"]
    },
    { "day": "Wednesday", "type": "news", ... },
    { "day": "Friday", "type": "prize", ... }
  ]
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setBatchData({ ...batchData, generated: parsed });
      setStep(4);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const saveAndSchedule = () => {
    if (!batchData.generated) return;
    const monday = new Date(batchData.weekOf);
    const newPieces = batchData.generated.posts.map((post, i) => {
      const dayOffset = i === 0 ? 0 : i === 1 ? 2 : 4; // Mon, Wed, Fri
      const postDate = new Date(monday);
      postDate.setDate(monday.getDate() + dayOffset);
      const story = i === 0 ? batchData.painStory : i === 1 ? batchData.newsStory : batchData.prizeStory;
      return {
        id: Date.now() + i,
        type: post.type,
        platform: batchData.platform,
        format: batchData.format,
        storyId: story?.id,
        storyTitle: story?.title,
        hook: post.hook,
        body: post.body,
        cta: post.cta,
        hashtags: post.hashtags,
        scheduledFor: postDate.toISOString().split('T')[0],
        batchId: batchData.id || Date.now(),
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
    });
    saveContent([...newPieces, ...contentPieces]);
    
    const newBatch = {
      id: Date.now(),
      name: batchData.name || `Week of ${new Date(batchData.weekOf).toLocaleDateString()}`,
      weekOf: batchData.weekOf,
      platform: batchData.platform,
      format: batchData.format,
      theme: batchData.generated.weekTheme,
      pieceIds: newPieces.map(p => p.id),
      createdAt: new Date().toISOString()
    };
    saveBatches([newBatch, ...batches]);
    
    // Reset
    setBatchData({
      name: '', 
      weekOf: getMonday(new Date()).toISOString().split('T')[0],
      painStory: null, newsStory: null, prizeStory: null,
      platform: profile.primaryPlatform || 'LinkedIn', format: 'post', generated: null
    });
    setStep(0);
    setView('history');
  };

  const StepIndicator = ({ active, num, label }) => (
    <div className={`flex items-center gap-2 ${active ? 'text-stone-900' : 'text-stone-400'}`}>
      <div className={`w-7 h-7 flex items-center justify-center font-mono text-xs ${active ? 'bg-stone-900 text-stone-50' : 'bg-stone-200'}`}>{num}</div>
      <div className="font-sans text-xs uppercase tracking-wider hidden md:block">{label}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Production · Batch Workflow"
        title="Plan a week in 30 minutes"
        description="Pick 3 stories, generate Mon/Wed/Fri posts, schedule them in one move. The proven cadence, automated."
      />

      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-8">
          <button onClick={() => setView('new')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'new' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Sparkles className="w-4 h-4" /> New Batch
          </button>
          <button onClick={() => setView('history')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'history' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Clock className="w-4 h-4" /> Previous Batches ({batches.length})
          </button>
        </div>
      </div>

      {view === 'new' && (
        <div>
          {/* Stepper */}
          <div className="flex items-center gap-4 mb-8 bg-white border border-stone-200 p-5">
            <StepIndicator active={step >= 0} num="1" label="Stories" />
            <div className="flex-1 h-px bg-stone-200" />
            <StepIndicator active={step >= 1} num="2" label="Format" />
            <div className="flex-1 h-px bg-stone-200" />
            <StepIndicator active={step >= 2} num="3" label="Week" />
            <div className="flex-1 h-px bg-stone-200" />
            <StepIndicator active={step >= 3} num="4" label="Generate" />
            <div className="flex-1 h-px bg-stone-200" />
            <StepIndicator active={step >= 4} num="5" label="Schedule" />
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Step 1</div>
                <div className="font-display text-2xl font-light text-stone-900 mb-1">Pick 3 stories</div>
                <div className="font-sans text-sm text-stone-600 mb-5">One pain, one news-tied, one prize. They'll become your Monday/Wednesday/Friday posts.</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'painStory', label: 'Pain Monday', cat: 'pain', color: 'red', icon: AlertCircle },
                    { key: 'newsStory', label: 'News Wednesday', cat: 'news', color: 'amber', icon: Newspaper },
                    { key: 'prizeStory', label: 'Prize Friday', cat: 'prize', color: 'emerald', icon: Trophy }
                  ].map(slot => {
                    const filtered = stories.filter(s => s.category === slot.cat);
                    const selected = batchData[slot.key];
                    return (
                      <div key={slot.key} className={`border-2 ${selected ? 'border-stone-900 bg-stone-50' : 'border-dashed border-stone-300'} p-4`}>
                        <div className={`flex items-center gap-2 mb-3 ${slot.color === 'red' ? 'text-red-700' : slot.color === 'amber' ? 'text-amber-700' : 'text-emerald-700'}`}>
                          <slot.icon className="w-4 h-4" />
                          <div className="font-mono text-[10px] uppercase tracking-[0.2em]">{slot.label}</div>
                        </div>
                        {selected ? (
                          <div>
                            <div className="font-display text-base font-medium text-stone-900 leading-snug mb-2">{selected.title}</div>
                            <div className="font-sans text-xs text-stone-600 italic line-clamp-2 mb-3">→ {selected.lesson}</div>
                            <button onClick={() => setBatchData({ ...batchData, [slot.key]: null })} className="font-sans text-xs text-stone-500 hover:text-stone-900">Change</button>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {filtered.length === 0 ? (
                              <div className="font-sans text-xs text-stone-500 italic">No {slot.cat} stories. Add some.</div>
                            ) : filtered.map(s => (
                              <button key={s.id} onClick={() => setBatchData({ ...batchData, [slot.key]: s })} className="w-full text-left p-2 text-xs hover:bg-stone-100 border border-stone-200">
                                {s.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => setStep(1)} 
                    disabled={!batchData.painStory && !batchData.newsStory && !batchData.prizeStory}
                    className="px-6 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white border border-stone-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Step 2</div>
              <div className="font-display text-2xl font-light text-stone-900 mb-5">Platform & format for the whole batch</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Platform</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {['LinkedIn', 'X', 'Newsletter', 'Instagram', 'YouTube', 'Podcast'].filter(p => profile.platforms?.includes(p) || p === 'LinkedIn').map(p => (
                      <button key={p} onClick={() => setBatchData({ ...batchData, platform: p })} className={`px-3 py-2.5 text-sm border ${batchData.platform === p ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Format</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['post', 'carousel', 'thread', 'newsletter'].map(f => (
                      <button key={f} onClick={() => setBatchData({ ...batchData, format: f })} className={`px-3 py-2.5 text-sm border ${batchData.format === f ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(0)} className="px-4 py-2 font-sans text-sm text-stone-600">Back</button>
                <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-stone-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Step 3</div>
              <div className="font-display text-2xl font-light text-stone-900 mb-5">Which week?</div>
              <div className="space-y-4 mb-6">
                <Field label="Batch name (optional)">
                  <Input value={batchData.name} onChange={v => setBatchData({ ...batchData, name: v })} placeholder="e.g. Week of June 5 - Jazz partnership stories" />
                </Field>
                <Field label="Week starting (Monday)">
                  <input type="date" value={batchData.weekOf} onChange={e => setBatchData({ ...batchData, weekOf: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-300 font-sans" />
                </Field>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-4 py-2 font-sans text-sm text-stone-600">Back</button>
                <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
                  Generate week <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-stone-950 text-stone-50 p-10 text-center">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <div className="font-display text-3xl font-light mb-3">Ready to generate</div>
              <div className="font-sans text-sm text-stone-300 max-w-lg mx-auto mb-8">
                The AI will produce 3 fully-written posts — Pain Monday, News Wednesday, Prize Friday — using your stories, voice, and audience. About 30 seconds.
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-stone-700 font-sans text-sm">Back</button>
                <button onClick={generateBatch} disabled={generating} className="px-7 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm hover:bg-stone-200 disabled:opacity-30 inline-flex items-center gap-2">
                  {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Producing your week...</> : <><Zap className="w-4 h-4" /> Generate batch</>}
                </button>
              </div>
            </div>
          )}

          {step === 4 && batchData.generated && (
            <div className="space-y-6 animate-slideIn">
              <div className="bg-amber-50 border border-amber-200 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-1">Week Theme</div>
                <div className="font-display text-xl text-stone-900 italic">"{batchData.generated.weekTheme}"</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchData.generated.posts.map((post, i) => {
                  const colors = { pain: 'border-l-red-700', news: 'border-l-amber-700', prize: 'border-l-emerald-700' };
                  return (
                    <div key={i} className={`bg-white border border-stone-200 border-l-4 ${colors[post.type]} p-5`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{post.day}</div>
                        <Pill color={post.type === 'pain' ? 'red' : post.type === 'prize' ? 'green' : 'amber'}>{post.type}</Pill>
                      </div>
                      <div className="font-display text-base font-medium text-stone-900 mb-3 leading-snug">{post.hook}</div>
                      <div className="font-sans text-xs text-stone-600 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-6">{post.body}</div>
                      <div className="border-t border-stone-200 pt-3 font-sans text-xs text-stone-500 italic">{post.cta}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between bg-white border border-stone-200 p-5">
                <button onClick={() => setStep(3)} className="px-4 py-2 font-sans text-sm text-stone-600">Regenerate</button>
                <button onClick={saveAndSchedule} className="px-7 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Save & schedule the week
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'history' && (
        <div>
          {batches.length === 0 ? (
            <EmptyState 
              icon={Repeat} 
              title="No batches yet" 
              description="Build your first batched week using the New Batch tab."
              action={
                <button onClick={() => setView('new')} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm">
                  Start a batch
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {batches.map(b => (
                <div key={b.id} className="bg-white border border-stone-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">
                        Week of {new Date(b.weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="font-display text-2xl font-light text-stone-900">{b.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Pill color="blue">{b.platform}</Pill>
                      <Pill>{b.format}</Pill>
                      <button onClick={async () => { if (await window.brandConfirm('Delete this batch? Scheduled posts stay; only the batch record is removed.')) saveBatches(batches.filter(x => x.id !== b.id)); }} className="p-1.5 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  {b.theme && <div className="font-sans text-sm text-stone-600 italic mb-3">Theme: "{b.theme}"</div>}
                  <div className="font-sans text-xs text-stone-500">{b.pieceIds?.length || 3} posts scheduled</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============= FUNNEL BUILDER =============
function FunnelBuilder({ funnels, saveFunnels, profile }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const templates = [
    {
      id: 'newsletter',
      name: 'Newsletter Funnel',
      description: 'Convert content readers into newsletter subscribers, then customers.',
      stages: [
        { name: 'Short-form posts', desc: 'LinkedIn/X posts that build attention', icon: 'Sparkles' },
        { name: 'Long-form piece', desc: 'A weekly newsletter / process post', icon: 'FileText' },
        { name: 'Newsletter signup', desc: 'Free opt-in via lead magnet', icon: 'Send' },
        { name: 'DM conversation', desc: 'Reply to engaged subscribers', icon: 'MessageSquare' },
        { name: 'Discovery call', desc: 'Qualified lead → meeting', icon: 'Trophy' }
      ]
    },
    {
      id: 'webinar',
      name: 'Webinar/Event Funnel',
      description: 'Attract → educate at scale → convert to clients.',
      stages: [
        { name: 'Pain post that promises a fix', desc: 'Build curiosity', icon: 'AlertCircle' },
        { name: 'Webinar registration', desc: 'Free 60-min training', icon: 'CalendarDays' },
        { name: 'Live workshop', desc: 'Teach + softly pitch', icon: 'Mic' },
        { name: 'Post-event email', desc: 'Replay + offer', icon: 'Send' },
        { name: 'Booked call', desc: 'Convert to client', icon: 'Trophy' }
      ]
    },
    {
      id: 'lowtouch',
      name: 'Low-touch Product Funnel',
      description: 'For courses, ebooks, templates — sells while you sleep.',
      stages: [
        { name: 'Educational thread/post', desc: 'Demonstrate expertise', icon: 'Sparkles' },
        { name: 'Pinned tweet/post w/ link', desc: 'Free → paid bridge', icon: 'Anchor' },
        { name: 'Lead magnet opt-in', desc: 'Sample or guide', icon: 'Send' },
        { name: 'Email sequence', desc: '5-7 emails to product', icon: 'MessageSquare' },
        { name: 'Self-serve purchase', desc: 'Stripe checkout', icon: 'Trophy' }
      ]
    }
  ];

  const useTemplate = (t) => {
    const newFunnel = {
      id: Date.now(),
      name: t.name,
      description: t.description,
      stages: t.stages.map(s => ({ ...s, contentLinks: [], conversion: 0 })),
      createdAt: new Date().toISOString()
    };
    saveFunnels([newFunnel, ...funnels]);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Step Three · Distribution"
        title="Funnel Builder"
        description="The path from stranger → engaged reader → conversation → client. Map each stage so attention turns into outcomes."
        action={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Custom funnel
          </button>
        }
      />

      {/* Templates */}
      {funnels.length === 0 && (
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Start with a template</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="bg-white border border-stone-200 p-6 hover:border-stone-900 transition-all">
                <div className="font-display text-xl font-medium text-stone-900 mb-2">{t.name}</div>
                <div className="font-sans text-sm text-stone-600 mb-4 leading-relaxed">{t.description}</div>
                <div className="space-y-1.5 mb-5">
                  {t.stages.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 font-sans text-xs text-stone-700">
                      <span className="font-mono text-stone-400">{i+1}.</span>
                      {s.name}
                    </div>
                  ))}
                </div>
                <button onClick={() => useTemplate(t)} className="w-full px-4 py-2 bg-stone-900 text-stone-50 font-sans text-sm">
                  Use this template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <FunnelForm
          funnel={editing}
          onSave={(f) => {
            if (f.id) saveFunnels(funnels.map(x => x.id === f.id ? f : x));
            else saveFunnels([{ ...f, id: Date.now() }, ...funnels]);
            setShowForm(false);
            setEditing(null);
          }}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      <div className="space-y-4">
        {funnels.map(funnel => (
          <FunnelCard 
            key={funnel.id}
            funnel={funnel}
            onEdit={() => { setEditing(funnel); setShowForm(true); }}
            onDelete={async () => { if (await window.brandConfirm('Delete this funnel? This cannot be undone.')) saveFunnels(funnels.filter(f => f.id !== funnel.id)); }}
          />
        ))}
      </div>
    </div>
  );
}

function FunnelCard({ funnel, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-stone-200 p-7">
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="font-display text-2xl font-light text-stone-900">{funnel.name}</div>
          <div className="font-sans text-sm text-stone-600 mt-1">{funnel.description}</div>
        </div>
        <div className="flex gap-2">
          <button aria-label="Edit" onClick={onEdit} className="p-2 hover:bg-stone-100"><Edit3 className="w-4 h-4 text-stone-600" /></button>
          <button aria-label="Delete" onClick={onDelete} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${funnel.stages.length}, 1fr)` }}>
        {funnel.stages.map((stage, i) => (
          <div key={i} className="relative">
            <div className="bg-stone-50 border border-stone-200 p-4 h-full">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">Stage {i+1}</div>
              <div className="font-medium text-sm text-stone-900 mb-1.5">{stage.name}</div>
              <div className="font-sans text-xs text-stone-600 leading-relaxed">{stage.desc}</div>
            </div>
            {i < funnel.stages.length - 1 && (
              <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 z-10 bg-white" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelForm({ funnel, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [f, setF] = useState(funnel || { name: '', description: '', stages: [{ name: '', desc: '' }] });
  return (
    <div className="bg-stone-950 text-stone-50 p-8 mb-6 animate-slideIn">
      <div className="flex justify-between items-center mb-6">
        <div className="font-display text-3xl font-light">{f.id ? 'Edit funnel' : 'New funnel'}</div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>
      <div className="space-y-4 mb-6">
        <Field label="Name">
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <Field label="Description">
          <textarea rows={2} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Stages</div>
            <button onClick={() => setF({ ...f, stages: [...f.stages, { name: '', desc: '' }] })} className="font-sans text-xs text-stone-300 hover:text-stone-50 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add stage
            </button>
          </div>
          <div className="space-y-2">
            {f.stages.map((stage, i) => (
              <div key={i} className="flex gap-2">
                <div className="font-mono text-xs text-stone-500 mt-2 w-6">{i+1}.</div>
                <input value={stage.name} onChange={e => { const s = [...f.stages]; s[i].name = e.target.value; setF({ ...f, stages: s }); }} placeholder="Stage name" className="flex-1 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
                <input value={stage.desc} onChange={e => { const s = [...f.stages]; s[i].desc = e.target.value; setF({ ...f, stages: s }); }} placeholder="Description" className="flex-1 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
                <button onClick={() => setF({ ...f, stages: f.stages.filter((_, j) => j !== i) })} className="p-2 hover:bg-stone-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400">Cancel</button>
        <button onClick={() => onSave(f)} disabled={!f.name} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}

// ============= CONTENT CALENDAR =============
function ContentCalendar({ calendar, saveCalendar, contentPieces, saveContent, analytics, saveAnalytics }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));

  const getDayInfo = (date) => {
    if (!date) return null;
    const key = date.toISOString().split('T')[0];
    const day = date.getDay();
    const isPosted = analytics[key]?.posted;
    const piece = calendar[key] ? contentPieces.find(p => p.id === calendar[key]) : null;
    const slot = day === 1 ? 'pain' : day === 3 ? 'news' : day === 5 ? 'prize' : null;
    return { key, isPosted, piece, slot };
  };

  const assignToDate = (pieceId) => {
    if (!selectedDate) return;
    saveCalendar({ ...calendar, [selectedDate]: pieceId });
    setShowAssign(false);
    setSelectedDate(null);
  };

  const markPosted = (key) => {
    const piece = contentPieces.find(p => p.id === calendar[key]);
    saveAnalytics({
      ...analytics,
      [key]: { 
        ...analytics[key], 
        posted: true, 
        postedAt: new Date().toISOString(),
        pieceId: calendar[key],
        type: piece?.type,
        platform: piece?.platform,
        impressions: 0, likes: 0, comments: 0, dms: 0, shares: 0
      }
    });
  };

  const upcomingScheduled = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return Object.entries(calendar)
      .filter(([k]) => k >= today)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 5)
      .map(([k, pieceId]) => {
        const piece = contentPieces.find(p => p.id === pieceId);
        return { date: k, piece };
      })
      .filter(x => x.piece);
  }, [calendar, contentPieces]);

  const draftPieces = contentPieces.filter(p => !Object.values(calendar).includes(p.id));

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Distribution · Content Calendar"
        title="The Cadence"
        description="Mondays = Pain · Wednesdays = News · Fridays = Prize. Click any day to schedule from your library."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="This month scheduled" value={Object.keys(calendar).filter(k => k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length} icon={CalendarDays} />
        <StatCard label="Drafts ready to schedule" value={draftPieces.length} icon={Layers} />
        <StatCard label="Posted this month" value={Object.entries(analytics).filter(([k, v]) => v.posted && k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length} icon={Check} />
        <StatCard label="Streak" value={getStreak(analytics)} hint="consecutive posting days" icon={Flame} />
      </div>

      {/* Upcoming */}
      {upcomingScheduled.length > 0 && (
        <div className="bg-white border border-stone-200 p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">Up Next</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {upcomingScheduled.map(({ date, piece }) => (
              <div key={date} className="border border-stone-200 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <Pill color={piece.type === 'pain' ? 'red' : piece.type === 'prize' ? 'green' : 'amber'}>{piece.type}</Pill>
                <div className="text-sm text-stone-900 leading-snug mt-2 line-clamp-3">{piece.hook}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar header */}
      <div className="bg-white border border-stone-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-3xl font-light text-stone-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-stone-100"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 font-sans text-xs hover:bg-stone-100">Today</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-stone-100"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="font-mono text-[10px] uppercase tracking-wider text-stone-500 p-2 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            const info = getDayInfo(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isPast = date && date < new Date(new Date().setHours(0,0,0,0));
            
            if (!date) return <div key={i} className="aspect-square" />;
            
            return (
              <button
                key={i}
                onClick={() => { setSelectedDate(info.key); setShowAssign(true); }}
                className={`aspect-square p-2 border text-left transition-all relative overflow-hidden ${
                  isToday ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200 hover:border-stone-400'
                } ${info.isPosted ? 'bg-stone-900 text-stone-50' : info.piece ? 'bg-stone-50' : isPast ? 'bg-stone-50/50' : 'bg-white'}`}
              >
                <div className={`font-mono text-xs ${isToday ? 'font-bold' : ''} ${info.isPosted ? 'text-stone-400' : 'text-stone-600'}`}>
                  {date.getDate()}
                </div>
                {info.slot && !info.piece && !info.isPosted && (
                  <div className={`absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ${
                    info.slot === 'pain' ? 'bg-red-400' : info.slot === 'prize' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                )}
                {info.piece && (
                  <div className="mt-1">
                    <div className={`text-[10px] line-clamp-2 leading-tight ${info.isPosted ? 'text-stone-300' : 'text-stone-700'}`}>
                      {info.piece.hook?.slice(0, 50)}
                    </div>
                    {info.isPosted && <Check className="w-3 h-3 mt-1 text-emerald-400" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assign modal */}
      {showAssign && selectedDate && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowAssign(false)}>
          <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Schedule for</div>
                  <div className="font-display text-2xl font-light">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button onClick={() => setShowAssign(false)}><X className="w-5 h-5" /></button>
              </div>
            </div>

            {calendar[selectedDate] && (
              <div className="p-6 border-b border-stone-200 bg-stone-50">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">Currently scheduled</div>
                <div className="font-display text-base text-stone-900 mb-3">{contentPieces.find(p => p.id === calendar[selectedDate])?.hook}</div>
                <div className="flex gap-2">
                  {!analytics[selectedDate]?.posted && (
                    <button onClick={() => markPosted(selectedDate)} className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-xs">
                      Mark as posted
                    </button>
                  )}
                  <button onClick={() => { 
                    const newCal = { ...calendar }; 
                    delete newCal[selectedDate]; 
                    saveCalendar(newCal); 
                    setShowAssign(false); 
                  }} className="px-4 py-2 border border-stone-300 font-sans text-xs">
                    Unschedule
                  </button>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">
                Pick from drafts ({draftPieces.length})
              </div>
              {draftPieces.length === 0 ? (
                <div className="text-sm text-stone-500 italic font-sans py-4">No unscheduled drafts. Generate content first.</div>
              ) : (
                <div className="space-y-2">
                  {draftPieces.map(p => (
                    <button key={p.id} onClick={() => assignToDate(p.id)} className="w-full text-left p-4 border border-stone-200 hover:border-stone-900 hover:bg-stone-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill color={p.type === 'pain' ? 'red' : p.type === 'prize' ? 'green' : 'amber'}>{p.type}</Pill>
                        {p.platform && <Pill color="blue">{p.platform}</Pill>}
                      </div>
                      <div className="font-display text-base font-medium text-stone-900 line-clamp-2">{p.hook}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStreak(analytics) {
  const sorted = Object.entries(analytics)
    .filter(([_, v]) => v.posted)
    .map(([k]) => k)
    .sort()
    .reverse();
  if (sorted.length === 0) return 0;
  let streak = 0;
  let checkDate = new Date();
  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    const diffDays = Math.floor((checkDate - date) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) {
      streak++;
      checkDate = date;
    } else break;
  }
  return streak;
}

// ============= ANALYTICS =============
function Analytics({ analytics, saveAnalytics, contentPieces, stories, calendar, profile }) {
  const [editingPost, setEditingPost] = useState(null);
  const [view, setView] = useState('overview'); // overview | posts | insights
  const [timeframe, setTimeframe] = useState('30d');

  const stats = useMemo(() => {
    const cutoff = new Date();
    if (timeframe === '7d') cutoff.setDate(cutoff.getDate() - 7);
    if (timeframe === '30d') cutoff.setDate(cutoff.getDate() - 30);
    if (timeframe === '90d') cutoff.setDate(cutoff.getDate() - 90);
    if (timeframe === 'all') cutoff.setFullYear(2000);
    
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const inWindow = Object.entries(analytics)
      .filter(([k, v]) => v.posted && k >= cutoffStr)
      .map(([k, v]) => ({ ...v, date: k }));
    
    const totalImpressions = inWindow.reduce((s, x) => s + (x.impressions || 0), 0);
    const totalLikes = inWindow.reduce((s, x) => s + (x.likes || 0), 0);
    const totalComments = inWindow.reduce((s, x) => s + (x.comments || 0), 0);
    const totalDMs = inWindow.reduce((s, x) => s + (x.dms || 0), 0);
    const totalShares = inWindow.reduce((s, x) => s + (x.shares || 0), 0);
    const totalEngagements = totalLikes + totalComments + totalShares;
    const engagementRate = totalImpressions > 0 ? ((totalEngagements / totalImpressions) * 100).toFixed(2) : 0;
    
    // By type
    const byType = { pain: { posts: 0, eng: 0, imp: 0 }, prize: { posts: 0, eng: 0, imp: 0 }, news: { posts: 0, eng: 0, imp: 0 } };
    inWindow.forEach(x => {
      if (byType[x.type]) {
        byType[x.type].posts++;
        byType[x.type].eng += (x.likes || 0) + (x.comments || 0) + (x.shares || 0);
        byType[x.type].imp += x.impressions || 0;
      }
    });
    
    // By platform
    const byPlatform = {};
    inWindow.forEach(x => {
      if (!byPlatform[x.platform]) byPlatform[x.platform] = { posts: 0, eng: 0, imp: 0 };
      byPlatform[x.platform].posts++;
      byPlatform[x.platform].eng += (x.likes || 0) + (x.comments || 0) + (x.shares || 0);
      byPlatform[x.platform].imp += x.impressions || 0;
    });

    return { 
      totalPosts: inWindow.length, 
      totalImpressions, totalLikes, totalComments, totalDMs, totalShares, 
      totalEngagements, engagementRate, byType, byPlatform, 
      posts: inWindow.sort((a, b) => b.date.localeCompare(a.date))
    };
  }, [analytics, timeframe]);

  const topPosts = useMemo(() => {
    return stats.posts
      .map(p => ({ ...p, piece: contentPieces.find(c => c.id === p.pieceId) }))
      .filter(p => p.piece)
      .sort((a, b) => ((b.likes || 0) + (b.comments || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.comments || 0) + (a.shares || 0)))
      .slice(0, 10);
  }, [stats, contentPieces]);

  const topStories = useMemo(() => {
    const byStory = {};
    stats.posts.forEach(p => {
      const piece = contentPieces.find(c => c.id === p.pieceId);
      if (piece?.storyId) {
        if (!byStory[piece.storyId]) byStory[piece.storyId] = { posts: 0, eng: 0, imp: 0 };
        byStory[piece.storyId].posts++;
        byStory[piece.storyId].eng += (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
        byStory[piece.storyId].imp += p.impressions || 0;
      }
    });
    return Object.entries(byStory)
      .map(([sid, data]) => ({ story: stories.find(s => s.id === parseInt(sid)), ...data }))
      .filter(x => x.story)
      .sort((a, b) => b.eng - a.eng)
      .slice(0, 5);
  }, [stats.posts, contentPieces, stories]);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Distribution · Analytics"
        title="What's actually working"
        description="Per-post performance, top stories, and patterns. The signal in the noise."
      />

      {/* Timeframe selector */}
      <div className="flex items-center gap-2 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mr-2">Timeframe</span>
        {[
          { v: '7d', l: '7 days' },
          { v: '30d', l: '30 days' },
          { v: '90d', l: '90 days' },
          { v: 'all', l: 'All time' }
        ].map(t => (
          <button key={t.v} onClick={() => setTimeframe(t.v)} className={`px-3 py-1.5 font-sans text-xs border ${timeframe === t.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="border-b border-stone-200 mb-6">
        <div className="flex gap-8">
          {[
            { v: 'overview', label: 'Overview', icon: BarChart3 },
            { v: 'posts', label: `Posts (${stats.totalPosts})`, icon: Layers },
            { v: 'insights', label: 'Insights', icon: Lightbulb }
          ].map(t => (
            <button key={t.v} onClick={() => setView(t.v)} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === t.v ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'overview' && (
        <div className="space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Posts" value={stats.totalPosts} icon={Sparkles} />
            <StatCard label="Impressions" value={stats.totalImpressions > 1000 ? `${(stats.totalImpressions/1000).toFixed(1)}k` : stats.totalImpressions} icon={Eye} />
            <StatCard label="Likes" value={stats.totalLikes} icon={Heart} />
            <StatCard label="Comments" value={stats.totalComments} icon={MessageSquare} />
            <StatCard label="DMs" value={stats.totalDMs} icon={Send} hint="Inbound" />
            <StatCard label="Eng. Rate" value={`${stats.engagementRate}%`} icon={Activity} />
          </div>

          {/* By type */}
          <div className="bg-white border border-stone-200 p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">Performance by Angle</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { k: 'pain', label: 'Pain', color: 'red' },
                { k: 'news', label: 'News', color: 'amber' },
                { k: 'prize', label: 'Prize', color: 'emerald' }
              ].map(t => {
                const d = stats.byType[t.k];
                const avgEng = d.posts > 0 ? Math.round(d.eng / d.posts) : 0;
                return (
                  <div key={t.k} className={`border-l-4 ${t.color === 'red' ? 'border-red-700' : t.color === 'amber' ? 'border-amber-700' : 'border-emerald-700'} bg-stone-50 p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-display text-2xl font-light text-stone-900">{t.label}</div>
                      <Pill color={t.color === 'emerald' ? 'green' : t.color}>{d.posts} posts</Pill>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-stone-400">Total Eng</div>
                        <div className="font-display text-2xl text-stone-900">{d.eng}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase text-stone-400">Avg/Post</div>
                        <div className="font-display text-2xl text-stone-900">{avgEng}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top posts */}
          {topPosts.length > 0 && (
            <div className="bg-white border border-stone-200 p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Top Performing Posts</div>
                <button onClick={() => setView('posts')} className="font-sans text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {topPosts.slice(0, 5).map((post, i) => (
                  <div key={post.date} className="border-l-2 border-stone-300 pl-4 py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-stone-400">#{i+1}</span>
                      <Pill color={post.type === 'pain' ? 'red' : post.type === 'prize' ? 'green' : 'amber'}>{post.type}</Pill>
                      <span className="font-mono text-[10px] text-stone-500">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-stone-900 line-clamp-2 mb-1">{post.piece?.hook}</div>
                    <div className="flex gap-4 font-mono text-[10px] text-stone-500">
                      <span>{post.impressions || 0} impressions</span>
                      <span>{post.likes || 0} likes</span>
                      <span>{post.comments || 0} comments</span>
                      <span>{post.dms || 0} DMs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top stories */}
          {topStories.length > 0 && (
            <div className="bg-white border border-stone-200 p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">Best Performing Source Stories</div>
              <div className="space-y-3">
                {topStories.map((s, i) => (
                  <div key={s.story.id} className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200">
                    <span className="font-mono text-xs text-stone-400 w-6">#{i+1}</span>
                    <div className="flex-1">
                      <div className="text-sm text-stone-900 font-medium">{s.story.title}</div>
                      <div className="font-sans text-xs text-stone-500 italic mt-0.5">→ {s.story.lesson}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl text-stone-900">{s.eng}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{s.posts} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'posts' && (
        <div className="space-y-3">
          {stats.posts.length === 0 ? (
            <EmptyState icon={BarChart3} title="No posted content yet" description="Once you mark posts as 'posted' in the calendar, they appear here for tracking." />
          ) : stats.posts.map(post => {
            const piece = contentPieces.find(c => c.id === post.pieceId);
            if (!piece) return null;
            const isEditing = editingPost === post.date;
            return (
              <div key={post.date} className="bg-white border border-stone-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Pill color={post.type === 'pain' ? 'red' : post.type === 'prize' ? 'green' : 'amber'}>{post.type}</Pill>
                      {post.platform && <Pill color="blue">{post.platform}</Pill>}
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                        {new Date(post.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-display text-base font-medium text-stone-900 line-clamp-2">{piece.hook}</div>
                  </div>
                  <button onClick={() => setEditingPost(isEditing ? null : post.date)} className="font-sans text-xs text-stone-700">
                    {isEditing ? 'Done' : 'Update metrics'}
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-stone-200">
                    {['impressions', 'likes', 'comments', 'shares', 'dms'].map(metric => (
                      <div key={metric}>
                        <div className="font-mono text-[10px] uppercase text-stone-500 mb-1">{metric}</div>
                        <input 
                          type="number" 
                          value={post[metric] || 0} 
                          onChange={e => saveAnalytics({ ...analytics, [post.date]: { ...analytics[post.date], [metric]: parseInt(e.target.value) || 0 } })}
                          className="w-full px-2 py-1.5 border border-stone-300 font-sans text-sm"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-3 border-t border-stone-200">
                    <div>
                      <div className="font-mono text-[10px] uppercase text-stone-400">Impressions</div>
                      <div className="font-display text-xl text-stone-900">{post.impressions || 0}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase text-stone-400">Likes</div>
                      <div className="font-display text-xl text-stone-900">{post.likes || 0}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase text-stone-400">Comments</div>
                      <div className="font-display text-xl text-stone-900">{post.comments || 0}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase text-stone-400">Shares</div>
                      <div className="font-display text-xl text-stone-900">{post.shares || 0}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase text-stone-400">DMs</div>
                      <div className="font-display text-xl text-stone-900">{post.dms || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {view === 'insights' && (
        <div className="space-y-4">
          {stats.totalPosts < 5 ? (
            <EmptyState icon={Lightbulb} title="Need more data" description="Once you've posted 5+ pieces, AI insights will surface here showing what's working and why." />
          ) : (
            <>
              <div className="bg-stone-950 text-stone-50 p-7 grain relative">
                <div className="relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Pattern</div>
                  <div className="font-display text-2xl font-light mb-3">Your best-performing angle</div>
                  <div className="font-display text-5xl font-light mb-2 capitalize">
                    {Object.entries(stats.byType).sort(([_,a], [__,b]) => (b.eng/Math.max(b.posts,1)) - (a.eng/Math.max(a.posts,1)))[0]?.[0] || '—'}
                  </div>
                  <div className="font-sans text-sm text-stone-300">
                    Highest average engagement per post in the last {timeframe === 'all' ? 'all time' : timeframe}.
                  </div>
                </div>
              </div>

              <div className="bg-white border border-stone-200 p-7">
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Recommendations</div>
                <ul className="space-y-3">
                  {Object.entries(stats.byType)
                    .filter(([k, v]) => v.posts > 0)
                    .sort(([_,a], [__,b]) => (b.eng/Math.max(b.posts,1)) - (a.eng/Math.max(a.posts,1)))
                    .slice(0, 1)
                    .map(([k, v]) => (
                      <li key={k} className="flex gap-3 text-sm text-stone-700 font-sans">
                        <span className="text-emerald-600">▲</span>
                        <span>Lean into more <strong className="capitalize">{k}</strong> posts — they're earning {Math.round(v.eng/v.posts)} eng/post on average.</span>
                      </li>
                    ))
                  }
                  {topStories[0] && (
                    <li className="flex gap-3 text-sm text-stone-700 font-sans">
                      <span className="text-amber-600">●</span>
                      <span>"<strong>{topStories[0].story.title}</strong>" is your top-performing source story. Mine it for more angles.</span>
                    </li>
                  )}
                  {stats.engagementRate > 5 && (
                    <li className="flex gap-3 text-sm text-stone-700 font-sans">
                      <span className="text-emerald-600">▲</span>
                      <span>Your engagement rate ({stats.engagementRate}%) is above average for B2B. Keep the cadence.</span>
                    </li>
                  )}
                  {stats.totalDMs > stats.totalPosts && (
                    <li className="flex gap-3 text-sm text-stone-700 font-sans">
                      <span className="text-emerald-600">▲</span>
                      <span>You're getting more DMs than posts. The CTAs are landing — now focus on the conversations that convert.</span>
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============= AI COACH =============
function AICoach({ profile, stories, saveStories }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [extractedStory, setExtractedStory] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const welcomeMessage = {
    role: 'assistant',
    content: `Hey ${firstNameOf(profile)}. I'm your story coach.

We're going to mine one story from your last 60 days. Here's how this works:

1. I'll ask you questions like Steven Bartlett would on Diary of a CEO
2. We dig until we find the lesson
3. I write it up as a clean story for your vault

Let's start: Open your phone, go to Photos, scroll back to the last 30 days. **What's one moment that stands out — good, bad, weird, anything?** Don't overthink. Just tell me what happened.`
  };

  // Restore the in-progress session from storage so navigating away doesn't lose work.
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    (async () => {
      try {
        if (typeof window !== 'undefined' && window.storage) {
          const r = await window.storage.get('coachSession');
          if (r?.value) {
            const saved = JSON.parse(r.value);
            if (Array.isArray(saved?.messages) && saved.messages.length > 0) {
              setMessages(saved.messages);
              setLoaded(true);
              return;
            }
          }
        }
      } catch {}
      setMessages([welcomeMessage]);
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages whenever they change (debounced via React batching).
  useEffect(() => {
    if (!loaded || messages.length === 0) return;
    if (typeof window === 'undefined' || !window.storage) return;
    window.storage.set('coachSession', JSON.stringify({ messages, updatedAt: Date.now() }));
  }, [messages, loaded]);

  const resetSession = async () => {
    if (typeof window === 'undefined') return;
    if (!(await window.brandConfirm('Start a new coaching session? The current conversation will be cleared.'))) return;
    setMessages([welcomeMessage]);
    setExtractedStory(null);
    if (window.storage) window.storage.set('coachSession', JSON.stringify({ messages: [welcomeMessage], updatedAt: Date.now() }));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setThinking(true);

    const systemPrompt = `You're a personal branding story coach for ${profile.name}.

Their context:
- Title: ${profile.title}
- Voice: ${profile.voice}, ${profile.tone?.join(', ')}
- Audience: ${profile.audiences?.join(', ')}
- Pains they address: ${profile.pains?.join(', ')}
- Their existing stories: ${stories.slice(0, 3).map(s => s.title).join('; ') || 'none yet'}

You're like Steven Bartlett interviewing them — make them realize the story themselves. Ask one good question at a time. Make them go deeper. Find the universal lesson.

When you have enough material (after 4-6 exchanges), say "I think we have a story here" and produce it as JSON inside <story> tags like this:
<story>{"title":"...", "category":"pain|prize|news", "month":"Sep 2025", "emotion":"...", "context":"...", "lesson":"..."}</story>

Otherwise just keep asking great questions. Be human, warm, but sharp. Push them. Don't accept surface answers.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          model: "claude-sonnet-4-20250514", 
          max_tokens: 1500, 
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      
      const storyMatch = text.match(/<story>([\s\S]+?)<\/story>/);
      let cleanText = text;
      if (storyMatch) {
        try {
          const story = JSON.parse(storyMatch[1]);
          setExtractedStory(story);
          cleanText = text.replace(/<story>[\s\S]+?<\/story>/, '').trim();
        } catch (e) {}
      }
      
      setMessages([...newMessages, { role: 'assistant', content: cleanText }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Connection issue. Try again?' }]);
    }
    setThinking(false);
  };

  const saveExtracted = () => {
    saveStories([{ ...extractedStory, id: Date.now(), createdAt: new Date().toISOString() }, ...stories]);
    setExtractedStory(null);
    setMessages([...messages, { role: 'assistant', content: '✓ Saved to your Story Vault. Ready for the next one — what else from the last 30 days?' }]);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-5xl">
      <SectionHeader
        kicker="Source Material · AI Coach"
        title="Story Coach"
        description="Conversational story extraction. Like sitting across from a host who keeps asking 'and then what?'"
        action={
          messages.length > 1 ? (
            <button
              onClick={resetSession}
              className="px-4 py-2 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center gap-2 text-stone-700"
            >
              <Repeat className="w-4 h-4" /> New session
            </button>
          ) : null
        }
      />

      {messages.length > 1 && (
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 font-sans text-xs text-stone-700 mb-3">
          <span className="font-mono uppercase tracking-wider text-emerald-800 text-[10px]">Auto-saved</span>
          <span className="mx-2 text-stone-400">·</span>
          Pick up where you left off any time — your conversation is preserved across page reloads.
        </div>
      )}

      <div className="bg-white border border-stone-200 h-[70vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-7 space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-stone-200' : 'bg-stone-900'}`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-stone-700" /> : <Brain className="w-4 h-4 text-stone-50" />}
              </div>
              <div className={`flex-1 max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`font-mono text-[10px] uppercase tracking-wider mb-1.5 ${m.role === 'user' ? 'text-stone-500' : 'text-stone-500'}`}>
                  {m.role === 'user' ? firstNameOf(profile) : 'Coach'}
                </div>
                <div className={`whitespace-pre-wrap leading-relaxed font-sans text-sm ${m.role === 'user' ? 'bg-stone-100 text-stone-900 p-4 inline-block text-left' : 'text-stone-800'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-4">
              <div className="w-9 h-9 bg-stone-900 flex items-center justify-center"><Brain className="w-4 h-4 text-stone-50" /></div>
              <div className="flex items-center gap-2 text-stone-500 font-sans text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          
          {extractedStory && (
            <div className="border-2 border-amber-400 bg-amber-50 p-6 animate-slideIn">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800">Story Extracted</div>
              </div>
              <div className="font-display text-xl text-stone-900 mb-2">{extractedStory.title}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3 text-xs font-sans">
                <div><span className="text-stone-500 font-mono uppercase tracking-wider">Cat:</span> {extractedStory.category}</div>
                <div><span className="text-stone-500 font-mono uppercase tracking-wider">When:</span> {extractedStory.month}</div>
                <div><span className="text-stone-500 font-mono uppercase tracking-wider">Felt:</span> {extractedStory.emotion}</div>
              </div>
              {extractedStory.context && (
                <div className="text-sm text-stone-700 mb-3 font-sans leading-relaxed">{extractedStory.context}</div>
              )}
              <div className="bg-white p-3 border border-amber-200 mb-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Lesson</div>
                <div className="text-sm text-stone-900 italic">{extractedStory.lesson}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveExtracted} className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-sm">Save to vault</button>
                <button onClick={() => setExtractedStory(null)} className="px-4 py-2 border border-stone-300 font-sans text-sm">Keep refining</button>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-5 border-t border-stone-200 bg-stone-50">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tell me what happened..."
              className="flex-1 bg-white border border-stone-300 px-4 py-3 outline-none font-sans text-sm"
            />
            <button onClick={send} disabled={!input.trim() || thinking} className="px-5 bg-stone-900 text-stone-50 disabled:opacity-30">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= PROFILE SETTINGS =============
function ProfileSettings({ profile, saveProfile, setShowOnboarding }) {
  const [edited, setEdited] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  const update = (k, v) => setEdited({ ...edited, [k]: v });

  const save = () => {
    saveProfile(edited);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { v: 'identity', label: 'Identity', icon: User },
    { v: 'audience', label: 'Audience & Pains', icon: Crosshair },
    { v: 'voice', label: 'Voice', icon: Mic },
    { v: 'platforms', label: 'Platforms & Goals', icon: Target },
    { v: 'danger', label: 'Reset', icon: AlertCircle }
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-4xl">
      <SectionHeader
        kicker="Foundation · Profile"
        title="Brand Identity"
        description="Your foundation. Edit anytime — every change updates the AI's outputs."
      />

      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setActiveTab(t.v)} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${activeTab === t.v ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-8 space-y-6">
        {activeTab === 'identity' && (
          <>
            <Field label="Name"><Input value={edited.name} onChange={v => update('name', v)} /></Field>
            <Field label="Professional title"><Input value={edited.title} onChange={v => update('title', v)} /></Field>
            <Field label="Location"><Input value={edited.location} onChange={v => update('location', v)} /></Field>
            <ChipInput label="Industries" items={edited.industries || []} setItems={v => update('industries', v)} />
            <ChipInput label="Areas of expertise" items={edited.expertise || []} setItems={v => update('expertise', v)} />
            <Field label="Transformation statement">
              <Textarea rows={4} value={edited.transformation} onChange={v => update('transformation', v)} />
            </Field>
            <Field label="What makes you different">
              <Textarea rows={4} value={edited.differentiators} onChange={v => update('differentiators', v)} />
            </Field>
          </>
        )}

        {activeTab === 'audience' && (
          <>
            <ChipInput label="Audiences" items={edited.audiences || []} setItems={v => update('audiences', v)} />
            <Field label="Ideal reader (one sentence)">
              <Textarea rows={3} value={edited.idealReader} onChange={v => update('idealReader', v)} />
            </Field>
            <ChipInput label="Pains they have" items={edited.pains || []} setItems={v => update('pains', v)} accent="red" />
            <ChipInput label="Prizes they want" items={edited.prizes || []} setItems={v => update('prizes', v)} accent="green" />
          </>
        )}

        {activeTab === 'voice' && (
          <>
            <Field label="Voice archetype">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['analytical', 'storyteller', 'contrarian', 'practitioner', 'professorial', 'wry'].map(v => (
                  <button key={v} onClick={() => update('voice', v)} className={`p-3 text-left border capitalize ${edited.voice === v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </Field>
            <ChipInput label="Tone descriptors" items={edited.tone || []} setItems={v => update('tone', v)} />
            <ChipInput label="Voice taboos (never do these)" items={edited.voiceTaboos || []} setItems={v => update('voiceTaboos', v)} accent="red" />
            <ChipInput label="Competitor voices you respect" items={edited.competitorVoices || []} setItems={v => update('competitorVoices', v)} />
          </>
        )}

        {activeTab === 'platforms' && (
          <>
            <ChipInput label="Platforms you publish on" items={edited.platforms || []} setItems={v => update('platforms', v)} />
            <Field label="Primary platform">
              <Input value={edited.primaryPlatform} onChange={v => update('primaryPlatform', v)} />
            </Field>
            <Field label="Posting cadence">
              <select value={edited.postingCadence} onChange={e => update('postingCadence', e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-300 font-sans">
                <option value="three_per_week">3 per week (Mon/Wed/Fri)</option>
                <option value="daily">Daily</option>
                <option value="multiple_daily">Multiple per day</option>
              </select>
            </Field>
            <Field label="Time available per week">
              <Input value={edited.timeAvailable} onChange={v => update('timeAvailable', v)} />
            </Field>
            <Field label="Primary goal">
              <Textarea rows={3} value={edited.primaryGoal} onChange={v => update('primaryGoal', v)} />
            </Field>
            <ChipInput label="Secondary goals" items={edited.secondaryGoals || []} setItems={v => update('secondaryGoals', v)} />
          </>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-6">
            <RestoreProfileSnapshot saveProfile={saveProfile} />
            <div className="bg-red-50 border border-red-200 p-6">
              <div className="font-display text-xl text-red-900 mb-2">Reset Onboarding</div>
              <div className="font-sans text-sm text-red-800 mb-4">This will walk you through the 10-step setup again. Your stories, content, and analytics will not be deleted.</div>
              <button
                onClick={async () => { if (await window.brandConfirm('Restart onboarding? Your stories and content will be kept.')) setShowOnboarding(true); }}
                className="px-5 py-2.5 bg-red-900 text-red-50 font-sans text-sm"
              >
                Restart onboarding
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'danger' && (
          <div className="flex justify-end pt-6 border-t border-stone-200">
            <button onClick={save} className="px-7 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
              {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============= BRAND DNA LAB =============
// "Understand me first" — deeper than onboarding. Five lenses on the self.
function BrandDNALab({ dna, saveDna, profile, saveProfile }) {
  const [tab, setTab] = useState('origin');
  const [generating, setGenerating] = useState(false);

  const tabs = [
    { v: 'origin', label: 'Origin Moments', icon: Sunrise, desc: 'Three formative experiences' },
    { v: 'values', label: 'Values & Beliefs', icon: HeartHandshake, desc: 'What you stand on' },
    { v: 'archetype', label: 'Brand Archetype', icon: Crown, desc: 'Your character profile' },
    { v: 'voice', label: 'Voice Analysis', icon: Mic, desc: 'AI reads your writing' },
    { v: 'timeline', label: 'Lived Experience', icon: Clock, desc: '5-year career arc' },
    { v: 'manifesto', label: 'Manifesto', icon: Flag, desc: 'Your one-page truth' }
  ];

  const completeness = useMemo(() => {
    let score = 0;
    if (dna.origin?.moments?.length >= 3) score += 17;
    if (dna.values?.core?.length >= 3) score += 17;
    if (dna.archetype?.primary) score += 17;
    if (dna.voice?.fingerprint) score += 17;
    if (dna.timeline?.events?.length >= 5) score += 16;
    if (dna.manifesto?.text) score += 16;
    return score;
  }, [dna]);

  const synthesizeDna = async () => {
    setGenerating(true);
    const prompt = `You are a personal brand archaeologist. Synthesize ${profile.name}'s Brand DNA into a single one-page manifesto.

INPUTS:
Origin moments: ${JSON.stringify(dna.origin?.moments || [])}
Core values: ${JSON.stringify(dna.values?.core || [])}
Beliefs (controversial): ${JSON.stringify(dna.values?.beliefs || [])}
Archetype: ${dna.archetype?.primary || 'undefined'}
Voice fingerprint: ${dna.voice?.fingerprint || 'undefined'}
Timeline events: ${JSON.stringify(dna.timeline?.events || [])}
Profile transformation: ${profile.transformation}
Profile differentiator: ${profile.differentiators}

Return ONLY valid JSON:
{
  "manifesto": "A 200-300 word manifesto written in their voice. First-person. No corporate fluff. Sentences a real human would say out loud. Should answer: who I am, what I've lived through, what I believe, what I'm building, why it matters.",
  "tagline": "A 6-12 word tagline that could go under their LinkedIn headline.",
  "elevatorPitch": "A 30-second elevator pitch (3 sentences max).",
  "differentiationStatement": "One sentence proving they're not just another voice in the space."
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      saveDna({ ...dna, manifesto: { ...parsed, generatedAt: new Date().toISOString() } });
      setTab('manifesto');
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Foundation · Self-Discovery"
        title="Brand DNA Lab"
        description="Before the platform writes a word in your voice, it has to hear who you actually are. Six lenses turn raw self-knowledge into a brand fingerprint the AI can use."
      />

      {/* Completeness hero */}
      <div className="bg-stone-950 text-stone-50 p-10 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">Brand DNA</div>
            <div className="font-display text-7xl font-light leading-none">{completeness}<span className="text-stone-600 text-4xl">%</span></div>
            <div className="font-sans text-sm text-stone-300 mt-3">Decoded</div>
          </div>
          <div className="col-span-2">
            <div className="font-display text-2xl font-light leading-tight mb-3">
              {completeness < 30 && 'Just getting started. Begin with Origin Moments.'}
              {completeness >= 30 && completeness < 70 && 'Coming into focus. Keep going — depth matters.'}
              {completeness >= 70 && completeness < 100 && 'Almost there. One synthesis away from your manifesto.'}
              {completeness === 100 && 'Fully decoded. The AI now writes in your DNA.'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-4">
              {tabs.map((t, i) => {
                const filled = (
                  (i === 0 && dna.origin?.moments?.length >= 3) ||
                  (i === 1 && dna.values?.core?.length >= 3) ||
                  (i === 2 && dna.archetype?.primary) ||
                  (i === 3 && dna.voice?.fingerprint) ||
                  (i === 4 && dna.timeline?.events?.length >= 5) ||
                  (i === 5 && dna.manifesto?.text)
                );
                return (
                  <button key={t.v} onClick={() => setTab(t.v)} className={`p-2 text-left border ${filled ? 'border-amber-400 bg-amber-900/20' : 'border-stone-800 bg-stone-900'} hover:border-stone-600`}>
                    <t.icon className="w-3 h-3 mb-1.5" />
                    <div className="font-mono text-[9px] uppercase tracking-wider text-stone-300">{t.label}</div>
                  </button>
                );
              })}
            </div>
            {completeness >= 70 && !dna.manifesto?.text && (
              <button onClick={synthesizeDna} disabled={generating} className="px-5 py-2.5 bg-amber-500 text-stone-950 font-sans text-sm hover:bg-amber-400 inline-flex items-center gap-2 disabled:opacity-30">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing...</> : <><Sparkles className="w-4 h-4" /> Synthesize my manifesto</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 pb-3 pt-2 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${tab === t.v ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'origin' && <DnaOriginMoments dna={dna} saveDna={saveDna} profile={profile} />}
      {tab === 'values' && <DnaValues dna={dna} saveDna={saveDna} />}
      {tab === 'archetype' && <DnaArchetype dna={dna} saveDna={saveDna} />}
      {tab === 'voice' && <DnaVoice dna={dna} saveDna={saveDna} profile={profile} saveProfile={saveProfile} />}
      {tab === 'timeline' && <DnaTimeline dna={dna} saveDna={saveDna} />}
      {tab === 'manifesto' && <DnaManifesto dna={dna} saveDna={saveDna} onRegenerate={synthesizeDna} generating={generating} />}
    </div>
  );
}

function DnaOriginMoments({ dna, saveDna, profile }) {
  const moments = dna.origin?.moments || [];
  const [draft, setDraft] = useState({ age: '', title: '', description: '', shaped: '' });
  const [editingIdx, setEditingIdx] = useState(null);

  const add = () => {
    if (!draft.title) return;
    const newMoments = editingIdx !== null
      ? moments.map((m, i) => i === editingIdx ? draft : m)
      : [...moments, draft];
    saveDna({ ...dna, origin: { ...(dna.origin || {}), moments: newMoments } });
    setDraft({ age: '', title: '', description: '', shaped: '' });
    setEditingIdx(null);
  };

  const remove = (idx) => saveDna({ ...dna, origin: { ...(dna.origin || {}), moments: moments.filter((_, i) => i !== idx) } });

  const prompts = [
    { age: 'Childhood', q: 'A childhood moment when you first felt like an outsider — or like you saw something others missed.' },
    { age: 'Teen years', q: 'A risk you took as a teenager that nobody around you understood at the time.' },
    { age: 'First job', q: 'The moment in your first real job when you realized "this is not how I want to work."' },
    { age: 'A failure', q: 'A failure that, looking back, set up everything you do now.' },
    { age: 'A mentor moment', q: 'A single sentence someone said to you that you still think about.' },
    { age: 'A turning point', q: 'The day you decided the path you were on was wrong, and what you did next.' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-2">Why this matters</div>
        <div className="font-display text-xl text-stone-900 leading-snug">
          AI has read every book. It hasn't lived a single day. <em>Origin moments</em> are the lived raw material — the experiences only you can speak to.
        </div>
      </div>

      {/* Existing moments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moments.map((m, i) => (
          <div key={i} className="bg-white border border-stone-200 p-6 relative group">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Moment {String(i+1).padStart(2,'0')} · {m.age}</div>
            <div className="font-display text-xl text-stone-900 leading-snug mb-3 font-medium">{m.title}</div>
            <div className="font-sans text-sm text-stone-600 leading-relaxed mb-3">{m.description}</div>
            <div className="border-t border-stone-200 pt-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">How it shaped me</div>
              <div className="font-sans text-sm text-stone-700 italic">{m.shaped}</div>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1">
              <button onClick={() => { setDraft(m); setEditingIdx(i); }} className="p-1.5 hover:bg-stone-100"><Edit3 className="w-3 h-3" /></button>
              <button onClick={() => remove(i)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="bg-stone-50 border-2 border-dashed border-stone-300 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">{editingIdx !== null ? 'Edit moment' : 'New moment'}</div>
          <div className="space-y-3">
            <Input value={draft.age} onChange={v => setDraft({ ...draft, age: v })} placeholder="Era / age (e.g. 'age 19', 'first job')" />
            <Input value={draft.title} onChange={v => setDraft({ ...draft, title: v })} placeholder="One-line title" />
            <Textarea rows={3} value={draft.description} onChange={v => setDraft({ ...draft, description: v })} placeholder="What happened (2-3 sentences)" />
            <Textarea rows={2} value={draft.shaped} onChange={v => setDraft({ ...draft, shaped: v })} placeholder="How it shaped what you do now" />
            <button onClick={add} disabled={!draft.title} className="w-full px-4 py-2 bg-stone-900 text-stone-50 font-sans text-sm disabled:opacity-30">
              {editingIdx !== null ? 'Update moment' : '+ Add moment'}
            </button>
          </div>
        </div>
      </div>

      {/* Prompt bank */}
      {moments.length < 3 && (
        <div className="bg-white border border-stone-200 p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Need a starting point?</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {prompts.map((p, i) => (
              <button key={i} onClick={() => setDraft({ ...draft, age: p.age })} className="text-left p-4 bg-stone-50 border border-stone-200 hover:border-stone-500 transition-all">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">{p.age}</div>
                <div className="font-sans text-sm text-stone-800 leading-relaxed">{p.q}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DnaValues({ dna, saveDna }) {
  const v = dna.values || {};
  const update = (k, val) => saveDna({ ...dna, values: { ...v, [k]: val } });

  const valueBank = [
    'Honesty over comfort', 'Speed over polish', 'Specificity over generality', 'Operators over consultants',
    'Compounding over chasing', 'Ownership over excuses', 'Real customers over vanity metrics',
    'Range over depth', 'Depth over range', 'Boring stability', 'Calculated chaos',
    'Quiet excellence', 'Loud confidence', 'Long timeframes', 'Quick experiments',
    'Direct feedback', 'Generous teaching', 'High standards', 'Forgiving culture',
    'Independence', 'Collaboration', 'Local roots', 'Global reach'
  ];

  const beliefBank = [
    'Most consultants have never shipped anything',
    'Strategy decks are how organizations avoid decisions',
    'BD is more about logistics than persuasion',
    'The "follow your passion" advice ruined a generation',
    'You don\'t need a co-founder to start',
    'Remote-first is overrated for partnerships work',
    'Most "thought leadership" is just resume polish',
    'Equity beats salary if you can wait',
    'Great BD looks boring from the outside'
  ];

  return (
    <div className="space-y-6">
      <div className="bg-stone-100 border-l-4 border-stone-900 p-5">
        <div className="font-display text-lg text-stone-800 leading-snug">
          Values are your <em>defaults under pressure</em>. Beliefs are the contrarian takes you'd defend at dinner.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core values */}
        <div className="bg-white border border-stone-200 p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Core Values</div>
          <div className="font-display text-2xl font-light text-stone-900 mb-1">What you stand on</div>
          <div className="font-sans text-sm text-stone-500 mb-5">Pick or write 3-5. These show up in every post you publish.</div>
          <ChipInput label="Your values" items={v.core || []} setItems={val => update('core', val)} suggestions={valueBank} />
        </div>

        {/* Beliefs */}
        <div className="bg-white border border-stone-200 p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Contrarian Beliefs</div>
          <div className="font-display text-2xl font-light text-stone-900 mb-1">What you'd defend at dinner</div>
          <div className="font-sans text-sm text-stone-500 mb-5">Beliefs that make 30% of your audience uncomfortable. The other 70% follow you because of them.</div>
          <ChipInput label="Your beliefs" items={v.beliefs || []} setItems={val => update('beliefs', val)} suggestions={beliefBank} accent="amber" />
        </div>
      </div>

      <div className="bg-white border border-stone-200 p-7">
        <Field label="Hill you'd die on (the one belief, even if everyone in your industry disagreed)">
          <Textarea rows={3} value={v.hill || ''} onChange={val => update('hill', val)} placeholder="e.g. 'BD is execution, not negotiation. The deal is decided before the table.'" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 p-7">
          <Field label="Things you've stopped believing in the last 3 years">
            <Textarea rows={4} value={v.unlearned || ''} onChange={val => update('unlearned', val)} placeholder="What were you sure of in 2022 that you now think is wrong?" />
          </Field>
        </div>
        <div className="bg-white border border-stone-200 p-7">
          <Field label="What you wish more people in your industry believed">
            <Textarea rows={4} value={v.wish || ''} onChange={val => update('wish', val)} placeholder="The thing you'd put on a billboard." />
          </Field>
        </div>
      </div>
    </div>
  );
}

function DnaArchetype({ dna, saveDna }) {
  const arch = dna.archetype || {};
  const update = (k, val) => saveDna({ ...dna, archetype: { ...arch, [k]: val } });

  const archetypes = [
    { v: 'sage', name: 'The Sage', desc: 'Truth-seeking. Insightful. Trusts knowledge.', who: 'Galloway, Lex Fridman', strength: 'Authority by depth', risk: 'Can become professorial / dry' },
    { v: 'rebel', name: 'The Rebel', desc: 'Status quo killer. Provocative. Allergic to fluff.', who: 'Codie Sanchez, Naval', strength: 'Cuts through noise', risk: 'Can become contrarian for sport' },
    { v: 'magician', name: 'The Magician', desc: 'Pattern matcher. Connects dots others miss. Visionary.', who: 'Sahil Bloom, James Clear', strength: 'Frameworks that stick', risk: 'Can drift into woo' },
    { v: 'hero', name: 'The Hero', desc: 'In the arena. Reports from the field. Action-first.', who: 'Alex Hormozi, Justin Welsh', strength: 'Gritty credibility', risk: 'Can over-flex wins' },
    { v: 'creator', name: 'The Creator', desc: 'Aesthetic-driven. Obsesses over craft. Builds in public.', who: 'Steven Bartlett, Pieter Levels', strength: 'Pulls in audience by taste', risk: 'Can hide behind polish' },
    { v: 'caregiver', name: 'The Caregiver', desc: 'Service-first. Generous teacher. Lifts others.', who: 'Amy Porterfield, Pat Flynn', strength: 'Deep loyalty', risk: 'Can underprice and burn out' },
    { v: 'jester', name: 'The Jester', desc: 'Wit as truth-telling. Disarming. Deeply observant.', who: 'Patrick Collison, Shaan Puri', strength: 'Memorable, shareable', risk: 'Can be dismissed as not-serious' },
    { v: 'explorer', name: 'The Explorer', desc: 'Frontier-curious. Brings back maps. Independent.', who: 'Tim Ferriss, Cal Newport', strength: 'Novelty + breadth', risk: 'Can lack a fixed identity' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-stone-100 border-l-4 border-stone-900 p-5">
        <div className="font-display text-lg text-stone-800 leading-snug">
          Pick the <em>primary</em> archetype people would describe you as, plus a <em>secondary</em> shade. The blend is what makes you you.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {archetypes.map(a => {
          const isPrimary = arch.primary === a.v;
          const isSecondary = arch.secondary === a.v;
          return (
            <div key={a.v} className={`p-5 border transition-all cursor-pointer ${isPrimary ? 'border-stone-900 bg-stone-900 text-stone-50' : isSecondary ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-500'}`}>
              <div className={`font-mono text-[10px] uppercase tracking-[0.2em] mb-2 ${isPrimary ? 'text-stone-400' : 'text-stone-500'}`}>
                {isPrimary ? 'Primary' : isSecondary ? 'Secondary' : 'Pick role'}
              </div>
              <div className="font-display text-xl font-medium leading-tight mb-2">{a.name}</div>
              <div className={`font-sans text-xs leading-relaxed mb-3 ${isPrimary ? 'text-stone-300' : 'text-stone-600'}`}>{a.desc}</div>
              <div className={`font-mono text-[10px] uppercase tracking-wider mb-2 ${isPrimary ? 'text-stone-500' : 'text-stone-400'}`}>Like: {a.who}</div>
              <div className="flex gap-1.5">
                <button onClick={() => update('primary', a.v)} className={`flex-1 px-2 py-1 text-[10px] font-sans border ${isPrimary ? 'bg-amber-400 text-stone-900 border-amber-400' : 'border-stone-300 hover:border-stone-500'}`}>
                  Primary
                </button>
                <button onClick={() => update('secondary', a.v)} className={`flex-1 px-2 py-1 text-[10px] font-sans border ${isSecondary ? 'bg-amber-400 text-stone-900 border-amber-400' : 'border-stone-300 hover:border-stone-500'}`}>
                  Secondary
                </button>
              </div>
              {(isPrimary || isSecondary) && (
                <div className={`mt-3 pt-3 border-t ${isPrimary ? 'border-stone-700' : 'border-amber-200'} space-y-1.5`}>
                  <div className="text-[10px]"><span className="text-emerald-500 font-mono">▲</span> {a.strength}</div>
                  <div className="text-[10px]"><span className="text-red-500 font-mono">▼</span> {a.risk}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {arch.primary && (
        <div className="bg-white border border-stone-200 p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Your archetype mix</div>
          <div className="font-display text-3xl font-light text-stone-900 mb-2">
            {archetypes.find(a => a.v === arch.primary)?.name}
            {arch.secondary && <span className="text-stone-400"> × {archetypes.find(a => a.v === arch.secondary)?.name}</span>}
          </div>
          <Field label="Notes (how this plays out in your work)">
            <Textarea rows={3} value={arch.notes || ''} onChange={val => update('notes', val)} placeholder="e.g. 'Mostly Hero — operator stories from the field — with Sage moments when explaining frameworks.'" />
          </Field>
        </div>
      )}
    </div>
  );
}

function DnaVoice({ dna, saveDna, profile, saveProfile }) {
  const v = dna.voice || {};
  const [samples, setSamples] = useState(v.samples || ['', '', '']);
  const [analyzing, setAnalyzing] = useState(false);

  const updateSample = (i, val) => {
    const next = [...samples];
    next[i] = val;
    setSamples(next);
  };

  const analyze = async () => {
    const validSamples = samples.filter(s => s.trim().length > 50);
    if (validSamples.length < 2) return;
    setAnalyzing(true);
    const prompt = `You're a voice analyst studying ${profile.name}'s natural writing. Extract their voice fingerprint from these samples.

SAMPLES:
${validSamples.map((s, i) => `--- Sample ${i+1} ---\n${s}`).join('\n\n')}

Return ONLY valid JSON:
{
  "fingerprint": "A 2-3 sentence summary of their voice. Specific, not 'professional and direct'.",
  "sentenceLength": "short | medium | long | varied",
  "rhetoricalDevices": ["e.g. parallelism, lists, anaphora, em-dashes, fragments"],
  "vocabularyTier": "elevated | conversational | hybrid",
  "signatureMoves": ["3-5 specific patterns they reach for, with examples in quotes"],
  "absences": ["What is NOT in their writing — buzzwords/cliches they avoid"],
  "emotionalRegister": "Where they live: detached, warm, urgent, contemplative, etc.",
  "punctuationStyle": "How they use punctuation",
  "typicalOpening": "How they tend to open a piece",
  "typicalClosing": "How they tend to close",
  "comparableWriters": ["3 writers their voice is closest to"]
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      saveDna({ ...dna, voice: { ...parsed, samples, analyzedAt: new Date().toISOString() } });
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-1">Why three samples?</div>
        <div className="font-display text-lg text-stone-900 leading-snug">
          One sample is a fluke. Three samples is a fingerprint. The AI uses this to write in your voice — not a generic LinkedIn voice.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {samples.map((s, i) => (
          <div key={i} className="bg-white border border-stone-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Sample {i+1}</div>
            <div className="font-sans text-xs text-stone-500 mb-3">
              {i === 0 && 'A LinkedIn post or email you wrote that landed well.'}
              {i === 1 && 'A Slack/WhatsApp message where you sounded like yourself.'}
              {i === 2 && 'A piece where you were teaching, explaining, or arguing for something.'}
            </div>
            <textarea rows={8} value={s} onChange={e => updateSample(i, e.target.value)} placeholder="Paste the text here..." className="w-full px-3 py-2 bg-stone-50 border border-stone-300 font-sans text-xs leading-relaxed" />
            <div className="font-mono text-[10px] text-stone-400 mt-2">{s.length} chars · {s.split(/\s+/).filter(Boolean).length} words</div>
          </div>
        ))}
      </div>

      <button onClick={analyze} disabled={analyzing || samples.filter(s => s.trim().length > 50).length < 2} className="w-full px-6 py-4 bg-stone-900 text-stone-50 font-sans text-sm disabled:opacity-30 inline-flex items-center justify-center gap-3">
        {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Reading your writing...</> : <><Microscope className="w-5 h-5" /> Analyze my voice</>}
      </button>

      {v.fingerprint && (
        <div className="space-y-4">
          <div className="bg-stone-950 text-stone-50 p-8 grain relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900 opacity-20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Your voice fingerprint</div>
              <div className="font-display text-2xl font-light leading-snug">"{v.fingerprint}"</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Sentence length</div>
              <div className="font-display text-2xl font-light capitalize">{v.sentenceLength}</div>
            </div>
            <div className="bg-white border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Vocabulary tier</div>
              <div className="font-display text-2xl font-light capitalize">{v.vocabularyTier}</div>
            </div>
            <div className="bg-white border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Emotional register</div>
              <div className="font-display text-base capitalize leading-snug">{v.emotionalRegister}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-3">Signature moves</div>
              <ul className="space-y-2">
                {(v.signatureMoves || []).map((m, i) => <li key={i} className="font-sans text-sm text-stone-700 leading-relaxed flex gap-2"><span className="text-emerald-700 font-mono">↳</span>{m}</li>)}
              </ul>
            </div>
            <div className="bg-white border border-stone-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-700 font-semibold mb-3">Absences (what you don't do)</div>
              <ul className="space-y-2">
                {(v.absences || []).map((m, i) => <li key={i} className="font-sans text-sm text-stone-700 leading-relaxed flex gap-2"><span className="text-red-700 font-mono">×</span>{m}</li>)}
              </ul>
            </div>
          </div>

          {v.rhetoricalDevices && (
            <div className="bg-white border border-stone-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">Rhetorical devices you use</div>
              <div className="flex flex-wrap gap-2">
                {v.rhetoricalDevices.map(d => <Pill key={d} color="violet">{d}</Pill>)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Typical opening</div>
              <div className="font-sans text-sm text-stone-700 italic">"{v.typicalOpening}"</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Typical closing</div>
              <div className="font-sans text-sm text-stone-700 italic">"{v.typicalClosing}"</div>
            </div>
          </div>

          {v.comparableWriters && (
            <div className="bg-white border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Voice neighbors</div>
              <div className="flex gap-2 flex-wrap">
                {v.comparableWriters.map(w => <Pill key={w}>{w}</Pill>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DnaTimeline({ dna, saveDna }) {
  const events = dna.timeline?.events || [];
  const [draft, setDraft] = useState({ year: '', label: '', title: '', desc: '', kind: 'chapter' });

  const add = () => {
    if (!draft.title || !draft.year) return;
    const next = [...events, draft].sort((a, b) => a.year - b.year || (a.month || 0) - (b.month || 0));
    saveDna({ ...dna, timeline: { events: next } });
    setDraft({ year: '', label: '', title: '', desc: '', kind: 'chapter' });
  };

  const remove = (i) => saveDna({ ...dna, timeline: { events: events.filter((_, idx) => idx !== i) } });

  const kindStyle = {
    chapter: 'bg-stone-900 text-stone-50',
    win: 'bg-emerald-900 text-emerald-50',
    failure: 'bg-red-900 text-red-50',
    pivot: 'bg-amber-900 text-amber-50',
    learning: 'bg-violet-900 text-violet-50'
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-100 border-l-4 border-stone-900 p-5">
        <div className="font-display text-lg text-stone-800 leading-snug">
          Map the last 5 years as <em>chapters</em>, not a CV. Wins, failures, pivots, hard lessons. This is the spine of your story.
        </div>
      </div>

      {/* Timeline visualization */}
      {events.length > 0 && (
        <div className="bg-white border border-stone-200 p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-6">Your arc</div>
          <div className="relative">
            <div className="absolute left-0 top-4 bottom-4 w-px bg-stone-300" />
            <div className="space-y-6">
              {events.map((e, i) => (
                <div key={i} className="relative pl-8 group">
                  <div className={`absolute left-0 top-2 w-2 h-2 rounded-full ${e.kind === 'win' ? 'bg-emerald-700' : e.kind === 'failure' ? 'bg-red-700' : e.kind === 'pivot' ? 'bg-amber-700' : e.kind === 'learning' ? 'bg-violet-700' : 'bg-stone-700'} -translate-x-[3px]`} />
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{e.year} · {e.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 ${kindStyle[e.kind]}`}>{e.kind}</span>
                      </div>
                      <div className="font-display text-xl text-stone-900 leading-tight font-medium mb-1">{e.title}</div>
                      <div className="font-sans text-sm text-stone-600 leading-relaxed">{e.desc}</div>
                    </div>
                    <button onClick={() => remove(i)} className="p-1.5 hover:bg-red-50 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add event */}
      <div className="bg-stone-950 text-stone-50 p-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Add a chapter</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <input value={draft.year} onChange={e => setDraft({ ...draft, year: e.target.value })} placeholder="Year" type="number" className="bg-stone-900 border border-stone-700 px-3 py-2 font-mono text-sm" />
          <input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Period label" className="col-span-2 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          <select value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value })} className="col-span-2 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            <option value="chapter">Chapter</option>
            <option value="win">Win</option>
            <option value="failure">Failure</option>
            <option value="pivot">Pivot</option>
            <option value="learning">Learning</option>
          </select>
        </div>
        <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="One-line title" className="w-full mb-3 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        <textarea rows={2} value={draft.desc} onChange={e => setDraft({ ...draft, desc: e.target.value })} placeholder="What happened (1-2 sentences)" className="w-full mb-3 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        <button onClick={add} disabled={!draft.title || !draft.year} className="px-5 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30">+ Add to timeline</button>
      </div>
    </div>
  );
}

function DnaManifesto({ dna, saveDna, onRegenerate, generating }) {
  const m = dna.manifesto || {};
  const [edited, setEdited] = useState(m.manifesto || '');
  const update = (k, v) => saveDna({ ...dna, manifesto: { ...m, [k]: v } });

  if (!m.text && !m.manifesto) {
    return (
      <EmptyState
        icon={Flag}
        title="No manifesto yet"
        description="Complete the other DNA tabs first (you need at least 70% completion). Then synthesize the manifesto from the hero card above."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-stone-950 text-stone-50 p-10 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-25 rounded-full blur-3xl" />
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">My manifesto</div>
          <div className="font-display text-2xl font-light leading-relaxed whitespace-pre-wrap">{m.manifesto}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Tagline</div>
          <div className="font-display text-xl font-medium text-stone-900 leading-snug">{m.tagline}</div>
        </div>
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Elevator pitch</div>
          <div className="font-sans text-sm text-stone-700 leading-relaxed">{m.elevatorPitch}</div>
        </div>
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Differentiator</div>
          <div className="font-sans text-sm text-stone-700 leading-relaxed italic">{m.differentiationStatement}</div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-stone-50 border border-stone-200 p-5">
        <div className="font-sans text-xs text-stone-500">
          Generated {m.generatedAt ? new Date(m.generatedAt).toLocaleDateString() : '—'}
        </div>
        <button onClick={onRegenerate} disabled={generating} className="px-5 py-2 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center gap-2 disabled:opacity-30">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Re-synthesizing</> : <><Repeat className="w-4 h-4" /> Re-synthesize from updated DNA</>}
        </button>
      </div>
    </div>
  );
}

// ============= PHOTO MINING RITUAL =============
// The classic ritual: pause-reflect-document, scroll month-by-month for 60 months.
function PhotoMiningRitual({ photoMining, savePhotoMining, stories, saveStories, profile }) {
  const [activeMonth, setActiveMonth] = useState(null);
  const [draft, setDraft] = useState({ note: '', emotion: '', shouldStory: false, storyTitle: '', lesson: '', category: 'pain' });

  const months = useMemo(() => {
    const m = [];
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      m.push({ key, label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), date: d });
    }
    return m;
  }, []);

  const completed = Object.keys(photoMining || {}).length;
  const withStories = Object.values(photoMining || {}).filter(e => e.shouldStory).length;

  const prompts = [
    'Was there a meeting that felt different from the others?',
    'Did you take a photo of a screen, doc, or whiteboard worth remembering?',
    'A trip — work or personal — what stayed with you?',
    'A meal or coffee with someone where the conversation moved something?',
    'A delivery day — a launch, a ship, a sign-off?',
    'A loss, a no, a rejection?',
    'A first time — you did something you\'d never done?',
    'Something funny or absurd that happened at work?'
  ];

  const openMonth = (key) => {
    setActiveMonth(key);
    const existing = photoMining?.[key];
    if (existing) {
      setDraft({ ...existing });
    } else {
      setDraft({ note: '', emotion: '', shouldStory: false, storyTitle: '', lesson: '', category: 'pain' });
    }
  };

  const saveMonth = () => {
    if (!activeMonth) return;
    const next = { ...photoMining, [activeMonth]: { ...draft, completedAt: new Date().toISOString() } };
    savePhotoMining(next);
    if (draft.shouldStory && draft.storyTitle && draft.lesson) {
      const monthLabel = months.find(m => m.key === activeMonth)?.label;
      saveStories([{
        id: Date.now(),
        title: draft.storyTitle,
        lesson: draft.lesson,
        category: draft.category,
        emotion: draft.emotion,
        month: monthLabel,
        context: draft.note,
        framework: 'general',
        rating: 0,
        timesUsed: 0,
        fromMining: true,
        createdAt: new Date().toISOString()
      }, ...stories]);
    }
    setActiveMonth(null);
  };

  const skipMonth = (key) => {
    const next = { ...photoMining, [key]: { skipped: true, completedAt: new Date().toISOString() } };
    savePhotoMining(next);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Source Material · Pause-Reflect-Document"
        title="Photo Mining Ritual"
        description="A proven technique — go to your phone, set photos to month-by-month, scroll the last 60 months. The ritual finds the stories you forgot you lived."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Months Mined" value={completed} hint={`of 60`} icon={CalendarDays} />
        <StatCard label="Stories Captured" value={withStories} hint="From mining" icon={BookOpen} />
        <StatCard label="Coverage" value={`${Math.round((completed/60)*100)}%`} hint="Of last 5 years" icon={Telescope} />
        <StatCard label="Streak" value={getMiningStreak(photoMining)} hint="Consecutive sessions" icon={Flame} />
      </div>

      {/* Ritual instructions */}
      <div className="bg-stone-950 text-stone-50 p-8 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-15 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">The ritual</div>
            <div className="font-display text-3xl font-light leading-tight">Find a quiet bench.<br /><span className="text-stone-400">Open your photos.</span></div>
          </div>
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-2">Step 1</div>
              <div className="font-display text-base font-medium mb-1">Pause</div>
              <div className="font-sans text-xs text-stone-400 leading-relaxed">Phone in hand, no laptop. Park bench, café, balcony. 20-30 minutes.</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-2">Step 2</div>
              <div className="font-display text-base font-medium mb-1">Reflect</div>
              <div className="font-sans text-xs text-stone-400 leading-relaxed">Set Photos to month-by-month. Scroll one month. What stands out? What surprised you?</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 mb-2">Step 3</div>
              <div className="font-display text-base font-medium mb-1">Document</div>
              <div className="font-sans text-xs text-stone-400 leading-relaxed">Click that month here. Capture the moment + lesson. Move on.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Month grid */}
      <div className="bg-white border border-stone-200 p-8 mb-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-1">60-month grid</div>
            <div className="font-display text-2xl font-light text-stone-900">Click any month to mine it</div>
          </div>
          <div className="flex gap-3 font-mono text-[10px] text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 inline-block"></span> Story captured</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-700 inline-block"></span> Mined, no story</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-stone-200 inline-block"></span> Untouched</span>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-1.5">
          {months.map(m => {
            const entry = photoMining?.[m.key];
            const hasStory = entry?.shouldStory;
            const isMined = !!entry;
            return (
              <button
                key={m.key}
                onClick={() => openMonth(m.key)}
                className={`aspect-square p-2 text-left border transition-all relative group ${hasStory ? 'bg-amber-500 text-stone-950 border-amber-600' : isMined ? 'bg-stone-700 text-stone-100 border-stone-700' : 'bg-stone-50 border-stone-200 hover:border-stone-500'}`}
                title={m.label}
              >
                <div className="font-mono text-[8px] uppercase tracking-wider opacity-70">{m.date.toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="font-mono text-xs">{m.date.getFullYear().toString().slice(-2)}</div>
                {hasStory && <BookOpen className="absolute bottom-1 right-1 w-2.5 h-2.5" />}
                {isMined && !hasStory && <Check className="absolute bottom-1 right-1 w-2.5 h-2.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active month modal */}
      {activeMonth && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-start justify-center p-6 overflow-y-auto" onClick={() => setActiveMonth(null)}>
          <div className="bg-white max-w-3xl w-full mt-12 mb-12" onClick={e => e.stopPropagation()}>
            <div className="p-7 border-b border-stone-200 flex justify-between items-center">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Mining</div>
                <div className="font-display text-3xl font-light">{months.find(m => m.key === activeMonth)?.label}</div>
              </div>
              <button onClick={() => setActiveMonth(null)}><X className="w-5 h-5" /></button>
            </div>

            <div className="p-7 space-y-5">
              <div className="bg-amber-50 border border-amber-200 p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">Prompts to jog memory</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {prompts.slice(0, 6).map((p, i) => (
                    <div key={i} className="font-sans text-xs text-stone-700 leading-relaxed">→ {p}</div>
                  ))}
                </div>
              </div>

              <Field label="What happened that month? (free notes)">
                <Textarea rows={4} value={draft.note} onChange={v => setDraft({ ...draft, note: v })} placeholder="Anything that comes back. Don't filter." />
              </Field>

              <Field label="The dominant emotion of that month">
                <Input value={draft.emotion} onChange={v => setDraft({ ...draft, emotion: v })} placeholder="e.g. relieved, frustrated, proud, anxious-but-determined" />
              </Field>

              {/* Convert to story toggle */}
              <div className={`p-5 border-2 ${draft.shouldStory ? 'border-amber-400 bg-amber-50' : 'border-stone-200 bg-stone-50'}`}>
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={draft.shouldStory} onChange={e => setDraft({ ...draft, shouldStory: e.target.checked })} className="w-4 h-4" />
                  <span className="font-display text-lg font-medium text-stone-900">There's a story here worth keeping</span>
                </label>

                {draft.shouldStory && (
                  <div className="space-y-3 mt-4">
                    <Field label="Story title (one line)">
                      <Input value={draft.storyTitle} onChange={v => setDraft({ ...draft, storyTitle: v })} placeholder="e.g. The Jazz pitch I almost walked out of" />
                    </Field>
                    <Field label="Category">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                          { v: 'pain', label: 'Pain' },
                          { v: 'prize', label: 'Prize' },
                          { v: 'news', label: 'News' }
                        ].map(c => (
                          <button key={c.v} onClick={() => setDraft({ ...draft, category: c.v })} className={`px-3 py-2 border text-sm ${draft.category === c.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>{c.label}</button>
                        ))}
                      </div>
                    </Field>
                    <Field label="The lesson">
                      <Textarea rows={3} value={draft.lesson} onChange={v => setDraft({ ...draft, lesson: v })} placeholder="What's the takeaway someone else could use?" />
                    </Field>
                    <div className="text-xs text-stone-500 font-sans">→ This will be saved to your Story Vault</div>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-stone-200">
                <button onClick={() => skipMonth(activeMonth)} className="px-4 py-2 font-sans text-sm text-stone-500 hover:text-stone-900">Mark mined, no story</button>
                <div className="flex gap-3">
                  <button onClick={() => setActiveMonth(null)} className="px-4 py-2 font-sans text-sm">Cancel</button>
                  <button onClick={saveMonth} className="px-6 py-2 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save month
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getMiningStreak(photoMining) {
  if (!photoMining) return 0;
  const sorted = Object.values(photoMining)
    .filter(v => v.completedAt)
    .map(v => new Date(v.completedAt))
    .sort((a, b) => b - a);
  if (sorted.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.floor((sorted[i-1] - sorted[i]) / (1000 * 60 * 60 * 24));
    if (diff <= 2) streak++;
    else break;
  }
  return streak;
}

// ============= CONVERSION LAB =============
// The four classic opt-in mechanisms: waiting list, assessment, webinar, mini-course
function ConversionLab({ optins, saveOptins, profile, icps, stories }) {
  const [tab, setTab] = useState('overview');

  const tabs = [
    { v: 'overview', label: 'Overview', icon: Compass },
    { v: 'waitlist', label: 'Waiting List', icon: Inbox, desc: 'Rolex-style scarcity' },
    { v: 'assessment', label: 'Assessment', icon: Gauge, desc: 'KPI-style quiz' },
    { v: 'webinar', label: 'Webinar', icon: Mic, desc: '45-90 min training' },
    { v: 'minicourse', label: 'Mini-course', icon: Layers, desc: 'Outline + emails' },
    { v: 'all', label: 'All Opt-ins', icon: Library }
  ];

  const counts = {
    waitlist: optins.filter(o => o.type === 'waitlist').length,
    assessment: optins.filter(o => o.type === 'assessment').length,
    webinar: optins.filter(o => o.type === 'webinar').length,
    minicourse: optins.filter(o => o.type === 'minicourse').length
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Conversion · Lead Magnets"
        title="Conversion Lab"
        description="The four classic opt-in mechanisms: waiting list, assessment, webinar, mini-course. Each turns warm attention into named contacts you can actually reach."
      />

      {/* Hero */}
      <div className="bg-stone-950 text-stone-50 p-8 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Why opt-ins matter</div>
            <div className="font-display text-3xl font-light leading-tight mb-4">DM beats follow.<br /><span className="text-stone-400">Email beats DM.</span></div>
            <div className="font-sans text-sm text-stone-300 leading-relaxed max-w-md">A follower is a stranger. An opt-in is a permission slip — name, email, phone — to pull them out of the algorithm and into your funnel.</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-stone-900 border border-stone-800 p-4">
              <Inbox className="w-4 h-4 text-amber-400 mb-2" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Waiting List</div>
              <div className="font-display text-2xl">{counts.waitlist}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4">
              <Gauge className="w-4 h-4 text-amber-400 mb-2" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Assessment</div>
              <div className="font-display text-2xl">{counts.assessment}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4">
              <Mic className="w-4 h-4 text-amber-400 mb-2" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Webinar</div>
              <div className="font-display text-2xl">{counts.webinar}</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-4">
              <Layers className="w-4 h-4 text-amber-400 mb-2" />
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Mini-course</div>
              <div className="font-display text-2xl">{counts.minicourse}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap ${tab === t.v ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <ConversionOverview optins={optins} setTab={setTab} profile={profile} />}
      {tab === 'waitlist' && <WaitlistBuilder optins={optins} saveOptins={saveOptins} profile={profile} icps={icps} />}
      {tab === 'assessment' && <AssessmentBuilder optins={optins} saveOptins={saveOptins} profile={profile} />}
      {tab === 'webinar' && <WebinarPlanner optins={optins} saveOptins={saveOptins} profile={profile} stories={stories} />}
      {tab === 'minicourse' && <MiniCoursePlanner optins={optins} saveOptins={saveOptins} profile={profile} stories={stories} />}
      {tab === 'all' && <AllOptins optins={optins} saveOptins={saveOptins} />}
    </div>
  );
}

function ConversionOverview({ optins, setTab, profile }) {
  const ladders = [
    {
      stage: 'Cold',
      label: 'Stranger on the feed',
      mechanism: 'Short-form posts',
      desc: 'They scroll past most things. Your hook stops them for 3 seconds.',
      color: 'border-stone-300'
    },
    {
      stage: 'Warm',
      label: 'Reader who lingers',
      mechanism: 'Long-form / DM CTA',
      desc: '15+ minutes of attention. They drop a DM or visit your page.',
      color: 'border-amber-400'
    },
    {
      stage: 'Hot',
      label: 'Opt-in (named contact)',
      mechanism: 'Waiting list / Assessment / Webinar / Mini-course',
      desc: 'They give you their email. Now they\'re in your sequence, not the algorithm\'s.',
      color: 'border-emerald-500'
    },
    {
      stage: 'Boiling',
      label: 'Booked discovery call',
      mechanism: 'Calendar link / DM follow-up',
      desc: 'They want a conversation. Half-sale already made.',
      color: 'border-emerald-700'
    },
    {
      stage: 'Customer',
      label: 'Paying client',
      mechanism: 'Discovery → proposal → close',
      desc: 'Deal signed. Now they should become a referral source.',
      color: 'border-stone-900'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-stone-200 p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">The temperature ladder</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ladders.map((l, i) => (
            <div key={i} className={`bg-stone-50 border-l-4 ${l.color} p-5 relative`}>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Stage 0{i+1}</div>
              <div className="font-display text-2xl font-light text-stone-900 mb-2">{l.stage}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-600 mb-2">{l.label}</div>
              <div className="font-sans text-xs text-stone-700 leading-relaxed mb-3">{l.desc}</div>
              <div className="border-t border-stone-200 pt-2">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Mechanism</div>
                <div className="font-sans text-xs text-stone-800 font-medium">{l.mechanism}</div>
              </div>
              {i < ladders.length - 1 && <ChevronsRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 bg-white" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setTab('waitlist')} className="bg-white border border-stone-200 p-7 text-left hover:border-stone-900 group">
          <Inbox className="w-5 h-5 text-stone-700 mb-3" />
          <div className="font-display text-2xl font-light text-stone-900 mb-1">Waiting List</div>
          <div className="font-sans text-sm text-stone-600 mb-3 leading-relaxed">Rolex-style. The thing isn't ready yet — but if they want it, they have to leave their name.</div>
          <div className="font-mono text-xs text-stone-500 group-hover:text-stone-900 inline-flex items-center gap-1">Build one <ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => setTab('assessment')} className="bg-white border border-stone-200 p-7 text-left hover:border-stone-900 group">
          <Gauge className="w-5 h-5 text-stone-700 mb-3" />
          <div className="font-display text-2xl font-light text-stone-900 mb-1">Assessment</div>
          <div className="font-sans text-sm text-stone-600 mb-3 leading-relaxed">A 5-minute quiz that gives them a score, a category, and a custom path forward.</div>
          <div className="font-mono text-xs text-stone-500 group-hover:text-stone-900 inline-flex items-center gap-1">Build one <ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => setTab('webinar')} className="bg-white border border-stone-200 p-7 text-left hover:border-stone-900 group">
          <Mic className="w-5 h-5 text-stone-700 mb-3" />
          <div className="font-display text-2xl font-light text-stone-900 mb-1">Webinar</div>
          <div className="font-sans text-sm text-stone-600 mb-3 leading-relaxed">45-90 minutes live. Teach a method. Soft pitch at the end. Repeats every 2 weeks.</div>
          <div className="font-mono text-xs text-stone-500 group-hover:text-stone-900 inline-flex items-center gap-1">Plan one <ArrowRight className="w-3 h-3" /></div>
        </button>
        <button onClick={() => setTab('minicourse')} className="bg-white border border-stone-200 p-7 text-left hover:border-stone-900 group">
          <Layers className="w-5 h-5 text-stone-700 mb-3" />
          <div className="font-display text-2xl font-light text-stone-900 mb-1">Mini-course</div>
          <div className="font-sans text-sm text-stone-600 mb-3 leading-relaxed">5-7 emails over 7-14 days. Their introduction to your way of thinking.</div>
          <div className="font-mono text-xs text-stone-500 group-hover:text-stone-900 inline-flex items-center gap-1">Outline one <ArrowRight className="w-3 h-3" /></div>
        </button>
      </div>
    </div>
  );
}

function WaitlistBuilder({ optins, saveOptins, profile, icps }) {
  const [draft, setDraft] = useState({
    type: 'waitlist',
    name: '',
    productConcept: '',
    targetIcp: '',
    scarcity: '',
    valueProp: '',
    landingHero: '',
    fields: ['email'],
    confirmationCopy: '',
    nextSteps: ''
  });
  const [generating, setGenerating] = useState(false);

  const generateDraft = async () => {
    setGenerating(true);
    const targetIcp = icps.find(i => i.id === parseInt(draft.targetIcp));
    const prompt = `Build a Rolex-style waiting list landing page concept for ${profile.name}.

Product concept (rough): ${draft.productConcept}
Target ICP: ${targetIcp ? `${targetIcp.name} — ${targetIcp.title}` : 'general audience'}
Voice: ${profile.voice}, ${profile.tone?.join(', ')}

The goal is genuine scarcity. Not fake "act now" pressure. Real "this isn't ready, but if you want first crack, leave your name."

Return ONLY valid JSON:
{
  "headline": "8-12 word hero headline",
  "subhead": "1 sentence subhead",
  "scarcityNarrative": "2-3 sentence explanation of WHY this is gated and why now",
  "valueProp": "What they get when it opens — 3 bullets",
  "fieldsToCollect": ["email", "and 2-3 other relevant fields"],
  "confirmationCopy": "What they see after they sign up — 2-3 sentences that build anticipation, not generic 'thanks'",
  "nurtureSequence": [
    "Email 1 (Day 0): subject + 1-line preview",
    "Email 2 (Day 7): subject + 1-line",
    "Email 3 (Day 14): subject + 1-line"
  ],
  "objections": ["3 likely objections + how the page addresses each"]
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setDraft({ ...draft, generated: parsed, name: draft.name || parsed.headline });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const save = () => {
    if (!draft.name) return;
    saveOptins([{ ...draft, id: Date.now(), createdAt: new Date().toISOString() }, ...optins]);
    setDraft({ type: 'waitlist', name: '', productConcept: '', targetIcp: '', scarcity: '', valueProp: '', landingHero: '', fields: ['email'], confirmationCopy: '', nextSteps: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-1">Classic example</div>
        <div className="font-display text-lg text-stone-900 leading-snug">Rolex doesn't sell watches. They run a waiting list. The list itself is the product. People go on the list because they can't have it.</div>
      </div>

      <div className="bg-stone-950 text-stone-50 p-7">
        <div className="font-display text-2xl font-light mb-1">Generate a waiting list concept</div>
        <div className="font-sans text-sm text-stone-300 mb-5">Give us the rough product and target. We'll draft the landing page, fields, and 3-email nurture.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Field label="Concept name (working title)">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. The TonePerks Voice-Ad Index" />
          </Field>
          <Field label="Target ICP">
            <select value={draft.targetIcp} onChange={e => setDraft({ ...draft, targetIcp: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
              <option value="">— choose ICP —</option>
              {icps.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Product concept (one paragraph — what it is, who it's for, why now)">
          <textarea rows={4} value={draft.productConcept} onChange={e => setDraft({ ...draft, productConcept: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. A quarterly index of the most monetizable voice-channel formats in MENA. Built for telco BD heads. Launches when we have data from 50 telcos." />
        </Field>
        <button onClick={generateDraft} disabled={!draft.productConcept || generating} className="mt-4 px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting...</> : <><Wand2 className="w-4 h-4" /> Draft it</>}
        </button>
      </div>

      {draft.generated && (
        <div className="bg-white border-2 border-stone-900 p-8 space-y-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Generated landing page</div>
          <div>
            <div className="font-display text-4xl font-light text-stone-900 leading-tight mb-2">{draft.generated.headline}</div>
            <div className="font-sans text-base text-stone-600 leading-relaxed">{draft.generated.subhead}</div>
          </div>
          <div className="bg-stone-50 border-l-4 border-amber-500 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">Scarcity narrative</div>
            <div className="font-sans text-sm text-stone-700 leading-relaxed italic">{draft.generated.scarcityNarrative}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Value prop bullets</div>
              <div className="font-sans text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">{draft.generated.valueProp}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Form fields</div>
              <div className="space-y-1">
                {(draft.generated.fieldsToCollect || []).map(f => <div key={f} className="bg-stone-100 px-3 py-1.5 font-mono text-xs">{f}</div>)}
              </div>
            </div>
          </div>
          <div className="bg-stone-50 border border-stone-200 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">After they sign up</div>
            <div className="font-sans text-sm text-stone-700 leading-relaxed italic">{draft.generated.confirmationCopy}</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">3-email nurture sequence</div>
            <div className="space-y-2">
              {(draft.generated.nurtureSequence || []).map((e, i) => (
                <div key={i} className="border-l-2 border-stone-300 pl-4 font-sans text-sm text-stone-700">{e}</div>
              ))}
            </div>
          </div>
          <button onClick={save} className="px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save concept to library</button>
        </div>
      )}
    </div>
  );
}

function AssessmentBuilder({ optins, saveOptins, profile }) {
  const [draft, setDraft] = useState({
    type: 'assessment',
    name: '',
    promise: '',
    questions: [],
    scoringBands: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    payoff: ''
  });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const prompt = `Design an assessment quiz for ${profile.name} like the "Key Person of Influence" assessment.

Their domain: ${profile.industries?.join(', ')} | ${profile.expertise?.join(', ')}
Their transformation: ${profile.transformation}
Audience: ${profile.audiences?.join(', ')}
Premise: ${draft.promise || 'rate the maturity of their work in this domain'}

Build a 12-question assessment that:
- Is genuinely useful (people learn something from taking it)
- Sorts respondents into 4 maturity bands
- Each answer reveals something about how they operate
- Avoids leading or sales-y questions

Return ONLY valid JSON:
{
  "name": "Assessment name (catchy, specific)",
  "promise": "One-line promise of what they'll learn",
  "questions": [
    {
      "id": "q1",
      "prompt": "The question (clear, single-axis)",
      "dimension": "What this question measures (e.g. 'BD discipline', 'process maturity')",
      "options": [
        { "label": "Option that sorts to Beginner", "score": 1 },
        { "label": "Option that sorts to Intermediate", "score": 2 },
        { "label": "Option that sorts to Advanced", "score": 3 },
        { "label": "Option that sorts to Expert", "score": 4 }
      ]
    }
    // ... 12 questions total, each measuring a different dimension
  ],
  "bands": [
    { "name": "Beginner", "minScore": 12, "maxScore": 22, "description": "Where they are + first thing to focus on" },
    { "name": "Intermediate", "minScore": 23, "maxScore": 33, "description": "..." },
    { "name": "Advanced", "minScore": 34, "maxScore": 42, "description": "..." },
    { "name": "Expert", "minScore": 43, "maxScore": 48, "description": "..." }
  ],
  "payoffPage": "What appears after they finish — promises a custom report or follow-up DM/email."
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setDraft({ ...draft, generated: parsed, name: parsed.name });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const save = () => {
    if (!draft.generated) return;
    saveOptins([{ ...draft, ...draft.generated, id: Date.now(), createdAt: new Date().toISOString() }, ...optins]);
    setDraft({ type: 'assessment', name: '', promise: '', questions: [], scoringBands: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], payoff: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-1">Classic example</div>
        <div className="font-display text-lg text-stone-900 leading-snug">The Key Person of Influence assessment scores you on 5 dimensions and tells you what to fix first. The act of being scored is the value.</div>
      </div>

      <div className="bg-stone-950 text-stone-50 p-7">
        <div className="font-display text-2xl font-light mb-1">Generate an assessment</div>
        <div className="font-sans text-sm text-stone-300 mb-5">Tell us the premise. We'll write the questions, scoring, and bands.</div>
        <Field label="What does this assessment score? (one line)">
          <input value={draft.promise} onChange={e => setDraft({ ...draft, promise: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. How predictable is your BD pipeline?" />
        </Field>
        <button onClick={generate} disabled={!draft.promise || generating} className="mt-4 px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Designing 12 questions...</> : <><Wand2 className="w-4 h-4" /> Design it</>}
        </button>
      </div>

      {draft.generated && (
        <div className="bg-white border-2 border-stone-900 p-8 space-y-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Assessment</div>
            <div className="font-display text-4xl font-light text-stone-900 leading-tight">{draft.generated.name}</div>
            <div className="font-sans text-base text-stone-600 mt-2">{draft.generated.promise}</div>
          </div>

          {/* Bands preview */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {(draft.generated.bands || []).map((b, i) => (
              <div key={i} className={`p-4 ${i === 0 ? 'bg-stone-100' : i === 1 ? 'bg-amber-50' : i === 2 ? 'bg-emerald-50' : 'bg-stone-900 text-stone-50'}`}>
                <div className="font-mono text-[10px] uppercase tracking-wider mb-1 opacity-70">{b.minScore}-{b.maxScore} pts</div>
                <div className="font-display text-lg font-medium mb-2">{b.name}</div>
                <div className="font-sans text-xs leading-relaxed opacity-80">{b.description}</div>
              </div>
            ))}
          </div>

          {/* Questions */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">{(draft.generated.questions || []).length} questions</div>
            <div className="space-y-3">
              {(draft.generated.questions || []).map((q, i) => (
                <details key={i} className="border border-stone-200 group">
                  <summary className="p-4 cursor-pointer flex items-center gap-3 hover:bg-stone-50">
                    <span className="font-mono text-xs text-stone-400">Q{String(i+1).padStart(2,'0')}</span>
                    <span className="flex-1 text-sm text-stone-900 font-medium">{q.prompt}</span>
                    <Pill>{q.dimension}</Pill>
                  </summary>
                  <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2">
                    {(q.options || []).map((o, oi) => (
                      <div key={oi} className="flex items-start gap-3 font-sans text-sm">
                        <span className="font-mono text-xs text-stone-400 mt-0.5">[{o.score}]</span>
                        <span className="text-stone-700">{o.label}</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 border-l-4 border-emerald-500 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800 mb-2">Payoff page</div>
            <div className="font-sans text-sm text-stone-700 leading-relaxed">{draft.generated.payoffPage}</div>
          </div>

          <button onClick={save} className="px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save assessment to library</button>
        </div>
      )}
    </div>
  );
}

function WebinarPlanner({ optins, saveOptins, profile, stories }) {
  const [draft, setDraft] = useState({ type: 'webinar', title: '', promise: '', duration: 60, anchorStoryId: '' });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const story = stories.find(s => s.id === parseInt(draft.anchorStoryId));
    const prompt = `Build a webinar plan for ${profile.name}.

Title hint: ${draft.title}
Promise: ${draft.promise}
Duration: ${draft.duration} minutes
Anchor story: ${story ? `"${story.title}" — ${story.lesson}` : 'none chosen'}
Voice: ${profile.voice}, ${profile.tone?.join(', ')}
Audience: ${profile.audiences?.join(', ')}

Design a webinar that follows  structure:
- Opens with their pain
- Tells the anchor story
- Teaches a 3-5 step process
- Shows proof
- Soft pitch the next step (a discovery call, a paid product, etc.)

Return ONLY valid JSON:
{
  "finalTitle": "Compelling title (max 12 words)",
  "subtitle": "One sentence promise",
  "registrationCopy": "Two-paragraph copy for the registration page",
  "agenda": [
    { "block": "Opening / pain hook", "minutes": 5, "talkingPoints": ["3-5 bullets"] },
    { "block": "Anchor story", "minutes": 10, "talkingPoints": ["..."] },
    { "block": "The framework", "minutes": 25, "talkingPoints": ["..."] },
    { "block": "Proof / case studies", "minutes": 10, "talkingPoints": ["..."] },
    { "block": "Q&A / soft pitch", "minutes": 10, "talkingPoints": ["..."] }
  ],
  "slidesOutline": ["10-15 slide titles in order"],
  "softPitchScript": "What to say at the soft-pitch moment (3-4 sentences)",
  "followUpEmail": "Subject + body for the post-webinar email"
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setDraft({ ...draft, generated: parsed });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const save = () => saveOptins([{ ...draft, ...draft.generated, id: Date.now(), createdAt: new Date().toISOString() }, ...optins]);

  return (
    <div className="space-y-6">
      <div className="bg-stone-950 text-stone-50 p-7">
        <div className="font-display text-2xl font-light mb-5">Plan a webinar</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Field label="Working title">
            <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. The 90-day MOU framework" />
          </Field>
          <Field label="Duration (minutes)">
            <select value={draft.duration} onChange={e => setDraft({ ...draft, duration: parseInt(e.target.value) })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
              <option value={45}>45 min</option><option value={60}>60 min</option><option value={75}>75 min</option><option value={90}>90 min</option>
            </select>
          </Field>
          <Field label="Anchor story">
            <select value={draft.anchorStoryId} onChange={e => setDraft({ ...draft, anchorStoryId: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
              <option value="">— pick one —</option>
              {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </Field>
        </div>
        <Field label="The promise (what they'll walk away with)">
          <textarea rows={2} value={draft.promise} onChange={e => setDraft({ ...draft, promise: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. A 5-step framework for getting from cold pitch to signed MOU in under 90 days." />
        </Field>
        <button onClick={generate} disabled={!draft.title || !draft.promise || generating} className="mt-4 px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Building agenda...</> : <><Wand2 className="w-4 h-4" /> Build agenda + slides</>}
        </button>
      </div>

      {draft.generated && (
        <div className="bg-white border-2 border-stone-900 p-8 space-y-5">
          <div>
            <div className="font-display text-3xl font-light text-stone-900 leading-tight mb-1">{draft.generated.finalTitle}</div>
            <div className="font-sans text-sm text-stone-600">{draft.generated.subtitle}</div>
          </div>

          {/* Agenda timeline */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Agenda · {draft.duration} min</div>
            <div className="space-y-2">
              {(draft.generated.agenda || []).map((a, i) => (
                <details key={i} className="border border-stone-200">
                  <summary className="p-4 cursor-pointer flex items-center gap-3 hover:bg-stone-50">
                    <span className="font-mono text-xs text-stone-400 w-12">{a.minutes}m</span>
                    <span className="flex-1 font-medium text-sm text-stone-900">{a.block}</span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </summary>
                  <div className="p-4 bg-stone-50 border-t border-stone-200">
                    <ul className="space-y-1">
                      {(a.talkingPoints || []).map((tp, ti) => (
                        <li key={ti} className="font-sans text-sm text-stone-700 flex gap-2">
                          <span className="text-stone-400 font-mono">→</span>{tp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 border border-stone-200 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Slide outline</div>
              <ol className="space-y-1">
                {(draft.generated.slidesOutline || []).map((s, i) => (
                  <li key={i} className="font-sans text-sm text-stone-700 flex gap-2">
                    <span className="font-mono text-xs text-stone-400 w-6">{String(i+1).padStart(2,'0')}</span>{s}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">Soft-pitch script</div>
                <div className="font-sans text-sm text-stone-700 leading-relaxed italic">"{draft.generated.softPitchScript}"</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800 mb-2">Follow-up email</div>
                <div className="font-sans text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{draft.generated.followUpEmail}</div>
              </div>
            </div>
          </div>

          <button onClick={save} className="px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save webinar plan</button>
        </div>
      )}
    </div>
  );
}

function MiniCoursePlanner({ optins, saveOptins, profile, stories }) {
  const [draft, setDraft] = useState({ type: 'minicourse', name: '', promise: '', lessons: 5, anchorStoryIds: [] });
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    const anchored = stories.filter(s => draft.anchorStoryIds.includes(s.id));
    const prompt = `Outline a ${draft.lessons}-lesson email mini-course for ${profile.name}.

Course name (working): ${draft.name}
Promise: ${draft.promise}
Anchor stories: ${JSON.stringify(anchored.map(s => ({ title: s.title, lesson: s.lesson })))}
Voice: ${profile.voice}, ${profile.tone?.join(', ')}
Audience: ${profile.audiences?.join(', ')}

Each lesson is one email. Together they take a beginner from "I don't know how to do this" to "I have a working approach to try."

Return ONLY valid JSON:
{
  "finalName": "Punchy course name",
  "subtitle": "One-line promise",
  "lessons": [
    {
      "day": 0,
      "subject": "Subject line",
      "preview": "Preview text (under 90 chars)",
      "hookLine": "First line of email body",
      "coreLesson": "The single thing they should walk away with",
      "exerciseOrAction": "Specific 5-min action they take after reading",
      "wordCount": 400
    }
    // ... ${draft.lessons} lessons
  ],
  "finalCta": "What lesson ${draft.lessons} ends with — a soft pitch or next-step invitation"
}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await response.json();
      const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setDraft({ ...draft, generated: parsed, name: parsed.finalName });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const save = () => saveOptins([{ ...draft, ...draft.generated, id: Date.now(), createdAt: new Date().toISOString() }, ...optins]);

  return (
    <div className="space-y-6">
      <div className="bg-stone-950 text-stone-50 p-7">
        <div className="font-display text-2xl font-light mb-5">Outline a mini-course</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Field label="Course name (working)">
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          </Field>
          <Field label="Number of lessons">
            <select value={draft.lessons} onChange={e => setDraft({ ...draft, lessons: parseInt(e.target.value) })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
              <option value={5}>5 emails</option><option value={7}>7 emails</option><option value={10}>10 emails</option>
            </select>
          </Field>
        </div>
        <Field label="Promise (what they'll know by lesson 5/7/10)">
          <textarea rows={2} value={draft.promise} onChange={e => setDraft({ ...draft, promise: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Anchor stories (optional — pick 2-3 to weave in)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {stories.slice(0, 12).map(s => {
              const sel = draft.anchorStoryIds.includes(s.id);
              return (
                <button key={s.id} onClick={() => setDraft({ ...draft, anchorStoryIds: sel ? draft.anchorStoryIds.filter(x => x !== s.id) : [...draft.anchorStoryIds, s.id] })} className={`p-2 text-left text-xs ${sel ? 'bg-stone-50 text-stone-900' : 'bg-stone-900 border border-stone-700 text-stone-300'}`}>
                  {s.title.slice(0, 50)}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={generate} disabled={!draft.name || !draft.promise || generating} className="mt-4 px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Outlining lessons...</> : <><Wand2 className="w-4 h-4" /> Outline the course</>}
        </button>
      </div>

      {draft.generated && (
        <div className="bg-white border-2 border-stone-900 p-8 space-y-5">
          <div>
            <div className="font-display text-3xl font-light text-stone-900 leading-tight">{draft.generated.finalName}</div>
            <div className="font-sans text-sm text-stone-600 mt-2">{draft.generated.subtitle}</div>
          </div>

          <div className="space-y-3">
            {(draft.generated.lessons || []).map((l, i) => (
              <div key={i} className="border border-stone-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider bg-stone-900 text-stone-50 px-2 py-1">Day {l.day}</div>
                  <div className="font-sans text-xs text-stone-500">~{l.wordCount} words</div>
                </div>
                <div className="font-display text-lg font-medium text-stone-900 mb-1">{l.subject}</div>
                <div className="font-sans text-xs text-stone-500 italic mb-3">Preview: {l.preview}</div>
                <div className="bg-stone-50 border-l-2 border-stone-300 p-3 mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Hook line</div>
                  <div className="font-sans text-sm text-stone-700 italic">"{l.hookLine}"</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Core lesson</div>
                    <div className="font-sans text-sm text-stone-700 leading-relaxed">{l.coreLesson}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Action / exercise</div>
                    <div className="font-sans text-sm text-stone-700 leading-relaxed">{l.exerciseOrAction}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-800 mb-2">Final CTA</div>
            <div className="font-sans text-sm text-stone-700 leading-relaxed">{draft.generated.finalCta}</div>
          </div>

          <button onClick={save} className="px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save mini-course</button>
        </div>
      )}
    </div>
  );
}

function AllOptins({ optins, saveOptins }) {
  if (optins.length === 0) {
    return <EmptyState icon={Library} title="No opt-ins built yet" description="Use one of the four builders to design your first lead magnet." />;
  }
  return (
    <div className="space-y-3">
      {optins.map(o => (
        <div key={o.id} className="bg-white border border-stone-200 p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Pill color={o.type === 'waitlist' ? 'amber' : o.type === 'assessment' ? 'violet' : o.type === 'webinar' ? 'blue' : 'green'}>{o.type}</Pill>
              <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{new Date(o.createdAt).toLocaleDateString()}</span>
            </div>
            <button onClick={async () => { if (await window.brandConfirm('Delete this opt-in?')) saveOptins(optins.filter(x => x.id !== o.id)); }} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
          </div>
          <div className="font-display text-2xl font-light text-stone-900">{o.name || o.finalTitle || o.finalName || 'Untitled'}</div>
          {(o.subtitle || o.promise) && <div className="font-sans text-sm text-stone-600 mt-1">{o.subtitle || o.promise}</div>}
        </div>
      ))}
    </div>
  );
}

// ============= REVENUE PLANNER =============
// 7-to-8 figure math from the transcript.
function RevenuePlanner({ revenuePlan, saveRevenuePlan, profile, analytics, contentPieces }) {
  const p = revenuePlan || {};
  const update = (k, v) => saveRevenuePlan({ ...p, [k]: v });

  const annualGoal = p.annualGoal || 1000000;
  const dealSize = p.dealSize || 10000;
  const closeRate = p.closeRate || 0.25;
  const callBookRate = p.callBookRate || 0.15;
  const optInRate = p.optInRate || 0.04;
  const longFormCTR = p.longFormCTR || 0.05;
  const impressionsPerPost = p.impressionsPerPost || 2000;

  const dealsNeeded = Math.ceil(annualGoal / dealSize);
  const callsNeeded = Math.ceil(dealsNeeded / closeRate);
  const optInsNeeded = Math.ceil(callsNeeded / callBookRate);
  const longFormViewsNeeded = Math.ceil(optInsNeeded / optInRate);
  const shortFormImpressionsNeeded = Math.ceil(longFormViewsNeeded / longFormCTR);
  const postsPerYear = Math.ceil(shortFormImpressionsNeeded / impressionsPerPost);
  const postsPerWeek = Math.ceil(postsPerYear / 52);

  const dealsPerMonth = Math.ceil(dealsNeeded / 12);
  const dealsPerWeek = (dealsNeeded / 52).toFixed(1);

  const stages = [
    { label: 'Annual revenue target', value: `$${annualGoal.toLocaleString()}`, color: 'bg-stone-950 text-stone-50', big: true },
    { label: 'Deal size (avg)', value: `$${dealSize.toLocaleString()}`, color: 'bg-stone-100' },
    { label: 'Deals needed / year', value: dealsNeeded.toLocaleString(), color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Discovery calls / year', value: callsNeeded.toLocaleString(), color: 'bg-amber-50 border-amber-200' },
    { label: 'Opt-ins / year', value: optInsNeeded.toLocaleString(), color: 'bg-violet-50 border-violet-200' },
    { label: 'Long-form views / year', value: longFormViewsNeeded.toLocaleString(), color: 'bg-blue-50 border-blue-200' },
    { label: 'Short-form impressions / year', value: shortFormImpressionsNeeded.toLocaleString(), color: 'bg-stone-50' },
    { label: 'Posts / year', value: postsPerYear, color: 'bg-stone-50' },
    { label: 'Posts / week', value: postsPerWeek, color: 'bg-stone-50' }
  ];

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Conversion · Revenue Math"
        title="Revenue Planner"
        description="The 7-to-8 figure math, made visible. $25k/week = $1.3M/year. 85 sales × $10k/month = $10M/year. The math doesn't lie — what does the funnel need to look like?"
      />

      {/* Hero with goal calculator */}
      <div className="bg-stone-950 text-stone-50 p-10 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900 opacity-30 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Your goal</div>
            <div className="font-display text-7xl font-light leading-none mb-3">${(annualGoal/1000000).toFixed(2)}M<span className="text-stone-600 text-3xl"> / year</span></div>
            <div className="font-sans text-base text-stone-300 mb-6">
              That's <span className="text-amber-400">${Math.round(annualGoal/52).toLocaleString()}/week</span> · {dealsPerMonth} deals/month · {dealsPerWeek} deals/week
            </div>
            <div className="space-y-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Annual revenue target</div>
                <input type="range" min="100000" max="20000000" step="100000" value={annualGoal} onChange={e => update('annualGoal', parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-[10px] text-stone-500"><span>$100k</span><span>$20M</span></div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Deal size (avg)</div>
                <input type="range" min="500" max="500000" step="500" value={dealSize} onChange={e => update('dealSize', parseInt(e.target.value))} className="w-full" />
                <div className="flex justify-between font-mono text-[10px] text-stone-500"><span>$500</span><span>$500k</span></div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Funnel rates</div>
            <div className="space-y-4">
              {[
                { k: 'closeRate', label: 'Close rate (calls → deals)', val: closeRate, max: 0.5, format: 'pct' },
                { k: 'callBookRate', label: 'Call-book rate (opt-ins → calls)', val: callBookRate, max: 0.4, format: 'pct' },
                { k: 'optInRate', label: 'Opt-in rate (long-form → opt-in)', val: optInRate, max: 0.15, format: 'pct' },
                { k: 'longFormCTR', label: 'Long-form CTR (short → long)', val: longFormCTR, max: 0.2, format: 'pct' },
                { k: 'impressionsPerPost', label: 'Impressions per short-form post', val: impressionsPerPost, max: 50000, format: 'num' }
              ].map(s => (
                <div key={s.k}>
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                    <span>{s.label}</span>
                    <span className="text-amber-400">{s.format === 'pct' ? `${(s.val*100).toFixed(1)}%` : s.val.toLocaleString()}</span>
                  </div>
                  <input type="range" min={s.format === 'pct' ? 0.001 : 100} max={s.max} step={s.format === 'pct' ? 0.001 : 100} value={s.val} onChange={e => update(s.k, parseFloat(e.target.value))} className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel waterfall */}
      <div className="bg-white border border-stone-200 p-8 mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">Required funnel</div>
        <div className="font-display text-3xl font-light text-stone-900 mb-6">What it takes, working backward</div>
        <div className="space-y-2">
          {stages.map((s, i) => (
            <div key={i} className={`p-5 border ${s.color} flex items-center gap-6`} style={{ paddingRight: `${i * 8 + 20}px`, paddingLeft: `${20 + (stages.length - i - 1) * 8}px` }}>
              <div className="font-mono text-[10px] uppercase tracking-wider opacity-70 w-48">{s.label}</div>
              <div className={`font-display ${s.big ? 'text-5xl' : 'text-3xl'} font-light flex-1`}>{s.value}</div>
              {i < stages.length - 1 && <ArrowDown className="w-4 h-4 opacity-40 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Reality check */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Reality check · Posts</div>
          <div className="font-display text-3xl font-light text-stone-900 mb-1">{postsPerWeek}<span className="text-stone-400 text-lg"> /week</span></div>
          <div className="font-sans text-sm text-stone-600 leading-relaxed">
            {postsPerWeek <= 3 && '3 per week is achievable. \'s minimum.'}
            {postsPerWeek > 3 && postsPerWeek <= 7 && 'Daily-ish cadence. Doable with batching.'}
            {postsPerWeek > 7 && 'Multiple posts/day. Either accept higher impressions/post is needed, or rethink deal size.'}
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Reality check · Calls</div>
          <div className="font-display text-3xl font-light text-stone-900 mb-1">{Math.ceil(callsNeeded/52)}<span className="text-stone-400 text-lg"> /week</span></div>
          <div className="font-sans text-sm text-stone-600 leading-relaxed">
            {Math.ceil(callsNeeded/52) <= 3 && 'Boutique cadence. Manageable solo.'}
            {Math.ceil(callsNeeded/52) > 3 && Math.ceil(callsNeeded/52) <= 10 && 'You need a half-decent calendar block.'}
            {Math.ceil(callsNeeded/52) > 10 && 'You\'ll need to hire a setter or raise the deal size.'}
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Reality check · Audience size</div>
          <div className="font-display text-3xl font-light text-stone-900 mb-1">{Math.ceil(shortFormImpressionsNeeded/postsPerYear).toLocaleString()}<span className="text-stone-400 text-lg"> avg/post</span></div>
          <div className="font-sans text-sm text-stone-600 leading-relaxed">
            {impressionsPerPost < 5000 && 'Achievable in year 1 with good algorithmic content.'}
            {impressionsPerPost >= 5000 && impressionsPerPost < 20000 && 'Year 2-3 territory. Compounds with consistency.'}
            {impressionsPerPost >= 20000 && 'You\'re betting on serious algorithmic reach. Tighten ICP first.'}
          </div>
        </div>
      </div>

      {/* benchmarks */}
      <div className="bg-stone-50 border border-stone-200 p-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Industry benchmarks</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">7 figures</div>
            <div className="font-display text-2xl font-light text-stone-900">$25k / week</div>
            <div className="font-sans text-sm text-stone-600 mt-1">"Not that big a deal."</div>
          </div>
          <div className="bg-white border border-stone-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">8 figures</div>
            <div className="font-display text-2xl font-light text-stone-900">85 × $10k / month</div>
            <div className="font-sans text-sm text-stone-600 mt-1">"Even less of a big deal at scale."</div>
          </div>
          <div className="bg-white border border-stone-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Reach available</div>
            <div className="font-display text-2xl font-light text-stone-900">Billions</div>
            <div className="font-sans text-sm text-stone-600 mt-1">"In a world where you can reach billions online."</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= AIO TRACKER =============
// AI Search Optimization — the closing-window opportunity.
function AIOTracker({ aio, saveAio, profile, contentPieces }) {
  const [tab, setTab] = useState('overview');
  const [topicDraft, setTopicDraft] = useState({ name: '', stance: '', longFormCount: 0 });
  const [queryDraft, setQueryDraft] = useState({ engine: 'ChatGPT', query: '', appeared: false, position: '', notes: '' });
  const topics = aio?.topics || [];
  const queries = aio?.queries || [];

  const addTopic = () => {
    if (!topicDraft.name) return;
    saveAio({ ...aio, topics: [{ ...topicDraft, id: Date.now(), createdAt: new Date().toISOString() }, ...topics] });
    setTopicDraft({ name: '', stance: '', longFormCount: 0 });
  };

  const addQuery = () => {
    if (!queryDraft.query) return;
    saveAio({ ...aio, queries: [{ ...queryDraft, id: Date.now(), testedAt: new Date().toISOString() }, ...queries] });
    setQueryDraft({ engine: 'ChatGPT', query: '', appeared: false, position: '', notes: '' });
  };

  const removeTopic = async (id) => { if (await window.brandConfirm('Delete this topic cluster?')) saveAio({ ...aio, topics: topics.filter(t => t.id !== id) }); };
  const removeQuery = async (id) => { if (await window.brandConfirm('Delete this query test?')) saveAio({ ...aio, queries: queries.filter(q => q.id !== id) }); };

  const aioScore = useMemo(() => {
    let score = 0;
    if (topics.length >= 1) score += 20;
    if (topics.length >= 3) score += 15;
    if (topics.some(t => t.longFormCount >= 5)) score += 20;
    if (queries.length >= 5) score += 15;
    const appearedRate = queries.length ? queries.filter(q => q.appeared).length / queries.length : 0;
    score += Math.round(appearedRate * 30);
    return Math.min(100, score);
  }, [topics, queries]);

  const longFormPieces = contentPieces.filter(p => ['newsletter', 'long_script', 'thread', 'podcast_outline', 'carousel'].includes(p.format));
  const appearedQueries = queries.filter(q => q.appeared);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Distribution · The Closing Window"
        title="AI Search Optimization"
        description="SEO is saturated. AIO is wide open. The next 12-24 months, AI chat tools will recommend humans by topic. Track your topic clusters, test your queries, and stake your claim before the competition catches up."
      />

      {/* Hero */}
      <div className="bg-stone-950 text-stone-50 p-10 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900 opacity-25 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">AIO Score</div>
            <div className="font-display text-7xl font-light leading-none">{aioScore}<span className="text-stone-600 text-3xl">/100</span></div>
            <div className="font-sans text-sm text-stone-300 mt-3 leading-relaxed">
              {aioScore < 30 && 'Just getting started. Stake claim to 1-3 topics.'}
              {aioScore >= 30 && aioScore < 60 && 'Building presence. Keep publishing long-form.'}
              {aioScore >= 60 && aioScore < 85 && 'Strong signals. Test more queries to confirm.'}
              {aioScore >= 85 && 'Owned territory. Compounding nicely.'}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">Topics owned</div>
            <div className="font-display text-5xl font-light">{topics.length}</div>
            <div className="font-sans text-xs text-stone-400 mt-1">Clusters with stance + content</div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">Queries logged · Appeared</div>
            <div className="font-display text-5xl font-light">{queries.length}<span className="text-stone-600 text-2xl"> / </span><span className="text-emerald-400">{appearedQueries.length}</span></div>
            <div className="font-sans text-xs text-stone-400 mt-1">Times you appeared in AI answers</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 mb-8">
        <div className="flex gap-8">
          <button onClick={() => setTab('overview')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === 'overview' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Compass className="w-4 h-4" /> Why AIO
          </button>
          <button onClick={() => setTab('topics')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === 'topics' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Network className="w-4 h-4" /> Topic Clusters ({topics.length})
          </button>
          <button onClick={() => setTab('queries')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === 'queries' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Search className="w-4 h-4" /> Query Tests ({queries.length})
          </button>
          <button onClick={() => setTab('coverage')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${tab === 'coverage' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}>
            <Radar className="w-4 h-4" /> Long-form Coverage
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">SEO</div>
              <div className="font-display text-3xl font-light text-stone-900 mb-3">Saturated</div>
              <div className="font-sans text-sm text-stone-700 leading-relaxed">
                Months to years to outrank. Big publishers own the top results. Your competitors have been investing for 5+ years. Hard mode.
              </div>
            </div>
            <div className="bg-stone-900 text-stone-50 p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">AIO</div>
              <div className="font-display text-3xl font-light mb-3">Open</div>
              <div className="font-sans text-sm text-stone-300 leading-relaxed">
                12-24 month window. AI chat tools recommend by topic depth and stance, not domain authority. Whoever publishes consistent, opinionated long-form on a niche topic gets cited.
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-800 mb-3">The 4-step play</div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { n: '01', t: 'Pick 1-3 topics', d: 'Niche enough that you can own them. Not "marketing" — "voice-channel partnerships in MENA telco".' },
                { n: '02', t: 'Take a stance', d: 'Boring summaries don\'t get cited. Strong, defensible opinions get quoted.' },
                { n: '03', t: 'Publish long-form', d: 'Newsletter, blog, podcast. Aim for 5+ pieces per topic. Cite your own work across them.' },
                { n: '04', t: 'Test queries weekly', d: 'Ask ChatGPT/Claude/Perplexity questions in your space. Are you appearing? If not, what\'s missing?' }
              ].map(s => (
                <div key={s.n} className="bg-white border border-amber-200 p-4">
                  <div className="font-mono text-xs text-amber-800 mb-2">{s.n}</div>
                  <div className="font-display text-base font-medium text-stone-900 mb-2">{s.t}</div>
                  <div className="font-sans text-xs text-stone-700 leading-relaxed">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'topics' && (
        <div className="space-y-6">
          <div className="bg-stone-950 text-stone-50 p-7">
            <div className="font-display text-2xl font-light mb-1">Stake a topic</div>
            <div className="font-sans text-sm text-stone-300 mb-5">Niche enough that 5 long-form pieces would make you the obvious answer.</div>
            <div className="space-y-3">
              <Field label="Topic name (very specific)">
                <input value={topicDraft.name} onChange={e => setTopicDraft({ ...topicDraft, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. Voice-channel monetization in MENA telcos" />
              </Field>
              <Field label="Your stance (the contrarian or distinctive take)">
                <textarea rows={3} value={topicDraft.stance} onChange={e => setTopicDraft({ ...topicDraft, stance: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. 'The voice channel is the most undervalued asset in MENA telco. Most operators sell minutes when they should be selling reach.'" />
              </Field>
              <button onClick={addTopic} disabled={!topicDraft.name || !topicDraft.stance} className="px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Stake claim
              </button>
            </div>
          </div>

          {topics.length === 0 ? (
            <EmptyState icon={Network} title="No topic clusters yet" description="Pick the first topic you want to be the AI's go-to source on." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map(t => (
                <div key={t.id} className="bg-white border border-stone-200 p-7 group relative">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Topic cluster</div>
                  <div className="font-display text-2xl font-light text-stone-900 mb-3">{t.name}</div>
                  <div className="bg-stone-50 border-l-4 border-amber-500 p-4 mb-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Your stance</div>
                    <div className="font-sans text-sm text-stone-700 italic leading-relaxed">"{t.stance}"</div>
                  </div>
                  <div className="flex items-center justify-between font-sans text-xs">
                    <div className="text-stone-500">Long-form pieces: <span className="font-mono text-stone-900">{t.longFormCount || 0}</span> / 5</div>
                    <div className="flex items-center gap-2">
                      <input type="number" value={t.longFormCount || 0} onChange={e => saveAio({ ...aio, topics: topics.map(x => x.id === t.id ? { ...x, longFormCount: parseInt(e.target.value) || 0 } : x) })} className="w-16 px-2 py-1 border border-stone-300 font-mono text-xs" />
                      <button onClick={() => removeTopic(t.id)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-stone-200">
                    <div className="h-full bg-emerald-600 transition-all" style={{ width: `${Math.min(100, ((t.longFormCount || 0) / 5) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'queries' && (
        <div className="space-y-6">
          <div className="bg-stone-950 text-stone-50 p-7">
            <div className="font-display text-2xl font-light mb-1">Log a query test</div>
            <div className="font-sans text-sm text-stone-300 mb-5">Once a week, ask a question in your space to ChatGPT/Claude/Perplexity. Did you appear? Where? Log it here.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              <select value={queryDraft.engine} onChange={e => setQueryDraft({ ...queryDraft, engine: e.target.value })} className="bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
                <option>ChatGPT</option><option>Claude</option><option>Perplexity</option><option>Gemini</option><option>Grok</option>
              </select>
              <input value={queryDraft.position} onChange={e => setQueryDraft({ ...queryDraft, position: e.target.value })} placeholder="Position (e.g. cited in answer / linked / not appeared)" className="col-span-2 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
            </div>
            <input value={queryDraft.query} onChange={e => setQueryDraft({ ...queryDraft, query: e.target.value })} placeholder="The exact query you tested" className="w-full mb-3 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
            <textarea rows={2} value={queryDraft.notes} onChange={e => setQueryDraft({ ...queryDraft, notes: e.target.value })} placeholder="Notes — who got cited instead? What was missing in the AI's answer?" className="w-full mb-3 bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 font-sans text-sm">
                <input type="checkbox" checked={queryDraft.appeared} onChange={e => setQueryDraft({ ...queryDraft, appeared: e.target.checked })} />
                I appeared in the answer
              </label>
              <button onClick={addQuery} disabled={!queryDraft.query} className="px-5 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Log test
              </button>
            </div>
          </div>

          {queries.length === 0 ? (
            <EmptyState icon={Search} title="No queries logged" description="Test 5-10 queries to see if and where you're appearing in AI answers." />
          ) : (
            <div className="bg-white border border-stone-200 divide-y divide-stone-200">
              {queries.map(q => (
                <div key={q.id} className="p-5 flex items-start gap-4">
                  <Pill color={q.appeared ? 'green' : 'red'}>{q.appeared ? 'Appeared' : 'No'}</Pill>
                  <Pill color="violet">{q.engine}</Pill>
                  <div className="flex-1">
                    <div className="font-display text-base text-stone-900 leading-snug font-medium">"{q.query}"</div>
                    {q.position && <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-1">{q.position}</div>}
                    {q.notes && <div className="font-sans text-xs text-stone-600 italic mt-1.5">{q.notes}</div>}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{new Date(q.testedAt).toLocaleDateString()}</div>
                  <button onClick={() => removeQuery(q.id)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'coverage' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Long-form coverage</div>
            <div className="font-display text-2xl font-light text-stone-900 mb-1">{longFormPieces.length} long-form pieces in library</div>
            <div className="font-sans text-sm text-stone-600 mb-5">Newsletters, threads, scripts, carousels — these are what the AI cites.</div>

            {topics.length === 0 ? (
              <div className="text-sm text-stone-500 font-sans italic">Stake topic clusters first to see coverage.</div>
            ) : (
              <div className="space-y-3">
                {topics.map(t => {
                  const pct = Math.min(100, ((t.longFormCount || 0) / 5) * 100);
                  return (
                    <div key={t.id} className="border border-stone-200 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-sm text-stone-900">{t.name}</div>
                        <div className="font-mono text-xs text-stone-500">{t.longFormCount || 0} / 5 minimum</div>
                      </div>
                      <div className="h-2 bg-stone-200">
                        <div className={`h-full transition-all ${pct >= 100 ? 'bg-emerald-600' : pct >= 60 ? 'bg-amber-500' : 'bg-stone-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                      {pct < 100 && (
                        <div className="font-sans text-xs text-stone-500 mt-2">
                          {Math.ceil((5 - (t.longFormCount || 0)) * 1)} more long-form pieces to reach the floor for AI citation.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============= IDEA INBOX =============
// Frictionless capture. Voice or text. AI sorts into pain/prize/news, can promote to story.
function IdeaInbox({ ideas, saveIdeas, stories, saveStories, profile }) {
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [interim, setInterim] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice capture requires Chrome, Edge, or Safari. Just type instead.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    let final = draft;
    rec.onresult = (e) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        else interimText += e.results[i][0].transcript;
      }
      setDraft(final.trim());
      setInterim(interimText);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => { setRecording(false); setInterim(''); };
    rec.start();
    setRecognition(rec);
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognition) recognition.stop();
    setRecording(false);
  };

  const capture = async () => {
    if (!draft.trim()) return;
    const idea = {
      id: Date.now(),
      text: draft.trim(),
      capturedAt: new Date().toISOString(),
      processed: false,
      category: null,
      tags: [],
      pinned: false
    };
    saveIdeas([idea, ...ideas]);
    setDraft('');
  };

  const sortWithAI = async (idea) => {
    setProcessing(idea.id);
    const prompt = `You're sorting ${profile.name}'s raw idea into the personal-branding system.

THE IDEA:
"${idea.text}"

THEIR CONTEXT:
Voice: ${profile.voice}, ${profile.tone?.join(', ')}
Pains they address: ${profile.pains?.join('; ')}
Prizes they deliver: ${profile.prizes?.join('; ')}
Audience: ${profile.audiences?.join(', ')}

Return ONLY valid JSON:
{
  "category": "pain | prize | news | unclear",
  "tags": ["3-5 short tags"],
  "shouldBecomeStory": true | false,
  "storyTitle": "if shouldBecomeStory: a one-line title in their voice",
  "storyLesson": "if shouldBecomeStory: the lesson in 1-2 sentences",
  "developmentNotes": "what's missing if it's not story-ready yet (1-2 sentences)"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      saveIdeas(ideas.map(i => i.id === idea.id ? { ...i, ...parsed, processed: true } : i));
    } catch (e) { console.error(e); }
    setProcessing(null);
  };

  const promoteToStory = (idea) => {
    saveStories([{
      id: Date.now(),
      title: idea.storyTitle || idea.text.slice(0, 60),
      lesson: idea.storyLesson || '',
      category: idea.category || 'pain',
      emotion: '',
      month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      context: idea.text,
      framework: 'general',
      tags: idea.tags || [],
      rating: 0,
      timesUsed: 0,
      fromIdea: true,
      createdAt: new Date().toISOString()
    }, ...stories]);
    saveIdeas(ideas.map(i => i.id === idea.id ? { ...i, promoted: true } : i));
  };

  const togglePin = (id) => saveIdeas(ideas.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  const remove = async (id) => { if (await window.brandConfirm('Delete this idea? This cannot be undone.')) saveIdeas(ideas.filter(i => i.id !== id)); };

  const filtered = useMemo(() => {
    let list = ideas;
    if (filter === 'unprocessed') list = list.filter(i => !i.processed);
    else if (filter === 'pain' || filter === 'prize' || filter === 'news') list = list.filter(i => i.category === filter);
    else if (filter === 'pinned') list = list.filter(i => i.pinned);
    if (search) list = list.filter(i => i.text.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.id - a.id));
  }, [ideas, filter, search]);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Capture · Frictionless Capture"
        title="Idea Inbox"
        description="The thoughts that flash through your day. Capture in 5 seconds, develop later. Voice or type — AI categorizes, you promote what's worth keeping."
      />

      {/* Capture box */}
      <div className="bg-stone-950 text-stone-50 p-7 mb-6 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900 opacity-15 rounded-full blur-3xl" />
        <div className="relative">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Capture</div>
          <textarea
            rows={3}
            value={draft + (interim ? ' ' + interim : '')}
            onChange={e => setDraft(e.target.value)}
            placeholder="A line you overheard. A pattern you noticed. A question someone asked. Anything..."
            className="w-full bg-stone-900 border border-stone-700 px-4 py-3 font-display text-lg text-stone-50 placeholder:text-stone-500 outline-none focus:border-stone-500 leading-snug"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-4 py-2 font-sans text-sm flex items-center gap-2 ${recording ? 'bg-red-600 text-stone-50' : 'bg-stone-800 text-stone-50 border border-stone-700 hover:border-stone-500'}`}
            >
              {recording ? <><MicOff className="w-4 h-4" /> Stop · {Math.floor((Date.now() - 0) / 1000) % 60}s</> : <><Mic className="w-4 h-4" /> Voice capture</>}
            </button>
            <div className="flex-1" />
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{draft.length} chars</div>
            <button
              onClick={capture}
              disabled={!draft.trim()}
              className="px-5 py-2 bg-stone-50 text-stone-900 font-sans text-sm hover:bg-stone-200 disabled:opacity-30 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Capture
            </button>
          </div>
          {recording && (
            <div className="mt-3 flex items-center gap-2 font-sans text-xs text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... speak naturally. Click "Stop" when done.
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Captured" value={ideas.length} icon={Inbox} />
        <StatCard label="Unprocessed" value={ideas.filter(i => !i.processed).length} hint="To sort with AI" icon={Hourglass} />
        <StatCard label="Pain leads" value={ideas.filter(i => i.category === 'pain').length} icon={AlertCircle} />
        <StatCard label="Prize leads" value={ideas.filter(i => i.category === 'prize').length} icon={Trophy} />
        <StatCard label="Promoted" value={ideas.filter(i => i.promoted).length} hint="Became stories" icon={ArrowUpRight} />
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 p-4 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
          <Search className="w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas..." className="bg-transparent outline-none flex-1 font-sans text-sm" />
        </div>
        {['all', 'unprocessed', 'pinned', 'pain', 'prize', 'news'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 font-sans text-xs border capitalize ${filter === f ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 hover:border-stone-500'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title={search || filter !== 'all' ? 'No matches' : 'Nothing captured yet'} description={search || filter !== 'all' ? 'Try changing the filters.' : 'Capture your first idea above. Voice works while you walk.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(idea => (
            <div key={idea.id} className={`bg-white border ${idea.pinned ? 'border-amber-400 border-l-4' : 'border-stone-200'} p-5 group relative`}>
              <div className="flex items-center gap-2 mb-3">
                {idea.category && <Pill color={idea.category === 'pain' ? 'red' : idea.category === 'prize' ? 'green' : idea.category === 'news' ? 'amber' : 'stone'}>{idea.category}</Pill>}
                {!idea.processed && <Pill>raw</Pill>}
                {idea.promoted && <Pill color="violet">→ story</Pill>}
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{new Date(idea.capturedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={() => togglePin(idea.id)} className="p-1.5 hover:bg-stone-100">{idea.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}</button>
                  <button onClick={() => remove(idea.id)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
                </div>
              </div>
              <div className="font-display text-base text-stone-900 leading-snug whitespace-pre-wrap mb-3">{idea.text}</div>
              {idea.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {idea.tags.map(t => <Pill key={t}>#{t}</Pill>)}
                </div>
              )}
              {idea.processed && idea.developmentNotes && (
                <div className="bg-stone-50 border-l-2 border-stone-300 p-3 mb-3 font-sans text-xs text-stone-600 italic leading-relaxed">{idea.developmentNotes}</div>
              )}
              <div className="flex gap-2">
                {!idea.processed && (
                  <button onClick={() => sortWithAI(idea)} disabled={processing === idea.id} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5 disabled:opacity-30">
                    {processing === idea.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    Sort with AI
                  </button>
                )}
                {idea.processed && idea.shouldBecomeStory && !idea.promoted && (
                  <button onClick={() => promoteToStory(idea)} className="px-3 py-1.5 bg-stone-900 text-stone-50 font-sans text-xs flex items-center gap-1.5">
                    <ArrowUpRight className="w-3 h-3" /> Promote to story
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= CONVERSATIONS HUB =============
// DM pipeline. Pro tip: get to 30 conversations. Track, draft replies, convert.
const CONVO_STAGES = [
  { v: 'new', label: 'New', color: 'bg-stone-100 border-stone-300', accent: 'text-stone-700' },
  { v: 'engaged', label: 'Engaged', color: 'bg-amber-50 border-amber-300', accent: 'text-amber-800' },
  { v: 'qualified', label: 'Qualified', color: 'bg-violet-50 border-violet-300', accent: 'text-violet-800' },
  { v: 'booked', label: 'Booked', color: 'bg-blue-50 border-blue-300', accent: 'text-blue-800' },
  { v: 'closed_won', label: 'Closed Won', color: 'bg-emerald-50 border-emerald-400', accent: 'text-emerald-800' },
  { v: 'closed_lost', label: 'Closed Lost', color: 'bg-red-50 border-red-300', accent: 'text-red-800' }
];

function ConversationsHub({ conversations, saveConversations, profile, contentPieces }) {
  const [showNew, setShowNew] = useState(false);
  const [prefill, setPrefill] = useState(null);
  const [active, setActive] = useState(null);
  const [view, setView] = useState('pipeline'); // pipeline | list
  const [showBookmarklet, setShowBookmarklet] = useState(false);

  // Auto-open the "New conversation" form when the user arrives via the bookmarklet.
  // The bookmarklet URL: /platform?capture=conversation&text=...&name=...&source=...
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('capture') === 'conversation') {
      setPrefill({
        firstMessage: params.get('text') || '',
        name: params.get('name') || '',
        source: params.get('source') || 'LinkedIn'
      });
      setShowNew(true);
      // Clean up the URL so refreshes don't re-trigger
      const url = new URL(window.location.href);
      ['capture', 'text', 'name', 'source'].forEach((k) => url.searchParams.delete(k));
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const stats = useMemo(() => ({
    total: conversations.length,
    open: conversations.filter(c => !['closed_won', 'closed_lost'].includes(c.stage)).length,
    booked: conversations.filter(c => c.stage === 'booked').length,
    won: conversations.filter(c => c.stage === 'closed_won').length,
    won_value: conversations.filter(c => c.stage === 'closed_won').reduce((s, c) => s + (parseFloat(c.value) || 0), 0)
  }), [conversations]);

  const moveStage = (id, newStage) => saveConversations(conversations.map(c => c.id === id ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c));
  const remove = async (id) => { if (await window.brandConfirm('Delete this conversation? All message history will be lost.')) saveConversations(conversations.filter(c => c.id !== id)); };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1800px]">
      <SectionHeader
        kicker="Pipeline · The Conversation Layer"
        title="DM & Conversations"
        description="The whole strategy hinges on this: get DMs, have 30 conversations, convert. Track every inbound from first message to closed deal."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowBookmarklet(true)}
              className="px-4 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm inline-flex items-center gap-2 text-stone-700"
              title="Install a 1-click bookmark to capture DMs from LinkedIn/X/Instagram"
            >
              <Anchor className="w-4 h-4" /> Bookmarklet
            </button>
            <button onClick={() => setShowNew(true)} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> New conversation
            </button>
          </div>
        }
      />

      {showBookmarklet && <BookmarkletModal onClose={() => setShowBookmarklet(false)} />}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} icon={MessageCircle} />
        <StatCard label="Open" value={stats.open} hint="In active stages" icon={Activity} />
        <StatCard label="Booked calls" value={stats.booked} icon={Phone} />
        <StatCard label="Won" value={stats.won} icon={Trophy} />
        <StatCard label="Won value" value={`$${(stats.won_value / 1000).toFixed(1)}k`} icon={DollarSign} />
      </div>

      <div className="border-b border-stone-200 mb-6">
        <div className="flex gap-8">
          <button onClick={() => setView('pipeline')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'pipeline' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}><Columns className="w-4 h-4" /> Pipeline</button>
          <button onClick={() => setView('list')} className={`pb-3 font-sans text-sm flex items-center gap-2 border-b-2 -mb-px ${view === 'list' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500'}`}><Layout className="w-4 h-4" /> List</button>
        </div>
      </div>

      {showNew && (
        <NewConversationForm
          prefill={prefill}
          onSave={(conv) => { saveConversations([{ ...conv, id: Date.now(), createdAt: new Date().toISOString() }, ...conversations]); setShowNew(false); setPrefill(null); }}
          onCancel={() => { setShowNew(false); setPrefill(null); }}
          contentPieces={contentPieces}
        />
      )}

      {view === 'pipeline' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CONVO_STAGES.map(stage => {
            const items = conversations.filter(c => c.stage === stage.v);
            return (
              <div key={stage.v} className={`border ${stage.color} p-3`}>
                <div className="flex justify-between items-center mb-3">
                  <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${stage.accent} font-semibold`}>{stage.label}</div>
                  <span className="font-mono text-xs text-stone-500">{items.length}</span>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {items.map(c => (
                    <button key={c.id} onClick={() => setActive(c)} className="w-full text-left bg-white border border-stone-200 p-3 hover:border-stone-500">
                      <div className="font-sans text-xs text-stone-500 mb-1">{c.source}</div>
                      <div className="font-display text-sm font-medium text-stone-900 leading-snug mb-1">{c.name}</div>
                      <div className="font-sans text-[11px] text-stone-600 line-clamp-2">{c.firstMessage}</div>
                      {c.value && <div className="font-mono text-[10px] text-emerald-700 mt-1.5">${c.value}</div>}
                    </button>
                  ))}
                  {items.length === 0 && <div className="text-center text-[10px] text-stone-400 font-sans py-6">empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white border border-stone-200 divide-y divide-stone-200">
          {conversations.length === 0 ? (
            <div className="p-12 text-center text-sm text-stone-500 font-sans">No conversations yet — log your first DM above.</div>
          ) : conversations.map(c => {
            const stage = CONVO_STAGES.find(s => s.v === c.stage);
            return (
              <button key={c.id} onClick={() => setActive(c)} className="w-full p-4 flex items-center gap-4 hover:bg-stone-50 text-left">
                <Pill color={c.stage === 'closed_won' ? 'green' : c.stage === 'closed_lost' ? 'red' : c.stage === 'qualified' ? 'violet' : 'amber'}>{stage?.label}</Pill>
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 w-20">{c.source}</span>
                <div className="flex-1">
                  <div className="text-sm text-stone-900 font-medium">{c.name}</div>
                  <div className="font-sans text-xs text-stone-500 line-clamp-1">{c.firstMessage}</div>
                </div>
                {c.value && <div className="font-mono text-xs text-emerald-700">${c.value}</div>}
                <span className="font-mono text-[10px] text-stone-400">{new Date(c.createdAt).toLocaleDateString()}</span>
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <ConversationDetail
          conversation={active}
          onClose={() => setActive(null)}
          onUpdate={(updated) => { saveConversations(conversations.map(c => c.id === updated.id ? updated : c)); setActive(updated); }}
          onDelete={() => { remove(active.id); setActive(null); }}
          onMoveStage={moveStage}
          profile={profile}
        />
      )}
    </div>
  );
}

function NewConversationForm({ onSave, onCancel, contentPieces, prefill }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [c, setC] = useState({
    source: prefill?.source || 'LinkedIn',
    name: prefill?.name || '',
    firstMessage: prefill?.firstMessage || '',
    stage: 'new',
    value: '',
    linkedToPiece: '',
    notes: '',
    history: []
  });
  return (
    <div className="bg-stone-950 text-stone-50 p-7 mb-6">
      <div className="flex justify-between items-center mb-5">
        <div className="font-display text-2xl font-light">Log a new conversation</div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Field label="Source">
          <select value={c.source} onChange={e => setC({ ...c, source: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            <option>LinkedIn</option><option>X / Twitter</option><option>Instagram</option><option>Email</option><option>WhatsApp</option><option>Other</option>
          </select>
        </Field>
        <Field label="Their name">
          <input value={c.name} onChange={e => setC({ ...c, name: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <Field label="Stage">
          <select value={c.stage} onChange={e => setC({ ...c, stage: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            {CONVO_STAGES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Their first message (or your opener if you reached out)">
        <textarea rows={4} value={c.firstMessage} onChange={e => setC({ ...c, firstMessage: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Linked to which piece of content (optional)">
          <select value={c.linkedToPiece} onChange={e => setC({ ...c, linkedToPiece: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            <option value="">— none —</option>
            {contentPieces.slice(0, 20).map(p => <option key={p.id} value={p.id}>{p.hook?.slice(0, 60)}</option>)}
          </select>
        </Field>
        <Field label="Estimated deal value ($, optional)">
          <input type="number" value={c.value} onChange={e => setC({ ...c, value: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400">Cancel</button>
        <button onClick={() => onSave({ ...c, history: c.firstMessage ? [{ from: 'them', text: c.firstMessage, at: new Date().toISOString() }] : [] })} disabled={!c.name || !c.firstMessage} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2"><Save className="w-4 h-4" /> Log conversation</button>
      </div>
    </div>
  );
}

function ConversationDetail({ conversation, onClose, onUpdate, onDelete, onMoveStage, profile }) {
  useEscape(onClose);
  useBodyScrollLock(true);
  const [draft, setDraft] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const addMessage = (from, text) => {
    if (!text.trim()) return;
    const updated = { ...conversation, history: [...(conversation.history || []), { from, text, at: new Date().toISOString() }] };
    onUpdate(updated);
    setDraft('');
  };

  const draftReply = async () => {
    setDrafting(true);
    const prompt = `You're drafting ${profile.name}'s reply in a DM conversation.

CONVERSATION SO FAR (newest last):
${(conversation.history || []).map(m => `[${m.from === 'me' ? profile.name : conversation.name}]: ${m.text}`).join('\n')}

CONTEXT:
- ${profile.name}'s voice: ${profile.voice}, ${profile.tone?.join(', ')}
- Voice taboos: ${profile.voiceTaboos?.join('; ')}
- Their transformation: ${profile.transformation}
- Stage of this conversation: ${conversation.stage}

Draft 3 reply options. Each should sound like the human, not a sales rep. Move the conversation forward without being pushy. Vary tone — one casual, one direct, one curious.

Return ONLY valid JSON:
{
  "drafts": [
    { "tone": "casual", "text": "..." },
    { "tone": "direct", "text": "..." },
    { "tone": "curious", "text": "..." }
  ],
  "nextBestAction": "What should they do after sending? (e.g. propose a 15-min call, send a long-form piece, etc.)"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      setAiSuggestion(safeAIParse(text));
    } catch (e) { console.error(e); }
    setDrafting(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex justify-center items-start overflow-y-auto p-6" onClick={onClose}>
      <div className="bg-white max-w-4xl w-full mt-12 mb-12" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">{conversation.source}</div>
            <div className="font-display text-3xl font-light">{conversation.name}</div>
          </div>
          <div className="flex gap-2">
            <select value={conversation.stage} onChange={e => onMoveStage(conversation.id, e.target.value)} className="px-3 py-2 border border-stone-300 font-sans text-sm">
              {CONVO_STAGES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
            <button aria-label="Delete" onClick={onDelete} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
            <button aria-label="Close" onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Conversation history */}
        <div className="p-6 max-h-96 overflow-y-auto space-y-4 bg-stone-50">
          {(conversation.history || []).map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 flex items-center justify-center font-mono text-[10px] uppercase ${m.from === 'me' ? 'bg-stone-900 text-stone-50' : 'bg-stone-200'}`}>
                {m.from === 'me' ? (profile.name?.slice(0, 1) || 'M') : (conversation.name?.slice(0, 1) || 'T')}
              </div>
              <div className={`max-w-[75%] ${m.from === 'me' ? 'text-right' : ''}`}>
                <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 text-stone-500`}>{m.from === 'me' ? firstNameOf(profile) : conversation.name}</div>
                <div className={`p-3 font-sans text-sm leading-relaxed ${m.from === 'me' ? 'bg-stone-900 text-stone-50 inline-block text-left' : 'bg-white border border-stone-200 text-stone-800'}`}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI suggestion */}
        {aiSuggestion && (
          <div className="p-6 border-t border-stone-200 bg-amber-50">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-3">3 draft replies</div>
            <div className="space-y-2 mb-4">
              {aiSuggestion.drafts.map((d, i) => (
                <button key={i} onClick={() => { setDraft(d.text); setAiSuggestion(null); }} className="w-full text-left p-3 bg-white border border-amber-200 hover:border-amber-500">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">{d.tone}</div>
                  <div className="font-sans text-sm text-stone-800 leading-relaxed">{d.text}</div>
                </button>
              ))}
            </div>
            <div className="bg-white border border-amber-200 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">Next best action</div>
              <div className="font-sans text-sm text-stone-700 italic">{aiSuggestion.nextBestAction}</div>
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="p-6 border-t border-stone-200">
          <textarea rows={3} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Write your reply..." className="w-full px-4 py-3 bg-stone-50 border border-stone-300 font-sans text-sm" />
          <div className="flex justify-between items-center mt-3 gap-3">
            <div className="flex gap-2">
              <button onClick={draftReply} disabled={drafting} className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 font-sans text-xs flex items-center gap-1.5">
                {drafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                AI draft 3 options
              </button>
              <button onClick={() => addMessage('them', draft)} disabled={!draft.trim()} className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 font-sans text-xs disabled:opacity-30">Log as their reply</button>
            </div>
            <button onClick={() => addMessage('me', draft)} disabled={!draft.trim()} className="px-5 py-2 bg-stone-900 text-stone-50 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
              <Send className="w-4 h-4" /> Log my reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= OUTBOUND PIPELINE =============
// Pitches you make: podcasts, speaking, partnerships.
const OUTBOUND_TYPES = [
  { v: 'podcast', label: 'Podcast', icon: Headphones },
  { v: 'speaking', label: 'Speaking', icon: Mic2 },
  { v: 'partnership', label: 'Partnership', icon: HeartHandshake },
  { v: 'media', label: 'Media / PR', icon: Newspaper },
  { v: 'guest_post', label: 'Guest post', icon: PenTool }
];
const OUTBOUND_STAGES = [
  { v: 'researching', label: 'Researching', accent: 'stone' },
  { v: 'pitched', label: 'Pitched', accent: 'amber' },
  { v: 'follow_up', label: 'Follow-up', accent: 'amber' },
  { v: 'accepted', label: 'Accepted', accent: 'green' },
  { v: 'completed', label: 'Completed', accent: 'green' },
  { v: 'declined', label: 'Declined', accent: 'red' }
];

function OutboundPipeline({ outbound, saveOutbound, profile, stories }) {
  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? outbound : outbound.filter(o => o.type === filter);

  const stats = {
    total: outbound.length,
    pitched: outbound.filter(o => ['pitched', 'follow_up'].includes(o.stage)).length,
    accepted: outbound.filter(o => o.stage === 'accepted').length,
    completed: outbound.filter(o => o.stage === 'completed').length,
    rate: outbound.length ? Math.round((outbound.filter(o => ['accepted', 'completed'].includes(o.stage)).length / outbound.length) * 100) : 0
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Pipeline · Outbound Visibility"
        title="Outbound"
        description="Pitches you send to podcasts, conferences, partnerships, media. Track every ask, anchor each pitch to your strongest story, never let a follow-up slip."
        action={
          <button onClick={() => setShowNew(true)} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New pitch
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total pitches" value={stats.total} icon={Megaphone} />
        <StatCard label="In flight" value={stats.pitched} hint="Pitched / awaiting" icon={Hourglass} />
        <StatCard label="Accepted" value={stats.accepted} icon={Check} />
        <StatCard label="Completed" value={stats.completed} icon={Trophy} />
        <StatCard label="Acceptance rate" value={`${stats.rate}%`} icon={Activity} />
      </div>

      {showNew && (
        <NewPitchForm
          stories={stories}
          onSave={(p) => { saveOutbound([{ ...p, id: Date.now(), createdAt: new Date().toISOString() }, ...outbound]); setShowNew(false); }}
          onCancel={() => setShowNew(false)}
        />
      )}

      <div className="bg-white border border-stone-200 p-3 mb-5 flex gap-1 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 font-sans text-xs border ${filter === 'all' ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>All</button>
        {OUTBOUND_TYPES.map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)} className={`px-3 py-1.5 font-sans text-xs border inline-flex items-center gap-1.5 ${filter === t.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 hover:border-stone-500'}`}>
            <t.icon className="w-3 h-3" /> {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title={filter === 'all' ? 'No pitches yet' : 'No pitches in this category'} description="Start tracking your outbound. Don't let a single 'follow up next week' slip." />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(o => {
            const type = OUTBOUND_TYPES.find(t => t.v === o.type);
            const stage = OUTBOUND_STAGES.find(s => s.v === o.stage);
            const story = stories.find(s => s.id === parseInt(o.anchorStoryId));
            return (
              <button key={o.id} onClick={() => setActive(o)} className="bg-white border border-stone-200 p-5 hover:border-stone-900 text-left">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1.5 w-16">
                    {type && <type.icon className="w-5 h-5 text-stone-700" />}
                    <Pill color={stage?.accent === 'green' ? 'green' : stage?.accent === 'red' ? 'red' : stage?.accent === 'amber' ? 'amber' : 'stone'}>{stage?.label}</Pill>
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-xl text-stone-900 leading-tight font-medium">{o.target}</div>
                    <div className="font-sans text-sm text-stone-600 mt-0.5">{o.contactName} {o.contactRole && `· ${o.contactRole}`}</div>
                    {story && (
                      <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-2">Anchor: "{story.title.slice(0, 80)}"</div>
                    )}
                  </div>
                  <div className="text-right">
                    {o.followUpAt && new Date(o.followUpAt) < new Date() && o.stage !== 'completed' && o.stage !== 'declined' && (
                      <Pill color="red">Follow-up overdue</Pill>
                    )}
                    {o.followUpAt && new Date(o.followUpAt) >= new Date() && (
                      <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">Follow up: {new Date(o.followUpAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {active && <PitchDetail pitch={active} stories={stories} onClose={() => setActive(null)} onUpdate={(u) => { saveOutbound(outbound.map(o => o.id === u.id ? u : o)); setActive(u); }} onDelete={async () => { if (await window.brandConfirm('Delete this pitch? This cannot be undone.')) { saveOutbound(outbound.filter(o => o.id !== active.id)); setActive(null); } }} profile={profile} />}
    </div>
  );
}

function NewPitchForm({ stories, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [p, setP] = useState({ type: 'podcast', target: '', contactName: '', contactRole: '', stage: 'researching', anchorStoryId: '', pitchAngle: '', notes: '', followUpAt: '' });
  return (
    <div className="bg-stone-950 text-stone-50 p-7 mb-6">
      <div className="flex justify-between items-center mb-5">
        <div className="font-display text-2xl font-light">New pitch</div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Field label="Type">
          <select value={p.type} onChange={e => setP({ ...p, type: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            {OUTBOUND_TYPES.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Target (show name / company / event)">
          <input value={p.target} onChange={e => setP({ ...p, target: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. My First Million" />
        </Field>
        <Field label="Stage">
          <select value={p.stage} onChange={e => setP({ ...p, stage: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            {OUTBOUND_STAGES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Contact name">
          <input value={p.contactName} onChange={e => setP({ ...p, contactName: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <Field label="Contact role">
          <input value={p.contactRole} onChange={e => setP({ ...p, contactRole: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder="e.g. Producer / Booker" />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Field label="Anchor story">
          <select value={p.anchorStoryId} onChange={e => setP({ ...p, anchorStoryId: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            <option value="">— pick a story —</option>
            {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </Field>
        <Field label="Follow-up date">
          <input type="date" value={p.followUpAt} onChange={e => setP({ ...p, followUpAt: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
      </div>
      <Field label="Pitch angle (your one-liner)">
        <textarea rows={3} value={p.pitchAngle} onChange={e => setP({ ...p, pitchAngle: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
      </Field>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400">Cancel</button>
        <button onClick={() => onSave(p)} disabled={!p.target} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save pitch</button>
      </div>
    </div>
  );
}

function PitchDetail({ pitch, stories, onClose, onUpdate, onDelete, profile }) {
  useEscape(onClose);
  useBodyScrollLock(true);
  const [drafting, setDrafting] = useState(false);
  const [draftedPitch, setDraftedPitch] = useState(null);
  const story = stories.find(s => s.id === parseInt(pitch.anchorStoryId));

  const draftPitch = async () => {
    setDrafting(true);
    const prompt = `Draft an outreach message for ${profile.name}.

WHO: ${pitch.contactName} (${pitch.contactRole}) at ${pitch.target}
TYPE: ${pitch.type}
ANGLE: ${pitch.pitchAngle || 'not specified'}
ANCHOR STORY: ${story ? `"${story.title}" — ${story.lesson}` : 'none'}
${profile.name}'s voice: ${profile.voice}, ${profile.tone?.join(', ')}
Voice taboos: ${profile.voiceTaboos?.join('; ')}

Write 3 versions:
1. Cold and direct (under 80 words)
2. Warm and curious (under 100 words)
3. Bold / contrarian (under 100 words)

Return ONLY valid JSON:
{
  "drafts": [
    { "style": "direct", "subject": "if email", "body": "..." },
    { "style": "warm", "subject": "...", "body": "..." },
    { "style": "bold", "subject": "...", "body": "..." }
  ],
  "followUpRule": "When to follow up if no reply (e.g. '7 days, with new value')"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      setDraftedPitch(safeAIParse(text));
    } catch (e) { console.error(e); }
    setDrafting(false);
  };

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex justify-center items-start p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-white max-w-3xl w-full mt-12 mb-12" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-stone-200 flex justify-between items-start">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">{OUTBOUND_TYPES.find(t => t.v === pitch.type)?.label}</div>
            <div className="font-display text-3xl font-light">{pitch.target}</div>
            <div className="font-sans text-sm text-stone-600 mt-1">{pitch.contactName} · {pitch.contactRole}</div>
          </div>
          <div className="flex gap-2">
            <select value={pitch.stage} onChange={e => onUpdate({ ...pitch, stage: e.target.value })} className="px-3 py-2 border border-stone-300 font-sans text-sm">
              {OUTBOUND_STAGES.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
            <button aria-label="Delete" onClick={onDelete} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
            <button aria-label="Close" onClick={onClose}><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {story && (
            <div className="bg-stone-50 border-l-4 border-stone-900 p-4">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Anchor story</div>
              <div className="font-display text-base font-medium text-stone-900 mb-1">{story.title}</div>
              <div className="font-sans text-xs text-stone-600 italic">→ {story.lesson}</div>
            </div>
          )}

          <Field label="Pitch angle">
            <Textarea rows={3} value={pitch.pitchAngle || ''} onChange={v => onUpdate({ ...pitch, pitchAngle: v })} />
          </Field>
          <Field label="Notes / next steps">
            <Textarea rows={3} value={pitch.notes || ''} onChange={v => onUpdate({ ...pitch, notes: v })} />
          </Field>

          <button onClick={draftPitch} disabled={drafting} className="w-full px-4 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center justify-center gap-2 disabled:opacity-30">
            {drafting ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting 3 versions...</> : <><Wand2 className="w-4 h-4" /> Draft pitch (3 versions)</>}
          </button>

          {draftedPitch && (
            <div className="space-y-3">
              {draftedPitch.drafts.map((d, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">Version: {d.style}</div>
                  {d.subject && <div className="font-display text-base font-medium text-stone-900 mb-2">Subject: {d.subject}</div>}
                  <div className="font-sans text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{d.body}</div>
                  <button onClick={() => navigator.clipboard?.writeText(`${d.subject ? d.subject + '\n\n' : ''}${d.body}`)} className="mt-3 px-3 py-1.5 bg-white border border-amber-200 hover:border-amber-500 font-sans text-xs inline-flex items-center gap-1.5">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              ))}
              {draftedPitch.followUpRule && (
                <div className="bg-stone-50 border-l-4 border-stone-900 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Follow-up rule</div>
                  <div className="font-sans text-sm text-stone-700">{draftedPitch.followUpRule}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= REPURPOSING STUDIO =============
// One story → 5 formats simultaneously, coherent.
function RepurposingStudio({ stories, contentPieces, saveContent, profile, icps, setActiveView }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedICP, setSelectedICP] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(null);

  const formatsToGenerate = [
    { v: 'linkedin_post', label: 'LinkedIn Post', icon: Linkedin, brief: '150-300 words, line breaks every 1-2 sentences, DM CTA' },
    { v: 'twitter_thread', label: 'X / Twitter Thread', icon: Twitter, brief: '5-9 tweets, hook + lesson beats + CTA' },
    { v: 'instagram_carousel', label: 'Instagram Carousel', icon: Instagram, brief: '8 slides: hook → setup → conflict → 4 lesson beats → CTA' },
    { v: 'youtube_short', label: 'YouTube Short Script', icon: Youtube, brief: '60-second script, [visual cues], pacing notes' },
    { v: 'newsletter_section', label: 'Newsletter Section', icon: Mail, brief: '300-500 words: subject + hook + story + framework + CTA' }
  ];

  const repurpose = async () => {
    if (!selectedStory) return;
    setGenerating(true);
    setGenerated(null);

    const icpContext = selectedICP ? `\nTARGETED AT: ${selectedICP.name}\n- Their top pains: ${selectedICP.topPains?.join('; ')}\n- Their vocabulary: ${selectedICP.vocabulary?.join(', ')}\n- Avoid: ${selectedICP.vocabularyToAvoid?.join(', ')}` : '';

    const prompt = `You are repurposing ONE story into 5 coherent platform-native pieces for ${profile.name}.

THE STORY:
- Title: ${selectedStory.title}
- Category: ${selectedStory.category}
- Emotion: ${selectedStory.emotion || 'not specified'}
- Context: ${selectedStory.context || ''}
- Conflict: ${selectedStory.conflict || ''}
- Resolution: ${selectedStory.resolution || ''}
- Lesson: ${selectedStory.lesson}

ABOUT ${profile.name}:
- Voice: ${profile.voice}, ${profile.tone?.join(', ')}
- Voice taboos: ${profile.voiceTaboos?.join('; ')}
- Audience: ${profile.audiences?.join(', ')}
- Transformation: ${profile.transformation}${icpContext}

Produce all 5 formats. They should share narrative DNA but feel native to each platform — different hooks, different rhythms.

Return ONLY valid JSON:
{
  "throughline": "The single sentence the whole campaign turns on (the unifying lesson, said sharply).",
  "linkedin_post": {
    "hook": "First 1-2 lines",
    "body": "Full post body with line breaks every 1-2 sentences",
    "cta": "DM-style CTA"
  },
  "twitter_thread": {
    "tweets": ["Tweet 1 (hook + promise)", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5", "Tweet 6 (CTA)"]
  },
  "instagram_carousel": {
    "slides": [
      { "n": 1, "title": "Hook", "body": "..." },
      { "n": 2, "title": "Setup", "body": "..." },
      { "n": 3, "title": "Conflict", "body": "..." },
      { "n": 4, "title": "Beat 1", "body": "..." },
      { "n": 5, "title": "Beat 2", "body": "..." },
      { "n": 6, "title": "Beat 3", "body": "..." },
      { "n": 7, "title": "The lesson", "body": "..." },
      { "n": 8, "title": "CTA", "body": "..." }
    ]
  },
  "youtube_short": {
    "title": "Catchy title",
    "script": "Full 60s script with [visual cues] and (pacing notes)"
  },
  "newsletter_section": {
    "subject": "Subject line",
    "hook": "Opening 1-2 sentences",
    "body": "300-500 word newsletter section",
    "cta": "Specific CTA"
  }
}`;

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      setGenerated(safeAIParse(text));
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const saveAllToLibrary = () => {
    if (!generated) return;
    const now = Date.now();
    const items = [
      { id: now + 1, type: selectedStory.category, platform: 'LinkedIn', format: 'post', storyId: selectedStory.id, storyTitle: selectedStory.title, hook: generated.linkedin_post.hook, body: generated.linkedin_post.body, cta: generated.linkedin_post.cta, repurposedFrom: selectedStory.id, status: 'draft', createdAt: new Date().toISOString() },
      { id: now + 2, type: selectedStory.category, platform: 'X', format: 'thread', storyId: selectedStory.id, storyTitle: selectedStory.title, hook: generated.twitter_thread.tweets[0], body: generated.twitter_thread.tweets.join('\n\n---\n\n'), cta: generated.twitter_thread.tweets[generated.twitter_thread.tweets.length - 1], repurposedFrom: selectedStory.id, status: 'draft', createdAt: new Date().toISOString() },
      { id: now + 3, type: selectedStory.category, platform: 'Instagram', format: 'carousel', storyId: selectedStory.id, storyTitle: selectedStory.title, hook: generated.instagram_carousel.slides[0]?.body || '', body: generated.instagram_carousel.slides.map(s => `Slide ${s.n} — ${s.title}\n${s.body}`).join('\n\n'), repurposedFrom: selectedStory.id, status: 'draft', createdAt: new Date().toISOString() },
      { id: now + 4, type: selectedStory.category, platform: 'YouTube', format: 'short_script', storyId: selectedStory.id, storyTitle: selectedStory.title, hook: generated.youtube_short.title, body: generated.youtube_short.script, repurposedFrom: selectedStory.id, status: 'draft', createdAt: new Date().toISOString() },
      { id: now + 5, type: selectedStory.category, platform: 'Newsletter', format: 'newsletter', storyId: selectedStory.id, storyTitle: selectedStory.title, hook: generated.newsletter_section.subject, body: generated.newsletter_section.body, cta: generated.newsletter_section.cta, repurposedFrom: selectedStory.id, status: 'draft', createdAt: new Date().toISOString() }
    ];
    saveContent([...items, ...contentPieces]);
    setGenerated(null);
    setSelectedStory(null);
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Production · One Story, Many Formats"
        title="Repurposing Studio"
        description="One story isn't one piece — it's five. Pick a story, get LinkedIn + X + Instagram + YouTube + Newsletter all at once. Coherent throughline. Native to each platform."
      />

      {/* Story picker */}
      <div className="bg-white border border-stone-200 p-6 mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">1. Pick a story</div>
        {stories.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-amber-900 mb-1">No stories to repurpose yet</div>
              <div className="font-sans text-sm text-amber-800 mb-3">Capture your first story (voice works great) — then come back here to turn it into 5 platform-native posts in one click.</div>
              <button
                onClick={() => setActiveView && setActiveView('stories')}
                className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-xs hover:bg-stone-800 inline-flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5" /> Go to Story Vault
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {stories.map(s => (
              <button key={s.id} onClick={() => setSelectedStory(s)} className={`p-3 text-left border ${selectedStory?.id === s.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 bg-stone-50 hover:border-stone-500'}`}>
                <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 ${selectedStory?.id === s.id ? 'text-stone-400' : 'text-stone-500'}`}>{s.month} · {s.category}</div>
                <div className="text-sm leading-snug line-clamp-2 font-medium">{s.title}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {icps.length > 0 && (
        <div className="bg-white border border-stone-200 p-6 mb-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">2. ICP target (optional)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {icps.map(icp => (
              <button key={icp.id} onClick={() => setSelectedICP(selectedICP?.id === icp.id ? null : icp)} className={`p-3 text-left border ${selectedICP?.id === icp.id ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 bg-stone-50 hover:border-stone-500'}`}>
                <Crosshair className="w-3.5 h-3.5 mb-1.5" />
                <div className="text-sm font-medium">{icp.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button onClick={repurpose} disabled={!selectedStory || generating} className="px-7 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 disabled:opacity-30 inline-flex items-center gap-2">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating 5 formats...</> : <><Shapes className="w-4 h-4" /> Generate all 5 formats</>}
        </button>
      </div>

      {generated && (
        <div className="space-y-5">
          {/* Throughline */}
          <div className="bg-stone-950 text-stone-50 p-7 grain relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900 opacity-25 rounded-full blur-3xl" />
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">The throughline</div>
              <div className="font-display text-2xl font-light italic leading-snug">"{generated.throughline}"</div>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /><div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">LinkedIn Post</div></div>
              <button onClick={() => copy(`${generated.linkedin_post.hook}\n\n${generated.linkedin_post.body}\n\n${generated.linkedin_post.cta}`, 'li')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                {copied === 'li' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="font-display text-lg font-medium text-stone-900 leading-snug mb-3">{generated.linkedin_post.hook}</div>
            <div className="font-sans text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mb-3">{generated.linkedin_post.body}</div>
            <div className="border-t border-stone-200 pt-3 font-sans text-sm text-stone-600 italic">{generated.linkedin_post.cta}</div>
          </div>

          {/* Twitter Thread */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Twitter className="w-4 h-4 text-stone-900" /><div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">X / Twitter Thread ({generated.twitter_thread.tweets.length} tweets)</div></div>
              <button onClick={() => copy(generated.twitter_thread.tweets.map((t, i) => `${i+1}/ ${t}`).join('\n\n'), 'tw')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                {copied === 'tw' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy thread</>}
              </button>
            </div>
            <div className="space-y-2">
              {generated.twitter_thread.tweets.map((t, i) => (
                <div key={i} className="border-l-2 border-stone-300 pl-4 py-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">{i+1}/{generated.twitter_thread.tweets.length}</div>
                  <div className="font-sans text-sm text-stone-800 leading-relaxed">{t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Instagram Carousel */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600" /><div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Instagram Carousel ({generated.instagram_carousel.slides.length} slides)</div></div>
              <button onClick={() => copy(generated.instagram_carousel.slides.map(s => `Slide ${s.n} — ${s.title}\n${s.body}`).join('\n\n'), 'ig')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                {copied === 'ig' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {generated.instagram_carousel.slides.map(s => (
                <div key={s.n} className="aspect-square bg-stone-50 border border-stone-200 p-3 flex flex-col">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">{String(s.n).padStart(2,'0')}</div>
                  <div className="font-display text-sm font-medium text-stone-900 mb-2">{s.title}</div>
                  <div className="font-sans text-[11px] text-stone-700 leading-snug overflow-hidden">{s.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube Short */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Youtube className="w-4 h-4 text-red-600" /><div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">YouTube Short Script</div></div>
              <button onClick={() => copy(`${generated.youtube_short.title}\n\n${generated.youtube_short.script}`, 'yt')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                {copied === 'yt' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="font-display text-lg font-medium text-stone-900 mb-3">{generated.youtube_short.title}</div>
            <div className="bg-stone-50 border-l-2 border-stone-300 p-4 font-mono text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">{generated.youtube_short.script}</div>
          </div>

          {/* Newsletter */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-700" /><div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Newsletter Section</div></div>
              <button onClick={() => copy(`Subject: ${generated.newsletter_section.subject}\n\n${generated.newsletter_section.hook}\n\n${generated.newsletter_section.body}\n\n${generated.newsletter_section.cta}`, 'nl')} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                {copied === 'nl' ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Subject</div>
            <div className="font-display text-lg font-medium text-stone-900 mb-3">{generated.newsletter_section.subject}</div>
            <div className="font-display text-base text-stone-800 italic mb-3">{generated.newsletter_section.hook}</div>
            <div className="font-sans text-sm text-stone-700 whitespace-pre-wrap leading-relaxed mb-3">{generated.newsletter_section.body}</div>
            <div className="border-t border-stone-200 pt-3 font-sans text-sm text-stone-600 italic">{generated.newsletter_section.cta}</div>
          </div>

          {/* Save all */}
          <div className="bg-stone-50 border border-stone-200 p-5 flex justify-between items-center">
            <div className="font-sans text-sm text-stone-600">All 5 pieces will be saved to your Content Library as drafts.</div>
            <button onClick={saveAllToLibrary} className="px-7 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Bookmark className="w-4 h-4" /> Save all 5 to library</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= SWIPE FILE =============
// Capture content you admire. AI extracts the structural pattern.
function SwipeFile({ swipeFile, saveSwipeFile, profile }) {
  const [draft, setDraft] = useState({ source: '', url: '', text: '', author: '', tags: [] });
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const captureAndAnalyze = async () => {
    if (!draft.text) return;
    setAnalyzing(true);
    const prompt = `You are a writing analyst studying a piece of content for ${profile.name}'s swipe file.

THE PIECE:
Source: ${draft.source || 'unknown'}
Author: ${draft.author || 'unknown'}
Text:
"""
${draft.text}
"""

Extract the structural blueprint that made this work. ${profile.name}'s voice is: ${profile.voice}, ${profile.tone?.join(', ')}.

Return ONLY valid JSON:
{
  "hookType": "What kind of hook (e.g. 'pain promise', 'contrarian claim', 'data shock')",
  "structure": ["Beat 1: ...", "Beat 2: ...", "Beat 3: ...", "..."],
  "rhetoricalMoves": ["3-5 specific moves the writer used"],
  "whyItWorks": "2-3 sentences on why this lands",
  "stealableTemplate": "A reusable template based on this — with [variables] in brackets — that ${profile.name} could fill in with their own story",
  "fitsTheirVoice": "yes / partial / no — and why",
  "tags": ["3-5 tags"]
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const t = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = JSON.parse(t.replace(/```json|```/g, '').trim());
      saveSwipeFile([{ ...draft, ...parsed, id: Date.now(), capturedAt: new Date().toISOString() }, ...swipeFile]);
      setDraft({ source: '', url: '', text: '', author: '', tags: [] });
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  const remove = async (id) => { if (await window.brandConfirm('Delete this swipe?')) saveSwipeFile(swipeFile.filter(s => s.id !== id)); };

  const filtered = useMemo(() => {
    let list = swipeFile;
    if (filter !== 'all') list = list.filter(s => s.hookType?.toLowerCase().includes(filter));
    if (search) list = list.filter(s => (s.text + s.author + (s.tags || []).join(' ')).toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [swipeFile, filter, search]);

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Capture · Inspiration File"
        title="Swipe File"
        description="Posts you admire. Hooks that stopped your scroll. Paste them in — AI extracts the structural pattern so you can steal the move (not the words)."
      />

      {/* Capture */}
      <div className="bg-stone-950 text-stone-50 p-7 mb-6">
        <div className="font-display text-2xl font-light mb-1">Capture a piece</div>
        <div className="font-sans text-sm text-stone-300 mb-5">Paste any post / tweet / hook / paragraph. We'll analyze why it works.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <input value={draft.source} onChange={e => setDraft({ ...draft, source: e.target.value })} placeholder="Source (e.g. LinkedIn)" className="bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          <input value={draft.author} onChange={e => setDraft({ ...draft, author: e.target.value })} placeholder="Author (e.g. Justin Welsh)" className="bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
          <input value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} placeholder="URL (optional)" className="bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </div>
        <textarea rows={6} value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} placeholder="Paste the content here..." className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        <button onClick={captureAndAnalyze} disabled={!draft.text || analyzing} className="mt-3 px-5 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2">
          {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing pattern...</> : <><ScanLine className="w-4 h-4" /> Capture & analyze</>}
        </button>
      </div>

      {/* Stats + filters */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="In file" value={swipeFile.length} icon={Files} />
        <StatCard label="Hook patterns" value={[...new Set(swipeFile.map(s => s.hookType).filter(Boolean))].length} icon={Zap} />
        <StatCard label="Authors" value={[...new Set(swipeFile.map(s => s.author).filter(Boolean))].length} icon={Users} />
        <StatCard label="Voice fit" value={swipeFile.filter(s => s.fitsTheirVoice?.startsWith('yes')).length} hint="Match your voice" icon={Check} />
      </div>

      <div className="bg-white border border-stone-200 p-4 mb-6 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
          <Search className="w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search swipe file..." className="bg-transparent outline-none flex-1 font-sans text-sm" />
        </div>
        {['all', 'pain', 'prize', 'contrarian', 'data', 'story'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 font-sans text-xs border capitalize ${filter === f ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Files} title={swipeFile.length === 0 ? 'Empty swipe file' : 'No matches'} description="Capture content you admire and AI will extract why it works." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-white border border-stone-200 p-6 group relative">
              <div className="flex items-center gap-2 mb-3">
                {s.hookType && <Pill color="violet">{s.hookType}</Pill>}
                {s.fitsTheirVoice?.startsWith('yes') && <Pill color="green">voice fit</Pill>}
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{s.source} · {s.author}</span>
                <button onClick={() => remove(s.id)} className="ml-auto opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
              </div>
              <div className="bg-stone-50 border-l-2 border-stone-300 p-3 mb-4 font-sans text-sm text-stone-700 italic leading-relaxed line-clamp-4">"{s.text}"</div>
              {s.whyItWorks && (
                <div className="mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Why it works</div>
                  <div className="font-sans text-sm text-stone-800 leading-relaxed">{s.whyItWorks}</div>
                </div>
              )}
              {s.structure && (
                <div className="mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Structure</div>
                  <ul className="space-y-0.5">
                    {s.structure.map((b, i) => <li key={i} className="font-sans text-xs text-stone-700">→ {b}</li>)}
                  </ul>
                </div>
              )}
              {s.stealableTemplate && (
                <div className="bg-amber-50 border border-amber-200 p-3 mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">Stealable template</div>
                  <div className="font-sans text-sm text-stone-800 italic">{s.stealableTemplate}</div>
                </div>
              )}
              {s.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.tags.map(t => <Pill key={t}>#{t}</Pill>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= NEWSLETTER STUDIO =============
// Section-based composer with AI-assisted drafting per section.
function NewsletterStudio({ newsletters, saveNewsletters, stories, profile, setActiveView }) {
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('list');

  const create = () => {
    setEditing({
      id: Date.now(),
      title: '',
      subject: '',
      preview: '',
      sections: [
        { kind: 'intro', title: 'Intro', content: '' },
        { kind: 'story', title: 'The story', content: '' },
        { kind: 'framework', title: 'The takeaway', content: '' },
        { kind: 'cta', title: 'CTA', content: '' }
      ],
      status: 'draft',
      scheduledAt: '',
      anchorStoryId: '',
      createdAt: new Date().toISOString()
    });
    setView('edit');
  };

  const save = (n) => {
    const exists = newsletters.find(x => x.id === n.id);
    if (exists) saveNewsletters(newsletters.map(x => x.id === n.id ? n : x));
    else saveNewsletters([n, ...newsletters]);
    setView('list');
    setEditing(null);
  };

  const remove = async (id) => { if (await window.brandConfirm('Delete this newsletter? All sections will be lost.')) saveNewsletters(newsletters.filter(n => n.id !== id)); };

  if (view === 'edit' && editing) {
    return <NewsletterEditor newsletter={editing} stories={stories} profile={profile} onSave={save} onCancel={() => { setView('list'); setEditing(null); }} />;
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Production · Long-form"
        title="Newsletter Studio"
        description="Section-based composer for the long-form piece that becomes your AI-citable signature content. Hook → story → framework → CTA. AI helps draft each section in your voice."
        action={
          <button onClick={create} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New newsletter
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={newsletters.length} icon={Mail} />
        <StatCard label="Drafts" value={newsletters.filter(n => n.status === 'draft').length} icon={Edit3} />
        <StatCard label="Scheduled" value={newsletters.filter(n => n.status === 'scheduled').length} icon={Clock} />
        <StatCard label="Sent" value={newsletters.filter(n => n.status === 'sent').length} icon={Send} />
      </div>

      {newsletters.length === 0 ? (
        <EmptyState icon={Mail} title="No newsletters yet" description="Long-form is what AI search engines cite. Start writing." action={<button onClick={create} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Compose first newsletter</button>} />
      ) : (
        <div className="space-y-3">
          {newsletters.map(n => (
            <div key={n.id} className="bg-white border border-stone-200 p-6 flex items-start gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Pill color={n.status === 'sent' ? 'green' : n.status === 'scheduled' ? 'amber' : 'stone'}>{n.status}</Pill>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-display text-2xl font-light text-stone-900 leading-tight">{n.title || 'Untitled newsletter'}</div>
                <div className="font-sans text-sm text-stone-600 mt-1 italic">Subject: {n.subject || '—'}</div>
                <div className="font-sans text-xs text-stone-500 mt-2">{n.sections?.length || 0} sections · {n.sections?.reduce((sum, s) => sum + (s.content?.split(/\s+/).filter(Boolean).length || 0), 0) || 0} words</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(n); setView('edit'); }} className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-sm">Edit</button>
                <button onClick={() => remove(n.id)} className="p-2 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsletterEditor({ newsletter, stories, profile, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [n, setN] = useState(newsletter);
  const [generatingSection, setGeneratingSection] = useState(null);
  const [generatingFull, setGeneratingFull] = useState(false);
  const [preview, setPreview] = useState(false);

  const updateSection = (idx, key, val) => {
    const next = [...n.sections];
    next[idx] = { ...next[idx], [key]: val };
    setN({ ...n, sections: next });
  };

  const addSection = () => setN({ ...n, sections: [...n.sections, { kind: 'custom', title: 'Custom', content: '' }] });
  const removeSection = (idx) => setN({ ...n, sections: n.sections.filter((_, i) => i !== idx) });

  const draftSection = async (idx) => {
    const section = n.sections[idx];
    setGeneratingSection(idx);
    const story = stories.find(s => s.id === parseInt(n.anchorStoryId));
    const prompt = `Draft the "${section.kind}" section of a newsletter for ${profile.name}.

Newsletter so far:
Title: ${n.title}
Subject: ${n.subject}
Anchor story: ${story ? `"${story.title}" — ${story.lesson}` : 'none'}

Other sections (so you stay coherent):
${n.sections.filter((_, i) => i !== idx && _.content).map(s => `[${s.kind}] ${s.content.slice(0, 200)}...`).join('\n\n')}

Voice: ${profile.voice}, ${profile.tone?.join(', ')}
Voice taboos: ${profile.voiceTaboos?.join('; ')}
Audience: ${profile.audiences?.join(', ')}

Write JUST this section. ${section.kind === 'intro' ? 'Open with a hook. 2-3 short paragraphs.' : ''}${section.kind === 'story' ? 'Tell the anchor story. Show, don\'t summarize. 3-4 paragraphs.' : ''}${section.kind === 'framework' ? 'Distill the lesson into a 3-5 step framework or principle. Numbered or bulleted.' : ''}${section.kind === 'cta' ? 'A specific, low-friction call to action. 1-2 sentences. DM-style.' : ''}

Return ONLY the section content (no JSON, no headers, no quotes around it). Write it as if it were already published.`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('').trim();
      updateSection(idx, 'content', text);
    } catch (e) { console.error(e); }
    setGeneratingSection(null);
  };

  const draftAll = async () => {
    setGeneratingFull(true);
    const story = stories.find(s => s.id === parseInt(n.anchorStoryId));
    const prompt = `Draft a full newsletter for ${profile.name} based on a single story.

ANCHOR STORY:
${story ? `Title: ${story.title}\nLesson: ${story.lesson}\nContext: ${story.context}` : 'No anchor — pick a topic from voice/audience'}

VOICE: ${profile.voice}, ${profile.tone?.join(', ')}
TABOOS: ${profile.voiceTaboos?.join('; ')}
AUDIENCE: ${profile.audiences?.join(', ')}

Return ONLY valid JSON:
{
  "title": "Newsletter title",
  "subject": "Email subject line",
  "preview": "Preview text (under 90 chars)",
  "intro": "Intro section (2-3 short paragraphs)",
  "story": "Story section (3-4 paragraphs, vivid)",
  "framework": "Framework section (numbered or bulleted, the takeaway)",
  "cta": "CTA section (1-2 sentences, specific)"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setN({
        ...n,
        title: parsed.title,
        subject: parsed.subject,
        preview: parsed.preview,
        sections: [
          { kind: 'intro', title: 'Intro', content: parsed.intro },
          { kind: 'story', title: 'The story', content: parsed.story },
          { kind: 'framework', title: 'The takeaway', content: parsed.framework },
          { kind: 'cta', title: 'CTA', content: parsed.cta }
        ]
      });
    } catch (e) { console.error(e); }
    setGeneratingFull(false);
  };

  const wordCount = n.sections.reduce((s, sec) => s + (sec.content?.split(/\s+/).filter(Boolean).length || 0), 0);

  if (preview) {
    return (
      <div className="p-4 md:p-8 lg:p-12 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setPreview(false)} className="font-sans text-sm text-stone-600 inline-flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back to editor</button>
          <button onClick={() => onSave(n)} className="px-5 py-2 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
        <div className="bg-white border border-stone-200 p-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <div className="font-display text-4xl font-light text-stone-900 leading-tight mb-2">{n.title || 'Untitled'}</div>
          <div className="font-sans text-base text-stone-600 mb-8 italic">{n.preview}</div>
          <div className="space-y-6">
            {n.sections.map((s, i) => (
              <div key={i}>
                {s.title && <div className="font-display text-xl font-medium text-stone-900 mb-2">{s.title}</div>}
                <div className="font-sans text-base text-stone-700 leading-relaxed whitespace-pre-wrap">{s.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">Editing newsletter</div>
          <h1 className="font-display text-4xl font-light text-stone-900 leading-tight">{n.title || 'New newsletter'}</h1>
          <div className="font-sans text-xs text-stone-500 mt-2">{wordCount} words · {n.sections.length} sections</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 font-sans text-sm">Cancel</button>
          <button onClick={() => setPreview(true)} className="px-4 py-2 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center gap-2"><Eye className="w-4 h-4" /> Preview</button>
          <button onClick={() => onSave(n)} className="px-5 py-2 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="col-span-2 space-y-4">
          {/* Header fields */}
          <div className="bg-white border border-stone-200 p-5 space-y-3">
            <Field label="Title (the headline)">
              <Input value={n.title} onChange={v => setN({ ...n, title: v })} />
            </Field>
            <Field label="Email subject line">
              <Input value={n.subject} onChange={v => setN({ ...n, subject: v })} />
            </Field>
            <Field label="Preview text (under 90 chars)">
              <Input value={n.preview} onChange={v => setN({ ...n, preview: v })} placeholder="Shows in the inbox preview" />
            </Field>
          </div>

          {/* Sections */}
          {n.sections.map((s, i) => (
            <div key={i} className="bg-white border border-stone-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Pill color={s.kind === 'intro' ? 'amber' : s.kind === 'story' ? 'blue' : s.kind === 'framework' ? 'violet' : s.kind === 'cta' ? 'green' : 'stone'}>{s.kind}</Pill>
                  <input value={s.title} onChange={e => updateSection(i, 'title', e.target.value)} className="font-display text-lg font-medium border-none outline-none bg-transparent" placeholder="Section title (optional)" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => draftSection(i)} disabled={generatingSection === i} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 font-sans text-xs flex items-center gap-1.5">
                    {generatingSection === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI draft
                  </button>
                  <button onClick={() => removeSection(i)} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
                </div>
              </div>
              <textarea rows={6} value={s.content} onChange={e => updateSection(i, 'content', e.target.value)} placeholder={`Write your ${s.kind} here...`} className="w-full px-4 py-3 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-sm leading-relaxed" />
              <div className="font-mono text-[10px] text-stone-400 mt-1">{s.content?.split(/\s+/).filter(Boolean).length || 0} words</div>
            </div>
          ))}

          <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-stone-500 font-sans text-sm text-stone-600 inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add section</button>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="bg-stone-950 text-stone-50 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">AI assist</div>
            <div className="font-display text-lg mb-3">Draft the whole thing</div>
            <Field label="Anchor story">
              <select value={n.anchorStoryId} onChange={e => setN({ ...n, anchorStoryId: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
                <option value="">— pick a story —</option>
                {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </Field>
            <button onClick={draftAll} disabled={generatingFull} className="w-full mt-4 px-4 py-2.5 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center justify-center gap-2">
              {generatingFull ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting...</> : <><SparkleIcon className="w-4 h-4" /> Draft full newsletter</>}
            </button>
          </div>

          <div className="bg-white border border-stone-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Status</div>
            <select value={n.status} onChange={e => setN({ ...n, status: e.target.value })} className="w-full px-3 py-2 border border-stone-300 font-sans text-sm mb-3">
              <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sent">Sent</option>
            </select>
            {n.status === 'scheduled' && (
              <Field label="Scheduled for">
                <input type="datetime-local" value={n.scheduledAt || ''} onChange={e => setN({ ...n, scheduledAt: e.target.value })} className="w-full px-3 py-2 border border-stone-300 font-sans text-sm" />
              </Field>
            )}
          </div>

          <NewsletterSendCard newsletter={n} />
        </div>
      </div>
    </div>
  );
}

// Inline Send-via-Resend card. Falls back gracefully when RESEND_API_KEY isn't
// configured server-side (the API returns 503 with setup docs link).
function NewsletterSendCard({ newsletter }) {
  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);
  const [sentInfo, setSentInfo] = useState(null);

  const cleanRecipients = useMemo(() => {
    return recipients
      .split(/[,\n;]/)
      .map(s => s.trim())
      .filter(s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  }, [recipients]);

  const buildHtml = () => {
    const sectionsHtml = (newsletter.sections || [])
      .map(s => `<section style="margin-bottom:32px;">${s.title ? `<h2 style="font-family:Georgia,serif;font-size:24px;font-weight:500;margin:0 0 12px;">${escapeHtml(s.title)}</h2>` : ''}<div style="font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.6;color:#374151;white-space:pre-wrap;">${escapeHtml(s.content || '')}</div></section>`)
      .join('');
    return `<!doctype html><html><body style="margin:0;padding:24px;background:#fafaf9;font-family:Inter,system-ui,sans-serif;color:#1c1917;"><div style="max-width:640px;margin:0 auto;background:#fff;padding:40px 32px;">${newsletter.title ? `<h1 style="font-family:Georgia,serif;font-size:32px;font-weight:300;line-height:1.2;margin:0 0 8px;">${escapeHtml(newsletter.title)}</h1>` : ''}${newsletter.preview ? `<p style="font-family:Georgia,serif;font-size:16px;font-style:italic;color:#78716c;margin:0 0 32px;">${escapeHtml(newsletter.preview)}</p>` : ''}${sectionsHtml}</div></body></html>`;
  };

  const buildText = () => {
    return (newsletter.sections || [])
      .map(s => (s.title ? `\n${s.title}\n${'-'.repeat(s.title.length)}\n` : '\n') + (s.content || ''))
      .join('\n');
  };

  const send = async () => {
    if (cleanRecipients.length === 0) return;
    setSending(true);
    setSentInfo(null);
    try {
      const r = await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: cleanRecipients,
          subject: newsletter.subject || newsletter.title || 'Untitled newsletter',
          html: buildHtml(),
          text: buildText()
        })
      });
      const data = await r.json();
      if (!r.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: data.error || `Send failed (HTTP ${r.status})` } }));
        }
        setSentInfo({ ok: false, error: data.error });
      } else {
        setSentInfo({ ok: true, count: data.sent || cleanRecipients.length });
        setRecipients('');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'success', message: `Newsletter sent to ${data.sent || cleanRecipients.length} recipient(s).` } }));
        }
      }
    } catch (e) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: 'Send failed: ' + e.message } }));
      }
      setSentInfo({ ok: false, error: e.message });
    }
    setSending(false);
  };

  return (
    <div className="bg-stone-950 text-stone-50 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-2">Send via email</div>
      <div className="font-display text-lg mb-3">Ship it (Resend)</div>
      <div className="font-sans text-xs text-stone-300 mb-4 leading-relaxed">
        Paste recipient emails (comma- or newline-separated). Max 50. Requires <span className="font-mono">RESEND_API_KEY</span> server env var.
      </div>
      <textarea
        rows={3}
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
        placeholder="alice@example.com, bob@example.com"
        className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-mono text-xs text-stone-100 placeholder:text-stone-600"
      />
      <div className="flex items-center justify-between mt-3 gap-2">
        <span className="font-mono text-[10px] text-stone-500">
          {cleanRecipients.length === 0 ? 'No valid emails yet' : `${cleanRecipients.length} valid email${cleanRecipients.length === 1 ? '' : 's'}`}
        </span>
        <button
          onClick={send}
          disabled={cleanRecipients.length === 0 || sending}
          className="px-4 py-2 bg-stone-50 text-stone-900 font-sans text-sm hover:bg-stone-200 disabled:opacity-30 inline-flex items-center gap-2"
        >
          {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send now</>}
        </button>
      </div>
      {sentInfo?.ok && (
        <div className="mt-3 bg-emerald-900/30 border border-emerald-800 px-3 py-2 font-sans text-xs text-emerald-200">
          ✓ Sent to {sentInfo.count} recipient{sentInfo.count === 1 ? '' : 's'}.
        </div>
      )}
      <div className="mt-3 font-mono text-[10px] text-stone-500">
        Don't have Resend? Visit <span className="text-amber-400">resend.com</span> (free tier: 100 emails/day). For bigger lists, copy/paste into ConvertKit, Beehiiv, or Mailchimp instead.
      </div>
    </div>
  );
}

// Tiny HTML-escape helper for newsletter rendering
function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ============= PROOF VAULT =============
// Wins, testimonials, screenshots — tagged for "where to weave this in".
const PROOF_TYPES = [
  { v: 'testimonial', label: 'Testimonial', icon: Quote },
  { v: 'win', label: 'Win', icon: Trophy },
  { v: 'screenshot', label: 'Screenshot', icon: ImagePlus },
  { v: 'case_study', label: 'Case study', icon: FileText },
  { v: 'milestone', label: 'Milestone', icon: Flag }
];

function ProofVault({ proof, saveProof, contentPieces, profile }) {
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = proof;
    if (filter !== 'all') list = list.filter(p => p.type === filter);
    if (search) list = list.filter(p => (p.content + (p.source || '') + (p.tags || []).join(' ')).toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => (b.id - a.id));
  }, [proof, filter, search]);

  const stats = {
    total: proof.length,
    testimonials: proof.filter(p => p.type === 'testimonial').length,
    wins: proof.filter(p => p.type === 'win').length,
    totalValue: proof.reduce((s, p) => s + (parseFloat(p.value) || 0), 0)
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Capture · Proof Bank"
        title="Proof Vault"
        description="Wins, testimonials, deal sizes, screenshots. Each tagged for where to weave it in. Receipts beat claims — and the AI helps you remember which receipt fits which post."
        action={
          <button onClick={() => { setEditing(null); setShowNew(true); }} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add proof
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Items" value={stats.total} icon={BadgeCheck} />
        <StatCard label="Testimonials" value={stats.testimonials} icon={Quote} />
        <StatCard label="Wins" value={stats.wins} icon={Trophy} />
        <StatCard label="Tracked value" value={`$${(stats.totalValue/1000).toFixed(0)}k`} hint="Total deal value" icon={DollarSign} />
      </div>

      {showNew && (
        <ProofForm
          proof={editing}
          onSave={(p) => {
            if (p.id && proof.find(x => x.id === p.id)) saveProof(proof.map(x => x.id === p.id ? p : x));
            else saveProof([{ ...p, id: Date.now(), createdAt: new Date().toISOString() }, ...proof]);
            setShowNew(false);
            setEditing(null);
          }}
          onCancel={() => { setShowNew(false); setEditing(null); }}
        />
      )}

      <div className="bg-white border border-stone-200 p-4 mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-2">
          <Search className="w-4 h-4 text-stone-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proof..." className="bg-transparent outline-none flex-1 font-sans text-sm" />
        </div>
        <button onClick={() => setFilter('all')} className={`px-3 py-2 font-sans text-xs border ${filter === 'all' ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300'}`}>All</button>
        {PROOF_TYPES.map(t => (
          <button key={t.v} onClick={() => setFilter(t.v)} className={`px-3 py-2 font-sans text-xs border inline-flex items-center gap-1.5 ${filter === t.v ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-300 hover:border-stone-500'}`}>
            <t.icon className="w-3 h-3" /> {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BadgeCheck} title={proof.length === 0 ? 'No proof yet' : 'No matches'} description={proof.length === 0 ? 'Capture your first win, testimonial, or milestone.' : 'Try a different filter.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const t = PROOF_TYPES.find(x => x.v === p.type);
            return (
              <div key={p.id} className="bg-white border border-stone-200 p-6 group relative">
                <div className="flex items-center gap-2 mb-3">
                  {t && <Pill color={p.type === 'testimonial' ? 'violet' : p.type === 'win' ? 'green' : p.type === 'milestone' ? 'amber' : 'stone'}>{t.label}</Pill>}
                  {p.value && <Pill color="green">${parseFloat(p.value).toLocaleString()}</Pill>}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{p.when || new Date(p.createdAt).toLocaleDateString()}</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1">
                    <button onClick={() => { setEditing(p); setShowNew(true); }} className="p-1.5 hover:bg-stone-100"><Edit3 className="w-3 h-3" /></button>
                    <button onClick={async () => { if (await window.brandConfirm('Delete this proof item?')) saveProof(proof.filter(x => x.id !== p.id)); }} className="p-1.5 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-600" /></button>
                  </div>
                </div>
                {p.type === 'testimonial' && (
                  <div className="bg-stone-50 border-l-4 border-violet-500 p-4 mb-3">
                    <div className="font-display text-base text-stone-800 italic leading-relaxed">"{p.content}"</div>
                    {p.source && <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mt-2">— {p.source}</div>}
                  </div>
                )}
                {p.type !== 'testimonial' && (
                  <div className="font-display text-base text-stone-900 leading-snug mb-2">{p.content}</div>
                )}
                {p.source && p.type !== 'testimonial' && (
                  <div className="font-sans text-xs text-stone-500 italic mb-3">{p.source}</div>
                )}
                {p.imageUrl && (
                  <a href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                    <img src={p.imageUrl} alt="Proof attachment" className="w-full max-h-64 object-cover bg-stone-100 border border-stone-200" />
                  </a>
                )}
                {p.weaveContext && (
                  <div className="bg-amber-50 border border-amber-200 p-3 mb-3">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">Weave into</div>
                    <div className="font-sans text-xs text-stone-700">{p.weaveContext}</div>
                  </div>
                )}
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map(tag => <Pill key={tag}>#{tag}</Pill>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProofForm({ proof, onSave, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [p, setP] = useState(proof || { type: 'testimonial', content: '', source: '', value: '', when: '', weaveContext: '', tags: [], imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'include' });
      const data = await r.json();
      if (!r.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: data.error || 'Upload failed' } }));
        }
      } else {
        setP({ ...p, imageUrl: data.url });
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'error', message: 'Upload failed: ' + err.message } }));
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };
  return (
    <div className="bg-stone-950 text-stone-50 p-7 mb-6">
      <div className="flex justify-between items-center mb-5">
        <div className="font-display text-2xl font-light">{p.id ? 'Edit proof' : 'New proof'}</div>
        <button aria-label="Close" onClick={onCancel}><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Field label="Type">
          <select value={p.type} onChange={e => setP({ ...p, type: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm">
            {PROOF_TYPES.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Date / when">
          <input value={p.when} onChange={e => setP({ ...p, when: e.target.value })} placeholder="e.g. Jan 2026, Q4 2024" className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
        <Field label="$ value (optional)">
          <input type="number" value={p.value} onChange={e => setP({ ...p, value: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
        </Field>
      </div>
      <Field label={p.type === 'testimonial' ? 'The quote' : 'The proof / what happened'}>
        <textarea rows={4} value={p.content} onChange={e => setP({ ...p, content: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" placeholder={p.type === 'testimonial' ? 'e.g. "Umair structured the partnership in 6 weeks. We\'d been trying for 18 months."' : 'e.g. Signed an MOU with a tier-1 telco in 47 days from cold outreach.'} />
      </Field>
      <Field label={p.type === 'testimonial' ? 'Who said it (Name, Role, Company)' : 'Source / context'}>
        <input value={p.source} onChange={e => setP({ ...p, source: e.target.value })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
      </Field>
      <Field label="Where to weave this in (notes for future-you)">
        <textarea rows={2} value={p.weaveContext} onChange={e => setP({ ...p, weaveContext: e.target.value })} placeholder="e.g. Use when posting about cold outreach speed, or in any tier-1 telco BD pitch." className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
      </Field>
      <Field label="Tags (comma separated)">
        <input value={(p.tags || []).join(', ')} onChange={e => setP({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className="w-full bg-stone-900 border border-stone-700 px-3 py-2 font-sans text-sm" />
      </Field>

      {/* File upload — useful for screenshots, certificates, photos of testimonials */}
      <Field label="Attach an image (optional · max 5 MB · PNG/JPG/WebP/GIF/SVG)">
        {p.imageUrl ? (
          <div className="flex items-start gap-3 bg-stone-900 border border-stone-700 p-3">
            <img src={p.imageUrl} alt="Proof attachment" className="w-24 h-24 object-cover bg-stone-800" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-1">Attached</div>
              <div className="font-mono text-xs text-stone-400 break-all line-clamp-2">{p.imageUrl}</div>
              <button onClick={() => setP({ ...p, imageUrl: '' })} className="font-sans text-xs text-stone-400 hover:text-stone-100 underline mt-2">Remove image</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" id="proof-file-input" />
            <label
              htmlFor="proof-file-input"
              className={`px-4 py-2 bg-stone-900 border border-stone-700 hover:border-stone-500 font-sans text-sm inline-flex items-center gap-2 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><ImagePlus className="w-4 h-4" /> Upload image</>}
            </label>
            <span className="font-sans text-xs text-stone-500">Or paste a URL below.</span>
          </div>
        )}
        {!p.imageUrl && (
          <input
            value={p.imageUrl || ''}
            onChange={e => setP({ ...p, imageUrl: e.target.value })}
            placeholder="https://..."
            className="mt-2 w-full bg-stone-900 border border-stone-700 px-3 py-2 font-mono text-xs text-stone-300"
          />
        )}
      </Field>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-800">
        <button onClick={onCancel} className="px-4 py-2 font-sans text-sm text-stone-400">Cancel</button>
        <button onClick={() => onSave(p)} disabled={!p.content} className="px-6 py-2 bg-stone-50 text-stone-900 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save proof</button>
      </div>
    </div>
  );
}

// ============= PUBLIC PROFILE BUILDER =============
// Generates a public-facing landing page from your DNA.
function PublicProfileBuilder({ publicProfile, savePublicProfile, profile, dna, stories, optins }) {
  const p = publicProfile || {};
  const update = (k, v) => savePublicProfile({ ...p, [k]: v });
  const [previewMode, setPreviewMode] = useState(false);

  const featuredStoryIds = p.featuredStoryIds || [];
  const featured = stories.filter(s => featuredStoryIds.includes(s.id));

  const toggleStory = (id) => {
    const next = featuredStoryIds.includes(id) ? featuredStoryIds.filter(x => x !== id) : [...featuredStoryIds, id].slice(-3);
    update('featuredStoryIds', next);
  };

  const featuredOptinId = p.featuredOptinId;

  if (previewMode) {
    return <PublicProfilePreview p={p} profile={profile} dna={dna} stories={stories.filter(s => featuredStoryIds.includes(s.id))} optin={optins.find(o => o.id === parseInt(featuredOptinId))} onClose={() => setPreviewMode(false)} />;
  }

  // Compose the live URL once a username is set. We pull the site URL from the
  // browser, so this works both on localhost and in production.
  const liveUrl = (typeof window !== 'undefined' && p.username)
    ? `${window.location.origin}/u/${encodeURIComponent(p.username)}`
    : null;
  const [copied, setCopied] = useState(false);
  const copyLiveUrl = () => {
    if (!liveUrl) return;
    try {
      navigator.clipboard?.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Distribution · Your Public Face"
        title="Public Profile"
        description="A linkable landing page generated from your DNA. Manifesto, top stories, lead magnet, contact. Drop the URL in your LinkedIn / X / IG bio."
        action={
          <button onClick={() => setPreviewMode(true)} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
        }
      />

      {/* Live URL banner — visible once a username is set */}
      {liveUrl ? (
        <div className="bg-emerald-50 border border-emerald-200 p-5 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-800 mb-1">Your page is live</div>
            <div className="font-mono text-sm md:text-base text-stone-900 break-all">{liveUrl}</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={copyLiveUrl}
              className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-xs inline-flex items-center gap-1.5"
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
            </button>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-stone-300 hover:border-stone-900 font-sans text-xs inline-flex items-center gap-1.5 text-stone-800"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 font-sans text-sm text-stone-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            Pick a handle below to make your page live at <span className="font-mono">/u/&lt;your-handle&gt;</span>. Once set, share that URL anywhere — LinkedIn bio, email signature, business card.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Username */}
          <div className="bg-white border border-stone-200 p-6">
            <Field label="Your handle (becomes your URL)">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-stone-500">yourdomain.com/u/</span>
                <input value={p.username || ''} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="umair" className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 font-mono text-sm" />
              </div>
            </Field>
            <div className="font-sans text-xs text-stone-500 mt-2">When deployed, this lives at <span className="font-mono">/u/{p.username || 'your-handle'}</span> — a public route.</div>
          </div>

          {/* Hero */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Hero section</div>
            <Field label="Headline (uses manifesto tagline by default)">
              <Input value={p.headline || dna.manifesto?.tagline || ''} onChange={v => update('headline', v)} />
            </Field>
            <div className="mt-3">
              <Field label="Subhead (uses elevator pitch by default)">
                <Textarea rows={3} value={p.subhead || dna.manifesto?.elevatorPitch || ''} onChange={v => update('subhead', v)} />
              </Field>
            </div>
          </div>

          {/* Manifesto inclusion */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Manifesto</div>
            {dna.manifesto?.manifesto ? (
              <>
                <label className="flex items-center gap-2 mb-3 cursor-pointer font-sans text-sm">
                  <input type="checkbox" checked={p.showManifesto !== false} onChange={e => update('showManifesto', e.target.checked)} />
                  Include the manifesto on my public page
                </label>
                <div className="bg-stone-50 border-l-4 border-stone-900 p-4 font-display text-base text-stone-800 leading-relaxed italic">{dna.manifesto.manifesto.slice(0, 300)}...</div>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 font-sans text-sm text-amber-900">Generate a manifesto in <strong>Brand DNA Lab</strong> first to include it here.</div>
            )}
          </div>

          {/* Featured stories */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Featured stories (pick up to 3)</div>
            {stories.length === 0 ? (
              <div className="text-sm text-stone-500 italic font-sans">No stories yet. Add them in Story Vault.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stories.map(s => {
                  const sel = featuredStoryIds.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleStory(s.id)} className={`p-3 text-left border ${sel ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 hover:border-stone-500'}`}>
                      <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 ${sel ? 'text-stone-400' : 'text-stone-500'}`}>{s.month}</div>
                      <div className="text-sm font-medium leading-snug">{s.title}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Featured opt-in */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Featured opt-in (the lead magnet on your page)</div>
            {optins.length === 0 ? (
              <div className="text-sm text-stone-500 italic font-sans">No opt-ins yet. Build one in Conversion Lab.</div>
            ) : (
              <select value={p.featuredOptinId || ''} onChange={e => update('featuredOptinId', e.target.value)} className="w-full px-3 py-2 border border-stone-300 font-sans text-sm">
                <option value="">— none —</option>
                {optins.map(o => <option key={o.id} value={o.id}>{o.name || o.finalTitle || o.finalName} · {o.type}</option>)}
              </select>
            )}
          </div>

          {/* Contact */}
          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Contact links</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="LinkedIn URL"><Input value={p.linkedin || ''} onChange={v => update('linkedin', v)} /></Field>
              <Field label="X / Twitter URL"><Input value={p.twitter || ''} onChange={v => update('twitter', v)} /></Field>
              <Field label="Email"><Input value={p.email || ''} onChange={v => update('email', v)} /></Field>
              <Field label="Calendar / book a call URL"><Input value={p.calendarUrl || ''} onChange={v => update('calendarUrl', v)} placeholder="e.g. https://cal.com/yourname" /></Field>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="bg-stone-950 text-stone-50 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Live preview</div>
            <button onClick={() => setPreviewMode(true)} className="w-full px-4 py-3 bg-stone-50 text-stone-900 font-sans text-sm inline-flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> Preview my page</button>
            <div className="font-sans text-xs text-stone-400 mt-3 leading-relaxed">When you deploy and the public route is live, share <span className="font-mono">/u/{p.username || 'handle'}</span> in your bios.</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">For deployment</div>
            <div className="font-sans text-xs text-stone-700 leading-relaxed mb-3">The public route <span className="font-mono">/u/[username]</span> needs a small Next.js page added. Ping me to wire it up — takes 5 minutes.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicProfilePreview({ p, profile, dna, stories, optin, onClose }) {
  useEscape(onClose);
  useBodyScrollLock(true);
  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 overflow-y-auto" onClick={onClose}>
      <div className="max-w-4xl mx-auto my-8 bg-stone-50 min-h-[calc(100vh-4rem)]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-stone-50 border-b border-stone-200 px-8 py-3 flex justify-between items-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500">Preview · /u/{p.username || 'your-handle'}</div>
          <button onClick={onClose} className="font-sans text-sm text-stone-600 hover:text-stone-900">Close</button>
        </div>

        {/* Hero */}
        <div className="px-12 py-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40" />
          <div className="relative">
            <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-4">{profile.location || 'Studio'}</div>
            <h1 className="font-display text-7xl font-light text-stone-900 leading-[1.05] tracking-tight mb-4">{firstNameOf(profile)}<span className="text-stone-400">.</span></h1>
            <div className="font-display text-3xl font-light text-stone-700 italic max-w-2xl mx-auto leading-snug mb-6">{p.headline || dna.manifesto?.tagline || profile.title}</div>
            <div className="font-sans text-base text-stone-600 max-w-xl mx-auto leading-relaxed">{p.subhead || dna.manifesto?.elevatorPitch}</div>
          </div>
        </div>

        {/* Manifesto */}
        {p.showManifesto !== false && dna.manifesto?.manifesto && (
          <div className="px-12 py-16 bg-stone-950 text-stone-50 grain relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl" />
            <div className="relative max-w-3xl mx-auto">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">Manifesto</div>
              <div className="font-display text-2xl font-light leading-relaxed whitespace-pre-wrap">{dna.manifesto.manifesto}</div>
            </div>
          </div>
        )}

        {/* Featured stories */}
        {stories.length > 0 && (
          <div className="px-12 py-16">
            <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-6 text-center">Stories I tell</div>
            <div className="grid grid-cols-1 gap-5">
              {stories.map(s => (
                <div key={s.id} className="bg-white border border-stone-200 p-7">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">{s.month} · {s.category}</div>
                  <div className="font-display text-3xl font-light text-stone-900 leading-tight mb-3">{s.title}</div>
                  <div className="font-sans text-base text-stone-700 leading-relaxed mb-3">{s.context}</div>
                  <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">The lesson</div>
                    <div className="font-display text-lg text-stone-800 italic">{s.lesson}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opt-in */}
        {optin && (
          <div className="px-12 py-16 bg-amber-50 border-y border-amber-200">
            <div className="max-w-2xl mx-auto text-center">
              <div className="font-mono text-[10px] tracking-[0.3em] text-amber-800 uppercase mb-3">{optin.type === 'waitlist' ? 'Get early access' : optin.type === 'assessment' ? 'Take the assessment' : optin.type === 'webinar' ? 'Join the workshop' : 'Get the mini-course'}</div>
              <div className="font-display text-4xl font-light text-stone-900 leading-tight mb-4">{optin.headline || optin.finalTitle || optin.finalName || optin.name}</div>
              <div className="font-sans text-base text-stone-700 leading-relaxed mb-6">{optin.subtitle || optin.subhead || optin.promise}</div>
              <button className="px-8 py-3 bg-stone-900 text-stone-50 font-sans text-sm">Join the list</button>
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="px-12 py-16 text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-6">Reach out</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {p.linkedin && <a href={p.linkedin} className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm inline-flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
            {p.twitter && <a href={p.twitter} className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm inline-flex items-center gap-2"><Twitter className="w-4 h-4" /> X</a>}
            {p.email && <a href={`mailto:${p.email}`} className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm inline-flex items-center gap-2"><Mail className="w-4 h-4" /> Email</a>}
            {p.calendarUrl && <a href={p.calendarUrl} className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Book a call</a>}
          </div>
        </div>

        <div className="px-12 py-6 border-t border-stone-200 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
          Built with Brand OS
        </div>
      </div>
    </div>
  );
}

// ============= BRAND HEALTH =============
// One-page audit. AI-graded.
function BrandHealth({ profile, dna, stories, contentPieces, icps, optins, aio, analytics, ideas, conversations, setActiveView }) {
  const [auditing, setAuditing] = useState(false);
  const [audit, setAudit] = useState(null);

  const dnaScore = useMemo(() => {
    let s = 0;
    if (dna.origin?.moments?.length >= 3) s += 17;
    if (dna.values?.core?.length >= 3) s += 17;
    if (dna.archetype?.primary) s += 17;
    if (dna.voice?.fingerprint) s += 17;
    if (dna.timeline?.events?.length >= 5) s += 16;
    if (dna.manifesto?.manifesto) s += 16;
    return s;
  }, [dna]);

  const dimensions = [
    { k: 'identity', label: 'Identity', score: dnaScore, view: 'dna', desc: dnaScore < 50 ? 'Decode more of your DNA' : 'Strong foundation' },
    { k: 'audience', label: 'Audience', score: Math.min(100, icps.length * 33), view: 'icp', desc: icps.length === 0 ? 'No ICPs yet — biggest leverage' : `${icps.length} ICPs mapped` },
    { k: 'stories', label: 'Stories', score: Math.min(100, stories.length * 10), view: 'stories', desc: `${stories.length} captured / 10 goal` },
    { k: 'content', label: 'Content velocity', score: Math.min(100, contentPieces.length * 5), view: 'content', desc: `${contentPieces.length} pieces in library` },
    { k: 'conversion', label: 'Conversion', score: Math.min(100, optins.length * 25), view: 'conversion', desc: `${optins.length} opt-in mechanisms` },
    { k: 'aio', label: 'AI Search', score: Math.min(100, ((aio.topics || []).length * 25) + ((aio.queries || []).filter(q => q.appeared).length * 5)), view: 'aio', desc: `${(aio.topics || []).length} topics staked` },
    { k: 'pipeline', label: 'Pipeline', score: Math.min(100, conversations.length * 5), view: 'conversations', desc: `${conversations.length} conversations tracked` },
    { k: 'capture', label: 'Capture habit', score: Math.min(100, ideas.length * 4), view: 'ideas', desc: `${ideas.length} ideas in inbox` }
  ];

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];

  const runAudit = async () => {
    setAuditing(true);
    const prompt = `You are conducting a quarterly Brand Health audit for ${profile.name}.

CURRENT STATE:
- Profile complete: ${profile.transformation ? 'yes' : 'no'} | Voice: ${profile.voice} | Audiences: ${profile.audiences?.join(', ')}
- DNA decoded: ${dnaScore}%
- ICPs: ${icps.length} | Stories: ${stories.length} | Content pieces: ${contentPieces.length} | Opt-ins: ${optins.length}
- AIO topics: ${(aio.topics || []).length} | Conversations tracked: ${conversations.length}
- Manifesto generated: ${dna.manifesto?.manifesto ? 'yes' : 'no'}
- Strongest: ${strongest?.label} (${strongest?.score}%)
- Weakest: ${weakest?.label} (${weakest?.score}%)

Conduct a brutal, useful audit. Don't be encouraging — be honest like the framework's author would.

Return ONLY valid JSON:
{
  "headline": "One sentence verdict on where they are",
  "thisQuarterFocus": "The ONE thing they should focus on for the next 90 days, given the data",
  "wins": ["3 things working well — be specific"],
  "blindSpots": ["3 things they're not seeing — be uncomfortable"],
  "weeklyHabits": ["3 specific weekly habits to lock in for the next 90 days"],
  "killThis": "One thing they should STOP doing or worrying about",
  "score": ${overall},
  "stage": "foundation | building | producing | scaling | compounding"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      setAudit({ ...safeAIParse(text), generatedAt: new Date().toISOString() });
    } catch (e) { console.error(e); }
    setAuditing(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px]">
      <SectionHeader
        kicker="Overview · Quarterly Audit"
        title="Brand Health"
        description="One-page audit across all 8 dimensions. AI grades you like a tough mentor. Run this every quarter to see what's working and what's drifting."
      />

      {/* Overall score */}
      <div className="bg-stone-950 text-stone-50 p-10 mb-8 grain relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-25 rounded-full blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-3">Brand health</div>
            <div className="font-display text-8xl font-light leading-none">{overall}<span className="text-stone-600 text-4xl">%</span></div>
            <div className="font-sans text-base text-stone-300 mt-3">
              {overall < 30 && 'Foundation phase. Most things still empty. That\'s normal.'}
              {overall >= 30 && overall < 60 && 'Building phase. You have raw material. Now ship.'}
              {overall >= 60 && overall < 85 && 'Producing phase. Cadence is forming. Keep optimizing.'}
              {overall >= 85 && 'Compounding. Your brand is doing work for you.'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div className="bg-emerald-900/30 border border-emerald-800 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-2">Strongest</div>
                <div className="font-display text-2xl">{strongest?.label}</div>
                <div className="font-sans text-xs text-stone-400 mt-1">{strongest?.score}% · {strongest?.desc}</div>
              </div>
              <div className="bg-red-900/30 border border-red-800 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-red-400 mb-2">Weakest</div>
                <div className="font-display text-2xl">{weakest?.label}</div>
                <div className="font-sans text-xs text-stone-400 mt-1">{weakest?.score}% · {weakest?.desc}</div>
              </div>
            </div>
            {stories.length < 10 && (
              <div className="bg-stone-900/60 border border-stone-800 p-4 mb-4 font-sans text-xs text-stone-300 leading-relaxed">
                <span className="font-mono uppercase tracking-wider text-amber-400 text-[10px]">Heads up</span>
                <div className="mt-1.5">The full quarterly audit gets brutal — meant for someone with at least 10 stories captured. You're at {stories.length}. You can run it anyway, but the feedback will read harsh on this little data.</div>
              </div>
            )}
            <button onClick={runAudit} disabled={auditing} className="px-6 py-3 bg-amber-500 text-stone-950 font-sans text-sm hover:bg-amber-400 disabled:opacity-30 inline-flex items-center gap-2">
              {auditing ? <><Loader2 className="w-4 h-4 animate-spin" /> Running audit...</> : <><Stamp className="w-4 h-4" /> {audit ? 'Re-run quarterly audit' : 'Run quarterly audit'}</>}
            </button>
          </div>
        </div>
      </div>

      {/* Dimensions grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {dimensions.map(d => (
          <button key={d.k} onClick={() => setActiveView(d.view)} className="bg-white border border-stone-200 p-5 text-left hover:border-stone-900 group">
            <div className="flex justify-between items-baseline mb-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">{d.label}</div>
              <div className="font-display text-2xl font-light text-stone-900">{d.score}<span className="text-stone-400 text-sm">%</span></div>
            </div>
            <div className="h-1.5 bg-stone-200 mb-2">
              <div className={`h-full transition-all ${d.score >= 70 ? 'bg-emerald-600' : d.score >= 40 ? 'bg-amber-500' : 'bg-stone-400'}`} style={{ width: `${d.score}%` }} />
            </div>
            <div className="font-sans text-xs text-stone-600 leading-relaxed">{d.desc}</div>
          </button>
        ))}
      </div>

      {/* Audit output */}
      {audit && (
        <div className="space-y-5 animate-slideIn">
          <div className="bg-white border-2 border-stone-900 p-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">The verdict</div>
            <div className="font-display text-3xl font-light text-stone-900 leading-tight mb-5">{audit.headline}</div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">This quarter, focus on</div>
              <div className="font-display text-xl text-stone-900 leading-snug">{audit.thisQuarterFocus}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-50 border border-emerald-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-800 mb-3">▲ What's working</div>
              <ul className="space-y-2.5">
                {audit.wins.map((w, i) => <li key={i} className="font-sans text-sm text-stone-800 flex gap-2 leading-relaxed"><span className="text-emerald-700 font-mono">↳</span>{w}</li>)}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-800 mb-3">⚠ Blind spots</div>
              <ul className="space-y-2.5">
                {audit.blindSpots.map((b, i) => <li key={i} className="font-sans text-sm text-stone-800 flex gap-2 leading-relaxed"><span className="text-red-700 font-mono">×</span>{b}</li>)}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-stone-200 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-3">Lock these in for the next 90 days</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {audit.weeklyHabits.map((h, i) => (
                <div key={i} className="border border-stone-200 p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">Habit {i+1}</div>
                  <div className="font-sans text-sm text-stone-800 leading-relaxed">{h}</div>
                </div>
              ))}
            </div>
          </div>

          {audit.killThis && (
            <div className="bg-stone-950 text-stone-50 p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Stop doing this</div>
              <div className="font-display text-xl leading-snug italic">"{audit.killThis}"</div>
            </div>
          )}

          <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 text-center">Audit generated {new Date(audit.generatedAt).toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}

// ============= DAILY BRIEFING CARD =============
// AI-generated each morning. Today's prompt + hook + story to develop.
function DailyBriefingCard({ profile, stories, ideas, briefing, saveBriefing, setActiveView }) {
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0];
  const day = today.getDay();
  const todayBriefing = briefing[todayKey];
  const [generating, setGenerating] = useState(false);

  // Auto-generate the briefing on first dashboard visit each day — but ONLY if the
  // user has enough source material to make a useful one. Otherwise show the manual
  // generate button so they don't see a stale/empty briefing.
  useEffect(() => {
    if (todayBriefing || generating) return;
    if (stories.length < 1) return; // need at least one story to anchor the briefing
    if (!profile?.voice) return;     // need basic profile
    const sessionFlag = `briefingAutoTried_${todayKey}`;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionFlag)) return;
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(sessionFlag, '1');
    generateBriefing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  const generateBriefing = async () => {
    setGenerating(true);
    const dayMap = { 1: 'pain', 3: 'news', 5: 'prize', 0: 'reflection', 6: 'reflection', 2: 'reflection', 4: 'reflection' };
    const todayType = dayMap[day];
    const recentIdeas = ideas.slice(0, 5);

    const prompt = `Generate today's morning briefing for ${profile.name}.

TODAY: ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
DAY TYPE: ${todayType} (${todayType === 'pain' ? 'Pain Monday' : todayType === 'news' ? 'News Wednesday' : todayType === 'prize' ? 'Prize Friday' : 'reflection / story-mining day'})

CONTEXT:
Voice: ${profile.voice}, ${profile.tone?.join(', ')}
Audience: ${profile.audiences?.join(', ')}
Stories available (${stories.length}): ${stories.slice(0, 5).map(s => `"${s.title}" [${s.category}]`).join(', ')}
Recent raw ideas: ${recentIdeas.map(i => `"${i.text.slice(0, 80)}"`).join(' | ')}

Produce a tight briefing — feel like a coach handing them today's mission.

Return ONLY valid JSON:
{
  "missionLine": "One sentence: today's mission. Punchy.",
  "todayPostType": "${todayType}",
  "promptOfTheDay": "A specific writing prompt for today, tailored to the day type",
  "suggestedHook": "A specific hook line they could open with today",
  "suggestedStoryId": ${stories.length > 0 ? `${stories[Math.floor(Math.random() * Math.min(5, stories.length))].id}` : 'null'},
  "energyTip": "One line on energy / focus for today",
  "sharpEdge": "A challenge or pushback for them — something they're avoiding"
}`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      saveBriefing({ ...briefing, [todayKey]: { ...parsed, generatedAt: new Date().toISOString() } });
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const suggestedStory = todayBriefing?.suggestedStoryId ? stories.find(s => s.id === todayBriefing.suggestedStoryId) : null;
  const dayLabel = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];

  return (
    <div className="bg-stone-950 text-stone-50 p-8 mb-8 grain relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-900 opacity-15 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-400 mb-2">Today's briefing · {dayLabel}</div>
            {todayBriefing ? (
              <div className="font-display text-4xl font-light leading-tight max-w-2xl">{todayBriefing.missionLine}</div>
            ) : (
              <div className="font-display text-4xl font-light leading-tight max-w-2xl text-stone-400">No briefing yet. Generate today's mission.</div>
            )}
          </div>
          {!generating && (
            <button onClick={generateBriefing} className="px-5 py-2.5 bg-amber-500 text-stone-950 font-sans text-sm hover:bg-amber-400 inline-flex items-center gap-2">
              {todayBriefing ? <><Repeat className="w-4 h-4" /> Refresh</> : <><Sunrise className="w-4 h-4" /> Generate briefing</>}
            </button>
          )}
          {generating && (
            <div className="px-5 py-2.5 bg-stone-800 text-stone-200 font-sans text-sm inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Briefing you...
            </div>
          )}
        </div>

        {todayBriefing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-stone-900 border border-stone-800 p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">Today's prompt</div>
              <div className="font-display text-base text-stone-100 leading-snug mb-3">{todayBriefing.promptOfTheDay}</div>
              <button onClick={() => setActiveView('content')} className="font-mono text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">Open content engine <ArrowRight className="w-3 h-3" /></button>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">Suggested hook</div>
              <div className="font-display text-base text-stone-100 leading-snug italic">"{todayBriefing.suggestedHook}"</div>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">Anchor story</div>
              {suggestedStory ? (
                <>
                  <div className="font-display text-base text-stone-100 leading-snug mb-2">{suggestedStory.title}</div>
                  <div className="font-sans text-xs text-stone-400 italic">→ {suggestedStory.lesson}</div>
                </>
              ) : (
                <div className="font-sans text-sm text-stone-500 italic">No story selected — capture some first.</div>
              )}
            </div>
            {todayBriefing.energyTip && (
              <div className="col-span-2 bg-violet-900/30 border border-violet-800 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-violet-300 mb-1">Energy</div>
                <div className="font-sans text-sm text-stone-200 leading-relaxed">{todayBriefing.energyTip}</div>
              </div>
            )}
            {todayBriefing.sharpEdge && (
              <div className="bg-red-900/30 border border-red-800 p-4">
                <div className="font-mono text-[10px] uppercase tracking-wider text-red-300 mb-1">Sharp edge</div>
                <div className="font-sans text-sm text-stone-200 leading-relaxed italic">"{todayBriefing.sharpEdge}"</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============= VOICE STORY CAPTURE =============
// Speak in any language → live transcribe → AI translates + structures into a Story.
const VOICE_LANGS = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'ur-PK', label: 'Urdu', flag: '🇵🇰' },
  { code: 'ar-SA', label: 'Arabic (Saudi)', flag: '🇸🇦' },
  { code: 'ar-AE', label: 'Arabic (Gulf)', flag: '🇦🇪' },
  { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es-ES', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'French', flag: '🇫🇷' },
  { code: 'de-DE', label: 'German', flag: '🇩🇪' },
  { code: 'pt-BR', label: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'it-IT', label: 'Italian', flag: '🇮🇹' },
  { code: 'tr-TR', label: 'Turkish', flag: '🇹🇷' },
  { code: 'ru-RU', label: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', label: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
  { code: 'fa-IR', label: 'Persian / Farsi', flag: '🇮🇷' },
  { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
  { code: 'id-ID', label: 'Indonesian', flag: '🇮🇩' }
];

function VoiceStoryCapture({ profile, months, onComplete, onCancel }) {
  useEscape(onCancel);
  useBodyScrollLock(true);
  const [lang, setLang] = useState('en-US');
  const [recording, setRecording] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [phase, setPhase] = useState('setup'); // setup | recording | review | processing | done
  const [duration, setDuration] = useState(0);
  const [structured, setStructured] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const supported = typeof window !== 'undefined' && (
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );

  const isNonEnglish = !lang.startsWith('en');
  const langLabel = VOICE_LANGS.find(l => l.code === lang)?.label || lang;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef) try { recognitionRef.stop(); } catch {}
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recognitionRef]);

  const start = () => {
    if (!supported) {
      setError('Voice capture requires Chrome, Edge, or Safari (with speech recognition enabled).');
      return;
    }
    setError(null);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;
    let final = '';
    rec.onresult = (e) => {
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
        else interimText += e.results[i][0].transcript;
      }
      setTranscript(final.trim());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      console.error('Speech error:', e);
      setError(`Speech recognition error: ${e.error}. Try again or check microphone permissions.`);
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    rec.onend = () => {
      setRecording(false);
      setInterim('');
      if (timerRef.current) clearInterval(timerRef.current);
    };
    try {
      rec.start();
      setRecognitionRef(rec);
      setRecording(true);
      setPhase('recording');
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (e) {
      setError('Could not start recording. Make sure microphone access is allowed.');
    }
  };

  const stop = () => {
    if (recognitionRef) {
      try { recognitionRef.stop(); } catch {}
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setPhase('review');
  };

  const reset = () => {
    if (recognitionRef) try { recognitionRef.stop(); } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    setTranscript('');
    setInterim('');
    setDuration(0);
    setStructured(null);
    setError(null);
    setPhase('setup');
  };

  const structureWithAI = async () => {
    if (!transcript.trim()) return;
    setPhase('processing');
    setError(null);
    const recentMonth = months[0];

    const prompt = `${profile.name} just spoke a personal-brand story aloud${isNonEnglish ? ` in ${langLabel}` : ''}. Below is the raw transcript.

TRANSCRIPT:
"""
${transcript}
"""

THEIR CONTEXT:
- Voice: ${profile.voice || 'direct'}, ${profile.tone?.join(', ') || 'honest'}
- Audience: ${profile.audiences?.join(', ') || 'professionals'}
- Pains they address: ${profile.pains?.slice(0, 5).join('; ') || 'unknown'}
- Prizes they deliver: ${profile.prizes?.slice(0, 5).join('; ') || 'unknown'}
- Voice taboos (avoid): ${profile.voiceTaboos?.join('; ') || 'corporate jargon'}
- Most recent month for the calendar: ${recentMonth}

YOUR JOB:
${isNonEnglish ? '1. Translate the transcript into clear, natural English first — preserve meaning, emotion, and any technical terms. Keep names and proper nouns intact.\n2. ' : '1. '}Structure the story into the personal-branding framework. ONLY use what's actually in the transcript — don't invent details. Where the transcript is unclear or missing a field, leave it short or write "—".

Return ONLY valid JSON:
{
  ${isNonEnglish ? '"originalLanguage": "' + langLabel + '",\n  "translation": "Full English translation of the transcript (clean, readable prose)",\n  ' : ''}"title": "One-line story title in their voice (sharp, specific, no clichés)",
  "category": "pain | prize | news",
  "month": "Month + year if mentioned (e.g. 'Mar 2025') or '${recentMonth}' if unclear",
  "emotion": "1-3 word dominant emotion (e.g. 'relieved-but-exhausted')",
  "context": "1-2 sentence setup of the situation",
  "conflict": "1-2 sentence central tension or stakes (or '—' if not in transcript)",
  "resolution": "1-2 sentence what happened (or '—' if not in transcript)",
  "lesson": "The takeaway, in their voice — relatable not impressive (1-3 sentences)",
  "tags": ["3-5 short lowercase tags"],
  "rating": 1-5,
  "completeness": "complete | partial | needs-more — your honest take on whether this is story-ready"
}`;

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message || 'AI request failed');
      const text = d.content.filter(c => c.type === 'text').map(c => c.text).join('');
      const parsed = safeAIParse(text);
      setStructured(parsed);
      setPhase('done');
    } catch (e) {
      console.error(e);
      setError('AI structuring failed: ' + e.message + '. Try again.');
      setPhase('review');
    }
  };

  const useThisStory = () => {
    if (!structured) return;
    onComplete({
      title: structured.title,
      category: structured.category,
      month: structured.month,
      emotion: structured.emotion,
      context: structured.context,
      conflict: structured.conflict !== '—' ? structured.conflict : '',
      resolution: structured.resolution !== '—' ? structured.resolution : '',
      lesson: structured.lesson,
      tags: structured.tags || [],
      rating: structured.rating || 0,
      voiceCapture: true,
      originalLanguage: structured.originalLanguage || 'English',
      rawTranscript: transcript,
      translation: structured.translation || null
    });
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-6" onClick={onCancel}>
      <div className="bg-stone-50 max-w-3xl w-full mt-8 mb-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-stone-950 text-stone-50 p-7 grain relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-900 opacity-25 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-400 mb-2">Voice → Story</div>
              <div className="font-display text-3xl font-light leading-tight">Speak it. We'll structure it.</div>
              <div className="font-sans text-sm text-stone-300 mt-2 max-w-md">
                {phase === 'setup' && 'Pick a language, hit record, tell the story like you would to a friend.'}
                {phase === 'recording' && 'Talking now. Take your time. Click Stop when done.'}
                {phase === 'review' && 'Review the transcript. Edit if needed, then let AI structure it.'}
                {phase === 'processing' && (isNonEnglish ? 'Translating + structuring with AI...' : 'Structuring with AI...')}
                {phase === 'done' && 'Story drafted. Review, then open the form to refine and save.'}
              </div>
            </div>
            <button aria-label="Close" onClick={onCancel} className="p-2 hover:bg-stone-800"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-8">
          {/* Phase: SETUP */}
          {phase === 'setup' && (
            <div className="space-y-6">
              {!supported && (
                <div className="bg-red-50 border border-red-200 p-4 font-sans text-sm text-red-800">
                  Speech recognition isn't supported in this browser. Use Chrome, Edge, or Safari for voice capture.
                </div>
              )}

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">Speak in</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {VOICE_LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`p-3 text-left border transition-all ${
                        lang === l.code ? 'border-stone-900 bg-stone-900 text-stone-50' : 'border-stone-200 bg-white hover:border-stone-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{l.flag}</div>
                      <div className="font-sans text-xs font-medium">{l.label}</div>
                    </button>
                  ))}
                </div>
                {isNonEnglish && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 p-3 font-sans text-xs text-stone-700 leading-relaxed">
                    AI will automatically translate from {langLabel} to English, preserving meaning + emotion, then structure into the story format.
                  </div>
                )}
              </div>

              <div className="bg-stone-100 border-l-4 border-stone-900 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-700 mb-2">A good story has</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-sans text-sm text-stone-700">
                  <div>→ Where + when it happened</div>
                  <div>→ What was at stake</div>
                  <div>→ What made it hard</div>
                  <div>→ How it resolved</div>
                  <div>→ How it felt</div>
                  <div>→ The lesson others can use</div>
                </div>
              </div>

              <button
                onClick={start}
                disabled={!supported}
                className="w-full py-6 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 disabled:opacity-30 inline-flex items-center justify-center gap-3"
              >
                <Mic className="w-6 h-6" />
                <span className="font-display text-xl">Start recording</span>
              </button>
            </div>
          )}

          {/* Phase: RECORDING */}
          {phase === 'recording' && (
            <div className="space-y-5">
              <div className="bg-red-50 border-2 border-red-300 p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-red-100 opacity-50 animate-pulse" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-[0.3em] text-red-800 font-semibold">Recording · {langLabel}</span>
                  </div>
                  <div className="font-display text-6xl font-light text-stone-900 mb-2">{fmt(duration)}</div>
                  <div className="font-sans text-sm text-stone-600">Talk like you would to a friend.</div>
                </div>
              </div>

              {/* Live transcript */}
              <div className="bg-white border border-stone-200 p-5 min-h-[200px]">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Live transcript</div>
                {transcript || interim ? (
                  <div className="font-display text-base text-stone-900 leading-relaxed">
                    {transcript}
                    {interim && <span className="text-stone-400 italic"> {interim}</span>}
                  </div>
                ) : (
                  <div className="font-sans text-sm text-stone-400 italic">Waiting for your voice...</div>
                )}
              </div>

              <button
                onClick={stop}
                className="w-full py-5 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 inline-flex items-center justify-center gap-3"
              >
                <Pause className="w-5 h-5" />
                <span className="font-display text-lg">Stop recording</span>
              </button>
            </div>
          )}

          {/* Phase: REVIEW */}
          {phase === 'review' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white border border-stone-200 p-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Duration</div>
                  <div className="font-display text-xl font-light text-stone-900">{fmt(duration)}</div>
                </div>
                <div className="bg-white border border-stone-200 p-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Words</div>
                  <div className="font-display text-xl font-light text-stone-900">{transcript.split(/\s+/).filter(Boolean).length}</div>
                </div>
                <div className="bg-white border border-stone-200 p-3 text-center">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-1">Language</div>
                  <div className="font-display text-base font-medium text-stone-900 leading-tight">{VOICE_LANGS.find(l => l.code === lang)?.flag} {VOICE_LANGS.find(l => l.code === lang)?.label}</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">Transcript (edit if needed)</div>
                  <div className="font-mono text-[10px] text-stone-400">{transcript.length} chars</div>
                </div>
                <textarea
                  rows={10}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 focus:border-stone-900 outline-none font-sans text-sm leading-relaxed text-stone-900"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 font-sans text-sm text-red-800">{error}</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <button onClick={reset} className="px-4 py-3 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center justify-center gap-2"><Repeat className="w-4 h-4" /> Re-record</button>
                <button onClick={start} className="px-4 py-3 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Continue recording</button>
                <button
                  onClick={structureWithAI}
                  disabled={!transcript.trim()}
                  className="px-4 py-3 bg-stone-900 text-stone-50 font-sans text-sm disabled:opacity-30 inline-flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" /> {isNonEnglish ? 'Translate + structure' : 'Structure with AI'}
                </button>
              </div>
            </div>
          )}

          {/* Phase: PROCESSING */}
          {phase === 'processing' && (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-stone-700 mx-auto mb-4" />
              <div className="font-display text-2xl font-light text-stone-900 mb-2">
                {isNonEnglish ? 'Translating, then structuring...' : 'Structuring your story...'}
              </div>
              <div className="font-sans text-sm text-stone-500 max-w-md mx-auto">
                AI is reading what you said, finding the lesson, and shaping it into a story format you can refine.
              </div>
            </div>
          )}

          {/* Phase: DONE */}
          {phase === 'done' && structured && (
            <div className="space-y-5 animate-slideIn">
              {structured.translation && (
                <div className="bg-violet-50 border border-violet-200 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-800 mb-2">English translation</div>
                  <div className="font-sans text-sm text-stone-800 leading-relaxed">{structured.translation}</div>
                </div>
              )}

              <div className="bg-white border-2 border-stone-900 p-7">
                <div className="flex items-center gap-2 mb-3">
                  <Pill color={structured.category === 'pain' ? 'red' : structured.category === 'prize' ? 'green' : 'amber'}>{structured.category}</Pill>
                  <Pill>{structured.month}</Pill>
                  <Pill color={structured.completeness === 'complete' ? 'green' : structured.completeness === 'partial' ? 'amber' : 'red'}>{structured.completeness}</Pill>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500 ml-auto">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3 h-3 inline-block ${n <= (structured.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-stone-200 fill-stone-200'}`} />)}</span>
                </div>
                <div className="font-display text-3xl font-light text-stone-900 leading-tight mb-4">{structured.title}</div>

                {structured.emotion && (
                  <div className="font-sans text-sm text-stone-500 italic mb-4">felt: {structured.emotion}</div>
                )}

                <div className="space-y-3 mb-4">
                  {structured.context && structured.context !== '—' && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Context</div>
                      <div className="font-sans text-sm text-stone-800 leading-relaxed">{structured.context}</div>
                    </div>
                  )}
                  {structured.conflict && structured.conflict !== '—' && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Conflict</div>
                      <div className="font-sans text-sm text-stone-800 leading-relaxed">{structured.conflict}</div>
                    </div>
                  )}
                  {structured.resolution && structured.resolution !== '—' && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">Resolution</div>
                      <div className="font-sans text-sm text-stone-800 leading-relaxed">{structured.resolution}</div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-1">The lesson</div>
                  <div className="font-display text-base text-stone-900 italic leading-relaxed">{structured.lesson}</div>
                </div>

                {structured.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {structured.tags.map(t => <Pill key={t}>#{t}</Pill>)}
                  </div>
                )}
              </div>

              {structured.completeness !== 'complete' && (
                <div className="bg-amber-50 border border-amber-200 p-4 font-sans text-sm text-stone-800 leading-relaxed">
                  <strong className="text-amber-900">Heads up:</strong> AI thinks this story is <em>{structured.completeness}</em>. You can still save it — or click "Re-record" to add more detail (when, where, who, what was at stake).
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <button onClick={reset} className="px-4 py-3 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center justify-center gap-2"><Repeat className="w-4 h-4" /> Re-record</button>
                <button onClick={() => setPhase('review')} className="px-4 py-3 border border-stone-300 hover:border-stone-500 font-sans text-sm inline-flex items-center justify-center gap-2"><Edit3 className="w-4 h-4" /> Edit transcript</button>
                <button onClick={useThisStory} className="px-4 py-3 bg-stone-900 text-stone-50 font-sans text-sm inline-flex items-center justify-center gap-2"><ArrowRight className="w-4 h-4" /> Use this · open form</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= RESTORE PROFILE SNAPSHOT =============
// Lets the user revert their profile to the last-saved version before the most
// recent edit. Powered by the `_history:profile` row the API writes on every save.
function RestoreProfileSnapshot({ saveProfile }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (typeof window === 'undefined' || !window.storage) return;
        const r = await window.storage.get('_history:profile');
        if (r?.value) {
          const parsed = JSON.parse(r.value);
          if (parsed?.snapshot) setSnapshot(parsed);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading || !snapshot) return null;

  const restore = async () => {
    if (typeof window === 'undefined') return;
    if (!(await window.brandConfirm('Restore your profile to the previous version? Current edits will be overwritten.'))) return;
    setRestoring(true);
    try {
      await saveProfile(snapshot.snapshot);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type: 'success', message: 'Profile restored from previous version.' } }));
      }
    } catch {}
    setRestoring(false);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 p-6">
      <div className="font-display text-xl text-amber-900 mb-2">Restore Previous Version</div>
      <div className="font-sans text-sm text-amber-800 mb-4">
        We keep one snapshot of your profile from before your last save — in case you regret a change.
        Last snapshot taken {new Date(snapshot.savedAt).toLocaleString()}.
      </div>
      <button
        onClick={restore}
        disabled={restoring}
        className="px-5 py-2.5 bg-amber-700 text-amber-50 font-sans text-sm disabled:opacity-30 inline-flex items-center gap-2"
      >
        {restoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Restoring</> : <><Repeat className="w-4 h-4" /> Restore previous profile</>}
      </button>
    </div>
  );
}

// ============= COMMAND PALETTE (Cmd/Ctrl+K) =============
function CommandPalette({ setActiveView, viewTitles }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEscape(open ? () => setOpen(false) : null);
  useBodyScrollLock(open);

  // Global hotkey listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const allItems = useMemo(() => {
    return Object.entries(viewTitles).map(([id, label]) => ({ id, label }));
  }, [viewTitles]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((i) => i.label.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [allItems, query]);

  // Reset active index when matches change
  useEffect(() => { setActiveIdx(0); }, [query]);

  const go = (id) => {
    setActiveView(id);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(matches.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const item = matches[activeIdx];
      if (item) go(item.id);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-[105] flex items-start justify-center pt-24 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-xl w-full shadow-2xl border border-stone-200"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="border-b border-stone-200 px-4 py-3 flex items-center gap-3">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to anything..."
            className="flex-1 outline-none bg-transparent text-stone-900 placeholder:text-stone-400 text-sm"
            aria-label="Command palette search"
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 hidden sm:inline">ESC</span>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {matches.length === 0 ? (
            <div className="px-4 py-6 text-sm text-stone-500 italic">No matches.</div>
          ) : (
            matches.map((m, i) => (
              <button
                key={m.id}
                onClick={() => go(m.id)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-sm ${i === activeIdx ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
              >
                <span className="text-stone-900">{m.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{m.id}</span>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-stone-200 px-4 py-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-stone-500">
          <span>↑↓ to navigate · ↵ to go</span>
          <span className="hidden sm:inline">⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}

// ============= BOOKMARKLET MODAL =============
// Generates a per-user "Save to Brand OS" bookmarklet. They drag it to their
// bookmarks bar, then click it on any LinkedIn/X/Instagram DM page to capture.
function BookmarkletModal({ onClose }) {
  useEscape(onClose);
  useBodyScrollLock(true);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';

  // The bookmarklet is one expression. Keep it short — bookmarks have URL-length caps.
  const bookmarkletJs = `javascript:(function(){var t=window.getSelection().toString();if(!t){t=prompt('Paste the DM message text:');}if(!t)return;var n=prompt('Their name?','');var h=location.hostname;var s='Other';if(h.indexOf('linkedin')>-1)s='LinkedIn';else if(h.indexOf('twitter')>-1||h.indexOf('x.com')>-1)s='X / Twitter';else if(h.indexOf('instagram')>-1)s='Instagram';else if(h.indexOf('facebook')>-1)s='Facebook';var u='${origin}/platform?capture=conversation&text='+encodeURIComponent(t)+'&name='+encodeURIComponent(n||'')+'&source='+encodeURIComponent(s);window.open(u,'_blank');})();`;

  return (
    <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-[80] flex items-start justify-center overflow-y-auto p-6" onClick={onClose}>
      <div className="bg-white max-w-2xl w-full mt-12 mb-12" onClick={(e) => e.stopPropagation()}>
        <div className="p-7 border-b border-stone-200 flex justify-between items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-1">DM Quick-Capture</div>
            <div className="font-display text-3xl font-light">Drag this to your bookmarks bar</div>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 space-y-5">
          <div className="bg-amber-50 border border-amber-200 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-800 mb-2">Why this exists</div>
            <p className="font-sans text-sm text-stone-800 leading-relaxed">
              The DM Hub is most valuable if you actually log every inbound conversation.
              Instead of switching apps and copy-pasting, install this bookmarklet — click it
              on LinkedIn/X/Instagram/Facebook and it pre-fills a new conversation here.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">Step 1 — Show your bookmarks bar</div>
            <div className="font-sans text-sm text-stone-700 leading-relaxed">
              On most browsers: <kbd className="bg-stone-100 border border-stone-300 px-1.5 py-0.5 font-mono text-xs">⌘ + Shift + B</kbd> (Mac) or <kbd className="bg-stone-100 border border-stone-300 px-1.5 py-0.5 font-mono text-xs">Ctrl + Shift + B</kbd> (Windows).
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">Step 2 — Drag the link below to your bookmarks bar</div>
            <div className="bg-stone-50 border-2 border-dashed border-stone-300 p-6 text-center">
              <a
                href={bookmarkletJs}
                onClick={(e) => { e.preventDefault(); }}
                className="inline-block px-6 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 cursor-grab active:cursor-grabbing"
                draggable="true"
              >
                📌 Save to Brand OS
              </a>
              <div className="font-sans text-xs text-stone-500 mt-3 italic">
                ↑ Click and drag this button to your bookmarks bar. Don't just click it.
              </div>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-3">Step 3 — Use it</div>
            <ol className="font-sans text-sm text-stone-700 space-y-2 list-decimal pl-5 leading-relaxed">
              <li>Open a DM on LinkedIn, X, or Instagram.</li>
              <li>Highlight the message text (optional — you can paste later if you skip this).</li>
              <li>Click <strong>📌 Save to Brand OS</strong> in your bookmarks bar.</li>
              <li>It opens Brand OS in a new tab with the DM pre-filled. Add the name, save, done.</li>
            </ol>
          </div>

          <div className="bg-stone-100 border-l-4 border-stone-900 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-700 mb-2">If drag-and-drop doesn't work</div>
            <p className="font-sans text-xs text-stone-700 leading-relaxed mb-2">
              Some browsers block dragging `javascript:` URLs. Work around it manually:
            </p>
            <ol className="font-sans text-xs text-stone-700 list-decimal pl-5 space-y-1">
              <li>Right-click your bookmarks bar → <em>Add page</em></li>
              <li>Name: <strong>📌 Save to Brand OS</strong></li>
              <li>URL: paste this entire blob:</li>
            </ol>
            <textarea
              readOnly
              value={bookmarkletJs}
              onClick={(e) => e.target.select()}
              className="mt-3 w-full bg-white border border-stone-300 px-3 py-2 font-mono text-[10px] text-stone-700 leading-relaxed"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
