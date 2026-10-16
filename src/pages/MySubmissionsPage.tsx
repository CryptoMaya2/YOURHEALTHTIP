import React from 'react';
import { isOnChain, getWalletAddress } from '../services/wallet';
import type { HealthTip } from '../types/tip';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { 
  BookmarkCheck, 
  PlusCircle, 
  ArrowRight, 
  Calendar, 
  UserCheck, 
  RotateCcw
} from 'lucide-react';

interface MySubmissionsPageProps {
  tips: HealthTip[];
  onSelectTip: (tipId: string) => void;
  onNavigateToSubmit: () => void;
  onResetSampleData: () => void;
}

export const MySubmissionsPage: React.FC<MySubmissionsPageProps> = ({
  tips,
  onSelectTip,
  onNavigateToSubmit,
  onResetSampleData
}) => {
  // Submissions created by the current demo user
  const userSubmissions = tips.filter((t) => isOnChain ? t.submittedBy.toLowerCase() === getWalletAddress()?.toLowerCase() : t.isCurrentUserSubmission);

  const pendingCount = userSubmissions.filter((t) => t.status === 'pending').length;
  const consistentCount = userSubmissions.filter((t) => t.status === 'evidence-consistent').length;
  const challengedCount = userSubmissions.filter((t) => t.status === 'under-challenge').length;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
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
            <BookmarkCheck size={16} />
            <span>Contributor Dashboard</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
            My Submissions & Outcomes
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '640px', fontSize: '1rem' }}>
            Track the review status and evidence evaluations for health tips you have shared with the global community.
          </p>
        </div>

        <button onClick={onNavigateToSubmit} className="btn btn-olive">
          <PlusCircle size={16} />
          <span>Share a New Tip</span>
        </button>
      </div>

      {/* Demo Identity Notice */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-subtle)',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-olive-surface)',
            color: 'var(--color-brand-olive-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserCheck size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-brand-black)' }}>
                {isOnChain ? getWalletAddress() || 'Connect your wallet to see your submissions' : 'Demo Contributor (Local Storage Profile)'}
              </span>
              <span style={{
                fontSize: '0.675rem',
                backgroundColor: 'var(--color-bg-subtle)',
                color: 'var(--color-text-muted)',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                border: '1px solid var(--color-border-subtle)'
              }}>
                {isOnChain ? 'GenLayer Studio' : 'Browser Sandbox'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {isOnChain ? 'Submissions are matched to the connected wallet address recorded by the contract.' : 'Your demo submissions persist locally in this browser.'}
            </p>
          </div>
        </div>

        <button
          hidden={isOnChain}
          onClick={onResetSampleData}
          className="btn btn-outline btn-sm"
          title="Reset demonstration tips to initial seed state"
        >
          <RotateCcw size={13} />
          <span>Reset Sample Seed</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Submissions
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-brand-black)', marginTop: '0.25rem' }}>
            {userSubmissions.length}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#854d0e', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Consensus
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#854d0e', marginTop: '0.25rem' }}>
            {pendingCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#2d6a33', textTransform: 'uppercase', fontWeight: 600 }}>
            Evidence-Consistent
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2d6a33', marginTop: '0.25rem' }}>
            {consistentCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#9a3412', textTransform: 'uppercase', fontWeight: 600 }}>
            Under Challenge
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#9a3412', marginTop: '0.25rem' }}>
            {challengedCount}
          </div>
        </div>
      </div>

      {/* User Submissions List */}
      {userSubmissions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userSubmissions.map((tip) => (
            <div
              key={tip.id}
              onClick={() => onSelectTip(tip.id)}
              className="card card-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.5rem',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CategoryBadge category={tip.category} size="sm" />
                  <StatusBadge status={tip.status} size="sm" />
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Calendar size={12} />
                    {new Date(tip.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-brand-black)', marginBottom: '0.35rem' }}>
                  {tip.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {tip.summary}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="btn btn-outline btn-sm">
                  <span>View Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-brand-olive-surface)',
            color: 'var(--color-brand-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <BookmarkCheck size={28} />
          </div>

          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--color-brand-black)' }}>
            You haven't submitted any health tips yet
          </h3>

          <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Share a practical lifestyle habit you've found beneficial. Your tip will be evaluated transparently against public health literature by validator consensus.
          </p>

          <button onClick={onNavigateToSubmit} className="btn btn-olive btn-lg">
            <PlusCircle size={18} />
            <span>Share Your First Health Tip</span>
          </button>
        </div>
      )}
    </div>
  );
};
