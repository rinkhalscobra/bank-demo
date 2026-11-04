import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type AccountOption = { id: string; currency: string; name: string };

export default function OverviewAccountSelector({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: AccountOption[];
  label: string;
  onChange: (id: string) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const typeahead = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedIndex = options.findIndex((option) => option.id === value);
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Scroll only the options container; never move the dashboard itself.
    const option = optionRefs.current[activeIndex];
    const list = option?.parentElement;
    if (!option || !list) return;
    if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }
  }, [activeIndex, open]);

  const showMenu = (index = Math.max(0, selectedIndex)) => {
    setActiveIndex(index);
    typeahead.current = { text: '', time: 0 };
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.id);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!options.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) showMenu();
      else setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      showMenu(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else showMenu();
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'Tab') {
      setOpen(false);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = `${now - typeahead.current.time < 650 ? typeahead.current.text : ''}${event.key.toLocaleLowerCase()}`;
      typeahead.current = { text, time: now };
      const query = [...text].every((character) => character === text[0]) ? text[0] : text;
      const start = open ? activeIndex : Math.max(0, selectedIndex);
      for (let offset = 1; offset <= options.length; offset += 1) {
        const index = (start + offset) % options.length;
        const option = options[index];
        if (option.currency.toLocaleLowerCase().startsWith(query) || option.name.toLocaleLowerCase().startsWith(query)) {
          setActiveIndex(index);
          setOpen(true);
          break;
        }
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className="overview-account-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className="overview-account-picker-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && options[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        disabled={!options.length}
        onClick={() => open ? setOpen(false) : showMenu()}
        onKeyDown={handleKeyDown}
      >
        <span className="overview-account-picker-code">{selected?.currency}</span>
        <span className="overview-account-picker-name">{selected?.name}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="overview-account-picker-menu">
          {options.map((option, index) => (
            <li
              key={option.id}
              id={`${listId}-${index}`}
              ref={(element) => { optionRefs.current[index] = element; }}
              role="option"
              aria-selected={option.id === value}
              data-active={index === activeIndex}
              onPointerMove={() => setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span className="overview-account-picker-symbol" aria-hidden="true">{option.currency}</span>
              <span className="overview-account-picker-option-label"><strong>{option.name}</strong><small>{option.currency}</small></span>
              {option.id === value && <Check size={16} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
