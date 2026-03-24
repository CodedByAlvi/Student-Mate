import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function ConfirmModal() {
  const { confirmModal, closeConfirmModal } = useStore();

  return (
    <AnimatePresence>
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeConfirmModal}
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <button 
                onClick={closeConfirmModal}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="font-display text-xl font-bold">{confirmModal.title}</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {confirmModal.message}
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={closeConfirmModal}
                className="flex-1 rounded-2xl border border-stone-200 py-3 text-sm font-bold transition-all hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  closeConfirmModal();
                }}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
