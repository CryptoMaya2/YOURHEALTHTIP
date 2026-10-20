import React, { useState } from 'react';
import type { HealthTip, SubmitChallengeInput } from '../types/tip';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ChallengeModalProps {
  tip: HealthTip;
  isOpen: boolean;
  onClose: () => void;
  onSubmitChallenge: (input: SubmitChallengeInput) => Promise<void>;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  tip,
  isOpen,
  onClose,
  onSubmitChallenge
}) => {
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [challengerName, setChallengerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccess(false);
    setReason('');
    setEvidenceUrl('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError('Please provide a substantive rationale for the challenge (at least 20 characters).');
      return;
    }

    if (!evidenceUrl.trim()) {
      setError('Provide a new source containing material contradictory evidence.'); return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmitChallenge({
        tipId: tip.id,
        reason: reason.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
        challengerName: challengerName.trim() || undefined
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fff4eb',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fed7aa'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Challenge Review Decision
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Community Accountability & Evidentiary Contest
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#edf7ee',
              color: '#2d6a33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--color-brand-black)' }}>
              Challenge Registered
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              The tip status has transitioned to <strong>Under Challenge</strong>. When the GenLayer Intelligent Contract consensus network is active, validator nodes will re-examine the cited evidence against specified public health authorities.
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Close & View Updated Status
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Target Tip Details */}
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Target Tip:
              </span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-brand-black)', marginTop: '0.2rem' }}>
                "{tip.title}"
              </p>
            </div>

            <div className="disclaimer-box" style={{ marginBottom: '1.25rem' }}>
              <strong>Notice:</strong> Challenges must point to credible public health research, epidemiological data, or recognized medical guidelines. Unsubstantiated claims will be dismissed by validator consensus.
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                color: '#991b1b',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Challenger Name */}
            <div className="form-group">
              <label className="form-label">
                Your Name or Credentials (Optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Jordan K. or Concerned Health Consumer"
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
              />
              <span className="form-hint">
                You may submit anonymously or provide your background for context.
              </span>
            </div>

            {/* Reason */}
            <div className="form-group">
              <label className="form-label">
                Why is this review inaccurate, misleading, or outdated? <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder="Explain the specific factual or methodological discrepancy in the current evaluation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <span className="form-hint">
                Minimum 20 characters. Include clear reasoning.
              </span>
            </div>

            {/* Evidence URL */}
            <div className="form-group">
              <label className="form-label">
                New contradictory evidence link (required)
              </label>
              <input
                required
                type="url"
                className="form-input"
                placeholder="https://pubmed.ncbi.nlm.nih.gov/... or https://who.int/..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
              />
              <span className="form-hint">
                Peer-reviewed medical literature, WHO/CDC publications, or meta-analyses.
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '1.25rem'
            }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-olive"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording Challenge...' : 'Submit Challenge to Consensus'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
