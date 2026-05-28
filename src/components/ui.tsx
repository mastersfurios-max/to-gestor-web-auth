import React from 'react';

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, className }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 20,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'box-shadow 0.15s, transform 0.1s',
        ...style,
      }}
      onMouseEnter={onClick ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      } : undefined}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({ label, color, bg }: { label: string; color: string; bg?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      color, backgroundColor: bg || color + '22',
    }}>
      {label}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style, icon, loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}) {
  const bgMap = {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-surface2)',
    danger: 'var(--color-error)',
    ghost: 'transparent',
    success: 'var(--color-success)',
    outline: 'transparent',
  };
  const colorMap = {
    primary: '#fff',
    secondary: 'var(--color-text)',
    danger: '#fff',
    ghost: 'var(--color-text-muted)',
    success: '#fff',
    outline: 'var(--color-primary)',
  };
  const sizeMap = { sm: '7px 12px', md: '9px 16px', lg: '11px 22px' };
  const fontMap = { sm: 13, md: 14, lg: 15 };
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: sizeMap[size], borderRadius: 8,
        fontSize: fontMap[size], fontWeight: 600,
        background: bgMap[variant], color: colorMap[variant],
        border: (variant === 'secondary' || variant === 'outline') ? '1px solid var(--color-border)' : 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'opacity 0.15s, transform 0.1s',
        ...style,
      }}
      onMouseEnter={e => { if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
      onMouseLeave={e => { if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
    >
      {loading ? (
        <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
      ) : icon}
      {children}
    </button>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 16, width: '100%', maxWidth: width,
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4, borderRadius: 6 }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function Input({ label, value, onChange, type = 'text', placeholder, required, disabled, as: As = 'input', rows }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
}) {
  const style: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface2)',
    color: 'var(--color-text)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    resize: As === 'textarea' ? 'vertical' : undefined,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}{required && ' *'}</label>}
      {As === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} rows={rows || 3} style={style} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} style={style} />
      )}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}{required && ' *'}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: 8,
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface2)',
          color: 'var(--color-text)', fontSize: 14, outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, icon }: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ color: 'var(--color-primary)' }}>{icon}</span>}
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text)' }}>{title}</h1>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--color-text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, color, icon }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
        {icon && <span style={{ color: color || 'var(--color-primary)' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || 'var(--color-text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>{title}</div>
      {description && <div style={{ fontSize: 14, marginBottom: 16 }}>{description}</div>}
      {action}
    </div>
  );
}
