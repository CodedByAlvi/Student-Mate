import React from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Monitor, Palette, Type, Bell, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';
import { useDevice } from '../hooks/useDevice';

export default function Settings() {
  const { user, updateUserProfile } = useStore();
  const { isTablet, isDesktop } = useDevice();

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const accentColors = [
    { id: 'emerald', color: 'bg-emerald-600' },
    { id: 'blue', color: 'bg-blue-600' },
    { id: 'purple', color: 'bg-purple-600' },
    { id: 'amber', color: 'bg-amber-600' },
    { id: 'rose', color: 'bg-rose-600' },
  ];

  const fonts = [
    { id: 'inter', label: 'Inter', family: 'font-sans' },
    { id: 'outfit', label: 'Outfit', family: 'font-outfit' },
    { id: 'space-grotesk', label: 'Space Grotesk', family: 'font-display' },
    { id: 'serif', label: 'Playfair Display', family: 'font-serif' },
    { id: 'mono', label: 'JetBrains Mono', family: 'font-mono' },
  ];

  const handleUpdate = async (updates: any) => {
    try {
      await updateUserProfile(updates);
      toast.success('Settings updated', {
        icon: <SettingsIcon className="h-4 w-4 text-brand-600" />
      });
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className={cn(
      "space-y-8 px-6 pb-24 transition-all duration-500",
      isTablet || isDesktop ? "max-w-6xl mx-auto" : "max-w-xl mx-auto"
    )}>
      <header>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-stone-500">Personalize your study space</p>
      </header>

      <div className={cn(
        "space-y-6",
        (isTablet || isDesktop) && "grid grid-cols-2 gap-8 space-y-0"
      )}>
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-stone-400">
              <Palette className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Appearance</h3>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-6 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
              <div className="space-y-3">
                <p className="text-sm font-bold">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleUpdate({ theme: t.id })}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                        user?.theme === t.id 
                          ? "border-brand-600 bg-brand-50 text-brand-600 dark:bg-brand-900/20" 
                          : "border-stone-100 bg-stone-50 text-stone-500 hover:border-stone-200 dark:border-stone-800 dark:bg-stone-800"
                      )}
                    >
                      <t.icon className="h-5 w-5" />
                      <span className="text-[10px] font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold">Accent Color</p>
                <div className="flex gap-3">
                  {accentColors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleUpdate({ accentColor: c.id })}
                      className={cn(
                        "h-8 w-8 rounded-full ring-offset-2 transition-all active:scale-90",
                        user?.accentColor === c.id ? "ring-2 ring-brand-600" : "ring-0 hover:scale-110",
                        c.color
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-stone-400">
              <Bell className="h-4 w-4" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest">Notifications</h3>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">Quiet Hours</p>
                  <p className="text-xs text-stone-500">Mute notifications during study time</p>
                </div>
                <button 
                  onClick={() => handleUpdate({ quietHours: { ...user?.quietHours, enabled: !user?.quietHours?.enabled } })}
                  className={cn(
                    "h-6 w-11 rounded-full p-1 transition-all",
                    user?.quietHours?.enabled ? "bg-brand-600" : "bg-stone-200 dark:bg-stone-800"
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full bg-white transition-all",
                    user?.quietHours?.enabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-stone-400">
            <Type className="h-4 w-4" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Typography</h3>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4 dark:border-stone-800 dark:bg-stone-900 shadow-sm">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => handleUpdate({ fontFamily: f.id })}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl p-4 transition-all",
                  user?.fontFamily === f.id 
                    ? "bg-stone-900 text-white dark:bg-stone-50 dark:text-stone-900" 
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400"
                )}
              >
                <span className={cn("text-sm font-bold", f.family)}>{f.label}</span>
                {user?.fontFamily === f.id && <div className="h-2 w-2 rounded-full bg-brand-500" />}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
