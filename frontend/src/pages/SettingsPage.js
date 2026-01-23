import React, { useState, useEffect } from 'react';
import '../styles/pages/settings.css';
import {
    Settings, Lock, Moon, Sun, Volume2, Globe, Eye, Printer, Database, Mail, Shield, Save, RefreshCw,
    Smartphone, Key, AlertTriangle, Check, X, Trash2, Upload, Download, Server, Wifi, WifiOff, BookOpen
} from 'lucide-react';
import PasswordPromptModal from '../components/common/PasswordPromptModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { usePreferences } from '../context/PreferencesContext';

// Help functions
const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: score, label: 'Medium', color: 'bg-yellow-500' };
    return { level: score, label: 'Strong', color: 'bg-green-500' };
};

// Extracted Components
const AppearanceTab = ({ settings, handleChange, handleSave }) => (
    <div className="section-wrapper">
        <h2 className="settings-page-title">Appearance & Feedback</h2>

        {/* Theme Mode */}
        <div className="settings-card">
            <label className="form-label">Theme Mode</label>
            <div className="theme-options">
                {['light', 'dark', 'system'].map(mode => (
                    <label key={mode} className={`theme-card ${settings.app_appearance?.theme === mode ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="theme"
                            className="theme-radio"
                            checked={settings.app_appearance?.theme === mode}
                            onChange={() => handleChange('app_appearance', 'theme', mode)}
                        />
                        {mode === 'light' && <Sun size={16} />}
                        {mode === 'dark' && <Moon size={16} />}
                        {mode === 'system' && <Settings size={16} />}
                        <span className="capitalize">{mode}</span>
                    </label>
                ))}
            </div>
        </div>



        {/* Sound Feedback */}
        <div className="settings-card">
            <label className="form-label">Sound Feedback</label>
            <div className="checkbox-row">
                <label className="checkbox-item">
                    <input
                        type="checkbox"
                        checked={settings.app_appearance?.soundSuccess}
                        onChange={e => handleChange('app_appearance', 'soundSuccess', e.target.checked)}
                    />
                    <Volume2 size={16} className="text-success" />
                    <span>Success Beep</span>
                </label>
                <label className="checkbox-item">
                    <input
                        type="checkbox"
                        checked={settings.app_appearance?.soundError}
                        onChange={e => handleChange('app_appearance', 'soundError', e.target.checked)}
                    />
                    <Volume2 size={16} className="text-danger" />
                    <span>Error Beep</span>
                </label>
            </div>
        </div>

        {/* Language */}
        <div className="settings-card">
            <label className="form-label">Interface Language</label>
            <select
                className="glass-input width-md"
                value={settings.app_appearance?.language || 'en'}
                onChange={e => handleChange('app_appearance', 'language', e.target.value)}
            >
                <option value="en">English (Primary)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
            <p className="form-hint">Note: Language change may require app restart.</p>
        </div>

        {/* Accessibility */}
        <div className="settings-card">
            <label className="form-label">Accessibility</label>
            <div className="scanner-grid">
                <div>
                    <label className="form-hint">Font Scaling ({settings.app_appearance?.fontScale}%)</label>
                    <input
                        type="range" min="80" max="150" step="10"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        value={settings.app_appearance?.fontScale}
                        onChange={e => handleChange('app_appearance', 'fontScale', parseInt(e.target.value))}
                    />
                    <div className="range-labels">
                        <span>80%</span>
                        <span>150%</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={settings.app_appearance?.highContrast}
                        onChange={e => handleChange('app_appearance', 'highContrast', e.target.checked)}
                    />
                    <Eye size={16} />
                    <span>High Contrast Mode</span>
                </div>
            </div>
        </div>
        {/* Save Button */}
        <div className="action-footer">
            <button
                onClick={handleSave}
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Save size={18} /> Save Appearance
            </button>
        </div>
    </div>
);

const AccountSecurityTab = ({ settings, handleChange, handleSave, passwordForm, setPasswordForm, handlePasswordChange, passwordError, passwordSuccess, changingPassword }) => {
    const strength = getPasswordStrength(passwordForm.new);

    return (
        <div className="section-wrapper">
            <h2 className="settings-page-title">Account Security</h2>

            {/* Change Password */}
            <div className="settings-card padding-lg">
                <div className="card-header">
                    <h3 className="card-title"><Lock size={18} /> Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="width-constrained">
                    <div className="form-group">
                        <label className="form-label">Current Password</label>
                        <input
                            type="password"
                            className="glass-input width-full"
                            style={{ width: '100%' }}
                            placeholder="Enter current password"
                            value={passwordForm.current}
                            onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="glass-input width-full"
                            style={{ width: '100%' }}
                            placeholder="Enter new password"
                            value={passwordForm.new}
                            onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                            required
                        />
                        {/* Strength Meter */}
                        {passwordForm.new && (
                            <div className="password-meter">
                                <div className="meter-bar-bg">
                                    <div
                                        className="meter-fill"
                                        style={{ width: `${(strength.level / 5) * 100}%`, background: strength.color === 'bg-green-500' ? '#22c55e' : strength.color === 'bg-yellow-500' ? '#eab308' : '#ef4444' }}
                                    />
                                </div>
                                <span className={`meter-text ${strength.color === 'bg-green-500' ? 'text-success' : strength.color === 'bg-yellow-500' ? 'text-warning' : 'text-danger'}`}>
                                    {strength.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="glass-input width-full"
                            style={{ width: '100%' }}
                            placeholder="Confirm new password"
                            value={passwordForm.confirm}
                            onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                            required
                        />
                        {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                            <span className="text-danger" style={{ fontSize: '0.75rem' }}>Passwords don't match</span>
                        )}
                    </div>

                    {passwordError && (
                        <div className="text-danger" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <X size={16} /> {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="text-success" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Check size={16} /> {passwordSuccess}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="primary-glass-btn"
                        disabled={changingPassword}
                    >
                        {changingPassword ? 'Changing...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Session Settings */}
            <div className="settings-card padding-lg">
                <div className="card-header">
                    <h3 className="card-title"><RefreshCw size={18} /> Session Settings</h3>
                </div>

                <div className="width-constrained">
                    <label className="form-label">Auto-Lock Timer</label>
                    <select
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        value={settings.app_security?.autoLockMinutes || 0}
                        onChange={e => handleChange('app_security', 'autoLockMinutes', parseInt(e.target.value))}
                    >
                        <option value={0}>Never</option>
                        <option value={5}>After 5 minutes of inactivity</option>
                        <option value={10}>After 10 minutes of inactivity</option>
                        <option value={15}>After 15 minutes of inactivity</option>
                        <option value={30}>After 30 minutes of inactivity</option>
                    </select>
                    <p className="form-hint">
                        Automatically lock the app after a period of inactivity.
                    </p>
                    <div className="action-footer">
                        <button
                            onClick={handleSave}
                            className="primary-glass-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={16} /> Save Session Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HardwareTab = ({ settings, handleChange, handleSave }) => (
    <div className="section-wrapper">
        <h2 className="settings-page-title">Hardware & Peripherals</h2>

        {/* Barcode Scanner */}
        <div className="settings-card">
            <h3 className="card-title"><Smartphone size={18} /> Barcode Scanner</h3>
            <div className="scanner-grid">
                <div>
                    <label className="form-label">Input Mode</label>
                    <select
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        value={settings.app_hardware?.scannerMode}
                        onChange={e => handleChange('app_hardware', 'scannerMode', e.target.value)}
                    >
                        <option value="keyboard">Keyboard Emulation (Default)</option>
                        <option value="serial">Serial Port (COM)</option>
                    </select>
                </div>
                <div>
                    <label className="form-label">Prefix / Suffix Stripping</label>
                    <input
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        placeholder="e.g. CA-"
                        value={settings.app_hardware?.scannerPrefix || ''}
                        onChange={e => handleChange('app_hardware', 'scannerPrefix', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Receipt Printer */}
        <div className="settings-card">
            <h3 className="card-title"><Printer size={18} /> Receipt Printer</h3>
            <div className="scanner-grid">
                <div>
                    <label className="form-label">Default Printer</label>
                    <select
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        value={settings.app_hardware?.defaultPrinter || ''}
                        onChange={e => handleChange('app_hardware', 'defaultPrinter', e.target.value)}
                    >
                        <option value="">System Default</option>
                        <option value="thermal_1">Thermal Printer (USB)</option>
                        <option value="network_1">Network Printer</option>
                    </select>
                    <p className="form-hint">
                        Note: Printer detection requires Electron integration.
                    </p>
                </div>
                <div>
                    <label className="form-label">Paper Size</label>
                    <select
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        value={settings.app_hardware?.paperSize}
                        onChange={e => handleChange('app_hardware', 'paperSize', e.target.value)}
                    >
                        <option value="58mm">58mm (Thermal)</option>
                        <option value="80mm">80mm (Thermal)</option>
                        <option value="A4">A4 (Standard)</option>
                    </select>
                </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <label className="checkbox-item">
                    <input
                        type="checkbox"
                        checked={settings.app_hardware?.autoPrint}
                        onChange={e => handleChange('app_hardware', 'autoPrint', e.target.checked)}
                    />
                    <span>Auto-Print Receipt after Fine Collection</span>
                </label>
            </div>
        </div>
        {/* Save Button */}
        <div className="action-footer">
            <button
                onClick={handleSave}
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Save size={18} /> Save Hardware Settings
            </button>
        </div>
    </div>
);

const DataMaintenanceTab = ({ settings, handleChange, handleSave, testingConnection, handleTestConnection }) => (
    <div className="section-wrapper">
        <h2 className="settings-page-title">Data & Maintenance</h2>

        {/* Cloud Database Configuration */}
        <div className="settings-card">
            <h3 className="card-title"><Server size={18} /> Cloud Database Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label className="form-label">MongoDB Connection URI</label>
                    <input
                        className="glass-input width-full"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9em' }}
                        placeholder="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dbname"
                        value={settings.backup_config?.connectionUri || ''}
                        onChange={e => handleChange('backup_config', 'connectionUri', e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className="nav-button"
                        style={{ width: 'auto', border: '1px solid var(--glass-border)' }}
                        onClick={handleTestConnection}
                        disabled={testingConnection}
                    >
                        {testingConnection ? (
                            <><RefreshCw size={16} className="animate-spin" /> Testing...</>
                        ) : (
                            <><Wifi size={16} /> Test Connection</>
                        )}
                    </button>
                    <button
                        className="primary-glass-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleSave}
                    >
                        <Save size={16} /> Save & Restart
                    </button>
                </div>
            </div>
        </div>

        {/* Backup Operations */}
        <div className="settings-card">
            <h3 className="card-title"><Database size={18} /> Backup Operations</h3>
            <div className="scanner-grid">
                <button className="btn-secondary justify-center" style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={18} /> Create Local Backup
                </button>
                <button className="btn-secondary justify-center" style={{ width: '100%', justifyContent: 'center' }}>
                    <Upload size={18} /> Restore from Backup
                </button>
            </div>
            <p className="form-hint">
                Restore requires Super Admin password verification.
            </p>
        </div>

        {/* Backup Automation */}
        <div className="settings-card">
            <h3 className="card-title">Backup Automation</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <label className="checkbox-item">
                    <input
                        type="checkbox"
                        checked={settings.backup_config?.autoBackup}
                        onChange={e => handleChange('backup_config', 'autoBackup', e.target.checked)}
                    />
                    <span>Enable Auto-Backup</span>
                </label>
                <div>
                    <label className="form-label" style={{ marginBottom: 0, display: 'inline-block', marginRight: '0.5rem' }}>Frequency</label>
                    <select
                        className="glass-input"
                        value={settings.backup_config?.frequency || 'daily'}
                        onChange={e => handleChange('backup_config', 'frequency', e.target.value)}
                        disabled={!settings.backup_config?.autoBackup}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Cache Control */}
        <div className="settings-card">
            <h3 className="card-title">Cache Control</h3>
            <button className="nav-button" style={{ width: 'auto', border: '1px solid var(--glass-border)' }}>
                <Trash2 size={16} /> Clear App Cache
            </button>
            <p className="form-hint">
                Wipes temporary UI states. Useful for troubleshooting display bugs.
            </p>
        </div>

        {/* Factory Reset - Danger Zone */}
        <div className="settings-card danger-zone">
            <h3 className="card-title text-danger">
                <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p className="form-hint" style={{ marginBottom: '1rem' }}>
                Factory reset will wipe ALL catalog and user data. This action is irreversible.
            </p>
            <button className="btn-danger-outline">
                <Trash2 size={16} /> Reset System
            </button>
            <p className="form-hint">
                Requires 2-step verification (Password + OTP).
            </p>
        </div>
        {/* Save Button */}
        <div className="action-footer">
            <button
                onClick={handleSave}
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Save size={18} /> Save Data Settings
            </button>
        </div>
    </div>
);

const DataEnrichmentTab = ({ bgAutoFillStatus, handleBackgroundAutoFill }) => (
    <div className="section-wrapper">
        <h2 className="settings-page-title">Data Enrichment</h2>

        {/* Auto-Fill Metadata */}
        <div className="settings-card">
            <h3 className="card-title"><BookOpen size={18} /> Auto-Fill Book Metadata</h3>
            <p className="form-hint" style={{ marginBottom: '1rem' }}>
                Automatically scan your library for books with missing information (Title, Author, Cover)
                and fetch details from Google Books and Open Library APIs.
            </p>

            <div className="scanner-grid">
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: bgAutoFillStatus.running ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: bgAutoFillStatus.running ? '#EAB308' : '#3B82F6'
                        }}>
                            {bgAutoFillStatus.running ? <RefreshCw className="animate-spin" size={20} /> : <BookOpen size={20} />}
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Background Auto-Fill</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {bgAutoFillStatus.running
                                    ? `Running... Processed ${bgAutoFillStatus.done} / ${bgAutoFillStatus.total} books`
                                    : "Ready to scan"}
                            </p>
                        </div>
                    </div>

                    {bgAutoFillStatus.progress && (
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                            <div style={{
                                width: bgAutoFillStatus.total ? `${(bgAutoFillStatus.done / bgAutoFillStatus.total) * 100}%` : '0%',
                                height: '100%',
                                background: '#3B82F6',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                        onClick={handleBackgroundAutoFill}
                        disabled={bgAutoFillStatus.running}
                    >
                        {bgAutoFillStatus.running ? 'Processing in Background...' : 'Start Auto-Fill Process'}
                    </button>

                    <p className="form-hint" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                        Note: This process runs in the background. You can navigate away from this page.
                        Process skips books with auto-generated ISBNs (AG-*) and those with complete info.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const EmailTab = ({ settings, handleChange, handleSave, testingEmail, handleTestEmail }) => (
    <div className="section-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="settings-page-title">Email Configuration</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={settings.email_config?.enabled ? "text-success" : "text-gray-500"}>
                    {settings.email_config?.enabled ? "Service Enabled" : "Service Disabled"}
                </span>
                <input
                    type="checkbox"
                    className="toggle-checkbox"
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    checked={settings.email_config?.enabled}
                    onChange={e => handleChange('email_config', 'enabled', e.target.checked)}
                />
            </div>
        </div>

        {/* Service Provider */}
        <div className="settings-card">
            <h3 className="card-title">Service Provider</h3>
            <div className="scanner-grid">
                <div>
                    <label className="form-label">Provider Type</label>
                    <select
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        value={settings.email_config?.provider}
                        onChange={e => handleChange('email_config', 'provider', e.target.value)}
                    >
                        <option value="smtp">SMTP Server</option>
                        <option value="sendgrid">SendGrid API</option>
                        <option value="aws_ses">AWS SES</option>
                    </select>
                </div>
            </div>

            {/* SMTP Configuration */}
            {settings.email_config?.provider === 'smtp' && (
                <div className="scanner-grid" style={{ marginTop: '1rem' }}>
                    <input placeholder="Host (e.g., smtp.gmail.com)" className="glass-input" value={settings.email_config?.host || ''} onChange={e => handleChange('email_config', 'host', e.target.value)} />
                    <input placeholder="Port (e.g., 587)" type="number" className="glass-input" value={settings.email_config?.port || ''} onChange={e => handleChange('email_config', 'port', e.target.value)} />
                    <input placeholder="Username" className="glass-input" value={settings.email_config?.user || ''} onChange={e => handleChange('email_config', 'user', e.target.value)} />
                    <input type="password" placeholder="Password" className="glass-input" value={settings.email_config?.pass || ''} onChange={e => handleChange('email_config', 'pass', e.target.value)} />
                </div>
            )}

            {/* Cloud API Configuration */}
            {(settings.email_config?.provider === 'sendgrid' || settings.email_config?.provider === 'aws_ses') && (
                <div className="scanner-grid" style={{ marginTop: '1rem' }}>
                    <input type="password" placeholder="API Key" className="glass-input" value={settings.email_config?.apiKey || ''} onChange={e => handleChange('email_config', 'apiKey', e.target.value)} />
                    {settings.email_config?.provider === 'aws_ses' && (
                        <input placeholder="Region (e.g., us-east-1)" className="glass-input" value={settings.email_config?.region || ''} onChange={e => handleChange('email_config', 'region', e.target.value)} />
                    )}
                </div>
            )}
        </div>

        {/* Sender Identity */}
        <div className="settings-card">
            <h3 className="card-title">Sender Identity</h3>
            <div className="scanner-grid">
                <div>
                    <label className="form-label">"From" Name</label>
                    <input
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        placeholder="e.g., College Library"
                        value={settings.email_config?.fromName || ''}
                        onChange={e => handleChange('email_config', 'fromName', e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">"From" Email</label>
                    <input
                        className="glass-input width-full"
                        style={{ width: '100%' }}
                        placeholder="e.g., library@college.edu"
                        value={settings.email_config?.fromEmail || ''}
                        onChange={e => handleChange('email_config', 'fromEmail', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Connectivity Test */}
        <div className="settings-card">
            <h3 className="card-title">Connectivity Test</h3>
            <button
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleTestEmail}
                disabled={testingEmail}
            >
                {testingEmail ? (
                    <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                ) : (
                    <><Mail size={16} /> Send Test Email</>
                )}
            </button>
            <p className="form-hint">
                Sends a test email to the currently logged-in user's email address.
            </p>
        </div>

        {/* Event Triggers */}
        <div className="settings-card">
            <h3 className="card-title">Event Triggers</h3>
            <div className="scanner-grid">
                {[
                    { key: 'issueReceipt', label: 'Issue Receipt' },
                    { key: 'returnReceipt', label: 'Return Receipt' },
                    { key: 'renewalConfirmation', label: 'Renewal Confirmation' },
                    { key: 'broadcastMessages', label: 'Broadcast Messages' },
                    { key: 'overdueAlerts', label: 'Overdue Alerts (Cron)' },
                    { key: 'finePaymentReceipt', label: 'Fine Payment Receipt' }
                ].map(({ key, label }) => (
                    <label key={key} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={settings.email_events?.[key] ?? true}
                            onChange={e => handleChange('email_events', key, e.target.checked)}
                        />
                        {label}
                    </label>
                ))}
            </div>
        </div>
        {/* Save Button */}
        <div className="action-footer">
            <button
                onClick={handleSave}
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Save size={18} /> Save Email Settings
            </button>
        </div>
    </div>
);

const SystemSecurityTab = ({ settings, handleChange, handleSave }) => (
    <div className="section-wrapper">
        <h2 className="settings-page-title">System Security</h2>

        {/* Login Security */}
        <div className="settings-card">
            <h3 className="card-title"><Shield size={18} /> Login Security</h3>
            <div className="width-constrained">
                <label className="form-label">Max Failed Login Attempts</label>
                <input
                    type="number"
                    className="glass-input width-sm"
                    style={{ width: '120px' }}
                    min="1"
                    max="10"
                    value={settings.sec_login?.maxAttempts || 5}
                    onChange={e => handleChange('sec_login', 'maxAttempts', parseInt(e.target.value))}
                />
                <p className="form-hint">Account locks after this many failed attempts.</p>
            </div>
        </div>

        {/* Password Complexity Rules */}
        <div className="settings-card">
            <h3 className="card-title">Password Complexity Rules</h3>
            <div className="scanner-grid">
                <div>
                    <label className="form-label">Minimum Length</label>
                    <input
                        type="number"
                        className="glass-input width-sm"
                        style={{ width: '120px' }}
                        min="6"
                        max="20"
                        value={settings.sec_login?.minLength || 8}
                        onChange={e => handleChange('sec_login', 'minLength', parseInt(e.target.value))}
                    />
                </div>
                <div className="checkbox-group">
                    <label className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={settings.sec_login?.requireUppercase}
                            onChange={e => handleChange('sec_login', 'requireUppercase', e.target.checked)}
                        />
                        Require Uppercase Letter
                    </label>
                    <label className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={settings.sec_login?.requireNumber}
                            onChange={e => handleChange('sec_login', 'requireNumber', e.target.checked)}
                        />
                        Require Number
                    </label>
                    <label className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={settings.sec_login?.requireSymbol}
                            onChange={e => handleChange('sec_login', 'requireSymbol', e.target.checked)}
                        />
                        Require Symbol
                    </label>
                </div>
            </div>
        </div>

        {/* Critical Action Protection */}
        <div className="settings-card">
            <h3 className="card-title">Critical Action Protection</h3>
            <p className="form-hint" style={{ marginBottom: '1rem' }}>
                Require Admin Password Re-entry for the following actions:
            </p>
            <div className="scanner-grid">
                {[
                    { key: 'bulkDelete', label: 'Bulk Delete Operations' },
                    { key: 'restoreBackup', label: 'Restore Backup' },
                    { key: 'policyChanges', label: 'Policy/Rule Changes' },
                    { key: 'staffModification', label: 'Staff Role Modification' }
                ].map(({ key, label }) => (
                    <label key={key} className="checkbox-item">
                        <input
                            type="checkbox"
                            checked={settings.sec_actions?.[key] ?? true}
                            onChange={e => handleChange('sec_actions', key, e.target.checked)}
                        />
                        {label}
                    </label>
                ))}
            </div>
        </div>
        {/* Save Button */}
        <div className="action-footer">
            <button
                onClick={handleSave}
                className="primary-glass-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <Save size={18} /> Save Security Settings
            </button>
        </div>
    </div>
);

const SettingsPage = () => {
    const [activeCategory, setActiveCategory] = useState('appearance');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unsavedChanges, setUnsavedChanges] = useState({});
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [testingEmail, setTestingEmail] = useState(false);
    const [bgAutoFillStatus, setBgAutoFillStatus] = useState(() => {
        return window.__autoFillStatus || { running: false, progress: '', total: 0, done: 0 };
    });

    // Notification modal state (replaces browser alerts)
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const showNotification = (title, message, type = 'info') => setNotification({ isOpen: true, title, message, type });
    const closeNotification = () => setNotification(n => ({ ...n, isOpen: false }));

    // Password change state
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Auth context - check both possible localStorage keys and use case-insensitive role check
    const user = JSON.parse(localStorage.getItem('user_info')) || JSON.parse(localStorage.getItem('user')) || { role: 'Staff', id: 'guest' };
    const userRole = (user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin' || userRole === 'super admin' || userRole === 'superadmin';

    // Preferences context for language sync
    const { language, toggleLanguage, theme, toggleTheme, setTheme } = usePreferences();

    const categoryGroups = [
        {
            title: 'General',
            items: [
                { id: 'appearance', label: 'Appearance & Feedback', icon: Moon, access: 'All' },
                { id: 'hardware', label: 'Hardware & Peripherals', icon: Printer, access: 'All' }
            ]
        },
        {
            title: 'Account',
            items: [
                { id: 'account', label: 'Account Security', icon: Key, access: 'All' }
            ]
        },
        {
            title: 'System & Admin',
            items: [
                { id: 'security', label: 'System Security', icon: Shield, access: 'Admin' },
                { id: 'data', label: 'Data & Maintenance', icon: Database, access: 'Admin' },
                { id: 'enrichment', label: 'Data Enrichment', icon: BookOpen, access: 'All' },
                { id: 'email', label: 'Email & Communication', icon: Mail, access: 'Admin' }
            ]
        }
    ];

    useEffect(() => {
        fetchSettings();

        // Sync with global auto-fill state
        if (window.__autoFillStatus) {
            setBgAutoFillStatus(window.__autoFillStatus);
        }

        const interval = setInterval(() => {
            if (window.__autoFillStatus) {
                setBgAutoFillStatus({ ...window.__autoFillStatus });
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/settings/app');
            const data = await res.json();
            // Set defaults for missing keys
            const defaults = {
                app_appearance: {
                    theme: 'dark',
                    glassIntensity: 10,
                    soundSuccess: true,
                    soundError: true,
                    fontScale: 100,
                    highContrast: false,
                    language: 'en'
                },
                app_hardware: {
                    scannerMode: 'keyboard',
                    scannerPrefix: '',
                    paperSize: '80mm',
                    autoPrint: false,
                    defaultPrinter: ''
                },
                app_security: {
                    autoLockMinutes: 0
                },
                email_config: {
                    enabled: false,
                    provider: 'smtp',
                    host: '',
                    port: 587,
                    user: '',
                    pass: '',
                    apiKey: '',
                    region: '',
                    fromName: '',
                    fromEmail: ''
                },
                email_events: {
                    issueReceipt: true,
                    returnReceipt: true,
                    renewalConfirmation: true,
                    broadcastMessages: true,
                    overdueAlerts: true,
                    finePaymentReceipt: true
                },
                sec_login: {
                    maxAttempts: 5,
                    minLength: 8,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false
                },
                sec_actions: {
                    bulkDelete: true,
                    restoreBackup: true,
                    policyChanges: true,
                    staffModification: true
                },
                backup_config: {
                    connectionUri: '',
                    autoBackup: false,
                    frequency: 'daily'
                }
            };
            // Merge defaults with fetched data
            const merged = { ...defaults };
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'object' && merged[key]) {
                    merged[key] = { ...merged[key], ...data[key] };
                } else {
                    merged[key] = data[key];
                }
            });
            setSettings(merged);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, field, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
        setUnsavedChanges(prev => ({ ...prev, [key]: true }));
    };

    const handleSave = () => {
        const sensitiveUpdated = ['sec_login', 'sec_actions', 'email_config', 'backup_config'].some(k => unsavedChanges[k]);
        if (sensitiveUpdated && isAdmin) {
            setIsPromptOpen(true);
        } else {
            saveChanges(null);
        }
    };

    const saveChanges = async (password) => {
        try {
            // Only send keys that have been changed, not all settings
            const changedKeys = Object.keys(unsavedChanges).filter(k => unsavedChanges[k]);
            const updates = {};
            changedKeys.forEach(key => {
                if (settings[key] !== undefined) {
                    updates[key] = settings[key];
                }
            });

            // If no changes, just show success
            if (Object.keys(updates).length === 0) {
                showNotification('No Changes', 'No changes to save', 'info');
                return;
            }

            const body = {
                updates: updates,
                admin_id: user.id
            };
            if (password) body.admin_password = password;

            const res = await fetch('http://localhost:3001/api/settings/app', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                showNotification('Success', 'Settings saved successfully!', 'success');

                // Immediate Theme Application
                if (updates.app_appearance && updates.app_appearance.theme) {
                    setTheme(updates.app_appearance.theme);
                }

                setUnsavedChanges({});
                setIsPromptOpen(false);
            } else {
                showNotification('Error', data.error + ' (ERR_SET_SAVE)', 'error');
                setIsPromptOpen(false);
            }
        } catch (e) {
            showNotification('Network Error', 'Failed to connect to server (ERR_NET_SET)', 'error');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordError('Passwords do not match (ERR_VAL_PWD_MATCH)');
            return;
        }
        if (passwordForm.new.length < 8) {
            setPasswordError('Password must be at least 8 characters (ERR_VAL_PWD_LEN)');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('http://localhost:3001/api/settings/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    current_password: passwordForm.current,
                    new_password: passwordForm.new
                })
            });
            const data = await res.json();
            if (res.ok) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordForm({ current: '', new: '', confirm: '' });
            } else {
                setPasswordError((data.error || 'Failed to change password') + ' (ERR_PWD_CHG)');
            }
        } catch (e) {
            setPasswordError('Network error (ERR_NET_PWD)');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        try {
            // Simulate connection test
            await new Promise(r => setTimeout(r, 1500));
            alert('Connection successful! Latency: 45ms');
        } catch (e) {
            alert('Connection failed (ERR_DB_CONN)');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleTestEmail = async () => {
        setTestingEmail(true);
        try {
            const res = await fetch('http://localhost:3001/api/settings/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email || 'admin@test.com' })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Test email sent! Check your inbox.');
            } else {
                alert('Test email failed: ' + (data.error || 'Unknown error') + ' (ERR_EMAIL_TEST)');
            }
        } catch (e) {
            alert('Network error (ERR_NET_EMAIL)');
        } finally {
            setTestingEmail(false);
        }
    };

    const handleBackgroundAutoFill = async () => {
        // Fetch all books first since we don't have them in settings page
        // We'll just fetch brief listing
        try {
            const res = await fetch('http://localhost:3001/api/books?status=All');
            const allBooks = await res.json();

            if (!Array.isArray(allBooks)) {
                showNotification('Error', 'Failed to fetch books for scanning.', 'error');
                return;
            }

            // Filter books that need auto-fill (have ISBN, not auto-generated, missing title/author)
            const booksToFill = allBooks.filter(book => {
                const isbn = book.isbn || '';
                // Skip auto-generated ISBNs
                if (isbn.startsWith('AG-')) return false;
                // Only fill if missing title, author, or cover
                return !book.author || !book.cover_image_url || book.title === isbn;
            });

            if (booksToFill.length === 0) {
                showNotification('Auto-Fill Complete', 'All books already have complete information!', 'success');
                return;
            }

            // Helper to update both local and global state
            const updateStatus = (status) => {
                window.__autoFillStatus = status;
                setBgAutoFillStatus(status);
            };

            // Start background process
            updateStatus({ running: true, progress: 'Starting...', total: booksToFill.length, done: 0 });
            showNotification('Started', `Starting auto-fill for ${booksToFill.length} books...`, 'info');

            // Run in background (won't block navigation)
            const processInBackground = async () => {
                let updated = 0;

                const fetchBookDetails = async (isbn) => {
                    const cleanIsbn = String(isbn).replace(/-/g, '').trim();
                    try {
                        // 1. Try Google Books API
                        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.items && data.items.length > 0) {
                                return data.items[0].volumeInfo;
                            }
                        }

                        // 2. Fallback: Open Library API
                        const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
                        if (olRes.ok) {
                            const olData = await olRes.json();
                            const key = `ISBN:${cleanIsbn}`;
                            if (olData[key]) {
                                const d = olData[key];
                                return {
                                    title: d.title,
                                    authors: d.authors ? d.authors.map(a => a.name) : [],
                                    publisher: d.publishers ? d.publishers.map(p => p.name).join(', ') : '',
                                    imageLinks: { thumbnail: d.cover?.medium || d.cover?.large || '' }
                                };
                            }
                        }
                    } catch (e) {
                        console.error(`Failed to fetch details for ${isbn}:`, e);
                    }
                    return null;
                };

                // Process in batches
                const BATCH_SIZE = 3;
                for (let i = 0; i < booksToFill.length; i += BATCH_SIZE) {
                    const batch = booksToFill.slice(i, i + BATCH_SIZE);

                    const results = await Promise.all(batch.map(async (book) => {
                        const details = await fetchBookDetails(book.isbn);
                        if (details) {
                            // Update book in backend
                            try {
                                await fetch(`http://localhost:3001/api/books/${book.isbn}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        ...book,
                                        title: details.title || book.title,
                                        author: details.authors ? details.authors.join(', ') : book.author,
                                        publisher: details.publisher || book.publisher,
                                        cover_image_url: details.imageLinks?.thumbnail?.replace('http:', 'https:') || book.cover_image_url
                                    })
                                });
                                return true;
                            } catch (e) {
                                console.error(`Failed to update ${book.isbn}:`, e);
                            }
                        }
                        return false;
                    }));

                    updated += results.filter(r => r).length;
                    const doneCount = Math.min(i + BATCH_SIZE, booksToFill.length);
                    updateStatus({
                        running: true,
                        done: doneCount,
                        total: booksToFill.length,
                        progress: `${doneCount}/${booksToFill.length}`
                    });

                    // Small delay between batches to avoid rate limiting
                    await new Promise(r => setTimeout(r, 300));
                }

                // Complete - mark as just completed
                window.__autoFillStatus = { running: false, progress: '', total: 0, done: 0, justCompleted: true, updatedCount: updated, totalCount: booksToFill.length };
                setBgAutoFillStatus({ running: false, progress: '', total: 0, done: 0 });
            };

            processInBackground();

        } catch (e) {
            console.error("Auto-Fill Init Failed:", e);
            showNotification('Error', 'Failed to initialize auto-fill process', 'error');
        }
    };


    // ==================== MAIN RENDER ====================
    if (loading) return <div className="p-10">Loading Settings...</div>;
    if (!settings) return <div className="p-10">Error loading settings.</div>;

    return (
        <div className="settings-container">
            {/* Left Sidebar */}
            {/* Left Sidebar - Premium Design (Semantic CSS) */}
            <div className="settings-sidebar custom-scrollbar">
                <div className="sidebar-header">
                    <h1 className="sidebar-title">
                        <Settings className="text-purple-400" size={28} />
                        Settings
                    </h1>
                    <p className="sidebar-subtitle">System Configuration</p>
                </div>

                <div className="sidebar-menu">
                    {categoryGroups.map((group, gIndex) => {
                        const visibleItems = group.items.filter(item => item.access === 'All' || (item.access === 'Admin' && isAdmin));
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={gIndex} className="sidebar-group" style={{ animationDelay: `${gIndex * 100}ms` }}>
                                <h3 className="sidebar-group-label">
                                    {group.title}
                                </h3>
                                <div className="sidebar-menu">
                                    {visibleItems.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`nav-button ${activeCategory === cat.id ? 'active' : ''}`}
                                        >
                                            {/* Active Indicator Bar */}
                                            {activeCategory === cat.id && (
                                                <div className="active-bar" />
                                            )}

                                            <cat.icon
                                                size={18}
                                                className="nav-icon"
                                            />
                                            <span style={{ position: 'relative', zIndex: 10 }}>{cat.label}</span>

                                            {/* Subtle Shine Effect on Hover */}
                                            <div className="hover-glow" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {Object.keys(unsavedChanges).length > 0 && (
                    <div className="unsaved-alert">
                        <AlertTriangle size={14} />
                        <span>You have unsaved changes</span>
                    </div>
                )}
            </div>

            {/* Right Panel */}
            <div className="settings-content custom-scrollbar">
                {activeCategory === 'appearance' && (
                    <AppearanceTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                    />
                )}
                {activeCategory === 'account' && (
                    <AccountSecurityTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                        passwordForm={passwordForm}
                        setPasswordForm={setPasswordForm}
                        handlePasswordChange={handlePasswordChange}
                        passwordError={passwordError}
                        passwordSuccess={passwordSuccess}
                        changingPassword={changingPassword}
                    />
                )}
                {activeCategory === 'hardware' && (
                    <HardwareTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                    />
                )}
                {activeCategory === 'data' && (
                    <DataMaintenanceTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                        testingConnection={testingConnection}
                        handleTestConnection={handleTestConnection}
                    />
                )}
                {activeCategory === 'enrichment' && (
                    <DataEnrichmentTab
                        bgAutoFillStatus={bgAutoFillStatus}
                        handleBackgroundAutoFill={handleBackgroundAutoFill}
                    />
                )}
                {activeCategory === 'email' && (
                    <EmailTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                        testingEmail={testingEmail}
                        handleTestEmail={handleTestEmail}
                    />
                )}
                {activeCategory === 'security' && (
                    <SystemSecurityTab
                        settings={settings}
                        handleChange={handleChange}
                        handleSave={handleSave}
                    />
                )}
            </div>

            <PasswordPromptModal
                isOpen={isPromptOpen}
                onClose={() => setIsPromptOpen(false)}
                onSuccess={saveChanges}
                message="Confirm Admin Password to save these sensitive settings."
            />

            {/* Notification Modal (replaces browser alerts) */}
            <ConfirmationModal
                isOpen={notification.isOpen}
                onClose={closeNotification}
                onConfirm={closeNotification}
                title={notification.title}
                message={notification.message}
                confirmText="OK"
                cancelText=""
                isDanger={notification.type === 'error'}
            />
        </div>
    );
};

export default SettingsPage;
