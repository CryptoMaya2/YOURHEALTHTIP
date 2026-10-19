import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  onOpenAboutModal: () => void;
  onOpenDisclaimerModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenContactModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAboutModal,
  onOpenDisclaimerModal,
  onOpenPrivacyModal,
  onOpenContactModal
}) => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-brand-black)',
      color: '#d4d8cf',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
      borderTop: '1px solid #282d22'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <ShieldCheck size={18} />
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}>
                YourHealth<span style={{ color: '#8fa860' }}>Tip</span>
              </span>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: '#a6ad9e',
              lineHeight: 1.6,
              marginBottom: '1.25rem'
            }}>
              A community-powered platform for practical healthy living. Every tip is evaluated against established public health literature and transparent consensus evidence.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#8fa860',
              backgroundColor: '#1c2217',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #333d2a'
            }}>
              <Cpu size={14} />
              <span>Prepared for GenLayer Intelligent Contract Integration</span>
            </div>
          </div>

          {/* Core Principles */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              Guiding Principles
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              fontSize: '0.85rem',
              color: '#a6ad9e'
            }}>
              <li>• Public health information must be accessible to everyone</li>
              <li>• Evidence sources must be transparently cited & reviewable</li>
              <li>• Consensus reviews reflect scientific consistency, not medical diagnosis</li>
              <li>• Open challenge mechanisms allow community accountability</li>
            </ul>
          </div>

          {/* Quick Links & Legal */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              Platform & Safety
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <li>
                <button
                  onClick={onOpenAboutModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c2c8bc',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#c2c8bc')}
                >
                  About YourHealthTip & Methodology
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDisclaimerModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c2c8bc',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#c2c8bc')}
                >
                  Health Disclaimer & Safety Standards
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPrivacyModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c2c8bc',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#c2c8bc')}
                >
                  Privacy Policy & Data Sovereignty
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContactModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c2c8bc',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#c2c8bc')}
                >
                  Contact Community Health Moderators
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Health Disclaimer Box */}
        <div style={{
          backgroundColor: '#171b13',
          border: '1px solid #273020',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '2rem',
          fontSize: '0.8rem',
          color: '#8f9786',
          lineHeight: 1.6
        }}>
          <strong style={{ color: '#e5e9e0', display: 'block', marginBottom: '0.25rem' }}>
            Official Health Disclaimer:
          </strong>
          YourHealthTip is an open community platform designed for healthy living education and evidence consistency checking. Content here does not constitute medical advice, diagnosis, treatment, or clinical prognosis. Never disregard professional medical consultation or delay seeking treatment because of information read on this platform. If you have an urgent medical condition, seek professional emergency medical services immediately.
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#707767',
          borderTop: '1px solid #23291d',
          paddingTop: '1.5rem'
        }}>
          <div>
            © 2026 YourHealthTip. Dedicated to transparent public health information.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Built for global community health</span>
            <span>•</span>
            <span>GenLayer Intelligent Contract Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
