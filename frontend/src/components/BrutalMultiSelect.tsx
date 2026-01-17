import React, { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface BrutalMultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    options: (string | Option)[];
    label?: string;
    placeholder?: string;
    dropUp?: boolean;
    className?: string;
    dropdownClassName?: string;
}

export const BrutalMultiSelect: React.FC<BrutalMultiSelectProps> = ({
    value = [],
    onChange,
    options,
    label,
    placeholder = 'SELECT TOOLS...',
    dropUp = false,
    className = '',
    dropdownClassName = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize options to Option objects
    const normalizedOptions: Option[] = options.map(opt =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    // Heuristic for scrollbar
    const showScrollbar = normalizedOptions.length > 6;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = (val: string) => {
        const newValue = value.includes(val)
            ? value.filter(v => v !== val)
            : [...value, val];
        onChange(newValue);
    };

    const selectedCount = value.length;
    const displayLabel = selectedCount === 0
        ? placeholder
        : selectedCount === 1
            ? normalizedOptions.find(o => o.value === value[0])?.label || value[0]
            : `${selectedCount} ITEMS SELECTED`;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block font-bold tracking-wide text-brutal-black uppercase mb-1 text-xs">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white border-3 border-brutal-black px-3 py-2 font-bold text-sm text-left flex items-center justify-between transition-all duration-200 hover:bg-brutal-yellow focus:outline-none ${isOpen ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[1px] translate-y-[1px]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
            >
                <span className="truncate">
                    {displayLabel}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? (dropUp ? 'rotate-0' : 'rotate-180') : (dropUp ? 'rotate-180' : 'rotate-0')}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className={`absolute z-50 w-full bg-white border-3 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto overflow-x-hidden animate-brutal-drop ${showScrollbar ? 'scrollbar-thin scrollbar-track-neutral-200 scrollbar-thumb-brutal-black' : 'scrollbar-none'} ${dropUp ? 'bottom-full mb-1' : 'mt-1'} ${dropdownClassName}`}>
                    {normalizedOptions.length === 0 && (
                        <div className="p-3 text-xs text-neutral-500 font-bold uppercase text-center">No Options</div>
                    )}
                    {normalizedOptions.map((option) => {
                        const isSelected = value.includes(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleToggle(option.value)}
                                className={`w-full text-left px-3 py-2 font-bold text-xs uppercase transition-colors border-b-2 border-neutral-100 last:border-0 flex items-center gap-2 hover:bg-neutral-50`}
                            >
                                <div className={`w-4 h-4 border-2 border-brutal-black flex items-center justify-center transition-colors ${isSelected ? 'bg-brutal-green' : 'bg-white'}`}>
                                    {isSelected && <svg className="w-3 h-3 text-brutal-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`flex-1 ${isSelected ? 'text-brutal-black' : 'text-neutral-600'}`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
