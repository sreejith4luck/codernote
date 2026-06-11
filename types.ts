/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Sun, 
  Moon, 
  Clock, 
  Calendar,
  AlertTriangle,
  FileText,
  Keyboard,
  ArrowRight,
  User,
  Github,
  Check,
  Download,
  FileJson,
  Activity,
  HeartPulse,
  Info,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle,
  HelpCircle,
  Hospital,
  Palette
} from 'lucide-react';
import { SectionType, CodingTags, CptToDxMap, CptToModMap } from './types';
import { AnimatePresence, motion } from 'motion/react';
import CodingQueueCard from './components/CodingQueueCard';
import { COMMON_DX, COMMON_CPT, COMMON_MODIFIERS } from './data';

export default function App() {
  // Theme state supporting light, dark, serene, and sage modes
  const [theme, setTheme] = useState<'light' | 'dark' | 'serene' | 'sage'>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mw-coding-theme');
      if (saved === 'dark' || saved === 'serene' || saved === 'sage') {
        return saved as 'light' | 'dark' | 'serene' | 'sage';
      }
    }
    return 'light';
  });

  // Active Gemini-like glowing animation state on build triggers
  const [isGeneratingGlow, setIsGeneratingGlow] = useState(false);

  // Custom tint background state for editable Compiled Medical Note box
  const [noteBoxColor, setNoteBoxColor] = useState<'slate' | 'blue' | 'green' | 'amber' | 'rose' | 'lavender'>('slate');

  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Input lists tags
  const [tags, setTags] = useState<CodingTags>({
    addDx: ['M54.50', 'I10', 'E11.9'],
    addCpt: ['99213', '36415', '10060'],
  });

  // Current inputs in simple tag fields
  const [inputs, setInputs] = useState<Record<SectionType, string>>({
    addDx: '',
    addCpt: '',
  });

  // Mapping states
  const [dxMaps, setDxMaps] = useState<CptToDxMap[]>([
    { id: 'dx1', cpt: '99213', dxs: ['M54.50', 'I10'] }
  ]);
  const [modMaps, setModMaps] = useState<CptToModMap[]>([
    { id: 'mod1', cpt: '99213', mods: ['25'] }
  ]);

  // Current individual input fields inside rows to allow typing before entering/tabbing
  const [mapInputValues, setMapInputValues] = useState<Record<string, string>>({});

  // Error/shake states
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generated note state
  const [generatedNote, setGeneratedNote] = useState<string>('');

  // Focused input element ID for rotating glowing animations
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);

  // User customizable Sage colors
  const [customSageColors, setCustomSageColors] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mw-sage-colors');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      bgApp: '#edf4f0',
      cardBg: '#f8faf9',
      textMain: '#132a1e',
      brandBlue: '#059669',
    };
  });

  const updateSageColor = (key: string, value: string) => {
    const next = { ...customSageColors, [key]: value };
    setCustomSageColors(next);
    localStorage.setItem('mw-sage-colors', JSON.stringify(next));
  };

  // Refs for focusing
  const addDxInputRef = useRef<HTMLInputElement>(null);
  const addCptInputRef = useRef<HTMLInputElement>(null);

  // Watch theme change
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'serene', 'sage');
    
    // Clear custom override properties first
    root.style.removeProperty('--bg-app');
    root.style.removeProperty('--card-bg');
    root.style.removeProperty('--text-main');
    root.style.removeProperty('--brand-blue');
    root.style.removeProperty('--brand-blue-hover');
    root.style.removeProperty('--border-light');
    root.style.removeProperty('--text-muted');
    root.style.removeProperty('--pill-bg');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'serene') {
      root.classList.add('serene');
    } else if (theme === 'sage') {
      root.classList.add('sage');
      // Inject customized colors
      root.style.setProperty('--bg-app', customSageColors.bgApp);
      root.style.setProperty('--card-bg', customSageColors.cardBg);
      root.style.setProperty('--text-main', customSageColors.textMain);
      root.style.setProperty('--brand-blue', customSageColors.brandBlue);
      root.style.setProperty('--brand-blue-hover', customSageColors.brandBlue + 'e0');
      // Helpers
      root.style.setProperty('--border-light', customSageColors.brandBlue + '30');
      root.style.setProperty('--pill-bg', customSageColors.brandBlue + '15');
      root.style.setProperty('--text-muted', customSageColors.textMain + '99');
    }
    localStorage.setItem('mw-coding-theme', theme);
  }, [theme, customSageColors]);

  // Clock updating loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync initial generated note on component mount
  useEffect(() => {
    createNoteText();
  }, [tags, dxMaps, modMaps]);

  // Helper to show a smart micro-toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to trigger a brief physical error shake on elements
  const triggerFieldError = (key: string) => {
    setShakeFields(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setShakeFields(prev => ({ ...prev, [key]: false }));
    }, 500);
  };

  // Format date parts helper
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  
  const formattedDate = currentTime.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Handle typing inside SectionType fields
  const handleInputChange = (section: SectionType, value: string) => {
    let cleaned = value.replace(/\s/g, '').toUpperCase();
    if (section.includes('Cpt')) {
      cleaned = cleaned.replace(/\D/g, ''); // CPT fields only allow digits
    }
    setInputs(prev => ({ ...prev, [section]: cleaned }));
  };

  // Handle custom tag insertion from input field
  const handleAddTag = (section: SectionType, code: string) => {
    const value = code.trim().toUpperCase();
    if (!value) return;

    // Direct CPT validation
    if (section.includes('Cpt') && value.length !== 5) {
      triggerToast('⚠ Validation Error: CPT codes must be exactly 5 digits.');
      triggerFieldError(section);
      return;
    }

    if (tags[section].includes(value)) {
      triggerToast(`Code ${value} is already in the queue.`);
      triggerFieldError(section);
      return;
    }

    setTags(prev => ({
      ...prev,
      [section]: [...prev[section], value]
    }));

    // Reset input value
    setInputs(prev => ({ ...prev, [section]: '' }));
    triggerToast(`Added tag: ${value}`);
  };

  // Tag validation and addition trigger on Tab / Enter
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    section: SectionType
  ) => {
    const value = inputs[section].trim();

    if (e.key === 'Tab' || e.key === 'Enter') {
      if (!value) {
        if (e.key === 'Enter') {
          e.preventDefault();
          advanceFocusFrom(section);
        }
        return; 
      }

      e.preventDefault();
      handleAddTag(section, value);
    } else if (e.key === 'Backspace' && !value) {
      if (tags[section].length > 0) {
        const updated = [...tags[section]];
        const removed = updated.pop();
        setTags(prev => ({ ...prev, [section]: updated }));
        triggerToast(`Removed tag: ${removed}`);
      }
    }
  };

  // Remove tag manually by clicking little cross
  const deleteTag = (section: SectionType, tagToDelete: string) => {
    setTags(prev => ({
      ...prev,
      [section]: prev[section].filter(t => t !== tagToDelete)
    }));
    triggerToast(`Removed tag: ${tagToDelete}`);
  };

  // Handle programmatic focus progression between primary block tags
  const advanceFocusFrom = (current: SectionType) => {
    if (current === 'addDx') {
      addCptInputRef.current?.focus();
    } else if (current === 'addCpt') {
      focusFirstMatrixField();
    }
  };

  const focusFirstMatrixField = () => {
    if (dxMaps.length > 0) {
      const firstId = dxMaps[0].id;
      const el = document.getElementById(`cpt-dx-${firstId}`);
      el?.focus();
      triggerToast('👉 Navigated to mapping fields');
    }
  };

  // MAPPING: CPT -> Diagnoses logic
  const handleCptDxMapFieldChange = (mapId: string, value: string) => {
    const cleaned = value.replace(/\D/g, ''); // CPT only allow digits
    setDxMaps(prev => prev.map(m => m.id === mapId ? { ...m, cpt: cleaned } : m));
  };

  const handleCptDxKeydown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    map: CptToDxMap,
    index: number
  ) => {
    const value = map.cpt.trim();

    if (e.key === 'Tab' || e.key === 'Enter') {
      if (!value) {
        e.preventDefault();
        const targetInput = document.getElementById(`dx-tags-input-${map.id}`);
        targetInput?.focus();
        return;
      }

      // If not blank, CPT validation must trigger
      if (value.length !== 5) {
        e.preventDefault();
        triggerToast('⚠ Validation Error: CPT in Mapping must be exactly 5 digits.');
        triggerFieldError(`cpt-dx-${map.id}`);
        return;
      }

      e.preventDefault();
      const targetInput = document.getElementById(`dx-tags-input-${map.id}`);
      targetInput?.focus();
    }
  };

  // Direct click-to-add for CPT DX rows
  const handleAddDxTagToRow = (rowId: string, code: string) => {
    const val = code.trim().toUpperCase();
    if (!val) return;

    const map = dxMaps.find(m => m.id === rowId);
    if (!map) return;

    if (map.dxs.includes(val)) {
      triggerToast(`Diagnosis ${val} is already mapped in this row.`);
      triggerFieldError(`dx-tags-container-${rowId}`);
      return;
    }

    setDxMaps(prev => prev.map(m => m.id === rowId ? { ...m, dxs: [...m.dxs, val] } : m));
    setMapInputValues(prev => ({ ...prev, [rowId]: '' }));
    triggerToast(`Mapped DX ${val} to CPT`);
  };

  const handleDxTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    map: CptToDxMap,
    mapIndex: number
  ) => {
    const val = (mapInputValues[map.id] || '').trim().toUpperCase();

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      
      if (val) {
        handleAddDxTagToRow(map.id, val);
      } else {
        const nextId = dxMaps[mapIndex + 1]?.id;
        if (nextId) {
          const nextInput = document.getElementById(`cpt-dx-${nextId}`);
          nextInput?.focus();
        } else {
          if (e.key === 'Tab') {
            // Tab on empty: create a new row to add more mapping
            const newId = `dx${Date.now()}`;
            setDxMaps(prev => [...prev, { id: newId, cpt: '', dxs: [] }]);
            setTimeout(() => {
              const nextInput = document.getElementById(`cpt-dx-${newId}`);
              nextInput?.focus();
            }, 50);
            triggerToast('➕ Created new diagnostic mapping line');
          } else {
            // Enter on empty: move to the next section
            const firstModId = modMaps[0]?.id;
            if (firstModId) {
              const nextInput = document.getElementById(`cpt-mod-${firstModId}`);
              nextInput?.focus();
            } else {
              const newId = `mod${Date.now()}`;
              setModMaps([{ id: newId, cpt: '', mods: [] }]);
              setTimeout(() => {
                const nextInput = document.getElementById(`cpt-mod-${newId}`);
                nextInput?.focus();
              }, 50);
            }
            triggerToast('👉 Navigated to modifier mappings');
          }
        }
      }
    } else if (e.key === 'Backspace' && !val) {
      if (map.dxs.length > 0) {
        const updatedDxs = [...map.dxs];
        const popped = updatedDxs.pop();
        setDxMaps(prev => prev.map(m => m.id === map.id ? { ...m, dxs: updatedDxs } : m));
        triggerToast(`Removed mapped DX: ${popped}`);
      }
    }
  };

  const deleteDxTagFromRow = (mapId: string, dxToDelete: string) => {
    setDxMaps(prev => prev.map(m => m.id === mapId ? { ...m, dxs: m.dxs.filter(d => d !== dxToDelete) } : m));
    triggerToast(`Unlinked diagnosis ${dxToDelete}`);
  };

  const addDxMapRow = () => {
    const newId = `dx${Date.now()}`;
    setDxMaps(prev => [...prev, { id: newId, cpt: '', dxs: [] }]);
    setTimeout(() => {
      document.getElementById(`cpt-dx-${newId}`)?.focus();
    }, 60);
    triggerToast('➕ Added mapping line');
  };

  const removeDxMapRow = (mapId: string) => {
    setDxMaps(prev => prev.filter(m => m.id !== mapId));
    triggerToast('✕ Eliminated mapping line');
  };

  // MAPPING: CPT -> Modifiers logic
  const handleCptModMapFieldChange = (mapId: string, value: string) => {
    const cleaned = value.replace(/\D/g, ''); // CPT only allow digits
    setModMaps(prev => prev.map(m => m.id === mapId ? { ...m, cpt: cleaned } : m));
  };

  const handleCptModKeydown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    map: CptToModMap,
    index: number
  ) => {
    const value = map.cpt.trim();

    if (e.key === 'Tab' || e.key === 'Enter') {
      if (!value) {
        e.preventDefault();
        const targetInput = document.getElementById(`mod-tags-input-${map.id}`);
        targetInput?.focus();
        return;
      }

      if (value.length !== 5) {
        e.preventDefault();
        triggerToast('⚠ Validation Error: CPT in Modifier mapping must be exactly 5 digits.');
        triggerFieldError(`cpt-mod-${map.id}`);
        return;
      }

      e.preventDefault();
      const targetInput = document.getElementById(`mod-tags-input-${map.id}`);
      targetInput?.focus();
    }
  };

  // Direct click-to-add for CPT Modifier rows
  const handleAddModTagToRow = (rowId: string, modCode: string) => {
    const val = modCode.trim().toUpperCase();
    if (!val) return;

    if (val.length !== 2) {
      triggerToast('⚠ Validation Error: Modifiers must be exactly 2 characters.');
      triggerFieldError(`mod-tags-container-${rowId}`);
      return;
    }

    const map = modMaps.find(m => m.id === rowId);
    if (!map) return;

    if (map.mods.includes(val)) {
      triggerToast(`Modifier ${val} is already mapped in this row.`);
      triggerFieldError(`mod-tags-container-${rowId}`);
      return;
    }

    setModMaps(prev => prev.map(m => m.id === rowId ? { ...m, mods: [...m.mods, val] } : m));
    setMapInputValues(prev => ({ ...prev, [rowId]: '' }));
    triggerToast(`Added modifier ${val}`);
  };

  const handleModTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    map: CptToModMap,
    mapIndex: number
  ) => {
    const val = (mapInputValues[map.id] || '').trim().toUpperCase();

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();

      if (val) {
        handleAddModTagToRow(map.id, val);
      } else {
        const nextId = modMaps[mapIndex + 1]?.id;
        if (nextId) {
          const nextInput = document.getElementById(`cpt-mod-${nextId}`);
          nextInput?.focus();
        } else {
          if (e.key === 'Tab') {
            // Tab on empty: create a new row to modifier list
            const newId = `mod${Date.now()}`;
            setModMaps(prev => [...prev, { id: newId, cpt: '', mods: [] }]);
            setTimeout(() => {
              const nextInput = document.getElementById(`cpt-mod-${newId}`);
              nextInput?.focus();
            }, 50);
            triggerToast('➕ Created new modifier mapping line');
          } else {
            // Enter on empty: trigger compile and focus the Compiled Note text field
            compileNoteAndFocus();
          }
        }
      }
    } else if (e.key === 'Backspace' && !val) {
      if (map.mods.length > 0) {
        const updatedMods = [...map.mods];
        const popped = updatedMods.pop();
        setModMaps(prev => prev.map(m => m.id === map.id ? { ...m, mods: updatedMods } : m));
        triggerToast(`Removed modifier: ${popped}`);
      }
    }
  };

  const deleteModTagFromRow = (mapId: string, modToDelete: string) => {
    setModMaps(prev => prev.map(m => m.id === mapId ? { ...m, mods: m.mods.filter(mod => mod !== modToDelete) } : m));
    triggerToast(`Unlinked modifier ${modToDelete}`);
  };

  const addModMapRow = () => {
    const newId = `mod${Date.now()}`;
    setModMaps(prev => [...prev, { id: newId, cpt: '', mods: [] }]);
    setTimeout(() => {
      document.getElementById(`cpt-mod-${newId}`)?.focus();
    }, 60);
    triggerToast('➕ Added modifier line');
  };

  const removeModMapRow = (mapId: string) => {
    setModMaps(prev => prev.filter(m => m.id !== mapId));
    triggerToast('✕ Eliminated modifier mapping line');
  };

  // GENERATE NOTE LOGIC
  const createNoteText = () => {
    const items: string[] = ['As per MR review'];

    if (tags.addDx.length > 0) {
      items.push(`DX [${tags.addDx.join(', ')}]`);
    }
    if (tags.addCpt.length > 0) {
      items.push(`CPT [${tags.addCpt.join(', ')}]`);
    }

    // Capture CPT to DX maps
    const cleanDxMap = dxMaps.filter(m => m.cpt.trim() && m.dxs.length > 0);
    if (cleanDxMap.length > 0) {
      const mapSegments = cleanDxMap.map(m => `${m.cpt}→${m.dxs.join(',')}`);
      items.push(`MAPPING CPT→DX ${mapSegments.join('; ')}`);
    }

    // Capture CPT to Mod maps
    const cleanModMap = modMaps.filter(m => m.cpt.trim() && m.mods.length > 0);
    if (cleanModMap.length > 0) {
      const modSegments = cleanModMap.map(m => `${m.cpt}→${m.mods.join(',')}`);
      items.push(`MAPPING CPT→MOD ${modSegments.join('; ')}`);
    }

    const compiled = items.join(', ') + '.';
    setGeneratedNote(compiled);
    return compiled;
  };

  const handleGenerateClick = () => {
    setIsGeneratingGlow(true);
    const note = createNoteText();
    triggerToast('⚡ Medical billing note compiled and polished with Gemini Glow!');
    setTimeout(() => {
      setIsGeneratingGlow(false);
    }, 1200);
  };

  const compileNoteAndFocus = () => {
    handleGenerateClick();
    setTimeout(() => {
      const textarea = document.getElementById('medical-note-textarea');
      if (textarea) {
        textarea.focus();
        (textarea as HTMLTextAreaElement).select();
      }
    }, 150);
  };

  const copyNoteClipboard = () => {
    const note = generatedNote || createNoteText();
    navigator.clipboard.writeText(note).then(() => {
      triggerToast('📋 Copied Medical Note to Clipboard!');
    }).catch(() => {
      triggerToast('📋 Unable to auto-copy; code highlighted below.');
    });
  };

  const handleCopyAndClearAll = () => {
    const finishedNote = generatedNote || createNoteText();
    navigator.clipboard.writeText(finishedNote).then(() => {
      triggerToast('📋 Copy complete! Dynamic board purged.');
      handleClearAll();
    }).catch(() => {
      triggerToast('📋 Highlighted medical logs below.');
    });
  };

  const handleClearAll = () => {
    setTags({
      addDx: [],
      addCpt: [],
    });
    setInputs({
      addDx: '',
      addCpt: '',
    });
    setDxMaps([{ id: 'dx1', cpt: '', dxs: [] }]);
    setModMaps([{ id: 'mod1', cpt: '', mods: [] }]);
    setMapInputValues({});
    setGeneratedNote('');
    triggerToast('✕ Interactive dashboard purged smoothly');
  };

  // EXPORT FUNCTIONS (SaaS requirement #4)
  const exportAsPlainText = () => {
    const text = generatedNote || createNoteText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_billing_note_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📥 Downloaded Plain Text Note file');
  };

  const exportAsJSON = () => {
    const dataObj = {
      compiledAt: new Date().toISOString(),
      tags,
      diagnosesMapping: dxMaps.filter(m => m.cpt.trim() && m.dxs.length > 0),
      modifiersMapping: modMaps.filter(m => m.cpt.trim() && m.mods.length > 0),
      compiledNote: generatedNote || createNoteText()
    };
    const text = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_billing_package_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📦 Downloaded structured JSON file');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      if ((isCtrl && e.key.toLowerCase() === 'g') || (isAlt && e.key.toLowerCase() === 'n')) {
        e.preventDefault();
        handleGenerateClick();
      }
      if ((isCtrl && e.shiftKey && e.key.toLowerCase() === 'c') || (isAlt && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        handleCopyAndClearAll();
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [tags, dxMaps, modMaps, generatedNote]);

  // Count active modifications for stats banner
  const totalDxTags = tags.addDx.length;
  const totalCptTags = tags.addCpt.length;
  const activeDxLinks = dxMaps.filter(m => m.cpt && m.dxs.length > 0).length;
  const activeModLinks = modMaps.filter(m => m.cpt && m.mods.length > 0).length;

  return (
    <div className="relative min-h-screen font-sans antialiased text-[var(--text-main)] transition-colors duration-200">
      <div className="bg-grid"></div>
      <div className="bg-glow"></div>

      {/* Main SaaS Layout Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* PREMIUM CONSOLE HEADER */}
        <header className="bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Clinical Branding Emblem */}
            <div className="h-14 w-14 bg-gradient-to-tr from-rose-500 via-red-600 to-rose-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-red-500/10 shrink-0">
              <Hospital className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/40 font-display">
                  v3.4 Release
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  SaaS Core Workspace
                </span>
              </div>
              <h1 className="text-2xl font-black font-display tracking-tight text-[var(--text-main)] mt-1">
                Midwest Coders <span className="text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text">SaaS Workspace</span>
              </h1>
            </div>
          </div>

          {/* Unified Controls & Widgets Shelf */}
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            {/* Live UTC Clock & Calendar */}
            <div className="hidden sm:flex items-center gap-3 bg-[var(--pill-bg)] border border-[var(--border-light)] px-4 py-2 rounded-xl">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white dark:bg-slate-900 shadow-2xs text-[var(--brand-blue)]">
                <Clock className="h-4 w-4 animate-pulse-subtle" />
              </div>
              <div className="flex flex-col text-right">
                <span className="font-mono text-sm font-bold tracking-wider text-[var(--text-main)] leading-none mb-0.5">
                  {formattedTime}
                </span>
                <span className="text-[9.5px] text-[var(--text-muted)] uppercase tracking-widest font-extrabold flex items-center gap-1 justify-end leading-none font-sans">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Premium Theme switch pill tab group */}
            <div className="flex bg-[var(--pill-bg)] p-1 rounded-xl border border-[var(--border-light)] gap-1">
              {(['light', 'dark', 'serene', 'sage'] as const).map((mode) => {
                const getLabel = () => {
                  if (mode === 'light') return <><Sun className="h-3.5 w-3.5 text-blue-500" /> <span className="hidden lg:inline text-[10px]">Light</span></>;
                  if (mode === 'dark') return <><Moon className="h-3.5 w-3.5 text-indigo-400" /> <span className="hidden lg:inline text-[10px]">Dark</span></>;
                  if (mode === 'serene') return <><User className="h-3.5 w-3.5 text-violet-500" /> <span className="hidden lg:inline text-[10px]">Serene</span></>;
                  return <><Sparkles className="h-3.5 w-3.5 text-emerald-500" /> <span className="hidden lg:inline text-[10px]">Sage</span></>;
                };
                
                return (
                  <button 
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold tracking-tight transition-all cursor-pointer ${
                      theme === mode 
                        ? 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-xs border border-[var(--border-light)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                    title={`${mode.toUpperCase()} color scheme`}
                    aria-label={`Toggle ${mode} color scheme`}
                  >
                    {getLabel()}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* SAGE PALETTE CUSTOMIZATION BENCHES */}
        <AnimatePresence>
          {theme === 'sage' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-light)] pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                      Sage Theme Studio Builder
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      Tailor medical layout styles, hex spectrum inputs & clinical color ranges.
                    </p>
                  </div>
                </div>
                {/* Designer Presets */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider mr-1">
                    Presets:
                  </span>
                  {[
                    { name: 'Moss Garden 🍃', bgApp: '#edf4f0', cardBg: '#f8faf9', textMain: '#132a1e', brandBlue: '#059669' },
                    { name: 'Matcha Tea 🍵', bgApp: '#faf6ee', cardBg: '#fffdfa', textMain: '#322107', brandBlue: '#4f772d' },
                    { name: 'Bonsai Mists 🎋', bgApp: '#ebf1ee', cardBg: '#f5f8f6', textMain: '#142921', brandBlue: '#31572c' },
                    { name: 'Sakura Blush 🌸', bgApp: '#faf3f5', cardBg: '#fffbfc', textMain: '#3a1c24', brandBlue: '#be185d' },
                    { name: 'Nordic Spruce 🌲', bgApp: '#d8e2dc', cardBg: '#f4f8f6', textMain: '#1d2d24', brandBlue: '#2f3e46' },
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setCustomSageColors(p)}
                      className="text-[10.5px] px-2.5 py-1 bg-[var(--pill-bg)] hover:bg-[var(--pill-border)] text-[var(--text-main)] rounded-md font-bold transition-all border border-[var(--border-light)] cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                  {/* Reset option */}
                  <button
                    type="button"
                    onClick={() => {
                      const defaultColors = {
                        bgApp: '#edf4f0',
                        cardBg: '#f8faf9',
                        textMain: '#132a1e',
                        brandBlue: '#059669',
                      };
                      setCustomSageColors(defaultColors);
                      localStorage.setItem('mw-sage-colors', JSON.stringify(defaultColors));
                    }}
                    className="text-[10.5px] px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-100 rounded-md font-bold transition-all border border-rose-200 dark:border-rose-900/30 cursor-pointer"
                    title="Reset colors to dynamic clinical defaults"
                  >
                    Reset 🔄
                  </button>
                </div>
              </div>

              {/* Hex Custom input fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Background Canvas', key: 'bgApp' },
                  { label: 'Card surfaces', key: 'cardBg' },
                  { label: 'Forest typography', key: 'textMain' },
                  { label: 'Primary branding', key: 'brandBlue' },
                ].map(item => (
                  <div key={item.key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider block">
                      {item.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customSageColors[item.key as keyof typeof customSageColors]}
                        onChange={(e) => updateSageColor(item.key, e.target.value)}
                        className="h-7 w-7 rounded-md cursor-pointer border border-[var(--border-light)] p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={customSageColors[item.key as keyof typeof customSageColors]}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            updateSageColor(item.key, val);
                          }
                        }}
                        className="flex-1 text-xs font-mono font-bold uppercase py-1 px-2 border border-[var(--border-light)] rounded-md bg-[var(--card-bg)] text-[var(--text-main)] outline-hidden focus:ring-1 focus:ring-[var(--brand-blue)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE LAYOUT - TWO-COLUMN PRIMARY WORKBENCH */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* LEFT COLUMN PANEL: RAPID INPUT QUEUES */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                <ChevronRight className="h-4.5 w-4.5 text-indigo-500" />
                Input Management Center
              </h2>
              <span className="text-[10.5px] text-[var(--text-muted)] font-medium">Auto-validating input streams</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DX QUEUE */}
              <CodingQueueCard
                title="Diagnosis (DX)"
                section="addDx"
                tags={tags.addDx}
                onDeleteTag={deleteTag}
                onAddTag={handleAddTag}
                inputValue={inputs.addDx}
                onInputChange={(sec, val) => handleInputChange(sec, val)}
                placeholder="+ DX (e.g. M54.5)"
                badgeText="ICD-10-CM"
                accentColor="green"
                inputRef={addDxInputRef}
                isErrorShake={!!shakeFields['addDx']}
                onAdvanceFocus={() => advanceFocusFrom('addDx')}
              />

              {/* CPT QUEUE */}
              <CodingQueueCard
                title="Procedure (CPT)"
                section="addCpt"
                tags={tags.addCpt}
                onDeleteTag={deleteTag}
                onAddTag={handleAddTag}
                inputValue={inputs.addCpt}
                onInputChange={(sec, val) => handleInputChange(sec, val)}
                placeholder="+ CPT (5 Digits)"
                badgeText="Procedural"
                accentColor="blue"
                inputRef={addCptInputRef}
                isErrorShake={!!shakeFields['addCpt']}
                onAdvanceFocus={() => advanceFocusFrom('addCpt')}
              />
            </div>
            
            {/* INSTRUCTION DECK SHORTCUTS */}
            <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border-light)] shadow-2xs space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-1.5">
                <Keyboard className="h-4 w-4 text-indigo-500 animate-pulse-subtle" />
                SaaS Power-User Keyboard Guide
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-1.5 pb-1">
                  <span>Enter / Tab on Blank Field</span>
                  <kbd className="font-mono bg-[var(--pill-bg)] px-1.5 py-0.5 rounded text-[9.5px] border border-[var(--pill-border)] font-semibold">Jump Next Input</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-1.5 pb-1">
                  <span>Tab / Enter with Text typed</span>
                  <kbd className="font-mono bg-[var(--pill-bg)] px-1.5 py-0.5 rounded text-[9.5px] border border-[var(--pill-border)] font-semibold">Commit &amp; Append Tag</kbd>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-1.5 pb-1 sm:border-0">
                  <span>Any incomplete code entry</span>
                  <span className="text-red-500 font-bold uppercase text-[9px]">Errors Shakes frame</span>
                </div>
                <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-1.5 pb-1 sm:border-0">
                  <span>Delete Tag on Empty box</span>
                  <kbd className="font-mono bg-[var(--pill-bg)] px-1.5 py-0.5 rounded text-[9.5px] border border-[var(--pill-border)] font-semibold">Backspace</kbd>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN PANEL: INTERACTIVE CODE MAPPING ENGINE */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                <ChevronRight className="h-4.5 w-4.5 text-purple-500" />
                Matrix Association Board
              </h2>
              <span className="text-[10.5px] text-[var(--text-muted)] font-medium">Procedural mapping linkages</span>
            </div>

            {/* DIAGNOSIS TO CPT LINK MAP */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border-light)] bg-slate-50/40 dark:bg-slate-900/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-xs shadow-purple-500/20"></div>
                  <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-main)]">
                    CPT &rarr; DX Diagnoses Matrix Linking
                  </h3>
                </div>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full font-bold border border-purple-100 dark:border-purple-900/20">
                  Matrix Linking
                </span>
              </div>

              {/* DX Mapping Table Container */}
              <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
                {dxMaps.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-[var(--text-muted)] italic">No diagnostic linkages established. Expand below.</p>
                  </div>
                ) : (
                  dxMaps.map((row, index) => {
                    const isCptInQueue = tags.addCpt.includes(row.cpt);
                    return (
                      <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/45 dark:bg-slate-900/20 p-3 rounded-xl border border-[var(--border-light)]">
                        
                        {/* CPT Selector Box */}
                        <div className="flex items-center gap-2 w-full sm:w-36 shrink-0 relative">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">CPT:</span>
                          <div className="relative flex-1">
                            {focusedFieldId === `cpt-dx-${row.id}` && (
                              <div className="absolute inset-[-2px] rounded-lg overflow-hidden pointer-events-none z-0">
                                <div className="absolute top-1/2 left-1/2 h-[300%] w-[300%] bg-[conic-gradient(from_180deg,#ff007f,#7f00ff,#00f0ff,#00ff7f,#ff007f)] animate-rotate-glow pointer-events-none" />
                              </div>
                            )}
                            <input
                              id={`cpt-dx-${row.id}`}
                              type="text"
                              placeholder="99213"
                              maxLength={5}
                              value={row.cpt}
                              onChange={e => handleCptDxMapFieldChange(row.id, e.target.value)}
                              onKeyDown={e => handleCptDxKeydown(e, row, index)}
                              onFocus={() => setFocusedFieldId(`cpt-dx-${row.id}`)}
                              onBlur={() => setFocusedFieldId(null)}
                              className={`relative z-10 w-full bg-[var(--card-bg)] border ${shakeFields[`cpt-dx-${row.id}`] ? 'border-red-500 animate-error' : 'border-[var(--border-light)]'} px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-purple-500`}
                            />
                            {isCptInQueue && (
                              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 animate-ping z-20" title="CPT present inside procedure queue tracker" />
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-purple-400 shrink-0" />
                        </div>

                        {/* Associative diagnosis tag shelf */}
                        <div className="relative flex-1 min-h-[40px]">
                          {focusedFieldId === `dx-tags-input-${row.id}` && (
                            <div className="absolute inset-[-2px] rounded-lg overflow-hidden pointer-events-none z-0">
                              <div className="absolute top-1/2 left-1/2 h-[300%] w-[300%] bg-[conic-gradient(from_180deg,#ff007f,#7f00ff,#00f0ff,#00ff7f,#ff007f)] animate-rotate-glow pointer-events-none" />
                            </div>
                          )}
                          <div 
                            id={`dx-tags-container-${row.id}`}
                            className={`relative z-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--card-bg)] border ${shakeFields[`dx-tags-container-${row.id}`] ? 'border-red-500 animate-error' : 'border-[var(--border-light)]'} rounded-lg min-h-[40px]`}
                          >
                            {row.dxs.map(dx => (
                              <span key={dx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10.5px] font-black font-mono bg-blue-50 text-blue-800 border border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/20">
                                {dx}
                                <button
                                  type="button"
                                  onClick={() => deleteDxTagFromRow(row.id, dx)}
                                  className="text-blue-500 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                            
                            {/* Autocomplete DX typing block */}
                            <div className="flex-1 relative min-w-[100px]">
                              <input
                                id={`dx-tags-input-${row.id}`}
                                type="text"
                                value={mapInputValues[row.id] || ''}
                                onChange={e => setMapInputValues(prev => ({ ...prev, [row.id]: e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase() }))}
                                onKeyDown={e => handleDxTagInputKeyDown(e, row, index)}
                                onFocus={() => setFocusedFieldId(`dx-tags-input-${row.id}`)}
                                onBlur={() => setFocusedFieldId(null)}
                                placeholder="+ Type DX & Tab"
                                className="w-full bg-transparent text-xs font-semibold outline-hidden text-[var(--text-main)] placeholder-[var(--text-muted)] uppercase tracking-wide"
                              />
                              {/* Fast click helper badge for typed DX */}
                              {mapInputValues[row.id] && (
                                <button
                                  type="button"
                                  onClick={() => handleAddDxTagToRow(row.id, mapInputValues[row.id])}
                                  className="absolute right-1 top-0.5 text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-1.5 py-0.5 rounded-md"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete row mapping */}
                        {dxMaps.length > 1 && (
                          <button
                            onClick={() => removeDxMapRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete mapping connection"
                            aria-label={`Remove dynamic mapping row`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Action pill row bottom of card */}
              <div className="px-6 py-4 border-t border-[var(--border-light)] flex justify-between items-center bg-slate-50/20 dark:bg-transparent rounded-b-2xl">
                <span className="text-[10.5px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-purple-400" />
                  Type custom codes freely to establish interactive associations
                </span>
                <button
                  onClick={addDxMapRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 transition-all cursor-pointer shadow-3xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Link Line
                </button>
              </div>
            </motion.div>


            {/* CPT TO MODIFIER APPENDER BOARD */}
            <motion.div 
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-light)] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-[var(--border-light)] bg-slate-50/40 dark:bg-slate-900/10 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-pink-500 shadow-xs shadow-pink-500/20"></div>
                  <h3 className="text-xs font-bold font-display uppercase tracking-widest text-[var(--text-main)]">
                    CPT &rarr; Modifiers Link Appender
                  </h3>
                </div>
                <span className="text-[10px] bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 rounded-full font-bold border border-pink-100 dark:border-pink-900/20">
                  Level Modifier
                </span>
              </div>

              {/* Modifier mapping rows */}
              <div className="p-6 space-y-4 max-h-[360px] overflow-y-auto">
                {modMaps.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-[var(--text-muted)] italic">No modifier linkages established. Expand below.</p>
                  </div>
                ) : (
                  modMaps.map((row, index) => {
                    const isCptInQueue = tags.addCpt.includes(row.cpt);
                    return (
                      <div key={row.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/45 dark:bg-slate-900/20 p-3 rounded-xl border border-[var(--border-light)]">
                        
                        {/* CPT Selection */}
                        <div className="flex items-center gap-2 w-full sm:w-36 shrink-0 relative">
                          <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest">CPT:</span>
                          <div className="relative flex-1">
                            {focusedFieldId === `cpt-mod-${row.id}` && (
                              <div className="absolute inset-[-2px] rounded-lg overflow-hidden pointer-events-none z-0">
                                <div className="absolute top-1/2 left-1/2 h-[300%] w-[300%] bg-[conic-gradient(from_180deg,#ff007f,#7f00ff,#00f0ff,#00ff7f,#ff007f)] animate-rotate-glow pointer-events-none" />
                              </div>
                            )}
                            <input
                              id={`cpt-mod-${row.id}`}
                              type="text"
                              placeholder="10060"
                              maxLength={5}
                              value={row.cpt}
                              onChange={e => handleCptModMapFieldChange(row.id, e.target.value)}
                              onKeyDown={e => handleCptModKeydown(e, row, index)}
                              onFocus={() => setFocusedFieldId(`cpt-mod-${row.id}`)}
                              onBlur={() => setFocusedFieldId(null)}
                              className={`relative z-10 w-full bg-[var(--card-bg)] border ${shakeFields[`cpt-mod-${row.id}`] ? 'border-red-500 animate-error' : 'border-[var(--border-light)]'} px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase text-[var(--text-main)] focus:outline-hidden focus:ring-1 focus:ring-pink-500`}
                            />
                            {isCptInQueue && (
                              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 animate-ping z-20" />
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-pink-400 shrink-0" />
                        </div>

                        {/* Modifiers Pill box */}
                        <div className="relative flex-1 min-h-[40px]">
                          {focusedFieldId === `mod-tags-input-${row.id}` && (
                            <div className="absolute inset-[-2px] rounded-lg overflow-hidden pointer-events-none z-0">
                              <div className="absolute top-1/2 left-1/2 h-[300%] w-[300%] bg-[conic-gradient(from_180deg,#ff007f,#7f00ff,#00f0ff,#00ff7f,#ff007f)] animate-rotate-glow pointer-events-none" />
                            </div>
                          )}
                          <div 
                            id={`mod-tags-container-${row.id}`}
                            className={`relative z-10 flex flex-wrap items-center gap-1.5 p-1.5 bg-[var(--card-bg)] border ${shakeFields[`mod-tags-container-${row.id}`] ? 'border-red-500 animate-error' : 'border-[var(--border-light)]'} rounded-lg min-h-[40px]`}
                          >
                            {row.mods.map(mod => (
                              <span key={mod} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10.5px] font-black font-mono bg-rose-50 text-rose-805 border border-rose-200/50 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/20">
                                {mod}
                                <button
                                  type="button"
                                  onClick={() => deleteModTagFromRow(row.id, mod)}
                                  className="text-red-500 hover:text-red-700 transition-colors ml-0.5 cursor-pointer font-black"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                            
                            {/* Modifier custom autocomplete field */}
                            <div className="flex-1 relative min-w-[80px]">
                              <input
                                id={`mod-tags-input-${row.id}`}
                                type="text"
                                maxLength={2}
                                value={mapInputValues[row.id] || ''}
                                onChange={e => setMapInputValues(prev => ({ ...prev, [row.id]: e.target.value.replace(/[^A-Za-z0-9]/gi, '').toUpperCase() }))}
                                onKeyDown={e => handleModTagInputKeyDown(e, row, index)}
                                onFocus={() => setFocusedFieldId(`mod-tags-input-${row.id}`)}
                                onBlur={() => setFocusedFieldId(null)}
                                placeholder="+ (2 char)"
                                className="w-full bg-transparent text-xs font-semibold outline-hidden text-[var(--text-main)] placeholder-[var(--text-muted)] uppercase tracking-wide"
                              />
                              {/* Instant add float button inside */}
                              {mapInputValues[row.id] && mapInputValues[row.id].length === 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleAddModTagToRow(row.id, mapInputValues[row.id])}
                                  className="absolute right-1 top-0.5 text-[9px] bg-pink-600 hover:bg-pink-700 text-white font-bold px-1.5 py-0.5 rounded-md"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mod map row deleting option */}
                        {modMaps.length > 1 && (
                          <button
                            onClick={() => removeModMapRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete modifier connection"
                            aria-label={`Remove level modifier row`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modifier suggestion dictionary footer */}
              <div className="px-6 py-4 border-t border-[var(--border-light)] flex flex-wrap justify-between items-center gap-3 bg-slate-50/20 dark:bg-transparent rounded-b-2xl">
                <span className="text-[10.5px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-pink-400" />
                  Type standard 2-character identifiers in the modifier blocks
                </span>
                <button
                  onClick={addModMapRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-pink-700 dark:text-pink-400 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/20 dark:hover:bg-pink-950/40 border border-pink-200 dark:border-pink-850/40 transition-all cursor-pointer shadow-3xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Modifier Line
                </button>
              </div>
            </motion.div>

          </section>

        </main>

        {/* BOTTOM FULL-WIDTH WORKSPACE PANEL: COMPILED MEDICAL NOTE EDITOR */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-[var(--card-bg)] border border-[var(--border-light)] rounded-2xl p-6.5 shadow-md relative overflow-hidden space-y-5"
        >
          {/* Glowing Gemini compiler background effect */}
          {isGeneratingGlow && (
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl animate-sweep z-30" />
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText className="h-5 w-5 animate-pulse-subtle" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-display uppercase tracking-widest text-[var(--text-main)]">
                  Compiled Billing Transcript Note
                </h3>
                <p className="text-[10.5px] text-[var(--text-muted)] font-medium mt-0.5">
                  Interactive clinically formatted annotation log outputs
                </p>
              </div>
            </div>

            {/* Display indicators */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              {isGeneratingGlow ? (
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-[#2563eb] dark:text-indigo-300 bg-blue-50/80 dark:bg-indigo-950/45 px-3 py-1 rounded-lg font-extrabold animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  Synthesizing billing payload...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg font-bold border border-[var(--border-light)]">
                  Note Synced
                </span>
              )}
            </div>
          </div>

          {/* BACKGROUND TINT DOTS CHOOSER & METRICS STATS COLUMN */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/40 dark:bg-slate-900/15 p-4 rounded-xl border border-[var(--border-light)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[10.5px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Workspace Canvas Background Accent:
              </span>
              <div className="flex items-center gap-1.5">
                {(['slate', 'blue', 'green', 'amber', 'rose', 'lavender'] as const).map(color => {
                  const selectorClasses: Record<string, string> = {
                    slate: 'bg-slate-200 dark:bg-slate-800',
                    blue: 'bg-blue-100 dark:bg-blue-900',
                    green: 'bg-emerald-100 dark:bg-emerald-900',
                    amber: 'bg-amber-100 dark:bg-amber-900/60',
                    rose: 'bg-rose-100 dark:bg-rose-900/50',
                    lavender: 'bg-indigo-100 dark:bg-indigo-900/60',
                  };
                  return (
                    <button
                      key={color}
                      onClick={() => setNoteBoxColor(color)}
                      className={`w-6.5 h-6.5 rounded-full border-2 ${noteBoxColor === color ? 'border-indigo-600 dark:border-white scale-110 shadow-xs ring-4 ring-indigo-500/10' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'} transition-all cursor-pointer ${selectorClasses[color]}`}
                      title={`${color.toUpperCase()} backdrop theme`}
                      aria-label={`Select ${color} background tint`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Micro details counter */}
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono self-end md:self-auto font-medium">
              <span>Chars: <b>{generatedNote.length}</b></span>
              <span className="text-[var(--border-light)]">|</span>
              <span>Words: <b>{generatedNote.split(/\s+/).filter(Boolean).length}</b></span>
              <span className="text-[var(--border-light)]">|</span>
              <span className="text-[var(--brand-blue)] font-bold">Standard format (US)</span>
            </div>
          </div>

          {/* EDITABLE BILLING CONSOLE DOCK */}
          <div className="relative">
            {focusedFieldId === 'medical-note-textarea' && (
              <div className="absolute inset-[-2px] rounded-xl overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/2 h-[300%] w-[300%] bg-[conic-gradient(from_180deg,#ff007f,#7f00ff,#00f0ff,#00ff7f,#ff007f)] animate-rotate-glow pointer-events-none" />
              </div>
            )}
            {/* Visual Editor line counters for prestige bento appearance */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-100/50 dark:bg-slate-900/30 border-r border-[var(--border-light)] flex flex-col items-center pt-3 select-none text-[10px] font-mono text-[var(--text-muted)] mt-1.5 rounded-l-xl z-20">
              <div>01</div>
              <div>02</div>
              <div>03</div>
              <div>04</div>
            </div>

            <textarea
              id="medical-note-textarea"
              value={generatedNote}
              onChange={e => setGeneratedNote(e.target.value)}
              onFocus={() => setFocusedFieldId('medical-note-textarea')}
              onBlur={() => setFocusedFieldId(null)}
              placeholder="Proceed to list diagnostic/procedural items or link tags inside mappings onto the right panels... Tap '⚡ Compile Note' to synthesize logs automatically."
              className={`relative z-10 w-full min-h-[140px] pl-11 pr-4 py-3 font-mono text-xs leading-relaxed rounded-xl border outline-hidden transition-all text-slate-900 dark:text-slate-100 ${
                noteBoxColor === 'slate' ? 'bg-slate-50 dark:bg-[#080c14] border-slate-200 dark:border-slate-800' :
                noteBoxColor === 'blue' ? 'bg-blue-50 dark:bg-[#0c162d] border-blue-200 dark:border-blue-900/40' :
                noteBoxColor === 'green' ? 'bg-emerald-50 dark:bg-[#0d2217] border-emerald-100 dark:border-emerald-900/40' :
                noteBoxColor === 'amber' ? 'bg-amber-50 dark:bg-[#1a140d] border-amber-100 dark:border-amber-900/40' :
                noteBoxColor === 'rose' ? 'bg-rose-50 dark:bg-[#1f0f15] border-rose-100 dark:border-rose-900/40' :
                'bg-purple-50 dark:bg-[#190d23] border-purple-100 dark:border-purple-900/40'
              }`}
              aria-label="Compiled Medical Note output textarea"
            />
          </div>

          {/* DUAL LAYER ACTION BUTTON PLATFORM */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* PRIMARY COMPILE ACTION */}
              <button
                onClick={handleGenerateClick}
                className="flex items-center justify-center gap-2 py-2.5 px-4.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-97 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-indigo-200 animate-pulse-subtle" />
                Compile Billing Note
              </button>

              {/* CLIPBOARD LOGISTICS */}
              <button
                onClick={copyNoteClipboard}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-97 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                Copy Transcript
              </button>

              {/* COPY AND CLEAR OUT FLOW */}
              <button
                onClick={handleCopyAndClearAll}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-97 cursor-pointer"
                title="Copies compiled note to clipboard and clears the entire workspace dashboard"
              >
                <Check className="h-4 w-4" />
                Copy &amp; Purge Board
              </button>
            </div>

            {/* EXPORT OPTIONS GRID (Requirement #4) */}
            <div className="flex items-center gap-2.5 self-center sm:self-auto">
              <span className="text-[10.5px] font-bold text-[var(--text-muted)] uppercase tracking-widest hidden md:inline">
                SaaS Exports:
              </span>
              <button
                onClick={exportAsPlainText}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--pill-bg)] hover:bg-[var(--pill-border)] text-[var(--text-main)] rounded-lg text-xs font-bold border border-[var(--border-light)] transition-all cursor-pointer"
                title="Download standard clinical txt note file"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Text File</span>
              </button>
              <button
                onClick={exportAsJSON}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--pill-bg)] hover:bg-[var(--pill-border)] text-[var(--text-main)] rounded-lg text-xs font-bold border border-[var(--border-light)] transition-all cursor-pointer"
                title="Download complete structured json batch packaging file"
              >
                <FileJson className="h-3.5 w-3.5" />
                <span>JSON Pack</span>
              </button>
            </div>
          </div>

          {/* LOWER META DETAILS GRID */}
          <div className="pt-4 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              ✕ Purge Entire Board (Reset maps)
            </button>
            <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--text-muted)]">
              <span>Shortcut commands:</span>
              <kbd className="font-mono bg-[var(--pill-bg)] px-1 py-0.5 rounded text-[9.5px] border border-[var(--pill-border)] font-semibold">Ctrl + G</kbd>
              <span>(compile)</span>
              <kbd className="font-mono bg-[var(--pill-bg)] px-1 py-0.5 rounded text-[9.5px] border border-[var(--pill-border)] font-semibold">Ctrl + Shift + C</kbd>
              <span>(complete copy &amp; purge)</span>
            </div>
          </div>
        </motion.section>

      </div>

      {/* FLOAT ACTION TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl shadow-black/35 border border-slate-800"
          >
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-sans">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
