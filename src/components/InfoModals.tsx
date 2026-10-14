import React from 'react';
import { X, ShieldCheck, FileText, Mail, AlertCircle, Cpu } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-brand-olive)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>About YourHealthTip</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          <strong>YourHealthTip</strong> is an open, global community health platform built on one foundational premise: <em>Better health starts with better information.</em>
        </p>

        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          Every day, millions of people encounter contradictory health advice across social media and web forums. Most people lack the time to parse 40-page systematic reviews or epidemiological databases.
        </p>

        <h4 style={{ fontSize: '1rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-brand-black)' }}>
          The GenLayer Intelligent Contract Distinction
        </h4>
        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          Unlike static health blogs or unverified discussion boards, YourHealthTip is engineered to connect directly with <strong>GenLayer Intelligent Contracts</strong>. Intelligent contracts leverage non-deterministic web retrieval and decentralized validator consensus to evaluate whether submitted lifestyle tips are logically consistent with specified public health authorities (such as the WHO, CDC, Cochrane Reviews, and PubMed).
        </p>

        <div className="genlayer-box" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
            <Cpu size={16} /> Current Integration Phase:
          </div>
          This frontend release establishes the complete user interface, validation models, and mock service boundaries. The production GenLayer smart contract will be attached upon deployment, without requiring alterations to the core user experience.
        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export const DisclaimerModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={22} style={{ color: '#b45309' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Health Disclaimer & Safety Standards</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem',
          fontSize: '0.85rem',
          color: '#991b1b',
          marginBottom: '1rem'
        }}>
          <strong>CRITICAL SAFETY NOTICE:</strong> Do not use this website for medical emergencies, diagnostic queries, or changes to prescription medication regimens.
        </div>

        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <strong>General Education Only:</strong> Tips posted here represent general healthy living habits (hydration, sleep routines, posture, stress mitigation), not therapeutic treatments.
          </li>
          <li>
            <strong>Not Medically Certified:</strong> A status of "Evidence-Consistent" means the tip is aligned with current reviewed public health citations; it does not constitute clinical certification or guarantees.
          </li>
          <li>
            <strong>Individual Medical Needs Differ:</strong> What is beneficial for one person may be contraindicated for someone with chronic kidney disease, diabetes, pregnancy, or other individual medical factors. Always consult your personal physician.
          </li>
        </ul>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
          I Understand & Acknowledge
        </button>
      </div>
    </div>
  );
};

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} style={{ color: 'var(--color-brand-olive)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Privacy & Data Ethics</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          YourHealthTip is engineered with privacy-first standards. In this frontend version, all your submitted tips and local activity are saved in your own browser's local storage sandbox.
        </p>

        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          We do not require personal identifiable information, phone numbers, or private healthcare data. We explicitly advise all users never to post private medical histories, sensitive biometrics, or personal health records.
        </p>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={22} style={{ color: 'var(--color-brand-olive)' }} />
            <h3 style={{ fontSize: '1.25rem' }}>Contact & Feedback</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ marginBottom: '1rem', fontSize: '0.925rem' }}>
          Are you a public health researcher, clinical librarian, or community organizer interested in evidence-consistency criteria? We welcome collaboration and peer review.
        </p>

        <div style={{
          backgroundColor: 'var(--color-bg-subtle)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.875rem'
        }}>
          <div><strong>Community Inquiries:</strong> contact@yourhealthtip.org</div>
          <div style={{ marginTop: '0.35rem' }}><strong>Evidence Verification Group:</strong> evidence@yourhealthtip.org</div>
        </div>

        <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
          Close
        </button>
      </div>
    </div>
  );
};
