import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, Loader2, X, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CustomToaster() {
  return (
    <Toaster position="top-center" toastOptions={{ duration: 3000 }}>
      {(t) => (
        <ToastBar toast={t} style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
          {({ icon, message }) => (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all",
                "bg-white/95 border-stone-200 text-stone-900 dark:bg-stone-900/95 dark:border-stone-800 dark:text-stone-50",
                t.type === 'success' && "shadow-emerald-500/10",
                t.type === 'error' && "shadow-rose-500/10",
                t.visible ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="flex-shrink-0">
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
                {t.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-brand-600" />}
                {t.type === 'blank' && (icon || <Info className="h-5 w-5 text-blue-500" />)}
              </div>
              
              <div className="text-sm font-bold tracking-tight">
                {message}
              </div>

              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-2 rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Progress Bar */}
              {t.type !== 'loading' && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: (t.duration || 3000) / 1000, ease: "linear" }}
                  className={cn(
                    "absolute bottom-0 left-0 h-0.5",
                    t.type === 'success' ? "bg-emerald-500" : 
                    t.type === 'error' ? "bg-rose-500" : 
                    "bg-brand-500"
                  )}
                />
              )}
            </motion.div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
