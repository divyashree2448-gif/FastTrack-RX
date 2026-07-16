import { Pill } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light';
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: 20, container: 'gap-2', text: 'text-lg', sub: 'text-[10px]' },
  md: { icon: 28, container: 'gap-2.5', text: 'text-xl', sub: 'text-xs' },
  lg: { icon: 36, container: 'gap-3', text: 'text-2xl', sub: 'text-sm' },
  xl: { icon: 44, container: 'gap-3.5', text: 'text-3xl', sub: 'text-sm' },
};

export default function Logo({ size = 'md', variant = 'default', showText = true }: LogoProps) {
  const s = sizeMap[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const subColor = variant === 'light' ? 'text-white/70' : 'text-slate-500';

  return (
    <div className={`flex items-center ${s.container}`}>
      <div
        className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-medical-500 to-medical-700 shadow-lg shadow-medical-600/30"
        style={{ width: s.icon + 12, height: s.icon + 12 }}
      >
        <Pill size={s.icon} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-extrabold tracking-tight ${textColor}`}>
            FastTrack<span className="text-medical-500">Rx</span>
          </span>
          <span className={`${s.sub} font-medium tracking-wide ${subColor}`}>
            Pharmacy Queue System
          </span>
        </div>
      )}
    </div>
  );
}
