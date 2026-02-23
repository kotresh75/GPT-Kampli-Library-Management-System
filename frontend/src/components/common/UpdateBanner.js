import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import '../../styles/components/update-banner.css';

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSec) {
    if (!bytesPerSec || bytesPerSec === 0) return '—';
    return formatBytes(bytesPerSec) + '/s';
}

// Parse markdown text with links and render as React elements
// Supports: [text](url) and bare https://... URLs
function renderMarkdownLine(text, lineKey) {
    // Combined regex: match [text](url) or bare URLs
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // Determine link text and URL
        const linkText = match[1] || match[3]; // [text](url) or bare URL
        const url = match[2] || match[3];
        parts.push(
            <a
                key={`${lineKey}-link-${partIndex++}`}
                href="#"
                className="post-update__link"
                onClick={(e) => {
                    e.preventDefault();
                    if (window.electron?.openExternal) {
                        window.electron.openExternal(url);
                    }
                }}
                title={url}
            >
                {linkText}
            </a>
        );
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : text;
}

const UpdateBanner = () => {
    const [status, setStatus] = useState('idle');
    const [version, setVersion] = useState('');
    const [progress, setProgress] = useState(0);
    const [transferred, setTransferred] = useState(0);
    const [total, setTotal] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [postUpdate, setPostUpdate] = useState(null);
    const [checkResult, setCheckResult] = useState(null); // 'uptodate' | 'error' | null
    const [checking, setChecking] = useState(false);
    const lastUpdate = useRef({ time: 0, bytes: 0 });
    const checkTimeout = useRef(null);

    const applyState = (state) => {
        if (!state) return;

        // Handle check-for-updates feedback
        if (state.status === 'uptodate') {
            setChecking(false);
            setCheckResult('uptodate');
            // Auto-clear after 5 seconds
            if (checkTimeout.current) clearTimeout(checkTimeout.current);
            checkTimeout.current = setTimeout(() => setCheckResult(null), 5000);
            return;
        }
        if (state.status === 'check-error') {
            setChecking(false);
            setCheckResult('error');
            if (checkTimeout.current) clearTimeout(checkTimeout.current);
            checkTimeout.current = setTimeout(() => setCheckResult(null), 5000);
            return;
        }

        if (state.status === 'idle') {
            setChecking(false);
            return;
        }
        setStatus(state.status);
        setVersion(state.version);
        setProgress(state.percent || 0);
        setTransferred(state.transferred || 0);
        setTotal(state.total || 0);
        setChecking(false);
        setCheckResult(null);
    };

    useEffect(() => {
        if (!window.electron?.getUpdateStatus) return;

        window.electron.getUpdateStatus().then(applyState);

        window.electron.onUpdateStatusChanged((state) => {
            applyState(state);

            if (state.status === 'downloading' && state.transferred) {
                const now = Date.now();
                const elapsed = (now - lastUpdate.current.time) / 1000;
                const bytesDelta = state.transferred - lastUpdate.current.bytes;
                if (elapsed > 0.5) {
                    setSpeed(bytesDelta / elapsed);
                    lastUpdate.current = { time: now, bytes: state.transferred };
                }
            }
            if (state.status === 'ready' || state.status === 'available') {
                setSpeed(0);
            }
        });

        // Check if app was just updated (pull-based)
        if (window.electron?.checkPostUpdate) {
            window.electron.checkPostUpdate().then((info) => {
                if (info) setPostUpdate(info);
            });
        }

        return () => {
            if (window.electron?.removeUpdateListeners) {
                window.electron.removeUpdateListeners();
            }
            if (checkTimeout.current) clearTimeout(checkTimeout.current);
        };
    }, []);

    const handleDownload = () => {
        if (window.electron?.startDownload) {
            lastUpdate.current = { time: Date.now(), bytes: 0 };
            window.electron.startDownload();
        }
    };

    const handleCancel = () => {
        if (window.electron?.cancelDownload) {
            window.electron.cancelDownload();
        }
    };

    const handleInstall = () => {
        if (window.electron?.installUpdate) {
            window.electron.installUpdate();
        }
    };

    const handleCheckUpdates = () => {
        if (window.electron?.manualCheckUpdates) {
            setChecking(true);
            setCheckResult(null);
            window.electron.manualCheckUpdates();
        }
    };

    // Full-screen overlay when installing (shown for 2.5s before app closes)
    if (status === 'installing') {
        return ReactDOM.createPortal(
            <div className="update-installing-overlay">
                <div className="update-installing-content">
                    <div className="update-installing-spinner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <h2 className="update-installing-title">Installing Update</h2>
                    <p className="update-installing-version">Version {version}</p>
                    <p className="update-installing-hint">The app will close and reopen automatically…</p>
                    <div className="update-installing-bar">
                        <div className="update-installing-bar-fill" />
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Modal rendered via portal so it's not clipped by header
    const modal = showModal ? ReactDOM.createPortal(
        <div className="update-modal__overlay" onClick={() => setShowModal(false)}>
            <div className="update-modal" onClick={(e) => e.stopPropagation()}>

                <button className="update-modal__close" onClick={() => setShowModal(false)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="update-modal__header">
                    <div className={`update-modal__header-icon update-modal__header-icon--${status}`}>
                        {status === 'ready' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        ) : status === 'downloading' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                    </div>
                    <h3 className="update-modal__title">
                        {status === 'ready' ? 'Update Ready!' :
                            status === 'downloading' ? 'Downloading Update' :
                                'Update Available'
                        }
                    </h3>
                    <p className="update-modal__version">Version {version}</p>
                </div>

                <div className="update-modal__body">
                    {status === 'available' && (
                        <div className="update-modal__info-text">
                            <p>A new version of GPTK Library Manager is available. Download it now or later at your convenience.</p>
                        </div>
                    )}

                    {status === 'downloading' && (
                        <>
                            <div className="update-modal__progress-wrap">
                                <div className="update-modal__progress-bar">
                                    <div className="update-modal__progress-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="update-modal__percent">{Math.round(progress)}%</span>
                            </div>

                            <div className="update-modal__stats">
                                <div className="update-modal__stat">
                                    <span className="update-modal__stat-label">Downloaded</span>
                                    <span className="update-modal__stat-value">{formatBytes(transferred)} / {formatBytes(total)}</span>
                                </div>
                                <div className="update-modal__stat">
                                    <span className="update-modal__stat-label">Speed</span>
                                    <span className="update-modal__stat-value">{formatSpeed(speed)}</span>
                                </div>
                            </div>

                            <p className="update-modal__hint">You can continue using the app. Update installs on restart.</p>
                        </>
                    )}

                    {status === 'ready' && (
                        <div className="update-modal__info-text">
                            <p>Update has been downloaded successfully. Restart the application to apply changes.</p>
                        </div>
                    )}
                </div>

                <div className="update-modal__footer">
                    {status === 'available' && (
                        <>
                            <button className="update-modal__btn update-modal__btn--secondary" onClick={() => setShowModal(false)}>
                                Later
                            </button>
                            <button className="update-modal__btn update-modal__btn--primary" onClick={handleDownload}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Now
                            </button>
                        </>
                    )}

                    {status === 'downloading' && (
                        <>
                            <button className="update-modal__btn update-modal__btn--secondary" onClick={() => setShowModal(false)}>
                                Minimize
                            </button>
                            <button className="update-modal__btn update-modal__btn--danger" onClick={handleCancel}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                </svg>
                                Cancel Download
                            </button>
                        </>
                    )}

                    {status === 'ready' && (
                        <>
                            <button className="update-modal__btn update-modal__btn--secondary" onClick={() => setShowModal(false)}>
                                Later
                            </button>
                            <button className="update-modal__btn update-modal__btn--primary" onClick={handleInstall}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                </svg>
                                Restart &amp; Install
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    // Post-update "What's New" modal with link support
    const postUpdateModal = postUpdate ? ReactDOM.createPortal(
        <div className="update-modal__overlay" onClick={() => setPostUpdate(null)}>
            <div className="update-modal update-modal--post-update" onClick={(e) => e.stopPropagation()}>
                <button className="update-modal__close" onClick={() => setPostUpdate(null)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="update-modal__header">
                    <div className="update-modal__header-icon update-modal__header-icon--ready">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h3 className="update-modal__title">Updated Successfully!</h3>
                    <p className="update-modal__version">{postUpdate.version}</p>
                </div>

                <div className="update-modal__body">
                    <div className="post-update__notes">
                        <h4 className="post-update__notes-title">What's New</h4>
                        <div className="post-update__notes-body">
                            {postUpdate.body.split('\n').map((line, i) => (
                                <p key={i}>{line ? renderMarkdownLine(line, i) : '\u00A0'}</p>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="update-modal__footer">
                    <button className="update-modal__btn update-modal__btn--primary" onClick={() => setPostUpdate(null)}>
                        Got it!
                    </button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    // --- RENDER ---

    // When post-update is showing, show "Updated" chip in header
    if (postUpdate) {
        return (
            <>
                <button
                    className="update-chip update-chip--updated"
                    onClick={() => setPostUpdate({ ...postUpdate })}
                    title="GPTK Library Manager was updated — click for details"
                >
                    <span className="update-chip__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </span>
                    <span className="update-chip__label">Updated!</span>
                </button>
                {postUpdateModal}
            </>
        );
    }

    // When idle — show check result or "Check for Updates" button
    if (status === 'idle') {
        // Briefly show result after checking
        if (checkResult === 'uptodate') {
            return (
                <button className="update-chip update-chip--uptodate" disabled title="No updates available">
                    <span className="update-chip__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </span>
                    <span className="update-chip__label">You're up to date!</span>
                </button>
            );
        }

        if (checkResult === 'error') {
            return (
                <button className="update-chip update-chip--error" onClick={handleCheckUpdates} title="Click to retry">
                    <span className="update-chip__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </span>
                    <span className="update-chip__label">Check failed</span>
                </button>
            );
        }

        return (
            <button
                className={`update-chip update-chip--check ${checking ? 'update-chip--checking' : ''}`}
                onClick={handleCheckUpdates}
                disabled={checking}
                title={checking ? 'Checking for updates…' : 'Check for updates'}
            >
                <span className="update-chip__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                </span>
                <span className="update-chip__label">
                    {checking ? 'Checking…' : 'Check for Updates'}
                </span>
            </button>
        );
    }

    // When update available/downloading/ready — existing chip + modal
    return (
        <>
            <button
                className={`update-chip update-chip--${status}`}
                onClick={() => setShowModal(true)}
                title={
                    status === 'ready' ? `Update v${version} ready — click to install` :
                        status === 'downloading' ? `Downloading v${version}…` :
                            `Update v${version} available`
                }
            >
                <span className="update-chip__icon">
                    {status === 'ready' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ) : status === 'downloading' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </span>
                <span className="update-chip__label">
                    {status === 'ready' ? 'Update Ready' :
                        status === 'downloading' ? `${Math.round(progress)}%` :
                            `v${version}`
                    }
                </span>
                {status === 'downloading' && (
                    <span className="update-chip__bar">
                        <span className="update-chip__bar-fill" style={{ width: `${progress}%` }} />
                    </span>
                )}
            </button>

            {modal}
        </>
    );
};

export default UpdateBanner;
