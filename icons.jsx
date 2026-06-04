/* icons.jsx — clean lucide-style stroke icons → window */
const Ic = ({ d, size = 20, sw = 2, fill = "none", children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
       strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const ArrowUpRight = (p) => <Ic {...p} d="M7 17 17 7M8 7h9v9" />;
const ArrowRight   = (p) => <Ic {...p}><line x1="5" y1="12" x2="19" y2="12" /><path d="m12 5 7 7-7 7" /></Ic>;
const ArrowDown    = (p) => <Ic {...p}><line x1="12" y1="5" x2="12" y2="19" /><path d="m5 12 7 7 7-7" /></Ic>;
const ExternalLink = (p) => <Ic {...p}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Ic>;
const Sparkle      = (p) => <Ic {...p} d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />;
const Scale        = (p) => <Ic {...p}><path d="m16 16 3-8 3 8c-2 1.5-4 1.5-6 0" /><path d="m2 16 3-8 3 8c-2 1.5-4 1.5-6 0" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></Ic>;
const Cpu          = (p) => <Ic {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" /></Ic>;
const LayoutGrid   = (p) => <Ic {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></Ic>;
const Mail         = (p) => <Ic {...p}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Ic>;
const PlayCircle   = (p) => <Ic {...p}><circle cx="12" cy="12" r="10" /><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" /></Ic>;
const BarChart     = (p) => <Ic {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></Ic>;
const Quote        = (p) => <Ic {...p}><path d="M9 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2-1 3-3 4" /><path d="M19 11h-3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2-1 3-3 4" /></Ic>;
const MapPin       = (p) => <Ic {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Ic>;
const Award        = (p) => <Ic {...p}><circle cx="12" cy="8" r="6" /><path d="M15.5 13 17 22l-5-3-5 3 1.5-9" /></Ic>;

Object.assign(window, {
  ArrowUpRight, ArrowRight, ArrowDown, ExternalLink, Sparkle, Scale,
  Cpu, LayoutGrid, Mail, PlayCircle, BarChart, Quote, MapPin, Award,
});
