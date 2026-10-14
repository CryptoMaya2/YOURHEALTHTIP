import React, { useState } from 'react';
import type { HealthTip } from '../types/tip';
import { STATUS_DEFINITIONS } from '../types/tip';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { ChallengeModal } from '../components/ChallengeModal';
import { FlagModal } from '../components/FlagModal';
import { tipService } from '../services/tipService';
import { 
  ArrowLeft, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Flag, 
  Cpu, 
  User, 
  BookOpen, 
  CheckCircle2,
  Share2,
  Clock
} from 'lucide-react';

interface TipDetailsPageProps {
  tip: HealthTip;
  onBack: () => void;
  onTipUpdated: (updatedTip: HealthTip) => void;
}

export const TipDetailsPage: React.FC<TipDetailsPageProps> = ({
  tip,
  onBack,
  onTipUpdated
}) => {
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusMeta = STATUS_DEFINITIONS[tip.status] || STATUS_DEFINITIONS.pending;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChallengeSubmit = async (input: any) => {
    const updated = await tipService.challengeTip(input);
    onTipUpdated(updated);
  };

  const handleFlagSubmit = async (tipId: string, reason: string) => {
    await tipService.flagTip(tipId, reason);
  };

  const formattedSubmittedDate = new Date(tip.submittedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedReviewedDate = tip.review?.reviewedAt
    ? new Date(tip.review.reviewedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className="container-narrow" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-olive)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.4rem 0'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleShare}
            className="btn btn-outline btn-sm"
            title="Share health tip"
          >
            <Share2 size={14} />
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => setFlagModalOpen(true)}
            className="btn btn-ghost btn-sm"
            style={{ color: '#991b1b' }}
            title="Report inappropriate or dangerous health claims"
          >
            <Flag size={14} />
            <span>Report Concern</span>
          </button>
        </div>
      </div>

      {/* Main Tip Document Card */}
      <article style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-subtle)',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '2rem'
      }}>
        {/* Meta Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <CategoryBadge category={tip.category} size="md" />
            <StatusBadge status={tip.status} size="md" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {tip.isSampleData && (
              <span className="sample-badge">
                Demonstration Sample
              </span>
            )}
            {tip.isCurrentUserSubmission && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--color-brand-olive-surface)',
                color: 'var(--color-brand-olive-dark)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid var(--color-brand-olive-border)'
              }}>
                Submitted by You
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
          lineHeight: 1.25,
          color: 'var(--color-brand-black)',
          marginBottom: '1.5rem'
        }}>
          {tip.title}
        </h1>

        {/* Author & Region metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          fontSize: '0.825rem',
          color: 'var(--color-text-muted)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} /> {tip.submittedBy}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} /> Submitted {formattedSubmittedDate}
          </span>
          {tip.region && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={14} /> {tip.region}
            </span>
          )}
        </div>

        {/* Full Tip Content */}
        <div style={{
          fontSize: '1.05rem',
          lineHeight: 1.75,
          color: 'var(--color-brand-charcoal)',
          marginBottom: '2rem'
        }}>
          <p>{tip.content}</p>
        </div>

        {/* User Supporting Sources if submitted */}
        {tip.supportingSources && tip.supportingSources.length > 0 && (
          <div style={{
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
          }}>
            <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
              Submitter-Provided References:
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {tip.supportingSources.map((url, i) => (
                <li key={i} style={{ fontSize: '0.85rem' }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ExternalLink size={13} /> {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Clinical Disclaimer Box for This Tip */}
        <div className="disclaimer-box" style={{ marginTop: '1.5rem' }}>
          <strong>Individual Health Caveat:</strong> What works for the general population may not suit your specific physiological profile. Discuss dietary modifications, physical exercise changes, and sleep supplements with your personal healthcare team.
        </div>
      </article>

      {/* Evidence Evaluation Section */}
      <section style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--color-brand-olive-border)',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-brand-olive)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-brand-black)' }}>
                Evidence Record & Consensus Review
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Evaluated against benchmark public health standards{formattedReviewedDate ? ` • Reviewed on ${formattedReviewedDate}` : ''}
              </span>
            </div>
          </div>

          <StatusBadge status={tip.status} size="md" />
        </div>

        {tip.review ? (
          <div>
            {/* Status Explanation Box */}
            <div style={{
              backgroundColor: statusMeta.badgeBg,
              border: `1px solid ${statusMeta.badgeBorder}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
                color: statusMeta.badgeColor,
                marginBottom: '0.4rem',
                fontSize: '0.95rem'
              }}>
                <CheckCircle2 size={16} />
                <span>Meaning of "{statusMeta.label}":</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: statusMeta.badgeColor, lineHeight: 1.55 }}>
                {statusMeta.shortDescription}
              </p>
            </div>

            {/* Evaluator Reasoning */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-brand-black)', marginBottom: '0.5rem' }}>
                Scientific Literature Synthesis & Reasoning
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.65,
                backgroundColor: 'var(--color-bg-canvas)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)'
              }}>
                {tip.review.reasoning}
              </p>
            </div>

            {/* Sources Consulted */}
            {tip.review.sourcesConsulted && tip.review.sourcesConsulted.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--color-brand-black)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <BookOpen size={16} style={{ color: 'var(--color-brand-olive)' }} />
                  <span>Public Health Literature Sources Consulted</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tip.review.sourcesConsulted.map((source, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        marginBottom: '0.35rem'
                      }}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontWeight: 700,
                            fontSize: '0.925rem',
                            color: 'var(--color-brand-olive-dark)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <span>{source.title}</span>
                          <ExternalLink size={13} />
                        </a>

                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--color-bg-subtle)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--color-text-muted)'
                        }}>
                          {source.organization} {source.year && `(${source.year})`}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        borderLeft: '2px solid var(--color-brand-olive-border)',
                        paddingLeft: '0.75rem',
                        marginTop: '0.4rem'
                      }}>
                        "{source.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GenLayer Contract Technical Reference Box */}
            <div className="genlayer-box" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--color-brand-charcoal)',
                marginBottom: '0.35rem'
              }}>
                <Cpu size={15} />
                <span>GenLayer Intelligent Contract Reference (Future On-Chain Slot):</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {tip.review.contractTransactionRef}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                Note: In this initial frontend release, this represents the planned smart contract interface schema. No actual gas or on-chain transaction has been executed.
              </div>
            </div>

            {/* Challenge Action Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-black)', display: 'block' }}>
                  Notice a factual error or conflicting public health evidence?
                </span>
                <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                  Any community member can trigger a consensus challenge with citations.
                </span>
              </div>

              <button
                onClick={() => setChallengeModalOpen(true)}
                className="btn btn-outline"
                style={{
                  color: '#c2410c',
                  borderColor: '#fdba74',
                  backgroundColor: '#fff7ed'
                }}
              >
                <AlertTriangle size={15} />
                <span>Challenge This Review</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pending Review State */
          <div style={{
            backgroundColor: '#fef8e7',
            border: '1px solid #fde087',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#854d0e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Clock size={24} />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#854d0e', marginBottom: '0.4rem' }}>
              Awaiting Multi-Source Consensus Review
            </h3>

            <p style={{
              fontSize: '0.9rem',
              color: '#92400e',
              maxWidth: '520px',
              margin: '0 auto 1.25rem',
              lineHeight: 1.55
            }}>
              This tip has entered the community queue. Once the GenLayer Intelligent Contract consensus network is live, validators will evaluate the claim against WHO, CDC, and PubMed literature benchmarks.
            </p>

            <span style={{
              fontSize: '0.75rem',
              color: '#a16207',
              backgroundColor: '#fef9c3',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #fef08a'
            }}>
              Simulated Queue Slot: #{tip.id}
            </span>
          </div>
        )}
      </section>

      {/* Active Community Challenges (if any) */}
      {tip.challenges && tip.challenges.length > 0 && (
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid #fed7aa',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#c2410c',
            marginBottom: '1.25rem'
          }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Community Challenges ({tip.challenges.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tip.challenges.map((chal) => (
              <div
                key={chal.id}
                style={{
                  backgroundColor: '#fffaf5',
                  border: '1px solid #fed7aa',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)'
                }}>
                  <strong style={{ color: 'var(--color-brand-black)' }}>
                    {chal.challengerName}
                  </strong>
                  <span>{new Date(chal.createdAt).toLocaleDateString()}</span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-brand-charcoal)', lineHeight: 1.55 }}>
                  {chal.reason}
                </p>

                {chal.evidenceUrl && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <a
                      href={chal.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#c2410c', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <ExternalLink size={12} /> Cited Reference: {chal.evidenceUrl}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <ChallengeModal
        tip={tip}
        isOpen={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        onSubmitChallenge={handleChallengeSubmit}
      />

      <FlagModal
        tip={tip}
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        onFlagSubmitted={handleFlagSubmit}
      />
    </div>
  );
};
