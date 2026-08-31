'use client';

import {
  useState, useEffect, useRef, useCallback, ReactNode,
} from 'react';
import {
  ArrowRight, ArrowLeft, Cpu, GitBranch, Layout, Settings,
  ExternalLink, Mail, Phone, ChevronDown, Code2, Zap, Star,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────

type Page = 'home' | 'about' | 'projects' | 'contact' | 'project';

interface Project {
  id: string; num: string; title: string; short: string;
  tags: string[]; color: string; textColor: string; year: string;
  detail: { headline: string; body: string; highlights: string[]; tech: string[] };
}

// ─── Data ──────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: 'vhdl-multiplier', num: '01',
    title: '4-bit VHDL Multiplier',
    short: 'Combinational hardware multiplier with carry-propagation logic.',
    tags: ['VHDL', 'Digital Logic', 'Simulation'],
    color: '#8b5cf6', textColor: '#fff', year: '2024',
    detail: {
      headline: 'Gate-level combinational multiplier',
      body: 'A 4-bit combinational multiplier built entirely in VHDL, simulated with a comprehensive testbench covering all 256 input combinations. Demonstrates mastery of structural VHDL and timing analysis.',
      highlights: ['Full 4×4 = 8-bit output width', 'Structural VHDL architecture', '100% input-space coverage', 'Comprehensive testbench'],
      tech: ['VHDL', 'Digital Logic', 'Simulation', 'Testbench'],
    },
  },
  {
    id: 'add-shift', num: '02',
    title: 'Add-Shift Multiplier',
    short: 'Sequential multiplication via iterative add-and-shift operations.',
    tags: ['VHDL', 'Architecture', 'FSM'],
    color: '#10b981', textColor: '#000', year: '2024',
    detail: {
      headline: 'Iterative hardware vs software tradeoffs',
      body: 'Implements binary multiplication using the classic add-and-shift algorithm in a finite-state machine architecture. Explores the balance between gate count and clock cycles.',
      highlights: ['FSM-based sequential design', 'Reduced gate count vs combinational', 'Sequential timing analysis', 'State transition diagrams'],
      tech: ['VHDL', 'FSM Design', 'Sequential Logic', 'Simulation'],
    },
  },
  {
    id: 'heapselect', num: '03',
    title: 'HeapSelect Algorithm',
    short: 'k-th smallest element in O(n + k log n) using heap structures.',
    tags: ['Python', 'Algorithms', 'Data Structures'],
    color: '#f59e0b', textColor: '#000', year: '2024',
    detail: {
      headline: 'Sub-linear selection via heap extraction',
      body: 'HeapSelect solves the k-th order statistic problem in optimal time complexity. Benchmarked against naive sorting approaches with rigorous empirical analysis.',
      highlights: ['Linear heap construction O(n)', 'Sub-linear k-extraction O(k log n)', 'Benchmarked against QuickSelect', 'Empirical complexity plots'],
      tech: ['Python', 'Heaps', 'Complexity Analysis', 'Matplotlib'],
    },
  },
];

const TICKER_ITEMS = [
  'VHDL', 'Digital Logic', 'Next.js', 'TypeScript', 'React',
  'Python', 'Algorithms', 'FSM Design', 'C Programming',
  'TU Dortmund', 'Data Structures', 'Systems', 'Web Dev',
];

const STATS = [
  { value: 3, label: 'Projects Built', suffix: '+' },
  { value: 5, label: 'Semester', suffix: 'th' },
  { value: 256, label: 'Test Cases', suffix: '' },
  { value: 100, label: 'Input Coverage', suffix: '%' },
];

// ─── Shared style helpers ──────────────────────────────────────────────────

const C = {
  container: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 } as React.CSSProperties,
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 } as React.CSSProperties,
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--primary)', marginBottom: 16 },
  tag: (bg = 'var(--primary-fixed)', fg = 'var(--on-primary-fixed)'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center',
    background: bg, color: fg,
    borderRadius: 6, padding: '3px 10px',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
  }),
};

// ─── Hooks ────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCounter(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return val;
}

// ─── Cursor Dot ───────────────────────────────────────────────────────────

