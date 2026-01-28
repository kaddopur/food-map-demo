import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { LocationCard } from "@/components/LocationCard";
import { Search, UtensilsCrossed, Map as MapIcon } from "lucide-react";
import type { Location } from "@shared/schema";

interface SidebarContentProps {
  locations: Location[];
  onSearch: (value: string) => void;
  onFlyTo: (lat: number, lng: number) => void;
  initialSearch?: string;
}

export function SidebarContent({ locations, onSearch, onFlyTo, initialSearch = "" }: SidebarContentProps) {
  const [localSearch, setLocalSearch] = useState(initialSearch);
  const isComposingRef = useRef(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    
    // Only trigger search when not composing (for IME support)
    if (!isComposingRef.current) {
      // Debounce the search to avoid too many re-renders
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
    // Trigger search with the final composed value
    const value = (e.target as HTMLInputElement).value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 50);
  }, [onSearch]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2.5 rounded-xl">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Food Map</h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company Favorites</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search places, categories..." 
            className="pl-9 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-all"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {locations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No locations found</p>
          </div>
        ) : (
          locations.map((location) => (
            <LocationCard 
              key={location.id} 
              location={location} 
              onFlyTo={onFlyTo}
            />
          ))
        )}
      </div>
    </div>
  );
}
