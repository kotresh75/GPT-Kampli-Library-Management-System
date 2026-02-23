import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import InteractiveBG from '../components/common/InteractiveBG';
import '../styles/pages/setup-wizard.css';

// Assets from /public directory
const collegeLogo = `${process.env.PUBLIC_URL}/College_Logo.png`;
const campusFront = `${process.env.PUBLIC_URL}/College_frontview_image.jpg`;

// ─── Minimalistic SVG icons ───
const Icons = {
    book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h6" />
        </svg>
    ),
    globe: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <ellipse cx="12" cy="12" rx="4" ry="10" />
            <path d="M2 12h20" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4M12 16h.01" />
        </svg>
    ),
    library: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 7v14M21 7v14M6 7v14M18 7v14M9 7v14M15 7v14M12 7v14" />
            <path d="M3 7l9-4 9 4" />
        </svg>
    ),
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    arrowLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    sun: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    ),
    moon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    type: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
    ),
    alertCircle: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    building: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
        </svg>
    )
};

// ─── Translation texts (embedded, works with or without i18n) ───
const TEXTS = {
    en: {
        steps: ['Welcome', 'Language', 'Admin Account', 'Library Info', 'Complete'],
        welcome: {
            title: 'Welcome to GPTK Library',
            subtitle: 'Set up your library management system in a few simple steps',
            collegeName: 'Government Polytechnic, Kampli',
            libraryName: 'GPT Kampli Library',
            campusLabel: 'Government Polytechnic, Kampli Campus',
            quote: '"A library is not a luxury but one of the necessities of life."',
            quoteAuthor: '— Henry Ward Beecher',
            vision: 'Vision',
            visionText: 'To be a center of excellence in technical education, nurturing skilled professionals.',
            mission: 'Mission',
            missionText: 'Providing quality education through innovative teaching and practical learning.',
            getStarted: 'Get Started'
        },
        language: {
            title: 'Personalize',
            subtitle: 'Choose your preferred language and appearance',
            english: 'English',
            kannada: 'ಕನ್ನಡ',
            englishNative: 'English',
            kannadaNative: 'Kannada',
            theme: 'Appearance',
            themeLight: 'Light Mode',
            themeDark: 'Dark Mode',
            fontSize: 'Text Size',
        },
        admin: {
            title: 'Create Admin',
            subtitle: 'Set up the first administrator account',
            name: 'Full Name',
            namePlaceholder: 'Enter your full name',
            email: 'Email Address',
            emailPlaceholder: 'admin@library.com',
            password: 'Password',
            passwordPlaceholder: 'Min 6 characters',
            confirmPassword: 'Confirm Password',
            confirmPlaceholder: 'Re-enter password',
            errName: 'Name is required',
            errEmail: 'Valid email is required',
            errPassword: 'Password must be at least 6 characters',
            errMismatch: 'Passwords do not match',
        },
        libraryInfo: {
            title: 'Library Details',
            subtitle: 'Configure your library information (can be changed later)',
            libraryName: 'Library Name',
            libraryPlaceholder: 'GPT Kampli Library',
        },
        complete: {
            title: 'All Set!',
            subtitle: 'Your library management system is ready to use',
            adminLabel: 'Admin',
            emailLabel: 'Email',
            languageLabel: 'Language',
            libraryLabel: 'Library',
            redirecting: 'Redirecting to login...',
            goNow: 'Go to Login'
        },
        next: 'Continue',
        back: 'Back',
        skip: 'Skip',
        creating: 'Setting up...',
        errServer: 'Server unreachable. Check connection.',
        errFailed: 'Setup failed. Please try again.',
    },
    kn: {
        steps: ['ಸ್ವಾಗತ', 'ಭಾಷೆ', 'ನಿರ್ವಾಹಕ ಖಾತೆ', 'ಗ್ರಂಥಾಲಯ ಮಾಹಿತಿ', 'ಪೂರ್ಣ'],
        welcome: {
            title: 'GPTK ಗ್ರಂಥಾಲಯಕ್ಕೆ ಸ್ವಾಗತ',
            subtitle: 'ಕೆಲವು ಸರಳ ಹಂತಗಳಲ್ಲಿ ನಿಮ್ಮ ಗ್ರಂಥಾಲಯ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆಯನ್ನು ಹೊಂದಿಸಿ',
            collegeName: 'ಸರ್ಕಾರಿ ಪಾಲಿಟೆಕ್ನಿಕ್, ಕಂಪ್ಲಿ',
            libraryName: 'ಜಿಪಿಟಿ ಕಂಪ್ಲಿ ಗ್ರಂಥಾಲಯ',
            campusLabel: 'ಸರ್ಕಾರಿ ಪಾಲಿಟೆಕ್ನಿಕ್, ಕಂಪ್ಲಿ ಆವರಣ',
            quote: '"ಗ್ರಂಥಾಲಯವು ಜ್ಞಾನದ ದೇವಾಲಯ"',
            quoteAuthor: '',
            vision: 'ದೃಷ್ಟಿ',
            visionText: 'ತಾಂತ್ರಿಕ ಶಿಕ್ಷಣದಲ್ಲಿ ಉತ್ಕೃಷ್ಟತೆಯ ಕೇಂದ್ರವಾಗುವುದು.',
            mission: 'ಧ್ಯೇಯ',
            missionText: 'ನವೀನ ಬೋಧನೆ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಕಲಿಕೆಯ ಮೂಲಕ ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣ.',
            getStarted: 'ಪ್ರಾರಂಭಿಸಿ'
        },
        language: {
            title: 'ವೈಯಕ್ತೀಕರಿಸಿ',
            subtitle: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆ ಮತ್ತು ನೋಟವನ್ನು ಆರಿಸಿ',
            english: 'English',
            kannada: 'ಕನ್ನಡ',
            englishNative: 'ಇಂಗ್ಲೀಷ್',
            kannadaNative: 'ಕನ್ನಡ',
            theme: 'ನೋಟ',
            themeLight: 'ಬೆಳಕು ಮೋಡ್',
            themeDark: 'ಡಾರ್ಕ್ ಮೋಡ್',
            fontSize: 'ಅಕ್ಷರ ಗಾತ್ರ',
        },
        admin: {
            title: 'ನಿರ್ವಾಹಕ ರಚಿಸಿ',
            subtitle: 'ಮೊದಲ ನಿರ್ವಾಹಕ ಖಾತೆಯನ್ನು ಹೊಂದಿಸಿ',
            name: 'ಪೂರ್ಣ ಹೆಸರು',
            namePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            email: 'ಇಮೇಲ್ ವಿಳಾಸ',
            emailPlaceholder: 'admin@library.com',
            password: 'ಪಾಸ್‌ವರ್ಡ್',
            passwordPlaceholder: 'ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು',
            confirmPassword: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
            confirmPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುನಮೂದಿಸಿ',
            errName: 'ಹೆಸರು ಅಗತ್ಯವಿದೆ',
            errEmail: 'ಮಾನ್ಯ ಇಮೇಲ್ ಅಗತ್ಯವಿದೆ',
            errPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳಿರಬೇಕು',
            errMismatch: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ',
        },
        libraryInfo: {
            title: 'ಗ್ರಂಥಾಲಯ ವಿವರಗಳು',
            subtitle: 'ನಿಮ್ಮ ಗ್ರಂಥಾಲಯದ ಮಾಹಿತಿಯನ್ನು ಹೊಂದಿಸಿ (ನಂತರ ಬದಲಾಯಿಸಬಹುದು)',
            libraryName: 'ಗ್ರಂಥಾಲಯದ ಹೆಸರು',
            libraryPlaceholder: 'ಜಿಪಿಟಿ ಕಂಪ್ಲಿ ಗ್ರಂಥಾಲಯ',
        },
        complete: {
            title: 'ಎಲ್ಲ ಸಿದ್ಧ!',
            subtitle: 'ನಿಮ್ಮ ಗ್ರಂಥಾಲಯ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ ಬಳಸಲು ಸಿದ್ಧವಾಗಿದೆ',
            adminLabel: 'ನಿರ್ವಾಹಕ',
            emailLabel: 'ಇಮೇಲ್',
            languageLabel: 'ಭಾಷೆ',
            libraryLabel: 'ಗ್ರಂಥಾಲಯ',
            redirecting: 'ಲಾಗಿನ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...',
            goNow: 'ಲಾಗಿನ್‌ಗೆ ಹೋಗಿ'
        },
        next: 'ಮುಂದುವರಿಸಿ',
        back: 'ಹಿಂದೆ',
        skip: 'ಬಿಟ್ಟು',
        creating: 'ಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...',
        errServer: 'ಸರ್ವರ್ ತಲುಪಲಾಗಲಿಲ್ಲ. ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.',
        errFailed: 'ಹೊಂದಿಕೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮರುಪ್ರಯತ್ನಿಸಿ.',
    }
};

