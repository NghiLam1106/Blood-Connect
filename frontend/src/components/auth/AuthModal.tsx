import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Login from '../../pages/auth/Login';
import AuthSelect from '../../pages/auth/AuthSelect';
import DonorRegister from '../../pages/auth/DonorRegister';
import HospitalRegister from '../../pages/auth/HospitalRegister';
import ForgotPassword from '../../pages/auth/ForgotPassword';

export type AuthView = 'login' | 'select' | 'donor' | 'hospital' | 'forgot-password' | '/auth/login' | '/auth' | '/auth/register/donor' | '/auth/register/hospital' | '/auth/forgot-password';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultView?: AuthView;
}

export function AuthModal({ isOpen, onClose, defaultView = 'login' }: AuthModalProps) {
    const [view, setView] = useState<AuthView>(defaultView);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setView(defaultView);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, defaultView]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleNavigate = (path: string) => {
        if (path.includes('forgot-password')) setView('forgot-password');
        else if (path.includes('login')) setView('login');
        else if (path.includes('register/donor')) setView('donor');
        else if (path.includes('register/hospital')) setView('hospital');
        else if (path.includes('auth')) setView('select');
    };

    const renderContent = () => {
        switch (view) {
            case 'login':
            case '/auth/login':
                return <Login asModal onClose={onClose} onNavigate={handleNavigate} />;
            case 'select':
            case '/auth':
                return <AuthSelect asModal onClose={onClose} onNavigate={handleNavigate} />;
            case 'donor':
            case '/auth/register/donor':
                return <DonorRegister asModal onClose={onClose} onNavigate={handleNavigate} />;
            case 'hospital':
            case '/auth/register/hospital':
                return <HospitalRegister asModal onClose={onClose} onNavigate={handleNavigate} />;
            case 'forgot-password':
            case '/auth/forgot-password':
                return <ForgotPassword asModal onClose={onClose} onNavigate={handleNavigate} />;
            default:
                return <Login asModal onClose={onClose} onNavigate={handleNavigate} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        key="modal-content"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        className={`relative w-full ${view === 'select' || view === '/auth' ? 'max-w-[800px]' : 'max-w-[480px]'} bg-[#FFF7F7] rounded-3xl shadow-2xl p-4 overflow-hidden z-10 transition-all duration-300`}
                        style={{ maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border-none"
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M13 1L1 13M1 1l12 12" />
                            </svg>
                        </button>
                        <div className="pt-2 pb-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
