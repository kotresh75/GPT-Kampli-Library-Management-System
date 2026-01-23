import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Building } from 'lucide-react';
import SmartAddDepartmentModal from '../components/departments/SmartAddDepartmentModal';
import SmartDepartmentTable from '../components/departments/SmartDepartmentTable';
import StatusModal from '../components/common/StatusModal';
import ConfirmationModal from '../components/common/ConfirmationModal';

const DepartmentPage = () => {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const url = search
                ? `http://localhost:3001/api/departments?search=${search}`
                : 'http://localhost:3001/api/departments';
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data)) setDepartments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [search]);

    const handleDeleteClick = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const id = confirmModal.id;
        try {
            const res = await fetch(`http://localhost:3001/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDepartments();
                setStatusModal({ isOpen: true, type: 'success', title: 'Deleted', message: 'Department deleted successfully.' });
            } else {
                setStatusModal({ isOpen: true, type: 'error', title: 'Delete Failed', message: 'Department might be in use by students or books.' });
            }
        } catch (err) {
            setStatusModal({ isOpen: true, type: 'error', title: 'Error', message: 'Network error occurred.' });
        } finally {
            setConfirmModal({ isOpen: false, id: null });
        }
    };

    return (
        <div className="dashboard-content">
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Building size={32} className="text-blue-400" /> Department Management
                    </h1>
                    <p className="text-[var(--text-secondary)]">Manage academic departments and track associated records.</p>
                </div>

                {/* Smart Toolbar */}
                <div className="catalog-toolbar">
                    <div className="toolbar-search" style={{ flex: 1, maxWidth: '500px' }}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Name or Code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ flex: 1 }} />

                    <button
                        className="toolbar-primary-btn"
                        onClick={() => { setSelectedDept(null); setShowModal(true); }}
                    >
                        <Plus size={20} /> Add Department
                    </button>
                </div>

                <div className="glass-panel" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <SmartDepartmentTable
                        departments={departments}
                        loading={loading}
                        onEdit={(dept) => { setSelectedDept(dept); setShowModal(true); }}
                        onDelete={handleDeleteClick}
                    />
                </div>

                {showModal && (
                    <SmartAddDepartmentModal
                        onClose={() => setShowModal(false)}
                        onAdded={fetchDepartments}
                        initialData={selectedDept}
                    />
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Department?"
                message="Are you sure you want to delete this department? This cannot be undone."
                confirmText="Delete"
                isDanger={true}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />
        </div>
    );
};

export default DepartmentPage;
