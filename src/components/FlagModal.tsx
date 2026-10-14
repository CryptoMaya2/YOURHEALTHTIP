import React, { useState } from 'react';
import type { HealthTip } from '../types/tip';
import { Flag, X, CheckCircle2 } from 'lucide-react';

interface FlagModalProps {
  tip: HealthTip;
  isOpen: boolean;
  onClose: () => void;
  onFlagSubmitted: (tipId: string, reason: string) => Promise<void>;
}

export const FlagModal: React.FC<FlagModalProps> = ({
  tip,
  isOpen,
  onClose,
  onFlagSubmitted
}) => {
  const [selectedReason, setSelectedReason] = useState('harmful-claim');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSuccess(false);
    setNotes('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onFlagSubmitted(tip.id, `${selectedReason}: ${notes}`);
      setSuccess(true);
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fecaca'
            }}>
              <Flag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Report Health Safety Concern
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Help safeguard the community from dangerous or predatory medical claims
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
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
              Report Received
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Thank you for keeping YourHealthTip safe. Our moderation system and evidence consensus pipeline will evaluate this report against public safety criteria.
            </p>
            <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
              Return to Content
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Reason for Report</label>
              <select
                className="form-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                <option value="harmful-claim">Promotes dangerous self-treatment or medication cessation</option>
                <option value="unsubstantiated-cure">Claims an unverified cure for severe medical conditions</option>
                <option value="commercial-spam">Commercial product promotion or deceptive marketing</option>
                <option value="outdated-guidance">Significantly outdated scientific advice</option>
                <option value="other-safety">Other public health safety concern</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional Context (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Describe why this could pose a hazard or what authoritative guidance contradicts it..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: '1.25rem'
            }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
