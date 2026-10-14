import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export const HealthDisclaimerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="Health disclaimer" style={{
      backgroundColor: '#f3f4ee',
      borderBottom: '1px solid var(--color-border-subtle)',
      fontSize: '0.825rem',
      color: 'var(--color-text-secondary)',
      transition: 'all 0.2s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '0.5rem',
        paddingBottom: '0.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <span style={{ color: 'var(--color-brand-olive)', display: 'flex', alignItems: 'center' }}>
              <AlertCircle size={15} />
            </span>
            <span>
              <strong style={{ color: 'var(--color-brand-black)' }}>Public Health Notice:</strong>{' '}
              YourHealthTip provides general health information and evidence evaluation—never personalized medical advice, diagnosis, or clinical treatment.
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-olive)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px'
            }}
          >
            <span>{isExpanded ? 'Less info' : 'Emergency & Clinical Details'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {isExpanded && (
          <div style={{
            marginTop: '0.65rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid rgba(71, 90, 40, 0.15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <ShieldAlert size={16} style={{ color: '#991b1b', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '0.15rem' }}>
                  Experiencing an Acute Emergency?
                </strong>
                <span>
                  Do not rely on this website for immediate symptoms. Contact your local emergency telephone number (such as 911, 999, 112, or your regional equivalent) or visit the nearest hospital emergency department immediately.
                </span>
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--color-brand-black)', display: 'block', marginBottom: '0.15rem' }}>
                Consult Qualified Clinicians
              </strong>
              <span>
                Always speak with your doctor or licensed healthcare specialist regarding persistent symptoms, medication changes, or chronic condition management before adopting new health regimens.
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