const TOTAL_STEPS = 5;
const CONFETTI_COLORS = ['#667eea', '#764ba2', '#2ecc71', '#f1c40f', '#e74c3c', '#3498db', '#A0522D'];

const SetupWizard = () => {
    const navigate = useNavigate();
    const { theme, setTheme, fontScale, setFontScale } = usePreferences();
    const { language, setLanguage: changeLanguage } = useLanguage();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Form state
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [libraryForm, setLibraryForm] = useState({ name: 'GPT Kampli Library' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [selectedLang, setSelectedLang] = useState(language || 'en');

    const t = TEXTS[selectedLang] || TEXTS.en;

    // Check if setup is needed
    useEffect(() => {
        const checkSetup = async () => {
            try {
                const res = await axios.get('http://localhost:17221/api/auth/setup-status');
                if (!res.data.needsSetup) {
                    navigate('/login', { replace: true });
                    return;
                }
            } catch {
                // Allow setup even if check fails
            }
            setLoading(false);
        };
        checkSetup();
    }, [navigate]);

    // Validate admin form
    const validateAdmin = useCallback(() => {
        const errs = {};
        if (!adminForm.name.trim()) errs.name = t.admin.errName;
        if (!adminForm.email.trim() || !/\S+@\S+\.\S+/.test(adminForm.email)) errs.email = t.admin.errEmail;
        if (adminForm.password.length < 6) errs.password = t.admin.errPassword;
        if (adminForm.password !== adminForm.confirmPassword) errs.confirmPassword = t.admin.errMismatch;
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    }, [adminForm, t]);

    // Handle next step
    const handleNext = async () => {
        setError('');

        if (currentStep === 0) {
            // Welcome → just move forward
            setCurrentStep(1);
            return;
        }

        if (currentStep === 1) {
            // Language step → apply preferences & move
            if (selectedLang !== language) changeLanguage(selectedLang);
            setCurrentStep(2);
            return;
        }

        if (currentStep === 2) {
            // Admin step → validate
            if (!validateAdmin()) return;
            setCurrentStep(3);
            return;
        }

        if (currentStep === 3) {
            // Library step → submit everything
            if (!validateAdmin()) {
                setCurrentStep(2);
                return;
            }
            setSubmitting(true);
            try {
                await axios.post('http://localhost:17221/api/auth/setup', {
                    name: adminForm.name.trim(),
                    email: adminForm.email.trim(),
                    password: adminForm.password,
                });
                setCurrentStep(4);
            } catch (err) {
                if (err.response?.data?.error) {
                    setError(err.response.data.error);
                } else if (err.code === 'ERR_NETWORK') {
                    setError(t.errServer);
                } else {
                    setError(t.errFailed);
                }
            } finally {
                setSubmitting(false);
            }
            return;
        }

        if (currentStep === 4) {
            navigate('/login', { replace: true });
        }
    };

    const handleBack = () => {
        setError('');
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleAdminChange = (field, value) => {
        setAdminForm(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Auto redirect after success
    useEffect(() => {
        if (currentStep === 4) {
            const timer = setTimeout(() => navigate('/login', { replace: true }), 5000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, navigate]);

    // ─── Render ───
    if (loading) {
        return (
            <div className="setup-wizard">
                <InteractiveBG />
                <div className="setup-wizard__bg" />
                <div className="setup-wizard__card">
                    <div className="setup-wizard__loading">
                        <div className="setup-wizard__loading-spinner" />
                        <span className="setup-wizard__loading-text">{TEXTS.en.creating}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="setup-wizard">
            <InteractiveBG />
            <div className="setup-wizard__bg">
                <div className="setup-wizard__orb setup-wizard__orb--1" />
                <div className="setup-wizard__orb setup-wizard__orb--2" />
                <div className="setup-wizard__orb setup-wizard__orb--3" />
            </div>

            <div className="setup-wizard__card">
                {/* ── Stepper ── */}
                <div className="setup-wizard__stepper">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div className="setup-wizard__step-item" key={i}>
                            <div
                                className={`setup-wizard__step-dot ${i === currentStep ? 'setup-wizard__step-dot--active' :
                                    i < currentStep ? 'setup-wizard__step-dot--completed' : ''
                                    }`}
                                title={t.steps[i]}
                            >
                                {i < currentStep ? Icons.check : i + 1}
                            </div>
                            {i < TOTAL_STEPS - 1 && (
                                <div className={`setup-wizard__step-line ${i < currentStep ? 'setup-wizard__step-line--completed' : ''}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Step Content ── */}
                <div className="setup-wizard__content">
                    {currentStep === 0 && <WelcomeStep t={t} campusFront={campusFront} collegeLogo={collegeLogo} />}
                    {currentStep === 1 && (
                        <LanguageStep
                            t={t}
                            selectedLang={selectedLang}
                            setSelectedLang={setSelectedLang}
                            theme={theme}
                            setTheme={setTheme}
                            fontScale={fontScale}
                            setFontScale={setFontScale}
                        />
                    )}
                    {currentStep === 2 && (
                        <AdminStep
                            t={t}
                            form={adminForm}
                            onChange={handleAdminChange}
                            errors={fieldErrors}
                            showPwd={showPwd}
                            setShowPwd={setShowPwd}
                            showConfirm={showConfirm}
                            setShowConfirm={setShowConfirm}
                        />
                    )}
                    {currentStep === 3 && (
                        <LibraryStep t={t} form={libraryForm} setForm={setLibraryForm} />
                    )}
                    {currentStep === 4 && (
                        <CompleteStep
                            t={t}
                            adminForm={adminForm}
                            libraryForm={libraryForm}
                            selectedLang={selectedLang}
                            onGo={() => navigate('/login', { replace: true })}
                        />
                    )}
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="setup-wizard__error" style={{ margin: '0 40px 12px' }}>
                        {Icons.alertCircle}
                        <span>{error}</span>
                    </div>
                )}

                {/* ── Footer ── */}
                {currentStep < 4 && (
                    <div className="setup-wizard__footer">
                        <div>
                            {currentStep > 0 && (
                                <button className="setup-wizard__btn setup-wizard__btn--back" onClick={handleBack}>
                                    {Icons.arrowLeft}
                                    {t.back}
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {currentStep === 3 && (
                                <button className="setup-wizard__btn setup-wizard__btn--skip" onClick={() => {
                                    setLibraryForm({ name: 'GPT Kampli Library' });
                                    handleNext();
                                }}>
                                    {t.skip}
                                </button>
                            )}
                            <button
                                className="setup-wizard__btn setup-wizard__btn--next"
                                onClick={handleNext}
                                disabled={submitting}
                            >
                                {submitting ? t.creating : currentStep === 0 ? t.welcome.getStarted : t.next}
                                {!submitting && Icons.arrowRight}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── STEP COMPONENTS ───

const WelcomeStep = ({ t, campusFront, collegeLogo }) => (
    <div className="setup-wizard__step" key="welcome">
        <div className="setup-wizard__step-header">
            <div className="setup-wizard__step-icon">{Icons.book}</div>
            <h1 className="setup-wizard__step-title">{t.welcome.title}</h1>
            <p className="setup-wizard__step-subtitle">{t.welcome.subtitle}</p>
        </div>

        <div className="setup-wizard__welcome-brand">
            <img src={collegeLogo} alt="College Logo" className="setup-wizard__college-logo" />
            <div className="setup-wizard__college-info">
                <p className="setup-wizard__college-name">{t.welcome.collegeName}</p>
                <p className="setup-wizard__library-name">{t.welcome.libraryName}</p>
            </div>
        </div>

        <div className="setup-wizard__campus-image">
            <img src={campusFront} alt={t.welcome.campusLabel} />
            <div className="setup-wizard__campus-overlay">
                <span>{t.welcome.campusLabel}</span>
            </div>
        </div>

        <div className="setup-wizard__quote">
            <p className="setup-wizard__quote-text">{t.welcome.quote}</p>
            {t.welcome.quoteAuthor && <p className="setup-wizard__quote-author">{t.welcome.quoteAuthor}</p>}
        </div>

        <div className="setup-wizard__vision-mission">
            <div className="setup-wizard__vm-card">
                <p className="setup-wizard__vm-label">{t.welcome.vision}</p>
                <p className="setup-wizard__vm-text">{t.welcome.visionText}</p>
            </div>
            <div className="setup-wizard__vm-card">
                <p className="setup-wizard__vm-label">{t.welcome.mission}</p>
                <p className="setup-wizard__vm-text">{t.welcome.missionText}</p>
            </div>
        </div>
    </div>
);

const FONT_SCALES = [
    { value: 85, label: 'S' },
    { value: 100, label: 'M' },
    { value: 115, label: 'L' },
    { value: 130, label: 'XL' },
];

const LanguageStep = ({ t, selectedLang, setSelectedLang, theme, setTheme, fontScale, setFontScale }) => (
    <div className="setup-wizard__step" key="language">
        <div className="setup-wizard__step-header">
            <div className="setup-wizard__step-icon">{Icons.globe}</div>
            <h1 className="setup-wizard__step-title">{t.language.title}</h1>
            <p className="setup-wizard__step-subtitle">{t.language.subtitle}</p>
        </div>

        <div className="setup-wizard__lang-grid">
            <div
                className={`setup-wizard__lang-option ${selectedLang === 'en' ? 'setup-wizard__lang-option--active' : ''}`}
                onClick={() => setSelectedLang('en')}
            >
                <div className="setup-wizard__lang-check">{Icons.check}</div>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🇬🇧</div>
                <div className="setup-wizard__lang-label">{t.language.english}</div>
                <div className="setup-wizard__lang-native">{t.language.englishNative}</div>
            </div>
            <div
                className={`setup-wizard__lang-option ${selectedLang === 'kn' ? 'setup-wizard__lang-option--active' : ''}`}
                onClick={() => setSelectedLang('kn')}
            >
                <div className="setup-wizard__lang-check">{Icons.check}</div>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>🇮🇳</div>
                <div className="setup-wizard__lang-label">{t.language.kannada}</div>
                <div className="setup-wizard__lang-native">{t.language.kannadaNative}</div>
            </div>
        </div>

        <div className="setup-wizard__theme-row">
            <span className="setup-wizard__theme-label">
                {theme === 'dark' ? Icons.moon : Icons.sun}
                {t.language.theme}
            </span>
            <button
                className={`setup-wizard__theme-toggle ${theme === 'dark' ? 'setup-wizard__theme-toggle--dark' : ''}`}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
            >
                <span className="setup-wizard__theme-knob">
                    {theme === 'dark' ? Icons.moon : Icons.sun}
                </span>
            </button>
        </div>

        <div className="setup-wizard__font-row">
            <span className="setup-wizard__font-label">
                {Icons.type}
                {t.language.fontSize}
            </span>
            <div className="setup-wizard__font-options">
                {FONT_SCALES.map(s => (
                    <button
                        key={s.value}
                        className={`setup-wizard__font-btn ${fontScale === s.value ? 'setup-wizard__font-btn--active' : ''}`}
                        onClick={() => setFontScale(s.value)}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
            <span className="setup-wizard__font-value">{fontScale}%</span>
        </div>
    </div>
);

const AdminStep = ({ t, form, onChange, errors, showPwd, setShowPwd, showConfirm, setShowConfirm }) => (
    <div className="setup-wizard__step" key="admin">
        <div className="setup-wizard__step-header">
            <div className="setup-wizard__step-icon">{Icons.shield}</div>
            <h1 className="setup-wizard__step-title">{t.admin.title}</h1>
            <p className="setup-wizard__step-subtitle">{t.admin.subtitle}</p>
        </div>

        <div className="setup-wizard__form">
            <div className="setup-wizard__field">
                <label className="setup-wizard__field-label">{t.admin.name}</label>
                <div className="setup-wizard__input-wrap">
                    <span className="setup-wizard__input-icon">{Icons.user}</span>
                    <input
                        className={`setup-wizard__input ${errors.name ? 'setup-wizard__input--error' : ''}`}
                        type="text"
                        placeholder={t.admin.namePlaceholder}
                        value={form.name}
                        onChange={e => onChange('name', e.target.value)}
                        autoFocus
                    />
                </div>
                {errors.name && <div className="setup-wizard__field-error">{Icons.alertCircle} {errors.name}</div>}
            </div>

            <div className="setup-wizard__field">
                <label className="setup-wizard__field-label">{t.admin.email}</label>
                <div className="setup-wizard__input-wrap">
                    <span className="setup-wizard__input-icon">{Icons.mail}</span>
                    <input
                        className={`setup-wizard__input ${errors.email ? 'setup-wizard__input--error' : ''}`}
                        type="email"
                        placeholder={t.admin.emailPlaceholder}
                        value={form.email}
                        onChange={e => onChange('email', e.target.value)}
                    />
                </div>
                {errors.email && <div className="setup-wizard__field-error">{Icons.alertCircle} {errors.email}</div>}
            </div>

            <div className="setup-wizard__field-row">
                <div className="setup-wizard__field">
                    <label className="setup-wizard__field-label">{t.admin.password}</label>
                    <div className="setup-wizard__input-wrap">
                        <span className="setup-wizard__input-icon">{Icons.lock}</span>
                        <input
                            className={`setup-wizard__input ${errors.password ? 'setup-wizard__input--error' : ''}`}
                            type={showPwd ? 'text' : 'password'}
                            placeholder={t.admin.passwordPlaceholder}
                            value={form.password}
                            onChange={e => onChange('password', e.target.value)}
                        />
                        <button className="setup-wizard__eye-btn" onClick={() => setShowPwd(!showPwd)} type="button">
                            {showPwd ? Icons.eyeOff : Icons.eye}
                        </button>
                    </div>
                    {errors.password && <div className="setup-wizard__field-error">{Icons.alertCircle} {errors.password}</div>}
                </div>

                <div className="setup-wizard__field">
                    <label className="setup-wizard__field-label">{t.admin.confirmPassword}</label>
                    <div className="setup-wizard__input-wrap">
                        <span className="setup-wizard__input-icon">{Icons.lock}</span>
                        <input
                            className={`setup-wizard__input ${errors.confirmPassword ? 'setup-wizard__input--error' : ''}`}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder={t.admin.confirmPlaceholder}
                            value={form.confirmPassword}
                            onChange={e => onChange('confirmPassword', e.target.value)}
                        />
                        <button className="setup-wizard__eye-btn" onClick={() => setShowConfirm(!showConfirm)} type="button">
                            {showConfirm ? Icons.eyeOff : Icons.eye}
                        </button>
                    </div>
                    {errors.confirmPassword && <div className="setup-wizard__field-error">{Icons.alertCircle} {errors.confirmPassword}</div>}
                </div>
            </div>
        </div>
    </div>
);

const LibraryStep = ({ t, form, setForm }) => (
    <div className="setup-wizard__step" key="library">
        <div className="setup-wizard__step-header">
            <div className="setup-wizard__step-icon">{Icons.library}</div>
            <h1 className="setup-wizard__step-title">{t.libraryInfo.title}</h1>
            <p className="setup-wizard__step-subtitle">{t.libraryInfo.subtitle}</p>
        </div>

        <div className="setup-wizard__form">
            <div className="setup-wizard__field">
                <label className="setup-wizard__field-label">{t.libraryInfo.libraryName}</label>
                <div className="setup-wizard__input-wrap">
                    <span className="setup-wizard__input-icon">{Icons.building}</span>
                    <input
                        className="setup-wizard__input"
                        type="text"
                        value={form.name}
                        readOnly
                        style={{ opacity: 0.7, cursor: 'default' }}
                    />
                </div>
            </div>
        </div>
    </div>
);

const CompleteStep = ({ t, adminForm, libraryForm, selectedLang, onGo }) => (
    <div className="setup-wizard__step" key="complete">
        <div className="setup-wizard__success">
            {/* Confetti */}
            <div className="setup-wizard__confetti">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="setup-wizard__confetti-piece"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 30 - 10}%`,
                            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                            animationDelay: `${Math.random() * 0.8}s`,
                            animationDuration: `${2 + Math.random() * 1.5}s`,
                            width: `${6 + Math.random() * 6}px`,
                            height: `${6 + Math.random() * 6}px`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        }}
                    />
                ))}
            </div>

            <div className="setup-wizard__success-icon">{Icons.check}</div>
            <h1 className="setup-wizard__success-title">{t.complete.title}</h1>
            <p className="setup-wizard__success-desc">{t.complete.subtitle}</p>

            <div className="setup-wizard__success-summary">
                <div className="setup-wizard__summary-item">
                    <span className="setup-wizard__summary-label">{t.complete.adminLabel}</span>
                    <span className="setup-wizard__summary-value">{adminForm.name}</span>
                </div>
                <div className="setup-wizard__summary-item">
                    <span className="setup-wizard__summary-label">{t.complete.emailLabel}</span>
                    <span className="setup-wizard__summary-value">{adminForm.email}</span>
                </div>
                <div className="setup-wizard__summary-item">
                    <span className="setup-wizard__summary-label">{t.complete.languageLabel}</span>
                    <span className="setup-wizard__summary-value">{selectedLang === 'kn' ? 'ಕನ್ನಡ' : 'English'}</span>
                </div>
                <div className="setup-wizard__summary-item">
                    <span className="setup-wizard__summary-label">{t.complete.libraryLabel}</span>
                    <span className="setup-wizard__summary-value">{libraryForm.name || 'GPT Kampli Library'}</span>
                </div>
            </div>

            <button className="setup-wizard__btn setup-wizard__btn--next" onClick={onGo} style={{ margin: '0 auto var(--space-4)', display: 'flex' }}>
                {t.complete.goNow}
                {Icons.arrowRight}
            </button>

            <p className="setup-wizard__redirect-text">
                <span className="setup-wizard__redirect-spinner" />
                {t.complete.redirecting}
            </p>
        </div>
    </div>
);

export default SetupWizard;
