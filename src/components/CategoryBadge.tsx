import React from 'react';
import type { Category } from '../types/tip';
import { CATEGORIES } from '../types/tip';
import { Apple, Moon, Activity, HeartHandshake, Sparkles, ShieldCheck } from 'lucide-react';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
  active?: boolean;
  onClick?: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  size = 'md',
  active = false,
  onClick
}) => {
  const catInfo = CATEGORIES.find((c) => c.id === category) || {
    id: category,
    label: category,
    description: '',
    iconName: 'ShieldCheck'
  };

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : 14;
    switch (category) {
      case 'nutrition':
        return <Apple size={iconSize} />;
      case 'sleep':
        return <Moon size={iconSize} />;
      case 'physical-activity':
        return <Activity size={iconSize} />;
      case 'mental-wellbeing':
        return <HeartHandshake size={iconSize} />;
      case 'hygiene':
        return <Sparkles size={iconSize} />;
      case 'general':
      default:
        return <ShieldCheck size={iconSize} />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.2rem 0.55rem' : '0.35rem 0.75rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.825rem',
        fontWeight: active ? 600 : 500,
        borderRadius: '9999px',
        backgroundColor: active ? 'var(--color-brand-black)' : 'var(--color-bg-subtle)',
        color: active ? '#ffffff' : 'var(--color-text-secondary)',
        border: active ? '1px solid var(--color-brand-black)' : '1px solid var(--color-border-subtle)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{getIcon()}</span>
      <span>{catInfo.label}</span>
    </button>
  );
};
