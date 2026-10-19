import React from 'react';
import type { HealthTip } from '../types/tip';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { Calendar, Globe, ArrowRight, FileText } from 'lucide-react';

interface TipCardProps {
  tip: HealthTip;
  onSelect: (tipId: string) => void;
  featured?: boolean;
}

export const TipCard: React.FC<TipCardProps> = ({ tip, onSelect, featured = false }) => {
  const formattedDate = new Date(tip.submittedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article
      onClick={() => onSelect(tip.id)}
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#ffffff',
        border: featured ? '1.5px solid var(--color-brand-olive)' : '1px solid var(--color-border-subtle)',
        position: 'relative',
        boxShadow: featured ? '0 8px 24px rgba(71, 90, 40, 0.08)' : 'var(--shadow-sm)'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <CategoryBadge category={tip.category} size="sm" />
            <StatusBadge status={tip.status} size="sm" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {tip.isSampleData && (
              <span className="sample-badge" title="Demonstration sample content for interface evaluation">
                Sample Data
              </span>
            )}
            {tip.isCurrentUserSubmission && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-brand-olive-surface)',
                color: 'var(--color-brand-olive-dark)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--color-brand-olive-border)'
              }}>
                Your Tip
              </span>
            )}
            {(tip.safetyAlert || (tip.flagCount && tip.flagCount >= 3)) && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #fecdd3'
              }} title="This tip has received independent community safety reports">
                ⚠️ Community Notice ({tip.flagCount})
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: featured ? '1.25rem' : '1.05rem',
          fontWeight: 700,
          color: 'var(--color-brand-black)',
          marginBottom: '0.65rem',
          lineHeight: 1.35
        }}>
          {tip.title}
        </h3>

        {/* Summary */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.55,
          marginBottom: '1.25rem'
        }}>
          {tip.summary}
        </p>
      </div>

      <div>
        {/* Evidence preview banner if reviewed */}
        {tip.review?.sourcesConsulted && tip.review.sourcesConsulted.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-subtle)',
            padding: '0.45rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            border: '1px solid var(--color-border-subtle)'
          }}>
            <FileText size={13} style={{ color: 'var(--color-brand-olive)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Reviewed vs: <strong>{tip.review.sourcesConsulted[0].organization}</strong>
              {tip.review.sourcesConsulted.length > 1 && ` +${tip.review.sourcesConsulted.length - 1} more`}
            </span>
          </div>
        )}

        {/* Footer Meta */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '0.85rem',
          fontSize: '0.785rem',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={13} />
              {formattedDate}
            </span>
            {tip.region && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Globe size={13} />
                {tip.region}
              </span>
            )}
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--color-brand-olive)',
              fontWeight: 600,
              fontSize: '0.825rem'
            }}
          >
            Inspect Evidence <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </article>
  );
};
