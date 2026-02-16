import React from 'react';
import { Mail, Phone, Edit2, Trash2, User, ToggleLeft, ToggleRight, Book, Users, Repeat, DollarSign, FileText, Eye, Briefcase } from 'lucide-react';

const StaffCard = ({ staff, onEdit, onToggleStatus, onDelete, onView }) => {
    const isActive = staff.status === 'Active';
    // Permissions mapping
    const PERMISSIONS = {
        CATALOG: { label: 'Catalog', icon: Book },
        CIRCULATION: { label: 'Circulation', icon: Repeat },
        STUDENTS: { label: 'Student Mgmt', icon: Users },
        DEPARTMENTS: { label: 'Dept Mgmt', icon: Briefcase },
        FINES: { label: 'Fine Mgmt', icon: DollarSign },
        REPORTS: { label: 'Reports', icon: FileText }
    };

    const userPerms = staff.access_permissions || [];

    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', borderTop: '1px solid var(--glass-border)' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-main)',
                        overflow: 'hidden'
                    }}>
                        {staff.profile_icon ? (
                            <img
                                src={staff.profile_icon.startsWith('data:') ? staff.profile_icon : (staff.profile_icon.startsWith('/') ? staff.profile_icon.slice(1) : staff.profile_icon)}
                                alt={staff.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{staff.name}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'rgba(66, 153, 225, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                            {staff.designation || 'Staff'}
                        </span>
                    </div>
                </div>
                <div style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                    background: isActive ? 'rgba(72, 187, 120, 0.2)' : 'rgba(252, 129, 129, 0.2)',
                    color: isActive ? '#48bb78' : '#fc8181', border: `1px solid ${isActive ? '#48bb78' : '#fc8181'}`
                }}>
                    {staff.status}
                </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Mail size={16} /> {staff.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Phone size={16} /> {staff.phone || 'N/A'}
                </div>
                {staff.last_login && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
                        <Eye size={14} /> Last login: {new Date(staff.last_login).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                )}
                {staff.transaction_count !== undefined && staff.transaction_count > 0 && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: '5px',
                        padding: '4px 10px',
                        background: 'rgba(159, 122, 234, 0.15)',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: '#9f7aea',
                        width: 'fit-content'
                    }}>
                        <Book size={12} /> {staff.transaction_count} transactions
                    </div>
                )}
            </div>

            {/* Permissions Footer */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '5px' }}>
                {userPerms.map(p => {
                    const PermMeta = PERMISSIONS[p];
                    if (!PermMeta) return null;
                    const Icon = PermMeta.icon;
                    return (
                        <div key={p} title={PermMeta.label} style={{
                            padding: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Icon size={14} color="var(--text-secondary)" />
                        </div>
                    );
                })}
                {userPerms.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No permissions</span>}
            </div>

            {/* Actions */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                    className="icon-btn"
                    style={{ color: isActive ? '#fc8181' : '#48bb78' }}
                    title={isActive ? "Disable Staff" : "Enable Staff"}
                    onClick={() => onToggleStatus(staff)}
                >
                    {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button className="icon-btn" title="Edit Details" onClick={() => onEdit(staff)}>
                    <Edit2 size={18} />
                </button>
                <button className="icon-btn danger-hover" title="Delete Staff" onClick={() => onDelete(staff)}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default StaffCard;
