# Pomodoro Timer - React Vite Starter

A sleek, dark-themed Pomodoro focus timer with circular progress ring, audio notifications, and session activity tracking.

## Features

- **3 Timer Modes**:
  - **Pomodoro** (25 min focus)
  - **Short Break** (5 min rest)
  - **Long Break** (15 min rest)
- **SVG Circular Progress Ring**: Smooth visual feedback for time remaining.
- **Audio Chime**: Native Web Audio API sound chime when timer completes (no audio assets required).
- **Session Stats**:
  - Completed Pomodoros counter.
  - Cumulative focus time in minutes.
  - Cycle tracker (4 sessions per long break).
- **Tab Title Sync**: View remaining time directly on your browser tab title.
- **LocalStorage Persistence**: Saves completed session counts automatically.

## Quick Start (Vite)

1. Create a Vite React project:
   ```bash
   npm create vite@latest pomodoro-timer -- --template react
   cd pomodoro-timer
   npm install
   ```

2. Replace `src/App.jsx` with `pomodoro-timer_App.jsx` and `src/App.css` with `pomodoro-timer_App.css`.

3. Ensure `import './App.css'` is present at top of `App.jsx`.

4. Start dev server:
   ```bash
   npm run dev
   ```
