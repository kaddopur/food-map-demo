import { Location } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "lucide-react";

interface LocationCardProps {
  location: Location;
  onFlyTo: (lat: number, lng: number) => void;
}

export function LocationCard({ location, onFlyTo }: LocationCardProps) {
  return (
    <div 
      className="flex items-center gap-3 px-4 py-3 bg-background hover:bg-secondary/50 active:bg-secondary transition-colors cursor-pointer"
      onClick={() => onFlyTo(location.latitude, location.longitude)}
      data-testid={`list-item-location-${location.id}`}
    >
      {/* Left Area - Icon for identification */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
        {location.icon || "📍"}
      </div>
      
      {/* Text Area */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-base text-foreground truncate">
            {location.name}
          </h3>
          {location.category && (
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-none text-[10px] font-medium px-1.5 py-0 h-4 rounded flex-shrink-0"
            >
              {location.category}
            </Badge>
          )}
        </div>
        
        {/* Description / Brand */}
        {(location.brand || location.address) && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {location.brand || location.address}
          </p>
        )}
      </div>
      
      {/* Right Area - Navigation indicator */}
      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
        <Navigation className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}
