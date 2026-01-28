import { useState, useRef, useCallback } from "react";
import { LocationCard } from "@/components/LocationCard";
import { Search, UtensilsCrossed, Map as MapIcon, X } from "lucide-react";
import type { Location } from "@shared/schema";

interface SidebarContentProps {
  locations: Location[];
  onSearch: (value: string) => void;
  onSelectLocation: (id: number) => void;
  initialSearch?: string;
}

export function SidebarContent({ locations, onSearch, onSelectLocation, initialSearch = "" }: SidebarContentProps) {
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const [isFocused, setIsFocused] = useState(false);
  const isComposingRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    
    if (!isComposingRef.current) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 150);
    }
  }, [onSearch]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    const value = (e.target as HTMLInputElement).value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 50);
  }, [onSearch]);

  const handleReset = useCallback(() => {
    setLocalSearch("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Food Map</h1>
            <p className="text-xs text-muted-foreground font-medium">Company Favorites</p>
          </div>
        </div>
        
        {/* LINE Design System Search Bar */}
        <div 
          className={`
            flex items-center gap-2 h-11 px-4 
            bg-secondary rounded-full
            transition-all duration-200
            ${isFocused ? 'ring-2 ring-primary/30' : ''}
          `}
        >
          {/* Icon Area */}
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          
          {/* Text Area */}
          <input 
            ref={inputRef}
            type="text"
            placeholder="搜尋餐廳、分類..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            data-testid="input-search"
          />
          
          {/* Reset Button Area */}
          {localSearch && (
            <button
              onClick={handleReset}
              className="flex-shrink-0 h-6 w-6 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-colors"
              data-testid="button-search-reset"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border bg-background/50">
        {locations.length} 個地點
      </div>

      {/* Location List */}
      <div className="flex-1 overflow-y-auto">
        {locations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>找不到地點</p>
          </div>
        ) : (
          <div>
            {locations.map((location) => (
              <LocationCard 
                key={location.id} 
                location={location} 
                onSelect={() => onSelectLocation(location.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
