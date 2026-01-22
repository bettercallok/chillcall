/**
 * App.jsx - Root Component
 * 
 * THE ROOT COMPONENT:
 * This is the top-level component that React renders.
 * It wraps everything in the CallProvider (context) and
 * switches between LandingScreen and AppScreen based on state.
 * 
 * CONDITIONAL RENDERING:
 * React uses JavaScript expressions to conditionally render components.
 * Example: {isConnected ? <AppScreen /> : <LandingScreen />}
 * This shows AppScreen if connected, otherwise LandingScreen.
 */

import { useState } from 'react';
import { CallProvider } from './context/CallContext';
import { LandingScreen } from './components/LandingScreen';
import { AppScreen } from './components/AppScreen';
import './index.css';

function AppContent() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnected = (msg) => {
    console.log('Connected to room:', msg.roomId);
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-[#D0D0D0] flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid z-0 pointer-events-none" />

      {/* Corner Labels */}
      <div className="absolute top-6 left-6 text-xs font-bold tracking-widest z-10 hidden sm:block">
        // REF: MAN_001
      </div>
      <div className="absolute top-6 right-6 text-xs font-bold tracking-widest z-10 hidden sm:block">
        [ SYSTEM_READY ]
      </div>

      {/* Main Content - Switch between screens */}
      {isConnected ? (
        <AppScreen />
      ) : (
        <LandingScreen onConnected={handleConnected} />
      )}
    </div>
  );
}

// Main App wraps everything in the CallProvider
export default function App() {
  return (
    <CallProvider>
      <AppContent />
    </CallProvider>
  );
}
