import React, { useState, useMemo } from 'react';
import type { HealthTip, Category, ReviewStatus } from '../types/tip';
import { CATEGORIES, STATUS_DEFINITIONS } from '../types/tip';
import { TipCard } from '../components/TipCard';
import { Search, RotateCcw, PlusCircle, Compass, HelpCircle } from 'lucide-react';

interface ExplorePageProps {
  tips: HealthTip[];
  initialCategory?: Category | 'all';
  onSelectTip: (tipId: string) => void;
  onNavigateToSubmit: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  tips,
  initialCategory = 'all',
  onSelectTip,
  onNavigateToSubmit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(initialCategory);
  const [prevInitial, setPrevInitial] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'recently-reviewed' | 'oldest'>('newest');

  if (prevInitial !== initialCategory) {
    setPrevInitial(initialCategory);
    setSelectedCategory(initialCategory);
  }

  // Filter & sort logic
  const filteredTips = useMemo(() => {
    let result = [...tips];

    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((t) => t.status === selectedStatus);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        (t.region && t.region.toLowerCase().includes(q)) ||
        (t.review?.reasoning && t.review.reasoning.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === 'recently-reviewed') {
        const timeA = a.review?.reviewedAt ? new Date(a.review.reviewedAt).getTime() : 0;
        const timeB = b.review?.reviewedAt ? new Date(b.review.reviewedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

    return result;
  }, [tips, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedCategory !== 'all' || 
    selectedStatus !== 'all' || 
    sortBy !== 'newest';

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
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
          <Compass size={16} />
          <span>Community Repository</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
          Explore Health Tips
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '680px', fontSize: '1rem' }}>
          Search, filter, and review healthy living guidance evaluated against public health literature. Compare evidence sources, pending reviews, and active community challenges.
        </p>
      </div>

      {/* Demonstration Banner */}
      <div style={{
        backgroundColor: '#f5f7f2',
        border: '1px solid var(--color-brand-olive-border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1rem',
        marginBottom: '2rem',
        fontSize: '0.825rem',
        color: 'var(--color-brand-charcoal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="sample-badge">Dataset Notice</span>
          <span>
            Tips marked <strong>Sample Data</strong> are verified health education examples for prototype demonstration. New tips submitted by you appear instantly with <strong>Pending Review</strong> status.
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }} className="search-field">
            <Search size={18} style={{
              position: 'absolute',
              left: '0.9rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by keyword, topic, or region (e.g., circadian, walk, soap, sugar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Review Status Filter */}
          <div>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              aria-label="Filter by review status"
            >
              <option value="all">All Review Statuses</option>
              <option value="evidence-consistent">Evidence-Consistent</option>
              <option value="pending">Pending Review</option>
              <option value="under-challenge">Under Challenge</option>
              <option value="evidence-inconsistent">Evidence-Inconsistent</option>
              <option value="undetermined">Review Undetermined</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort health tips"
            >
              <option value="newest">Sort: Newest Submissions</option>
              <option value="recently-reviewed">Sort: Recently Reviewed</option>
              <option value="oldest">Sort: Oldest Submissions</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-brand-charcoal)', marginRight: '0.25rem' }}>
            Categories:
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: selectedCategory === 'all' ? 700 : 500,
              borderRadius: '9999px',
              backgroundColor: selectedCategory === 'all' ? 'var(--color-brand-black)' : 'var(--color-bg-subtle)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--color-text-secondary)',
              border: selectedCategory === 'all' ? '1px solid var(--color-brand-black)' : '1px solid var(--color-border-subtle)',
              cursor: 'pointer'
            }}
          >
            All Categories
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: selectedCategory === cat.id ? 700 : 500,
                borderRadius: '9999px',
                backgroundColor: selectedCategory === cat.id ? 'var(--color-brand-black)' : 'var(--color-bg-subtle)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--color-text-secondary)',
                border: selectedCategory === cat.id ? '1px solid var(--color-brand-black)' : '1px solid var(--color-border-subtle)',
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--color-brand-olive)',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Result Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        fontSize: '0.875rem',
        color: 'var(--color-text-muted)'
      }}>
        <span>
          Showing <strong>{filteredTips.length}</strong> {filteredTips.length === 1 ? 'tip' : 'tips'}
          {selectedCategory !== 'all' && ` in ${CATEGORIES.find(c => c.id === selectedCategory)?.label}`}
          {selectedStatus !== 'all' && ` (${STATUS_DEFINITIONS[selectedStatus].label})`}
        </span>
      </div>

      {/* Tips Grid or Empty State */}
      {filteredTips.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onSelect={onSelectTip}
            />
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
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
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <HelpCircle size={28} />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-brand-black)' }}>
            No health tips match your filters
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Try broadening your search term, switching categories, or resetting the review status filter.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={handleResetFilters} className="btn btn-outline">
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
            <button onClick={onNavigateToSubmit} className="btn btn-olive">
              <PlusCircle size={15} />
              <span>Submit a New Tip</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
