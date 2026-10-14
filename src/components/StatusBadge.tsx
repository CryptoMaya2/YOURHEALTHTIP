import React from 'react';
import type { ReviewStatus } from '../types/tip';
import { STATUS_DEFINITIONS } from '../types/tip';
import { CheckCircle2, Clock, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReviewStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onExplainClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  interactive = false,
  onExplainClick
}) => {
  const meta = STATUS_DEFINITIONS[status] || STATUS_DEFINITIONS.pending;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
    switch (status) {
      case 'evidence-consistent':
        return <CheckCircle2 size={iconSize} strokeWidth={2.5} />;
      case 'pending':
        return <Clock size={iconSize} strokeWidth={2.2} />;
      case 'under-challenge':
        return <AlertTriangle size={iconSize} strokeWidth={2.2} />;
      case 'evidence-inconsistent':
        return <XCircle size={iconSize} strokeWidth={2.5} />;
      case 'undetermined':
      default:
        return <HelpCircle size={iconSize} strokeWidth={2.2} />;
    }
  };

  const paddingStyle = 
    size === 'sm' ? '0.2rem 0.5rem' :
    size === 'lg' ? '0.4rem 0.9rem' : 
    '0.3rem 0.75rem';

  const fontStyle = 
    size === 'sm' ? '0.725rem' :
    size === 'lg' ? '0.875rem' : 
    '0.8rem';

  return (
    <span
      className={`badge status-badge-${status}`}
      style={{
        backgroundColor: meta.badgeBg,
        color: meta.badgeColor,
        border: `1px solid ${meta.badgeBorder}`,
        padding: paddingStyle,
        fontSize: fontStyle,
        cursor: interactive ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontWeight: 600,
        borderRadius: '9999px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}
      title={meta.shortDescription}
      onClick={interactive ? onExplainClick : undefined}
    >
      {showIcon && renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
};