function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);
    let raf: number;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} style={{
        position: 'fixed', top: 0, left: 0, width: 8, height: 8,
        borderRadius: '50%', background: 'var(--primary)',
        pointerEvents: 'none', zIndex: 9999, willChange: 'transform',
      }} />
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, width: 40, height: 40,
        borderRadius: '50%', border: '2px solid var(--primary)',
        pointerEvents: 'none', zIndex: 9998, willChange: 'transform',
        opacity: 0.5,
      }} />
    </>
  );
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 600ms ${delay}ms ease, transform 600ms ${delay}ms ease`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Marquee Ticker ───────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', borderTop: '4px solid var(--on-surface)', borderBottom: '4px solid var(--on-surface)', background: 'var(--primary)', color: '#fff', padding: '12px 0', whiteSpace: 'nowrap' }}>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      <div style={{ display: 'inline-flex', gap: 48, animation: 'ticker 18s linear infinite' }}>
        {items.map((item, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            {item} <span style={{ opacity: 0.5 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────

function StatCard({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const { ref, inView } = useInView();
  const count = useCounter(value, inView);
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '32px 24px', border: '4px solid var(--on-surface)', borderRadius: 8 }}>
      <div style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1, color: 'var(--primary)', marginBottom: 8 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-soft)' }}>{label}</div>
    </div>
  );
}

// ─── Typing Hero ──────────────────────────────────────────────────────────

function TypingText({ words }: { words: string[] }) {
  const [wIdx, setWIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkT = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(blinkT);
  }, []);

  useEffect(() => {
    const word = words[wIdx];
    if (!deleting && cIdx === word.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && cIdx === 0) {
      setDeleting(false);
      setWIdx(i => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => setCIdx(c => deleting ? c - 1 : c + 1), deleting ? 45 : 90);
    return () => clearTimeout(t);
  }, [cIdx, deleting, wIdx, words]);

  return (
    <span style={{ color: 'var(--primary)' }}>
      {words[wIdx].slice(0, cIdx)}
      <span style={{ opacity: blink ? 1 : 0, fontWeight: 300 }}>|</span>
    </span>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────

function MagBtn({
  children, onClick, dark = false, outline = false, style,
}: {
  children: ReactNode; onClick?: () => void;
  dark?: boolean; outline?: boolean; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
  };

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    padding: '16px 40px', borderRadius: 6, cursor: 'pointer',
    border: outline ? '4px solid currentColor' : 'none',
    transform: hov ? `translate(${pos.x}px, ${pos.y}px) scale(1.04)` : 'translate(0,0) scale(1)',
    transition: hov ? 'transform 100ms ease' : 'transform 400ms cubic-bezier(0.23,1,0.32,1)',
    background: outline ? 'transparent' : dark ? '#000' : 'var(--primary)',
    color: outline ? (dark ? '#000' : '#fff') : '#fff',
    ...style,
  };

  return (
    <button ref={ref} onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPos({ x: 0, y: 0 }); }}
      style={base}
    >
      {children}
    </button>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────

function ProjectCard({ p, onClick, delay = 0 }: { p: Project; onClick: () => void; delay?: number }) {
  const [hov, setHov] = useState(false);
  const { ref, inView } = useInView(0.1);

  return (
    <div ref={ref} onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: p.color,
        color: p.textColor,
        borderRadius: 8, padding: 40,
        minHeight: 360,
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transform: inView
          ? hov ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'
          : 'translateY(60px)',
        opacity: inView ? 1 : 0,
        transition: inView
          ? `transform 250ms ease, opacity 0ms`
          : `opacity 600ms ${delay}ms ease, transform 600ms ${delay}ms ease`,
        overflow: 'hidden',
        position: 'relative',
      }}>
      {/* Big number background */}
      <div style={{
        position: 'absolute', right: -10, bottom: -20,
        fontSize: 140, fontWeight: 900, lineHeight: 1,
        opacity: 0.07, pointerEvents: 'none',
        userSelect: 'none',
      }}>{p.num}</div>

      <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.65, marginBottom: 'auto', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Project {p.num}
      </div>
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {p.tags.map(t => (
            <span key={t} style={{ background: 'rgba(0,0,0,0.18)', color: p.textColor, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t}</span>
          ))}
        </div>
        <h3 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.6rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.15, marginBottom: 10 }}>{p.title}</h3>
        <p style={{ opacity: 0.82, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{p.short}</p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          borderBottom: `2px solid ${p.textColor}`, paddingBottom: 2, opacity: 0.8,
        }}>
          View Project <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const [page, setPage] = useState<Page>('home');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = (p: Page) => { setPage(p); setProjectId(null); window.scrollTo(0, 0); };
  const openProject = (id: string) => { setProjectId(id); setPage('project'); window.scrollTo(0, 0); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--on-background)', fontFamily: 'Outfit, sans-serif' }}>
      <CursorDot />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100,
        background: 'var(--background)',
        borderBottom: scrolled ? '4px solid var(--on-surface)' : '4px solid transparent',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxSizing: 'border-box',
        transition: 'border-color 300ms ease',
      }}>
        <button onClick={() => nav('home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 22, fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '-0.04em', color: 'var(--on-surface)', fontFamily: 'Outfit, sans-serif',
          transition: 'opacity 200ms',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ya<span style={{ color: 'var(--primary)' }}>.</span>dev
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(['home', 'about', 'projects', 'contact'] as Page[]).map(p => (
            <button key={p} onClick={() => nav(p)} style={{
              background: page === p ? 'var(--primary)' : 'transparent',
              color: page === p ? '#fff' : 'var(--on-surface)',
              border: 'none', cursor: 'pointer',
              padding: '6px 14px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: 'Outfit, sans-serif', borderRadius: 6,
              transition: 'background 200ms, color 200ms',
            }}
              onMouseEnter={e => { if (page !== p) { e.currentTarget.style.color = 'var(--primary)'; } }}
              onMouseLeave={e => { if (page !== p) { e.currentTarget.style.color = 'var(--on-surface)'; } }}
            >{p}</button>
          ))}
          <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{
            marginLeft: 8, width: 38, height: 38,
            border: '3px solid var(--on-surface)', borderRadius: 6,
            background: 'transparent', cursor: 'pointer',
            fontSize: 16, color: 'var(--on-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 200ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {theme === 'light' ? '☽' : '☀'}
          </button>
        </div>
      </nav>

      <main style={{ paddingTop: 64 }}>
        {page === 'home'     && <HomePage    onNav={nav} onProject={openProject} />}
        {page === 'about'    && <AboutPage   />}
        {page === 'projects' && <ProjectsPage onProject={openProject} />}
        {page === 'contact'  && <ContactPage />}
        {page === 'project'  && projectId && <ProjectDetailPage projectId={projectId} onBack={() => nav('projects')} />}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: '#000', color: '#fff', borderTop: '4px solid var(--primary)', padding: '48px 32px' }}>
        <div style={{ ...C.container, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 4 }}>
              ya<span style={{ color: 'var(--primary)' }}>.</span>dev
            </div>
            <div style={{ fontSize: 12, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Yassine Abousaid © 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 32, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
            {['Next.js', 'TypeScript', 'Tailwind', 'VHDL'].map(t => <span key={t}>{t}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Home ──────────────────────────────────────────────────────────────────

function HomePage({ onNav, onProject }: { onNav: (p: Page) => void; onProject: (id: string) => void }) {
  const heroRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) setParallaxY(window.scrollY * 0.3);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '100px 32px 80px',
        backgroundColor: '#a36700', color: '#000',
        borderBottom: '4px solid #000', overflow: 'hidden',
      }}>
        {/* Deco shapes with parallax */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          top: -120, right: -120, background: '#fff', opacity: 0.08,
          transform: `translateY(${parallaxY * 0.4}px)`,
          pointerEvents: 'none', zIndex: 0,
          transition: 'transform 0ms',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500,
          bottom: -100, left: -100, background: '#000', opacity: 0.07,
          transform: `rotate(45deg) translateY(${-parallaxY * 0.2}px)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          top: '40%', left: '55%', background: '#fff', opacity: 0.06,
          transform: `translateY(${parallaxY * 0.6}px)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ ...C.container, position: 'relative', zIndex: 1 }}>
          {/* Available badge — animate in */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#000', color: '#fff',
            padding: '6px 16px', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            marginBottom: 28, borderRadius: 4,
            animation: 'fadeSlideDown 600ms ease both',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Available for opportunities
          </div>

          <h1 style={{
            fontSize: 'clamp(3.5rem, 10vw, 8rem)', fontWeight: 900,
            textTransform: 'uppercase', lineHeight: 0.88, letterSpacing: '-0.04em',
            marginBottom: 32,
            animation: 'fadeSlideUp 700ms 100ms ease both',
          }}>
            Yassine<br />
            <span style={{ color: '#fff' }}>Abou<span style={{ color: '#000' }}>sa</span>id</span>
          </h1>

          <p style={{
            maxWidth: 580, fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', lineHeight: 1.7,
            marginBottom: 12, opacity: 0.85,
            animation: 'fadeSlideUp 700ms 200ms ease both',
          }}>
            CS student at TU Dortmund building{' '}
            <TypingText words={['robust hardware.', 'fast algorithms.', 'modern UIs.', 'digital logic.']} />
          </p>

          <p style={{ fontSize: 14, opacity: 0.65, marginBottom: 40, animation: 'fadeSlideUp 700ms 280ms ease both' }}>
            5th Semester · Dortmund, Germany
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, animation: 'fadeSlideUp 700ms 360ms ease both' }}>
            <MagBtn onClick={() => onNav('projects')}>
              View Projects <ArrowRight size={18} />
            </MagBtn>
            <MagBtn outline dark onClick={() => onNav('contact')}>
              Get in Touch
            </MagBtn>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0.5, animation: 'bounce 2s infinite',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Stats ── */}
      <section style={{ padding: '80px 32px', background: 'var(--background)' }}>
        <div style={{ ...C.container }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <StatCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intro / Skills ── */}
      <section style={{ padding: '96px 32px', background: 'var(--surface-muted)', borderTop: '4px solid var(--on-surface)', borderBottom: '4px solid var(--on-surface)' }}>
        <div style={{ ...C.container, display: 'flex', flexWrap: 'wrap', gap: 80 }}>
          <div style={{ flex: '1 1 240px' }}>
            <Reveal>
              <span style={C.label}>What I Do</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
                I solve<br />complex<br />problems.
              </h2>
            </Reveal>
          </div>

          <div style={{ flex: '2 1 400px' }}>
            <Reveal delay={100}>
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', lineHeight: 1.75, color: 'var(--foreground-soft)', marginBottom: 48 }}>
                I&apos;m passionate about understanding how things work at every level — from NAND gates to React components. Precision, performance, and clarity drive everything I build.
              </p>
            </Reveal>
            <div style={C.grid2}>
              {[
                { icon: <Cpu size={28} />, title: 'Hardware', desc: 'VHDL, digital logic, FSM design and simulation.', accent: '#8b5cf6' },
                { icon: <GitBranch size={28} />, title: 'Algorithms', desc: 'Complexity analysis, heaps, graph traversal, selection.', accent: '#10b981' },
                { icon: <Layout size={28} />, title: 'Web Dev', desc: 'Next.js, React, Tailwind — building real user-facing apps.', accent: '#0058be' },
                { icon: <Settings size={28} />, title: 'Systems', desc: 'Low-level C, memory, architecture, and OS.', accent: '#f59e0b' },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 80}>
                  <SkillCard {...c} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section style={{ padding: '96px 32px', background: 'var(--background)' }}>
        <div style={C.container}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64, gap: 16 }}>
            <Reveal>
              <span style={C.label}>Work</span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
                Featured Projects
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <button onClick={() => onNav('projects')} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                borderBottom: '3px solid var(--primary)', color: 'var(--primary)',
                fontFamily: 'Outfit, sans-serif', paddingBottom: 3,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'opacity 200ms',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                View All <ArrowRight size={14} />
              </button>
            </Reveal>
          </div>

          <div style={C.grid3}>
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} p={p} onClick={() => onProject(p.id)} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Terminal Quote ── */}
      <section style={{ padding: '0 32px 96px', background: 'var(--background)' }}>
        <div style={C.container}>
          <Reveal>
            <div style={{
              background: '#000', color: '#fff', borderRadius: 8,
              padding: '32px 40px', fontFamily: 'monospace', fontSize: 14, lineHeight: 1.8,
              border: '4px solid var(--on-surface)',
            }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['#ff5f57', '#ffbd2e', '#28c841'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ color: '#6a9955' }}>{'// currently obsessed with'}</div>
              <div><span style={{ color: '#569cd6' }}>const</span> <span style={{ color: '#9cdcfe' }}>interests</span> <span style={{ color: '#d4d4d4' }}>= [</span></div>
              <div style={{ paddingLeft: 24 }}><span style={{ color: '#ce9178' }}>&quot;hardware-software co-design&quot;</span><span style={{ color: '#d4d4d4' }}>,</span></div>
              <div style={{ paddingLeft: 24 }}><span style={{ color: '#ce9178' }}>&quot;algorithmic complexity&quot;</span><span style={{ color: '#d4d4d4' }}>,</span></div>
              <div style={{ paddingLeft: 24 }}><span style={{ color: '#ce9178' }}>&quot;building things that actually work&quot;</span></div>
              <div><span style={{ color: '#d4d4d4' }}>];</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--primary)', color: '#fff', padding: '80px 32px', textAlign: 'center', borderTop: '4px solid var(--on-surface)' }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 16 }}>Ready to collaborate?</div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: 40, lineHeight: 0.9 }}>
            Let&apos;s build<br />something.
          </h2>
          <MagBtn onClick={() => onNav('contact')} style={{ background: '#fff', color: '#000', fontSize: 15 }}>
            Start a Conversation <ArrowRight size={18} />
          </MagBtn>
        </Reveal>
      </section>

      <style>{`
        @keyframes fadeSlideUp   { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes bounce { 0%,100% { transform:translateX(-50%) translateY(0) } 50% { transform:translateX(-50%) translateY(6px) } }
      `}</style>
    </div>
  );
}

// ─── Skill Card ────────────────────────────────────────────────────────────

function SkillCard({ icon, title, desc, accent }: { icon: ReactNode; title: string; desc: string; accent: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--background)',
        border: hov ? `4px solid ${accent}` : '4px solid transparent',
        borderRadius: 8, padding: '28px 28px',
        transition: 'border-color 250ms, transform 250ms',
        transform: hov ? 'translateY(-4px)' : 'none',
        cursor: 'default',
      }}>
      <div style={{ color: accent, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'var(--foreground-soft)', fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ─── About ─────────────────────────────────────────────────────────────────

function AboutPage() {
  const skills = [
    { name: 'VHDL / Digital Logic', level: 85, color: '#8b5cf6' },
    { name: 'Python / Algorithms', level: 80, color: '#10b981' },
    { name: 'React / Next.js / TS', level: 75, color: '#0058be' },
    { name: 'C / Systems Programming', level: 70, color: '#f59e0b' },
    { name: 'Git / Linux', level: 85, color: '#ef4444' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header band */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '80px 32px 64px', borderBottom: '4px solid var(--on-surface)' }}>
        <div style={C.container}>
          <Reveal><span style={{ ...C.label, color: 'rgba(255,255,255,0.6)' }}>Me</span></Reveal>
          <Reveal delay={80}>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
              About<br />Yassine
            </h1>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: '80px 32px', background: 'var(--background)' }}>
        <div style={C.container}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 80, marginBottom: 96 }}>
            <div style={{ flex: '1 1 300px' }}>
              <Reveal>
                <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', lineHeight: 1.7, color: 'var(--foreground-soft)', marginBottom: 40 }}>
                  I&apos;m a Computer Science student at TU Dortmund (5th Semester). My approach is rooted in understanding fundamentals deeply — from gate-level hardware to high-level algorithms.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { icon: <Mail size={16} />, text: 'yassine.abousaid2004@gmail.com' },
                    { icon: <Phone size={16} />, text: '+49 152 5156 1403' },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600 }}>
                      <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div style={{ flex: '1 1 300px' }}>
              <Reveal delay={100}>
                <span style={C.label}>Education</span>
                <div style={{ border: '4px solid var(--on-surface)', borderRadius: 8, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', background: 'var(--primary)' }} />
                  <div style={{ paddingLeft: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', marginBottom: 6 }}>TU Dortmund</div>
                    <div style={{ fontWeight: 700, color: 'var(--foreground-soft)', marginBottom: 4, fontSize: 15 }}>B.Sc. Computer Science</div>
                    <div style={{ color: 'var(--outline)', fontSize: 13 }}>2022 – Present · 5th Semester</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Skill bars */}
          <Reveal>
            <span style={C.label}>Skills</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {skills.map((s, i) => <SkillBar key={s.name} {...s} delay={i * 100} />)}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        <span>{name}</span>
        <span style={{ color: 'var(--foreground-soft)' }}>{level}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--outline-variant)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, background: color,
          width: inView ? `${level}%` : '0%',
          transition: `width 900ms ${delay}ms cubic-bezier(0.23,1,0.32,1)`,
        }} />
      </div>
    </div>
  );
}

// ─── Projects ──────────────────────────────────────────────────────────────

function ProjectsPage({ onProject }: { onProject: (id: string) => void }) {
  const [filter, setFilter] = useState<string | null>(null);
  const allTags = Array.from(new Set(PROJECTS.flatMap(p => p.tags)));
  const filtered = filter ? PROJECTS.filter(p => p.tags.includes(filter)) : PROJECTS;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: 'var(--surface-muted)', padding: '80px 32px 64px', borderBottom: '4px solid var(--on-surface)' }}>
        <div style={C.container}>
          <Reveal><span style={C.label}>Portfolio</span></Reveal>
          <Reveal delay={80}>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: 32 }}>
              All<br />Projects
            </h1>
          </Reveal>
          {/* Filter chips */}
          <Reveal delay={160}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <FilterChip active={!filter} label="All" onClick={() => setFilter(null)} />
              {allTags.map(t => <FilterChip key={t} active={filter === t} label={t} onClick={() => setFilter(t === filter ? null : t)} />)}
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: '64px 32px', background: 'var(--background)' }}>
        <div style={C.container}>
          <div style={C.grid2}>
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={i * 100}>
                <div onClick={() => onProject(p.id)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = p.color; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--on-surface)'; }}
                  style={{
                    background: 'var(--background)', border: '4px solid var(--on-surface)',
                    borderRadius: 8, padding: 40, cursor: 'pointer',
                    transition: 'transform 250ms, border-color 250ms',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
                    <span style={{ fontWeight: 900, color: p.color, fontSize: 24 }}>/{p.num}</span>
                    <span style={{ fontWeight: 700, opacity: 0.4, fontSize: 13 }}>{p.year}</span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 12, lineHeight: 1.1 }}>{p.title}</h3>
                  <p style={{ color: 'var(--foreground-soft)', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>{p.short}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                    {p.tags.map(t => <span key={t} style={C.tag()}>{t}</span>)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: p.color }}>
                    View Project <ArrowRight size={14} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'var(--primary)' : 'transparent',
      color: active ? '#fff' : 'var(--on-surface)',
      border: `2px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
      borderRadius: 6, padding: '6px 14px',
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
      cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
      transition: 'background 200ms, color 200ms, border-color 200ms',
    }}>{label}</button>
  );
}

