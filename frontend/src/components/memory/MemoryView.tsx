/**
 * Main Memory View Component
 * Displays core memory blocks and archival memories with enhanced stats
 */

import React, { useEffect, useState } from 'react';
import { useMemory } from '../../hooks/useMemory';
import { CoreMemoryBlock } from './CoreMemoryBlock';
import { ArchivalMemoryList } from './ArchivalMemoryList';
import { MemoryStatsComponent } from './MemoryStats';
import type { CoreMemoryLabel } from '../../types/memory';

export const MemoryView: React.FC = () => {
  const {
    coreMemory,
    coreMemoryLoading,
    coreMemoryError,
    stats,
    statsLoading,
    loadCoreMemory,
    updateCoreMemoryBlock,
    loadStats,
  } = useMemory();

  const [showCoreMemory, setShowCoreMemory] = useState(true);

  useEffect(() => {
    loadCoreMemory(); // No chatId - loads user-level blocks for Memory tab view
    loadStats();
  }, []);

  if (coreMemoryLoading && !coreMemory) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-20 bg-neutral-100 animate-pulse border-3 border-brutal-black"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-neutral-100 animate-pulse border-3 border-brutal-black"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-8 w-1/2 bg-neutral-100 animate-pulse"></div>
            <div className="h-64 bg-neutral-100 animate-pulse border-3 border-brutal-black"></div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-1/3 bg-neutral-100 animate-pulse"></div>
            <div className="h-96 bg-neutral-100 animate-pulse border-3 border-brutal-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (coreMemoryError) {
    return (
      <div className="p-6 space-y-4">
        <div className="border-3 border-brutal-red bg-white p-6 animate-brutal-shake shadow-brutal">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-brutal text-xl text-brutal-red mb-2 uppercase">System Error</h3>
              <p className="text-brutal-black font-mono text-sm mb-4">{coreMemoryError}</p>
              <button
                onClick={() => loadCoreMemory()}
                className="px-6 py-2 border-2 border-brutal-black bg-white hover:bg-neutral-100 font-bold uppercase shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
              >
                🔄 Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-offset-top memory-scroll px-4 md:px-8 pb-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-brutal-drop border-b-3 border-brutal-black pb-6">
        <div>
          <h2 className="font-brutal text-4xl uppercase tracking-tight text-brutal-black mb-2">
            Memory System
          </h2>
          <p className="text-neutral-600 font-mono text-sm">
            // LONG_TERM_STORAGE_ACCESS_TERMINAL
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              loadStats();
              loadCoreMemory();
            }}
            className="px-4 py-2 border-2 border-brutal-black bg-white hover:bg-brutal-black hover:text-white font-bold text-sm uppercase shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2"
            title="Refresh memory data"
          >
            <span>↻</span> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <section>
        <MemoryStatsComponent stats={stats} isLoading={statsLoading} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Core Memory Section - Takes 4 columns on large screens */}
        <div className="xl:col-span-5 space-y-4 animate-brutal-drop" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between bg-brutal-black text-white p-3 border-3 border-brutal-black">
            <div>
              <h3 className="font-brutal text-xl uppercase tracking-tight">
                Core Memory
              </h3>
              <p className="text-xs text-neutral-300 font-mono">
                READ_WRITE_ACCESS
              </p>
            </div>
            <button
              onClick={() => setShowCoreMemory(!showCoreMemory)}
              className="px-2 py-1 border-2 border-white bg-brutal-black hover:bg-white hover:text-brutal-black font-bold text-xs uppercase transition-all"
            >
              {showCoreMemory ? '−' : '+'}
            </button>
          </div>

          {showCoreMemory && (
            <div className="space-y-4">
              {coreMemory &&
                (Object.keys(coreMemory) as CoreMemoryLabel[]).map((label, idx) => (
                  <div
                    key={label}
                    className="animate-brutal-drop"
                    style={{ animationDelay: `${0.05 * idx}s` }}
                  >
                    <CoreMemoryBlock
                      label={label}
                      content={coreMemory[label]}
                      onUpdate={updateCoreMemoryBlock}
                    />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Archival Memory Section - Takes 8 columns on large screens */}
        <div className="xl:col-span-7 space-y-4 animate-brutal-drop" style={{ animationDelay: '0.15s' }}>
          <div className="bg-white p-1 border-b-3 border-brutal-black mb-2">
             <h3 className="font-brutal text-xl uppercase tracking-tight text-brutal-black">
              Archival Database
            </h3>
            <p className="text-xs text-neutral-600 font-mono">
              READ_ONLY_SEARCH_INDEX
            </p>
          </div>
          <ArchivalMemoryList />
        </div>
      </div>
    </div>
  );
};
