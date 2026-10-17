import { useState, useEffect, useSyncExternalStore } from 'react';
import type { HealthTip, Category } from './types/tip';
import { WalletPanel } from './components/WalletPanel';
import { getWalletAddress, subscribeWallet } from './services/wallet';
import { tipService } from './services/tipService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HealthDisclaimerBanner } from './components/HealthDisclaimerBanner';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SubmitPage } from './pages/SubmitPage';
import { TipDetailsPage } from './pages/TipDetailsPage';
import { MySubmissionsPage } from './pages/MySubmissionsPage';
import { AboutModal, DisclaimerModal, PrivacyModal, ContactModal } from './components/InfoModals';

export function App() {
  const walletAddress = useSyncExternalStore(subscribeWallet, getWalletAddress, () => null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | 'all'>('all');
  const [selectedTipId, setSelectedTipId] = useState<string | null>(null);

  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals state
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Load tips on mount
  const refreshTips = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await tipService.listTips();
      setTips(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load health tips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTips();
  }, [walletAddress]);

  // Handle Navigation
  const handleNavigate = (page: string, params?: { tipId?: string; category?: string }) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (params?.category) {
      setSelectedCategoryFilter(params.category as Category);
    } else if (page === 'explore' && !params?.category) {
      setSelectedCategoryFilter('all');
    }

    if (params?.tipId) {
      setSelectedTipId(params.tipId);
      setCurrentPage('details');
      return;
    }

    setCurrentPage(page);
  };

  const handleSelectTip = (tipId: string) => {
    setSelectedTipId(tipId);
    setCurrentPage('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTipCreated = (newTip: HealthTip) => {
    setTips((prev) => [newTip, ...prev]);
  };

  const handleTipUpdated = (updatedTip: HealthTip) => {
    setTips((prev) => prev.map((t) => (t.id === updatedTip.id ? updatedTip : t)));
  };

  const handleResetSampleData = async () => {
    if (window.confirm('Reset local demonstration tips back to initial seed data?')) {
      await tipService.resetToDefaultSampleData();
      await refreshTips();
    }
  };

  const activeTip = selectedTipId ? tips.find((t) => t.id === selectedTipId) || null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Clinical & Public Health Notice */}
      <HealthDisclaimerBanner />

      {/* Main Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      <WalletPanel />
      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 1rem',
            color: 'var(--color-brand-olive)',
            fontSize: '1rem',
            fontWeight: 600
          }}>
            Loading community health repository...
          </div>
        ) : loadError ? (
          <div className="container" role="alert" style={{ padding: '3rem 1rem' }}>
            <h2>Unable to load health tips</h2>
            <p>{loadError}</p>
            <button className="btn btn-primary" onClick={() => void refreshTips()}>Try again</button>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <HomePage
                tips={tips}
                onNavigate={handleNavigate}
                onSelectTip={handleSelectTip}
              />
            )}

            {currentPage === 'explore' && (
              <ExplorePage
                tips={tips}
                initialCategory={selectedCategoryFilter}
                onSelectTip={handleSelectTip}
                onNavigateToSubmit={() => handleNavigate('submit')}
              />
            )}

            {currentPage === 'submit' && (
              <SubmitPage
                onTipCreated={handleTipCreated}
                onNavigateToExplore={() => handleNavigate('explore')}
                onNavigateToMySubmissions={() => handleNavigate('my-submissions')}
              />
            )}

            {currentPage === 'details' && (
              activeTip ? (
                <TipDetailsPage
                  tip={activeTip}
                  onBack={() => handleNavigate('explore')}
                  onTipUpdated={handleTipUpdated}
                />
              ) : (
                <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--color-brand-black)' }}>
                    Health Tip Not Found
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    The requested health tip could not be found or may have been reset in the local repository.
                  </p>
                  <button onClick={() => handleNavigate('explore')} className="btn btn-primary">
                    Return to Explore Feed
                  </button>
                </div>
              )
            )}

            {currentPage === 'my-submissions' && (
              <MySubmissionsPage
                tips={tips}
                onSelectTip={handleSelectTip}
                onNavigateToSubmit={() => handleNavigate('submit')}
                onResetSampleData={handleResetSampleData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAboutModal={() => setAboutModalOpen(true)}
        onOpenDisclaimerModal={() => setDisclaimerModalOpen(true)}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onOpenContactModal={() => setContactModalOpen(true)}
      />

      {/* Informational Modals */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <DisclaimerModal
        isOpen={disclaimerModalOpen}
        onClose={() => setDisclaimerModalOpen(false)}
      />

      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />
    </div>
  );
}

export default App;
