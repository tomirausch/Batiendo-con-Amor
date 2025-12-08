// frontend/src/components/AlertModal.tsx
'use client';

import { useEffect } from 'react';

type ModalType = 'success' | 'error' | 'confirm';

interface Props {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void; // Solo para tipo 'confirm'
}

export default function AlertModal({ isOpen, type, title, message, onClose, onConfirm }: Props) {

    // Cerrar con tecla Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    // Configuración de colores según el tipo
    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: '✅',
                    headerBg: 'bg-green-500',
                    btnBg: 'bg-green-500 hover:bg-green-600',
                    textColor: 'text-green-700'
                };
            case 'error':
                return {
                    icon: '⚠️',
                    headerBg: 'bg-red-500',
                    btnBg: 'bg-red-500 hover:bg-red-600',
                    textColor: 'text-red-700'
                };
            case 'confirm':
                return {
                    icon: '❓',
                    headerBg: 'bg-pink-500',
                    btnBg: 'bg-pink-500 hover:bg-pink-600',
                    textColor: 'text-pink-700'
                };
        }
    };

    const config = getConfig();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className={`${config.headerBg} p-4 flex justify-between items-center`}>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span>{config.icon}</span> {title}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 font-bold text-xl">
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <p className="text-gray-700 text-base">{message}</p>
                </div>

                {/* Footer (Botones) */}
                <div className="bg-gray-50 p-4 flex justify-center gap-3">
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                                className={`px-4 py-2 text-white rounded font-bold transition ${config.btnBg}`}
                            >
                                Confirmar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`px-6 py-2 text-white rounded font-bold transition w-full ${config.btnBg}`}
                        >
                            Aceptar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}