@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* Custom CSS Variables & Theme Definitions */
:root {
  --bg-app: #eef5ff; /* Beautiful soft eye-safe light blue background */
  --card-bg: #ffffff;
  --border-light: #e2ebf6;
  --text-main: #0f172a; /* Extra-high contrast charcoal black/blue for maximum readability in light mode */
  --text-muted: #5e6c84;
  --pill-bg: #edf4fc;
  --pill-border: #cbdced;
  
  --brand-blue: #2563eb;
  --brand-blue-hover: #1d4ed8;
  --brand-purple: #9333ea;
  
  --green: #16a34a;
  --green-bg: #f0fdf4;
  --red: #dc2626;
  --red-bg: #fef2f2;
  --blue: #2563eb;
  --blue-bg: #eff6ff;
  --purple: #9333ea;
  --purple-bg: #faf5ff;
  --pink: #db2777;
  --pink-bg: #fdf2f8;

  --shadow-sm: 0 4px 14px rgba(59, 130, 246, 0.05);
  --shadow-md: 0 12px 38px rgba(59, 130, 246, 0.08);
  --glow-focus: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.dark {
  --bg-app: #080c14;
  --card-bg: #101524;
  --border-light: #1f293b;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --pill-bg: #1c2538;
  --pill-border: #2e3b52;
  
  --brand-blue: #60a5fa;
  --brand-blue-hover: #3b82f6;
  --brand-purple: #c084fc;
  
  --green: #34d399;
  --green-bg: rgba(52, 211, 153, 0.1);
  --red: #f87171;
  --red-bg: rgba(248, 113, 113, 0.1);
  --blue: #60a5fa;
  --blue-bg: rgba(96, 165, 250, 0.1);
  --purple: #c084fc;
  --purple-bg: rgba(192, 132, 252, 0.1);
  --pink: #f472b6;
  --pink-bg: rgba(244, 114, 182, 0.1);

  --shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 16px 48px rgba(0, 0, 0, 0.35);
  --glow-focus: 0 0 0 4px rgba(192, 132, 252, 0.2);
}

/* Beautiful Serene Pastel Iris mode - soft pastel tones, highly elegant, highly readable */
.serene {
  --bg-app: #f4f3fb; /* Calming soft pastel lilac app canvas */
  --card-bg: #faf9ff; /* Cream clean iris card surface */
  --border-light: #e4e1f5;
  --text-main: #2d264d; /* High-contrast deep plum-indigo text, very distinct */
  --text-muted: #6b5f93;
  --pill-bg: #eae8f7;
  --pill-border: #dadaf2;
  
  --brand-blue: #6366f1;
  --brand-blue-hover: #4f46e5;
  --brand-purple: #a855f7;
  
  --green: #10b981;
  --green-bg: #ecfdf5;
  --red: #f43f5e;
  --red-bg: #fff1f2;
  --blue: #6366f1;
  --blue-bg: #eef2ff;
  --purple: #a855f7;
  --purple-bg: #faf5ff;
  --pink: #ec4899;
  --pink-bg: #fdf2f8;

  --shadow-sm: 0 4px 14px rgba(99, 102, 241, 0.04);
  --shadow-md: 0 12px 38px rgba(99, 102, 241, 0.07);
  --glow-focus: 0 0 0 4px rgba(99, 102, 241, 0.16);
}

/* Calm Sage & Moss mode - organic, earthly, light pastel, beautiful and hyper-readable */
.sage {
  --bg-app: #edf4f0; /* Soft botanical muted green app background */
  --card-bg: #f8faf9; /* Organic off-white card surface */
  --border-light: #d6e2db;
  --text-main: #132a1e; /* Deep rich forest green text for stunning contrast */
  --text-muted: #53695c;
  --pill-bg: #e1ede6;
  --pill-border: #ccd8cf;
  
  --brand-blue: #059669;
  --brand-blue-hover: #047857;
  --brand-purple: #10b981;
  
  --green: #059669;
  --green-bg: #f0fdf4;
  --red: #dc2626;
  --red-bg: #fef2f2;
  --blue: #0284c7;
  --blue-bg: #f0f9ff;
  --purple: #7c3aed;
  --purple-bg: #f5f3ff;
  --pink: #db2777;
  --pink-bg: #fdf2f8;

  --shadow-sm: 0 4px 14px rgba(5, 150, 105, 0.04);
  --shadow-md: 0 12px 38px rgba(5, 150, 105, 0.07);
  --glow-focus: 0 0 0 4px rgba(5, 150, 105, 0.16);
}

/* Animations */
@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(1deg); }
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.93; transform: scale(1.01); }
}

@keyframes rotate-glow {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.animate-rotate-glow {
  animation: rotate-glow 4s linear infinite;
}

/* Stunning Gemini sweeping gradient animation for searches and note generation glows */
@keyframes gemini-sweep {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-sweep {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f43f5e, #10b981, #3b82f6);
  background-size: 300% 300%;
  animation: gemini-sweep 2.2s linear infinite;
}

.animate-error {
  animation: error-shake 0.4s ease-in-out;
  border-color: var(--red) !important;
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-pulse-subtle {
  animation: pulse-subtle 3s ease-in-out infinite;
}

/* Grid & Glow Graphics - Professional blueprint patterns */
.bg-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: 
    linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.dark .bg-grid {
  background-image: 
    linear-gradient(rgba(139, 92, 246, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px);
  background-size: 30px 30px;
}

.serene .bg-grid {
  background-image: 
    linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.sage .bg-grid {
  background-image: 
    linear-gradient(rgba(5, 150, 105, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(5, 150, 105, 0.05) 1px, transparent 1px);
  background-size: 22px 22px;
}

.bg-glow {
  position: fixed;
  top: -20%; left: -10%;
  width: 90%; height: 90%;
  background: 
    radial-gradient(circle, rgba(168, 85, 247, 0.04) 0%, transparent 60%),
    radial-gradient(circle, rgba(236, 72, 153, 0.03) 0%, transparent 70%);
  z-index: -1;
  pointer-events: none;
}

body {
  background-color: var(--bg-app);
  color: var(--text-main);
  transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 100vh;
}

/* Transition improvements */
.transition-all-custom {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
