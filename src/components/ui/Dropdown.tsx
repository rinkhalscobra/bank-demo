import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  accent?: 'spain' | 'green';
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder,
  className = '',
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  accent = 'green',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [menuPosition, setMenuPosition] = useState({
    left: 0,
    top: 0,
    width: 180,
    maxHeight: 256,
  });

  const updateMenuPosition = useCallback(() => {
    const trigger = ref.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportMargin = 8;
    const menuGap = 6;
    const desiredHeight = 256;
    const spaceBelow = window.innerHeight - rect.bottom - viewportMargin - menuGap;
    const spaceAbove = rect.top - viewportMargin - menuGap;
    const openAbove = spaceBelow < Math.min(180, desiredHeight) && spaceAbove > spaceBelow;
    const availableHeight = Math.max(80, openAbove ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(desiredHeight, availableHeight);
    const top = openAbove
      ? Math.max(viewportMargin, rect.top - menuGap - maxHeight)
      : Math.min(window.innerHeight - viewportMargin - maxHeight, rect.bottom + menuGap);

    setMenuPosition({
      left: Math.max(viewportMargin, Math.min(rect.left, window.innerWidth - viewportMargin - rect.width)),
      top,
      width: Math.max(180, Math.min(rect.width, window.innerWidth - viewportMargin * 2)),
      maxHeight,
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      return;
    }

    if (!searchable) return;

    const focusFrame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [open, searchable]);

  useLayoutEffect(() => {
    if (!open) return;

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, options.length, updateMenuPosition]);

  const selected = options.find((o) => o.value === value);
  const isSpainAccent = accent === 'spain';
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery.trim());
    if (!searchable || !normalizedQuery) return options;

    return options.filter((option) =>
      normalizeSearchValue(`${option.label} ${option.value}`).includes(normalizedQuery)
    );
  }, [options, searchQuery, searchable]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`
          flex min-w-0 items-center gap-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium
          bg-white border text-left
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:border-transparent
          ${isSpainAccent
            ? 'border-[#AA151B]/15 hover:border-[#AA151B]/30 hover:bg-[#F1BF00]/[0.08] focus:ring-[#F1BF00]/35'
            : 'border-[#006446]/14 hover:border-[#006446]/25 hover:bg-[#006446]/[0.03] focus:ring-[#006446]/20'}
          ${open ? (isSpainAccent ? 'ring-2 ring-[#F1BF00]/35 border-transparent' : 'ring-2 ring-[#006446]/20 border-transparent') : ''}
        `}
      >
        {selected?.icon && <span className="flex-shrink-0">{selected.icon}</span>}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isSpainAccent ? 'text-[#AA151B]' : 'text-[#006446]'} ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={menuPosition}
          className={`fixed z-[9999] flex flex-col overflow-hidden rounded-2xl border bg-white animate-in ${isSpainAccent
            ? 'border-[#AA151B]/15 shadow-[0_24px_70px_-38px_rgba(107,15,20,0.38)]'
            : 'border-[#006446]/14 shadow-[0_24px_70px_-38px_rgba(0,100,70,0.45)]'}`}
        >
          {searchable && (
            <div className={`flex-shrink-0 border-b bg-white p-2 ${isSpainAccent ? 'border-[#AA151B]/10' : 'border-[#006446]/10'}`}>
              <div className={`flex items-center gap-2 rounded-xl border px-3 focus-within:ring-2 ${isSpainAccent
                ? 'border-[#AA151B]/15 bg-[#F1BF00]/[0.06] focus-within:border-[#AA151B]/30 focus-within:ring-[#F1BF00]/20'
                : 'border-[#006446]/15 bg-[#006446]/[0.03] focus-within:border-[#006446]/30 focus-within:ring-[#006446]/10'}`}>
                <Search className={`h-4 w-4 flex-shrink-0 ${isSpainAccent ? 'text-[#AA151B]/70' : 'text-[#006446]/65'}`} />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  aria-label={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div role="listbox" className="min-h-0 flex-1 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-slate-500">{emptyMessage}</p>
            ) : filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full min-w-0 flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors
                    ${isSpainAccent
                      ? (isSelected ? 'bg-[#F1BF00]/20 text-[#AA151B]' : 'text-neutral-700 hover:bg-[#F1BF00]/10 hover:text-[#AA151B]')
                      : (isSelected ? 'bg-[#006446]/10 text-[#006446]' : 'text-slate-700 hover:bg-[#006446]/[0.05] hover:text-[#006446]')}
                  `}
                >
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isSpainAccent ? 'text-[#AA151B]' : 'text-[#006446]'}`} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
