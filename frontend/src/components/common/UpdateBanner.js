import React, { useState, useEffect, useRef } from 'react';
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

const UpdateBanner = () => {
    const [status, setStatus] = useState('idle');
    const [version, setVersion] = useState('');
    const [progress, setProgress] = useState(0);
    const [transferred, setTransferred] = useState(0);
    const [total, setTotal] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const lastUpdate = useRef({ time: 0, bytes: 0 });

    useEffect(() => {
        if (!window.electron?.onUpdateAvailable) return;

        window.electron.onUpdateAvailable((info) => {
            setVersion(info.version);
            setStatus('downloading');
            lastUpdate.current = { time: Date.now(), bytes: 0 };
        });

        window.electron.onUpdateProgress((info) => {
            const now = Date.now();
            const elapsed = (now - lastUpdate.current.time) / 1000;
            const bytesDelta = (info.transferred || 0) - lastUpdate.current.bytes;

            if (elapsed > 0.5) {
                setSpeed(bytesDelta / elapsed);
                lastUpdate.current = { time: now, bytes: info.transferred || 0 };
            }

            setProgress(info.percent || 0);
            setTransferred(info.transferred || 0);
            setTotal(info.total || 0);
        });

        window.electron.onUpdateDownloaded((info) => {
            setVersion(info.version);
            setStatus('ready');
            setProgress(100);
            setSpeed(0);
        });

        return () => {
            if (window.electron?.removeUpdateListeners) {
                window.electron.removeUpdateListeners();
            }
        };
    }, []);

    const handleInstall = () => {
        if (window.electron?.installUpdate) {
            window.electron.installUpdate();
        }
    };

    if (status === 'idle') return null;

    const isPreparing = status === 'downloading' && progress === 0;

    return (
        <>
            {/* Small chip in header */}
            <button
                className={`update-chip update-chip--${status}`}
                onClick={() => setShowModal(true)}
                title={status === 'ready' ? `Update v${version} ready` : `Downloading v${version}...`}
            >
                <span className="update-chip__icon">
                    {status === 'ready' ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    )}
                </span>
                <span className="update-chip__label">
                    {status === 'ready' ? 'Update Ready' : isPreparing ? 'Preparing…' : `${Math.round(progress)}%`}
                </span>
                {status === 'downloading' && !isPreparing && (
                    <span className="update-chip__bar">
                        <span className="update-chip__bar-fill" style={{ width: `${progress}%` }} />
                    </span>
                )}
            </button>

            {/* Detail Modal */}
            {showModal && (
                <div className="update-modal__overlay" onClick={() => setShowModal(false)}>
                    <div className="update-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="update-modal__header">
                            <div className={`update-modal__header-icon ${status === 'ready' ? 'update-modal__header-icon--ready' : ''}`}>
                                {status === 'ready' ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="update-modal__title">
                                {status === 'ready' ? 'Update Ready!' : isPreparing ? 'Preparing Update' : 'Downloading Update'}
                            </h3>
                            <p className="update-modal__version">Version {version}</p>
                        </div>

                        <div className="update-modal__body">
                            {status === 'downloading' && (
                                <>
                                    <div className="update-modal__progress-wrap">
                                        <div className="update-modal__progress-bar">
                                            <div
                                                className={`update-modal__progress-fill ${isPreparing ? 'update-modal__progress-fill--indeterminate' : ''}`}
                                                style={isPreparing ? {} : { width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="update-modal__percent">{isPreparing ? '…' : `${Math.round(progress)}%`}</span>
                                    </div>

                                    <div className="update-modal__stats">
                                        <div className="update-modal__stat">
                                            <span className="update-modal__stat-label">{isPreparing ? 'Status' : 'Downloaded'}</span>
                                            <span className="update-modal__stat-value">
                                                {isPreparing ? 'Preparing download…' : `${formatBytes(transferred)} / ${formatBytes(total)}`}
                                            </span>
                                        </div>
                                        {!isPreparing && (
                                            <div className="update-modal__stat">
                                                <span className="update-modal__stat-label">Speed</span>
                                                <span className="update-modal__stat-value">{formatSpeed(speed)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="update-modal__hint">
                                        {isPreparing
                                            ? 'This may take a moment…'
                                            : 'You can continue using the app. Update installs on restart.'
                                        }
                                    </p>
                                </>
                            )}

                            {status === 'ready' && (
                                <div className="update-modal__ready-info">
                                    <p>Update downloaded and ready. Restart to apply.</p>
                                </div>
                            )}
                        </div>

                        <div className="update-modal__footer">
                            <button className="update-modal__btn update-modal__btn--secondary" onClick={() => setShowModal(false)}>
                                {status === 'ready' ? 'Later' : 'Close'}
                            </button>
                            {status === 'ready' && (
                                <button className="update-modal__btn update-modal__btn--primary" onClick={handleInstall}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                    </svg>
                                    Restart &amp; Install
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UpdateBanner;
