import React, { useState } from 'react';
import type { Category, HealthTip } from '../types/tip';
import { CATEGORIES } from '../types/tip';
import { tipService } from '../services/tipService';
import { 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Plus,
  Trash2
} from 'lucide-react';

interface SubmitPageProps {
  onTipCreated: (tip: HealthTip) => void;
  onNavigateToExplore: () => void;
  onNavigateToMySubmissions: () => void;
}

export const SubmitPage: React.FC<SubmitPageProps> = ({
  onTipCreated,
  onNavigateToExplore,
  onNavigateToMySubmissions
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('nutrition');
  const [region, setRegion] = useState('');
  const [sources, setSources] = useState<string[]>(['']);
  const [acknowledged, setAcknowledged] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTip, setSubmittedTip] = useState<HealthTip | null>(null);

  const handleAddSource = () => {
    if (sources.length < 5) {
      setSources([...sources, '']);
    }
  };

  const handleSourceChange = (index: number, value: string) => {
    const updated = [...sources];
    updated[index] = value;
    setSources(updated);
  };

  const handleRemoveSource = (index: number) => {
    const updated = sources.filter((_, i) => i !== index);
    setSources(updated.length > 0 ? updated : ['']);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (title.trim().length < 10) {
      errs.title = 'Title must be at least 10 characters long.';
    } else if (title.trim().length > 150) {
      errs.title = 'Title should not exceed 150 characters.';
    }

    if (content.trim().length < 40) {
      errs.content = 'Tip text must be at least 40 characters so validators can evaluate evidentiary consistency.';
    } else if (content.trim().length > 1200) {
      errs.content = 'Tip text must not exceed 1,200 characters.';
    }

    if (!acknowledged) {
      errs.acknowledged = 'You must acknowledge the general health education disclaimer before submitting.';
    }

    const cleanSources = sources.map((s) => s.trim()).filter((s) => s.length > 0);
    for (const src of cleanSources) {
      try {
        const parsed = new URL(src);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errs.sources = 'Supporting sources must be valid web URLs starting with http:// or https://.';
          break;
        }
      } catch {
        errs.sources = `"${src}" is not a valid web URL. Please provide a full URL (e.g., https://who.int).`;
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const cleanSources = sources.map((s) => s.trim()).filter((s) => s.length > 0);

      const created = await tipService.submitTip({
        title: title.trim(),
        content: content.trim(),
        category,
        region: region.trim() || undefined,
        supportingSources: cleanSources,
        generalHealthAcknowledgement: acknowledged
      });

      setSubmittedTip(created);
      onTipCreated(created);
    } catch (err: any) {
      setErrors({ form: err?.message || 'Failed to submit tip. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setContent('');
    setCategory('nutrition');
    setRegion('');
    setSources(['']);
    setAcknowledged(false);
    setErrors({});
    setSubmittedTip(null);
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-brand-olive)'
        }}>
          <PlusCircle size={16} />
          <span>Community Contribution</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
          Share a Health Tip
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Contribute practical healthy living knowledge. All submissions enter a transparent review pipeline where public health literature and validator consensus evaluate consistency.
        </p>
      </div>

      {submittedTip ? (
        /* Confirmation State */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--color-brand-olive-border)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-olive-surface)',
            color: 'var(--color-brand-olive-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#854d0e',
            backgroundColor: '#fef8e7',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            border: '1px solid #fde087'
          }}>
            Status: Pending Review
          </span>

          <h2 style={{ fontSize: '1.65rem', marginTop: '1rem', marginBottom: '0.75rem', color: 'var(--color-brand-black)' }}>
            Tip Successfully Submitted!
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--color-text-secondary)',
            maxWidth: '560px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.6
          }}>
            "{submittedTip.title}" has been saved to your local submission record and entered into the community queue.
          </p>

          {/* GenLayer Readiness Note */}
          <div className="genlayer-box" style={{ maxWidth: '580px', margin: '0 auto 2rem', textAlign: 'left' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--color-brand-charcoal)' }}>
              Contract Pipeline Status:
            </strong>
            This tip is assigned a simulated queue slot. Once the GenLayer Intelligent Contract is deployed, validator nodes will trigger automated non-deterministic consensus to benchmark your submission against WHO, CDC, and PubMed research.
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button onClick={onNavigateToMySubmissions} className="btn btn-primary">
              <span>View in My Submissions</span>
              <ArrowRight size={15} />
            </button>
            <button onClick={onNavigateToExplore} className="btn btn-outline">
              Explore Community Feed
            </button>
            <button onClick={handleResetForm} className="btn btn-ghost">
              Submit Another Tip
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmit} style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)'
        }}>

          {errors.form && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              color: '#991b1b',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="tip-title">
                Tip Headline or Summary <span className="required">*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {title.length}/150
              </span>
            </div>
            <input
              id="tip-title"
              type="text"
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              placeholder="e.g. Taking a 10-Minute Walk After Meals Moderates Blood Sugar"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <div className="form-error-msg"><AlertCircle size={13} /> {errors.title}</div>}
            <span className="form-hint">
              Be clear, concise, and avoid exaggerated promises (such as "instant cures" or "miracle fixes").
            </span>
          </div>

          {/* Category & Region */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tip-category">
                Health Category <span className="required">*</span>
              </label>
              <select
                id="tip-category"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                Select the domain that best represents the habit.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="tip-region">
                Relevant Region or Climate (Optional)
              </label>
              <input
                id="tip-region"
                type="text"
                className="form-input"
                placeholder="e.g. Global, Temperate Climates, Desk Workers"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
              <span className="form-hint">
                Helps users understand context (e.g. winter sunlight habits).
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="tip-content">
                Tip Explanation & Healthy Living Context <span className="required">*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {content.length}/1200
              </span>
            </div>
            <textarea
              id="tip-content"
              className={`form-textarea ${errors.content ? 'has-error' : ''}`}
              rows={5}
              maxLength={1200}
              placeholder="Describe what the healthy habit is, why it works, and how everyday people can adopt it safely..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && <div className="form-error-msg"><AlertCircle size={13} /> {errors.content}</div>}
            <span className="form-hint">
              Minimum 40 characters. Focus on accessible lifestyle habits rather than medical interventions.
            </span>
          </div>

          {/* Supporting Source URLs */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label">
                Supporting Source Links (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddSource}
                disabled={sources.length >= 5}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand-olive)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: sources.length >= 5 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Plus size={14} /> Add Another Link
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sources.map((src, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://who.int/... or https://pubmed.ncbi.nlm.nih.gov/..."
                    value={src}
                    onChange={(e) => handleSourceChange(index, e.target.value)}
                  />
                  {sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(index)}
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)'
                      }}
                      title="Remove source"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.sources && <div className="form-error-msg"><AlertCircle size={13} /> {errors.sources}</div>}
            <span className="form-hint">
              Linking WHO, CDC, or peer-reviewed literature accelerates consensus validation.
            </span>
          </div>

          {/* Required Acknowledgement */}
          <div style={{
            backgroundColor: '#fafaf6',
            border: `1px solid ${errors.acknowledged ? '#fca5a5' : 'var(--color-border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginTop: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{
                  marginTop: '0.2rem',
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-brand-olive)',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-brand-black)', lineHeight: 1.5 }}>
                <strong style={{ display: 'block', marginBottom: '0.2rem' }}>
                  General Health Educational Acknowledgement <span className="required">*</span>
                </strong>
                I confirm that this submission represents general healthy living guidance and educational information. It does not provide individual clinical diagnosis, prescription dosage, or advice to discontinue prescribed medical treatment.
              </span>
            </label>
            {errors.acknowledged && (
              <div className="form-error-msg" style={{ marginTop: '0.65rem', marginLeft: '1.85rem' }}>
                <AlertCircle size={13} /> {errors.acknowledged}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '1.5rem'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Tip will be assigned <strong>Pending Review</strong> upon submission.
            </span>

            <button
              type="submit"
              className="btn btn-olive btn-lg"
              disabled={isSubmitting}
              style={{ minWidth: '180px' }}
            >
              <PlusCircle size={18} />
              <span>{isSubmitting ? 'Recording Submission...' : 'Submit Health Tip'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
