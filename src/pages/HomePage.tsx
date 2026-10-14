import React from 'react';
import type { HealthTip, Category } from '../types/tip';
import { CATEGORIES } from '../types/tip';
import { TipCard } from '../components/TipCard';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Compass, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Sparkles, 
  Apple,
  Moon,
  Activity,
  HeartHandshake
} from 'lucide-react';

interface HomePageProps {
  tips: HealthTip[];
  onNavigate: (page: string, params?: { tipId?: string; category?: string }) => void;
  onSelectTip: (tipId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ tips, onNavigate, onSelectTip }) => {
  // Find a standout featured tip (consistent review with rich sources)
  const featuredTip = tips.find((t) => t.id === 'tip-101') || tips[0];
  
  // Recent 4 tips
  const recentTips = tips.slice(0, 4);

  const getCategoryIcon = (id: Category) => {
    switch (id) {
      case 'nutrition':
        return <Apple size={22} />;
      case 'sleep':
        return <Moon size={22} />;
      case 'physical-activity':
        return <Activity size={22} />;
      case 'mental-wellbeing':
        return <HeartHandshake size={22} />;
      case 'hygiene':
        return <Sparkles size={22} />;
      case 'general':
      default:
        return <ShieldCheck size={22} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {/* 1. Hero Section */}
      <section style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--color-border-subtle)',
        paddingTop: '3.5rem',
        paddingBottom: '4rem'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-brand-olive-surface)',
                color: 'var(--color-brand-olive-dark)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.825rem',
                fontWeight: 600,
                border: '1px solid var(--color-brand-olive-border)',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={16} />
                <span>Evidence-Powered Community Health</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                fontWeight: 800,
                color: 'var(--color-brand-black)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem'
              }}>
                Better health starts with better information.
              </h1>

              {/* Supporting Text */}
              <p style={{
                fontSize: '1.125rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '2rem',
                maxWidth: '540px'
              }}>
                Discover practical health tips, share what you've learned, and explore the evidence behind everyday health advice. Evaluated against trusted public health literature.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('explore')}
                  className="btn btn-primary btn-lg"
                  style={{
                    boxShadow: '0 4px 14px rgba(17, 19, 14, 0.15)'
                  }}
                >
                  <Compass size={18} />
                  <span>Explore Health Tips</span>
                </button>

                <button
                  onClick={() => onNavigate('submit')}
                  className="btn btn-outline btn-lg"
                >
                  <PlusCircle size={18} />
                  <span>Share a Tip</span>
                </button>
              </div>

              {/* Micro proof points */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-subtle)',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                flexWrap: 'wrap'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-brand-olive)' }} /> No commercial sponsorships
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-brand-olive)' }} /> Open source citations
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-brand-olive)' }} /> Community challenge system
                </span>
              </div>
            </div>

            {/* Editorial Hero Illustration Card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                backgroundColor: 'var(--color-bg-canvas)',
                border: '1.5px solid var(--color-brand-olive-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative Olive Accent bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  backgroundColor: 'var(--color-brand-olive)'
                }} />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-brand-black)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShieldCheck size={18} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-brand-black)' }}>
                      Evidence Verification Engine
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.725rem',
                    backgroundColor: '#eaf1e3',
                    color: 'var(--color-brand-olive-dark)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    Simulation Mode
                  </span>
                </div>

                <div style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '1.25rem'
                }}>
                  Every submitted tip undergoes multi-point validation across benchmark epidemiological repositories to identify consistency, potential clinical contradictions, or unwarranted claims.
                </div>

                {/* Architecture Steps preview */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand-olive)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>1</span>
                    <span>Community Contributor Submits Tip</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand-olive)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>2</span>
                    <span>GenLayer Intelligent Contract Retrieves Peer Research</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-brand-black)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>3</span>
                    <span>Consensus Validators Reach Equivalence Result</span>
                  </div>
                </div>

                <div style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)'
                }}>
                  <span>Targeted consensus: 5 validators</span>
                  <span style={{ color: 'var(--color-brand-olive)', fontWeight: 600 }}>Zero Sponsored Bias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Health Tip */}
      {featuredTip && (
        <section className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <div>
              <span style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
                color: 'var(--color-brand-olive)'
              }}>
                Spotlight Review
              </span>
              <h2 style={{ fontSize: '1.65rem', marginTop: '0.2rem' }}>
                Featured Community Tip
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="sample-badge">Demonstration Content</span>
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--color-brand-olive-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'var(--color-brand-olive)',
                  backgroundColor: 'var(--color-brand-olive-surface)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--color-brand-olive-border)'
                }}>
                  {featuredTip.category}
                </span>
                <StatusBadge status={featuredTip.status} size="sm" />
              </div>

              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.85rem', color: 'var(--color-brand-black)' }}>
                {featuredTip.title}
              </h3>

              <p style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.5rem'
              }}>
                {featuredTip.content}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onSelectTip(featuredTip.id)}
                  className="btn btn-primary"
                >
                  <span>Read Full Tip & Evidence Record</span>
                  <ArrowRight size={15} />
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Submitted by {featuredTip.submittedBy}
                </span>
              </div>
            </div>

            {/* Evidence Summary Card */}
            {featuredTip.review && (
              <div style={{
                backgroundColor: 'var(--color-bg-canvas)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--color-border-subtle)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-brand-black)',
                  marginBottom: '0.65rem'
                }}>
                  <ShieldCheck size={16} style={{ color: 'var(--color-brand-olive)' }} />
                  <span>Evidence Consistency Analysis</span>
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.55,
                  marginBottom: '1rem',
                  fontStyle: 'italic'
                }}>
                  "{featuredTip.review.reasoning}"
                </p>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-brand-olive-dark)',
                  marginBottom: '0.35rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Primary Citations Consulted:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {featuredTip.review.sourcesConsulted.map((source, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--color-brand-charcoal)' }}>
                        {source.organization}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>
                        {source.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Explore by Category */}
      <section className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <span style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: 'var(--color-brand-olive)'
          }}>
            Global Wellness Domains
          </span>
          <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem', marginBottom: '0.65rem' }}>
            Explore by Category
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Everyday health habits adaptable to different cultures, schedules, and regions—without extreme regimens or costly gym memberships.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('explore', { category: cat.id })}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                backgroundColor: '#ffffff'
              }}
            >
              <div>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-brand-olive-surface)',
                  color: 'var(--color-brand-olive)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '1px solid var(--color-brand-olive-border)'
                }}>
                  {getCategoryIcon(cat.id)}
                </div>

                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem', color: 'var(--color-brand-black)' }}>
                  {cat.label}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {cat.description}
                </p>
              </div>

              <div style={{
                marginTop: '1.25rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--color-brand-olive)'
              }}>
                <span>Browse tips</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recently Submitted Tips */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: 'var(--color-brand-olive)'
            }}>
              Community Feed
            </span>
            <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem' }}>
              Recently Submitted Tips
            </h2>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="btn btn-outline"
          >
            <span>View All Tips Feed</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {recentTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onSelect={onSelectTip}
            />
          ))}
        </div>
      </section>

      {/* 5. How It Works (4-Step GenLayer Intelligent Contract Process) */}
      <section style={{
        backgroundColor: 'var(--color-brand-black)',
        color: '#ffffff',
        paddingTop: '4.5rem',
        paddingBottom: '4.5rem'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#1e2417',
              color: '#8fa860',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: '1px solid #333d2a',
              marginBottom: '1rem'
            }}>
              <Cpu size={15} />
              <span>Decentralized Consensus Architecture</span>
            </div>

            <h2 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.85rem' }}>
              How Evidence Consensus Works
            </h2>

            <p style={{ color: '#a6ad9e', fontSize: '1rem', lineHeight: 1.6 }}>
              Most health platforms rely either on unchecked social popularity or centralized editorial gatekeepers. YourHealthTip bridges community submissions with decentralized validator consensus powered by GenLayer Intelligent Contracts.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {/* Step 1 */}
            <div style={{
              backgroundColor: '#171b13',
              border: '1px solid #273020',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-olive)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.25rem'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Someone Submits a Tip
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#979f8f', lineHeight: 1.55 }}>
                A community member submits an actionable healthy living tip, selecting its category, optional region, and any initial sources.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              backgroundColor: '#171b13',
              border: '1px solid #273020',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-olive)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.25rem'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Intelligent Contract Evaluation
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#979f8f', lineHeight: 1.55 }}>
                The contract analyzes the tip against specified trusted public health benchmark libraries (e.g., WHO guidelines, PubMed reviews, CDC advisories).
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              backgroundColor: '#171b13',
              border: '1px solid #273020',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-olive)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.25rem'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Validator Consensus
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#979f8f', lineHeight: 1.55 }}>
                Independent GenLayer validators independently evaluate the evidence reasoning using non-deterministic execution and confirm equivalence according to strict consensus rules.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              backgroundColor: '#171b13',
              border: '1px solid #273020',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              position: 'relative'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-olive)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '1.25rem'
              }}>
                4
              </div>
              <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                Transparent Evidence Record
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#979f8f', lineHeight: 1.55 }}>
                The accepted status, reasoning, and cited sources become fully inspectable and open to community challenge if new research emerges.
              </p>
            </div>
          </div>

          {/* Integration Status Notice */}
          <div style={{
            backgroundColor: '#1d2218',
            border: '1px dashed #3a472c',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            maxWidth: '820px',
            margin: '0 auto',
            fontSize: '0.85rem',
            color: '#a9b39f',
            textAlign: 'center'
          }}>
            <strong style={{ color: '#ffffff' }}>Production Integration Roadmap:</strong>{' '}
            This demonstration frontend simulates the evidence-review lifecycle to finalize UX and data schemas. The live GenLayer Intelligent Contract will execute these consensus checks on-chain once the contract deployment phase begins.
          </div>
        </div>
      </section>

    </div>
  );
};
