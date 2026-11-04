import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import './workspace.css';
import '../../../i18n/dashboard-workspace/translations';

export function WorkspacePage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`dashboard-route workspace-page ${className}`}>{children}</div>;
}

export function WorkspaceHeader({ title, description, icon: Icon, actions, eyebrow }: {
  title: string; description?: string; icon?: LucideIcon; actions?: ReactNode; eyebrow?: string;
}) {
  return <header className="workspace-heading">
    <div className="workspace-heading-content">
      {Icon && <span className="workspace-heading-icon"><Icon size={23} aria-hidden="true" /></span>}
      <div>{eyebrow && <p className="workspace-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="workspace-description">{description}</p>}</div>
    </div>
    {actions && <div className="workspace-heading-actions">{actions}</div>}
  </header>;
}

export function WorkspacePanel({ title, description, icon: Icon, action, children, className = '', bodyClassName = '' }: {
  title?: string; description?: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string;
}) {
  return <section className={`workspace-panel ${className}`}>
    {title && <header className="workspace-panel-heading"><div>{Icon && <Icon size={18} aria-hidden="true" />}<span><h2>{title}</h2>{description && <p>{description}</p>}</span></div>{action}</header>}
    <div className={`workspace-panel-body ${bodyClassName}`}>{children}</div>
  </section>;
}

export function WorkspaceMetrics({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <dl className={`workspace-metrics ${className}`}>{children}</dl>;
}

export function WorkspaceStat({ label, value, detail, icon: Icon }: {
  label: string; value: ReactNode; detail?: ReactNode; icon?: LucideIcon;
}) {
  return <div className="workspace-stat"><dt>{Icon && <Icon size={16} aria-hidden="true" />}{label}</dt><dd>{value}</dd>{detail && <p>{detail}</p>}</div>;
}

export function WorkspaceTabs<T extends string>({ value, onChange, items, label }: {
  value: T; onChange: (value: T) => void; label: string;
  items: { value: T; label: string; icon?: LucideIcon; count?: number }[];
}) {
  return <div className="workspace-tabs" role="group" aria-label={label}>{items.map((item) => <button type="button" key={item.value} aria-pressed={value === item.value} onClick={() => onChange(item.value)}>{item.icon && <item.icon size={17} aria-hidden="true" />}<span>{item.label}</span>{item.count !== undefined && <small>{item.count}</small>}</button>)}</div>;
}

export function WorkspaceEmpty({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description?: string; action?: ReactNode;
}) {
  return <div className="workspace-empty"><span><Icon size={30} aria-hidden="true" /></span><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>;
}
