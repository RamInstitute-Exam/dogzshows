import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  className = ''
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div 
        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground flex justify-between items-center cursor-pointer focus-within:border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">No results found.</div>
              ) : (
                filteredOptions.map(opt => (
                  <div 
                    key={opt.id} 
                    className={`px-4 py-2.5 text-sm cursor-pointer rounded-md mb-1 flex items-center justify-between transition-colors ${value === opt.id ? 'bg-primary/20 text-primary font-bold' : 'text-foreground hover:bg-accent hover:text-foreground'}`}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {opt.label}
                    {value === opt.id && <Check className="w-4 h-4" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
