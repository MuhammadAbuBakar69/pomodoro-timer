import './App.css';
import React, { useState, useEffect, useRef } from 'react';

// Timer modes configuration (in seconds)
const MODES = {
  work: { name: 'Pomodoro', duration: 25 * 60, color: '#f43f5e' },
  shortBreak: { name: 'Short Break', duration: 5 * 60, color: '#10b981' },
  longBreak: { name: 'Long Break', duration: 15 * 60, color: '#6366f1' }
};

export default function App() {
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [isRunning, setIsRunning] = useState(false);

  // Stats
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('pt_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [sessionLogs, setSessionLogs] = useState(() => {
    const saved = localStorage.getItem('pt_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const timerRef = useRef(null);

  // Persist stats
  useEffect(() => {
    localStorage.setItem('pt_sessions', completedSessions.toString());
  }, [completedSessions]);

  useEffect(() => {
    localStorage.setItem('pt_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  // Audio tone generator via Web Audio API
  const playFinishBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('Audio Context error', e);
    }
  };

  // Timer Tick Effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  // Update document title with remaining time
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.title = `${formatted} - ${MODES[mode].name}`;
  }, [timeLeft, mode]);

  // Handle Session Completion
  const handleTimerComplete = () => {
    setIsRunning(false);
    playFinishBeep();

    if (mode === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);

      const logEntry = {
        id: Date.now().toString(),
        type: 'Pomodoro',
        durationMinutes: 25,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessionLogs((prev) => [logEntry, ...prev.slice(0, 9)]);

      // Auto suggest break
      if (newCount % 4 === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('work');
    }
  };

  // Switch Mode
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  // Controls
  const toggleStartPause = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const skipTimer = () => {
    if (window.confirm('Skip current session?')) {
      handleTimerComplete();
    }
  };

  const clearStats = () => {
    if (window.confirm('Reset all session statistics?')) {
      setCompletedSessions(0);
      setSessionLogs([]);
      localStorage.removeItem('pt_sessions');
      localStorage.removeItem('pt_logs');
    }
  };

  // Formatting helpers
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular SVG ring calculation
  const totalDuration = MODES[mode].duration;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const currentThemeColor = MODES[mode].color;
  const totalFocusMinutes = completedSessions * 25;

  return (
    <div className="pt-app">
      <div className="pt-container">
        {/* Header */}
        <header className="pt-header">
          <h1>⏱️ Pomodoro Focus Timer</h1>
          <p>Boost your productivity with structured time management</p>
        </header>

        {/* Mode Selector Tabs */}
        <div className="pt-mode-tabs">
          <button
            className={mode === 'work' ? 'active' : ''}
            onClick={() => switchMode('work')}
            style={{ '--theme-color': MODES.work.color }}
          >
            🎯 Pomodoro (25m)
          </button>
          <button
            className={mode === 'shortBreak' ? 'active' : ''}
            onClick={() => switchMode('shortBreak')}
            style={{ '--theme-color': MODES.shortBreak.color }}
          >
            ☕ Short Break (5m)
          </button>
          <button
            className={mode === 'longBreak' ? 'active' : ''}
            onClick={() => switchMode('longBreak')}
            style={{ '--theme-color': MODES.longBreak.color }}
          >
            🌴 Long Break (15m)
          </button>
        </div>

        {/* Circular Progress Timer Display */}
        <div className="pt-timer-wrapper">
          <svg className="pt-progress-ring" width="280" height="280">
            {/* Background Ring */}
            <circle
              className="pt-ring-bg"
              stroke="#2d3748"
              strokeWidth="12"
              fill="transparent"
              r={radius}
              cx="140"
              cy="140"
            />
            {/* Animated Progress Ring */}
            <circle
              className="pt-ring-progress"
              stroke={currentThemeColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="140"
              cy="140"
            />
          </svg>

          <div className="pt-timer-content">
            <span className="pt-time-display">{formatTime(timeLeft)}</span>
            <span className="pt-mode-label" style={{ color: currentThemeColor }}>
              {MODES[mode].name.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="pt-controls">
          <button
            className="pt-btn-main"
            onClick={toggleStartPause}
            style={{ backgroundColor: currentThemeColor }}
          >
            {isRunning ? 'PAUSE' : 'START'}
          </button>
          <button className="pt-btn-sub" onClick={resetTimer} title="Reset Timer">
            🔄 Reset
          </button>
          <button className="pt-btn-sub" onClick={skipTimer} title="Skip Session">
            ⏭️ Skip
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="pt-stats-grid">
          <div className="pt-stat-card">
            <span className="pt-stat-icon">🍅</span>
            <div className="pt-stat-info">
              <span className="pt-stat-val">{completedSessions}</span>
              <span className="pt-stat-lbl">Completed Today</span>
            </div>
          </div>

          <div className="pt-stat-card">
            <span className="pt-stat-icon">⚡</span>
            <div className="pt-stat-info">
              <span className="pt-stat-val">{totalFocusMinutes}m</span>
              <span className="pt-stat-lbl">Total Focus Time</span>
            </div>
          </div>

          <div className="pt-stat-card">
            <span className="pt-stat-icon">🔄</span>
            <div className="pt-stat-info">
              <span className="pt-stat-val">{completedSessions % 4} / 4</span>
              <span className="pt-stat-lbl">Cycle Progress</span>
            </div>
          </div>
        </div>

        {/* Completed Session History */}
        <div className="pt-history-card">
          <div className="pt-history-header">
            <h3>Recent Activity</h3>
            {sessionLogs.length > 0 && (
              <button className="pt-btn-text" onClick={clearStats}>
                Clear
              </button>
            )}
          </div>

          {sessionLogs.length === 0 ? (
            <p className="pt-empty-logs">No completed sessions yet. Press Start to focus!</p>
          ) : (
            <ul className="pt-log-list">
              {sessionLogs.map((log) => (
                <li key={log.id} className="pt-log-item">
                  <span>🎯 {log.type} session ({log.durationMinutes} mins)</span>
                  <span className="pt-log-time">{log.timestamp}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
