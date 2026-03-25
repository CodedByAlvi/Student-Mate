import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { 
  Plus, Search, Pin, Trash2, ChevronLeft, Save, Maximize2, Minimize2, 
  Loader2, Copy, LayoutGrid, List, Edit3, Palette, MoreVertical, 
  Archive, Tag, Eye, EyeOff, Hash, Clock, FileText, CheckCircle2,
  Calendar, BookOpen, Share2, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn, generateId, isValidDate } from '../lib/utils';
import toast from 'react-hot-toast';
import { NoteSkeleton } from './Skeleton';
import { Note } from '../types';
import Markdown from 'react-markdown';
import { useDevice } from '../hooks/useDevice';

const NoteCard = memo(({ 
  note, 
  viewMode, 
  onEdit, 
  onPin, 
  onDelete 
}: { 
  note: Note; 
  viewMode: 'grid' | 'list';
  onEdit: (id: string) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      onClick={() => onEdit(note.id)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 transition-all hover:border-stone-900 hover:shadow-2xl hover:shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-white dark:hover:shadow-white/5",
        viewMode === 'list' && "flex items-center gap-6 py-4"
      )}
    >
      <div className={cn(
        "flex flex-1 flex-col gap-4",
        viewMode === 'list' && "flex-row items-center justify-between"
      )}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-1 w-4 rounded-full bg-stone-200 dark:bg-stone-800 transition-colors group-hover:bg-stone-900 dark:group-hover:bg-white" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
              {isValidDate(note.updatedAt) ? format(new Date(note.updatedAt), 'MMM d, yyyy') : 'TBD'}
            </span>
          </div>
          <h3 className="font-display text-xl font-bold tracking-tight text-stone-900 dark:text-white line-clamp-1">
            {note.title || 'Untitled Note'}
          </h3>
          {viewMode === 'grid' && (
            <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 line-clamp-3 font-serif">
              {note.content || 'No content yet...'}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(note.id, !note.isPinned);
              }}
              className={cn(
                "rounded-full p-2 transition-all",
                note.isPinned ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" : "text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              )}
            >
              <Pin className={cn("h-4 w-4", note.isPinned && "fill-current")} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="rounded-full p-2 text-stone-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
            <FileText className="h-3 w-3" />
            <span>{(note.content || '').split(/\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

NoteCard.displayName = 'NoteCard';

export default function Notebook() {
  const notes = useStore(state => state.notes);
  const addNote = useStore(state => state.addNote);
  const updateNote = useStore(state => state.updateNote);
  const deleteNote = useStore(state => state.deleteNote);
  const isLoading = useStore(state => state.isLoading);
  const setConfirmModal = useStore(state => state.setConfirmModal);
  const { isTablet, isDesktop } = useDevice();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPreview, setIsPreview] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
      note.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      note.content.toLowerCase().includes(debouncedSearch.toLowerCase())
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, debouncedSearch]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned), [filteredNotes]);

  const currentNote = useMemo(() => 
    notes.find(n => n.id === editingNoteId), 
    [notes, editingNoteId]
  );

  useEffect(() => {
    if (currentNote) {
      setLocalTitle(currentNote.title);
      setLocalContent(currentNote.content);
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!editingNoteId) return;
    setIsSaving(true);
    try {
      await updateNote(editingNoteId, {
        title: localTitle,
        content: localContent,
        updatedAt: new Date().toISOString()
      });
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const newNote = {
      id: generateId(),
      title: '',
      content: '',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    await addNote(newNote);
    setEditingNoteId(newNote.id);
    setIsPreview(false);
  };

  const handleCancel = () => {
    setEditingNoteId(null);
    setIsStudyMode(false);
  };

  const wordCount = localContent.split(/\s+/).filter(Boolean).length;
  const charCount = localContent.length;

  if (editingNoteId && currentNote) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "fixed inset-0 z-[60] bg-stone-50 dark:bg-[#050505] transition-colors duration-500",
          isStudyMode && "bg-white dark:bg-black"
        )}
      >
        <div className={cn(
          "mx-auto h-full flex flex-col transition-all duration-500",
          isStudyMode ? "max-w-4xl p-4 pt-20 sm:p-12 lg:p-24" : "max-w-6xl p-4 pt-20 sm:p-6 lg:p-12 gap-6 sm:gap-12"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button 
                onClick={handleCancel}
                className="group flex items-center gap-2 sm:gap-3 rounded-full bg-white px-3 sm:px-4 py-2 text-stone-500 shadow-sm transition-all hover:bg-stone-100 hover:text-stone-900 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-800"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">Cancel</span>
              </button>
              <button 
                onClick={async () => {
                  await handleSave();
                  setEditingNoteId(null);
                  setIsStudyMode(false);
                }}
                disabled={isSaving}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-brand-600 px-4 sm:px-6 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> : <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                Save
              </button>
              <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />
              <button 
                onClick={() => setIsPreview(!isPreview)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                  isPreview ? "bg-stone-900 text-white dark:bg-white dark:text-black" : "bg-white text-stone-500 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800"
                )}
              >
                {isPreview ? <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                {isPreview ? 'Edit' : 'Preview'}
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${localTitle}\n\n${localContent}`);
                    toast.success('Note copied as Markdown');
                  }}
                  className="rounded-full p-2.5 text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                  title="Copy Markdown"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsStudyMode(!isStudyMode)}
                  className={cn(
                    "rounded-full p-2.5 transition-all",
                    isStudyMode ? "bg-brand-100 text-brand-600 dark:bg-brand-900/30" : "text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
                  )}
                  title={isStudyMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                  {isStudyMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className={cn(
            "flex-1 flex flex-col transition-all duration-500",
            isStudyMode ? "gap-8 sm:gap-12" : "gap-6 sm:gap-8"
          )}>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {isValidDate(currentNote.updatedAt) ? format(new Date(currentNote.updatedAt), 'MMMM d, yyyy') : 'TBD'}
                  </span>
                </div>
              </div>
              <input 
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className={cn(
                  "w-full bg-transparent font-display font-bold outline-none placeholder:text-stone-200 dark:placeholder:text-stone-800 leading-tight transition-all break-words",
                  isStudyMode ? "text-4xl sm:text-7xl" : "text-3xl sm:text-5xl"
                )}
                placeholder="Untitled Note"
              />
            </div>

            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                {isPreview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "h-full w-full overflow-y-auto prose prose-stone dark:prose-invert max-w-none transition-all",
                      isStudyMode ? "prose-xl leading-[2]" : "prose-lg leading-[1.8]"
                    )}
                  >
                    <Markdown>{localContent || '_No content yet..._'}</Markdown>
                  </motion.div>
                ) : (
                  <motion.textarea 
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    ref={editorRef}
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    className={cn(
                      "h-full w-full resize-none bg-transparent font-serif outline-none placeholder:text-stone-200 dark:placeholder:text-stone-800 transition-all",
                      isStudyMode ? "text-xl sm:text-3xl leading-[1.8] sm:leading-[2]" : "text-lg sm:text-xl leading-[1.6] sm:leading-[1.8]"
                    )}
                    placeholder="Start your academic journey here... (Markdown supported)"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <AnimatePresence>
            {!isStudyMode && (
              <motion.footer 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-stone-200/50 pt-8 gap-6 dark:border-stone-800/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                  <button 
                    onClick={() => updateNote(currentNote.id, { isPinned: !currentNote.isPinned })}
                    className={cn(
                      "flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border",
                      currentNote.isPinned 
                        ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/10 dark:border-amber-900/30" 
                        : "bg-white border-stone-200 text-stone-400 hover:border-stone-400 dark:bg-stone-900 dark:border-stone-800 dark:hover:border-stone-700"
                    )}
                  >
                    <Pin className={cn("h-4 w-4", currentNote.isPinned && "fill-current")} />
                    {currentNote.isPinned ? 'Pinned' : 'Pin Note'}
                  </button>
                  <div className="flex items-center justify-center sm:justify-start gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-stone-300 dark:text-stone-700" />
                      <span className="text-stone-900 dark:text-stone-100">{wordCount}</span>
                      <span className="text-stone-300 dark:text-stone-700">Words</span>
                    </div>
                    <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
                    <div className="flex items-center gap-2">
                      <span className="text-stone-900 dark:text-stone-100">{charCount}</span>
                      <span className="text-stone-300 dark:text-stone-700">Chars</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                  <button 
                    onClick={() => {
                      setConfirmModal({
                        title: 'Delete Note',
                        message: 'This note will be permanently removed from your academic hub.',
                        onConfirm: () => {
                          deleteNote(currentNote.id);
                          setEditingNoteId(null);
                          toast.error('Note deleted');
                        }
                      });
                    }}
                    className="flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-stone-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.footer>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 px-4 sm:px-6 pb-24 max-w-full mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-6 sm:w-8 rounded-full bg-stone-900 dark:bg-white" />
            <h2 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400">Knowledge Repository</h2>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">Notebook</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl bg-stone-100 p-1 dark:bg-stone-900">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "rounded-xl p-2.5 transition-all",
                viewMode === 'grid' ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-white" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "rounded-xl p-2.5 transition-all",
                viewMode === 'list' ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-white" : "text-stone-400 hover:text-stone-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={() => handleCreate()}
            disabled={isLoading}
            className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-300 transition-colors group-focus-within:text-stone-900 dark:group-focus-within:text-white" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="w-full rounded-[2rem] border border-stone-200 bg-stone-50/50 py-5 pl-16 pr-8 text-base outline-none transition-all focus:border-stone-900 focus:bg-white focus:ring-4 focus:ring-stone-900/5 dark:border-stone-800 dark:bg-stone-900/10 dark:focus:border-white dark:focus:ring-white/5"
          />
        </div>
      </div>

      <div className="space-y-12">
        {isLoading && notes.length === 0 && (
          <div className={cn(
            "grid gap-6 sm:gap-8",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
          </div>
        )}

        {pinnedNotes.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Pin className="h-4 w-4 text-amber-500 fill-current" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Pinned Records</h3>
            </div>
            <div className={cn(
              "grid gap-6 sm:gap-8",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {pinnedNotes.map((note) => (
                  <NoteCard 
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onEdit={setEditingNoteId}
                    onPin={(id, isPinned) => {
                      updateNote(id, { isPinned });
                      toast.success(isPinned ? 'Note pinned' : 'Note unpinned');
                    }}
                    onDelete={(id) => {
                      setConfirmModal({
                        title: 'Delete Note',
                        message: 'This note will be permanently removed.',
                        onConfirm: () => {
                          deleteNote(id);
                          toast.error('Note deleted');
                        }
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {otherNotes.length > 0 && (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 text-stone-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Recent Records</h3>
              </div>
            )}
            <div className={cn(
              "grid gap-6 sm:gap-8",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout">
                {otherNotes.map((note) => (
                  <NoteCard 
                    key={note.id}
                    note={note}
                    viewMode={viewMode}
                    onEdit={setEditingNoteId}
                    onPin={(id, isPinned) => {
                      updateNote(id, { isPinned });
                      toast.success(isPinned ? 'Note pinned' : 'Note unpinned');
                    }}
                    onDelete={(id) => {
                      setConfirmModal({
                        title: 'Delete Note',
                        message: 'This note will be permanently removed.',
                        onConfirm: () => {
                          deleteNote(id);
                          toast.error('Note deleted');
                        }
                      });
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {filteredNotes.length === 0 && !isLoading && (
          <div className="py-32 text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center dark:bg-stone-900">
              <Archive className="h-10 w-10 text-stone-300" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold text-stone-900 dark:text-white">No records found</p>
              <p className="text-stone-500 dark:text-stone-400">Try adjusting your search or create a new note.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