// ─── Contact ───────────────────────────────────────────────────────────────

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (name: string): React.CSSProperties => ({
    fontFamily: 'Outfit, sans-serif', fontSize: 15,
    padding: '14px 18px', borderRadius: 6, width: '100%', boxSizing: 'border-box',
    border: focused === name ? '4px solid var(--primary)' : '3px solid var(--outline-variant)',
    background: 'var(--background)', color: 'var(--on-surface)',
    outline: 'none', transition: 'border 200ms',
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ background: '#000', color: '#fff', padding: '80px 32px 64px', borderBottom: '4px solid var(--primary)' }}>
        <div style={C.container}>
          <Reveal><span style={{ ...C.label, color: 'rgba(255,255,255,0.5)' }}>Get in Touch</span></Reveal>
          <Reveal delay={80}>
            <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
              Let&apos;s<br />Talk.
            </h1>
          </Reveal>
        </div>
      </div>

      <div style={{ padding: '80px 32px', background: 'var(--background)' }}>
        <div style={{ ...C.container }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 80 }}>

            {/* Left info */}
            <div style={{ flex: '1 1 260px' }}>
              <Reveal>
                <p style={{ fontSize: 18, color: 'var(--foreground-soft)', marginBottom: 48, lineHeight: 1.7 }}>
                  Available for internships, student jobs, and creative collaborations. I respond within 24 hours.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {[
                    { icon: <Mail size={20} />, label: 'Email', value: 'yassine.abousaid2004@gmail.com' },
                    { icon: <Phone size={20} />, label: 'Phone', value: '+49 152 5156 1403' },
                    { icon: <Zap size={20} />, label: 'Response', value: 'Within 24 hours' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <div style={{ flex: '2 1 360px' }}>
              <Reveal delay={100}>
                {sent ? (
                  <div style={{ border: '4px solid var(--primary)', borderRadius: 8, padding: 48, textAlign: 'center' }}>
                    <Star size={40} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 24, fontWeight: 900, textTransform: 'uppercase', marginBottom: 12 }}>Message Sent!</h3>
                    <p style={{ color: 'var(--foreground-soft)' }}>I&apos;ll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                      { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                    ].map(f => (
                      <div key={f.name}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-soft)', marginBottom: 8 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder}
                          onFocus={() => setFocused(f.name)} onBlur={() => setFocused(null)}
                          style={inputStyle(f.name)} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-soft)', marginBottom: 8 }}>Message</label>
                      <textarea rows={6} placeholder="Tell me about your project or idea…"
                        onFocus={() => setFocused('msg')} onBlur={() => setFocused(null)}
                        style={{ ...inputStyle('msg'), resize: 'vertical' }} />
                    </div>
                    <MagBtn onClick={() => setSent(true)} style={{ alignSelf: 'flex-start' }}>
                      Send Message <ArrowRight size={18} />
                    </MagBtn>
                  </div>
                )}
              </Reveal>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Project Detail ────────────────────────────────────────────────────────

function ProjectDetailPage({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const p = PROJECTS.find(proj => proj.id === projectId);
  if (!p) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Color band header */}
      <div style={{
        background: p.color, color: p.textColor,
        padding: '80px 32px 60px',
        borderBottom: '4px solid var(--on-surface)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: p.textColor === '#fff' ? '#fff' : '#000', opacity: 0.06, pointerEvents: 'none' }} />
        <div style={C.container}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: p.textColor,
            fontFamily: 'Outfit, sans-serif', marginBottom: 40,
            opacity: 0.7, transition: 'opacity 200ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            <ArrowLeft size={16} /> All Projects
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {p.tags.map(t => (
              <span key={t} style={{ background: 'rgba(0,0,0,0.15)', color: p.textColor, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t}</span>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: 20 }}>
            {p.title}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', fontWeight: 600, opacity: 0.8, maxWidth: 580 }}>{p.detail.headline}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '80px 32px', background: 'var(--background)' }}>
        <div style={C.container}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 80, marginBottom: 80 }}>
            <div style={{ flex: '2 1 320px' }}>
              <Reveal>
                <span style={C.label}>Overview</span>
                <p style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--foreground-soft)', marginBottom: 40 }}>{p.detail.body}</p>
              </Reveal>
              <Reveal delay={100}>
                <span style={C.label}>Technologies</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {p.detail.tech.map(t => (
                    <span key={t} style={{ ...C.tag('var(--surface-muted)', 'var(--on-surface)'), border: '2px solid var(--outline-variant)', fontSize: 12, padding: '6px 14px' }}>
                      <Code2 size={12} style={{ marginRight: 6 }} />{t}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            <div style={{ flex: '1 1 260px' }}>
              <Reveal delay={120}>
                <span style={C.label}>Highlights</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {p.detail.highlights.map((h, i) => (
                    <div key={h} style={{
                      padding: '16px 0', borderBottom: '2px solid var(--outline-variant)',
                      display: 'flex', alignItems: 'center', gap: 14,
                      fontWeight: 700, fontSize: 15,
                      animation: `fadeSlideUp 500ms ${i * 80}ms both`,
                    }}>
                      <span style={{ color: p.color, fontWeight: 900, fontSize: 18 }}>→</span>
                      {h}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          {/* Next project */}
          <Reveal>
            <div style={{ borderTop: '4px solid var(--on-surface)', paddingTop: 48 }}>
              <span style={C.label}>Next Project</span>
              {(() => {
                const idx = PROJECTS.findIndex(pr => pr.id === p.id);
                const next = PROJECTS[(idx + 1) % PROJECTS.length];
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase' }}>{next.title}</h3>
                    <MagBtn onClick={onBack} style={{ background: 'var(--on-surface)', color: 'var(--background)' }}>
                      Browse All <ExternalLink size={16} />
                    </MagBtn>
                  </div>
                );
              })()}
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`@keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
}
