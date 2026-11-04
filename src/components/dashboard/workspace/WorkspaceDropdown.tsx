import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';
import { getDropdownPosition } from './dropdownPosition';

type Option = { value: string; label: string; icon?: ReactNode };
type Props = {
  value: string; options: Option[]; onChange: (value: string) => void;
  placeholder?: string; className?: string; searchable?: boolean;
  searchPlaceholder?: string; emptyMessage?: string; accent?: 'spain' | 'green';
};

export default function WorkspaceDropdown({ value, options, onChange, placeholder, className = '', searchable = false, searchPlaceholder = 'Search…', emptyMessage = 'No options found' }: Props) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 200, maxHeight: 300 });
  const selected = options.find((option) => option.value === value);
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const filtered = searchable && query.trim() ? options.filter((option) => normalize(`${option.value} ${option.label}`).includes(normalize(query.trim()))) : options;

  const show = () => { setQuery(''); setActive(Math.max(0, options.findIndex((option) => option.value === value))); setOpen(true); };
  const choose = (index: number) => {
    if (!filtered[index]) return;
    onChange(filtered[index].value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    const frame = requestAnimationFrame(() => { if (searchable) search.current?.focus({ preventScroll: true }); });
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('focusin', closeOutside); cancelAnimationFrame(frame); };
  }, [open, searchable]);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const viewport = window.visualViewport;
    const update = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const bounds = {
        left: viewport?.offsetLeft ?? 0,
        top: viewport?.offsetTop ?? 0,
        width: viewport?.width ?? document.documentElement.clientWidth,
        height: viewport?.height ?? window.innerHeight,
      };
      if (rect.bottom < bounds.top || rect.top > bounds.top + bounds.height) {
        setOpen(false);
        return;
      }
      const list = menu.current?.querySelector<HTMLElement>('[role="listbox"]');
      const searchHeight = search.current?.parentElement?.offsetHeight ?? 0;
      const contentHeight = (list?.scrollHeight ?? 300) + searchHeight + 2;
      const next = getDropdownPosition(rect, bounds, contentHeight);
      setPosition((current) => Object.keys(next).every((key) => current[key as keyof typeof current] === next[key as keyof typeof next]) ? current : next);
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    if (trigger.current) observer?.observe(trigger.current);
    if (menu.current) observer?.observe(menu.current);
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);
    viewport?.addEventListener('resize', scheduleUpdate);
    viewport?.addEventListener('scroll', scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
      viewport?.removeEventListener('resize', scheduleUpdate);
      viewport?.removeEventListener('scroll', scheduleUpdate);
    };
  }, [open, filtered.length, searchable]);

  useEffect(() => {
    if (!open) return;
    const option = optionRefs.current[active];
    const list = option?.parentElement;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
  }, [active, open, query]);

  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus({ preventScroll: true }); }
    else if (event.key === 'Tab') { setOpen(false); if (event.target !== trigger.current) trigger.current?.focus({ preventScroll: true }); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) show();
      else if (filtered.length) setActive((current) => (current + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length);
    } else if ((event.key === 'Home' || event.key === 'End') && event.target === trigger.current) {
      event.preventDefault(); setOpen(true); setActive(event.key === 'Home' ? 0 : Math.max(0, filtered.length - 1));
    } else if (event.key === 'Enter' || (event.key === ' ' && event.target === trigger.current)) {
      event.preventDefault(); if (open) choose(active); else show();
    }
  };

  return <>
    <div className={`workspace-dropdown ${className}`}>
      <button ref={trigger} type="button" role="combobox" aria-label={placeholder || selected?.label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} aria-activedescendant={open && !searchable && filtered[active] ? `${id}-${active}` : undefined} onClick={() => open ? setOpen(false) : show()} onKeyDown={keyDown}>
        {selected?.icon}<span className={selected ? '' : 'workspace-dropdown-placeholder'}>{selected?.label || placeholder || 'Select…'}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
    </div>
    {open && createPortal(<div ref={menu} className="workspace-dropdown-menu" style={position} onKeyDown={keyDown}>
      {searchable && <div className="workspace-dropdown-search"><Search size={15} /><input ref={search} type="search" role="combobox" aria-label={searchPlaceholder} aria-expanded={open} aria-controls={id} aria-activedescendant={filtered[active] ? `${id}-${active}` : undefined} placeholder={searchPlaceholder} value={query} onChange={(event) => {setQuery(event.target.value);setActive(0);}} /></div>}
      <div className="workspace-dropdown-options" role="listbox" id={id} aria-label={placeholder || selected?.label}>
        {filtered.length ? filtered.map((option, index) => <div key={option.value} id={`${id}-${index}`} ref={(element) => {optionRefs.current[index] = element;}} role="option" aria-selected={option.value === value} data-active={index === active} onPointerMove={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(index)}>{option.icon}<span>{option.label}</span>{option.value === value && <Check size={16} />}</div>) : <p className="workspace-dropdown-empty">{emptyMessage}</p>}
      </div>
    </div>, document.body)}
  </>;
}
