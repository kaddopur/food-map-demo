import { Location } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationCardProps {
  location: Location;
  onFlyTo: (lat: number, lng: number) => void;
}

export function LocationCard({ location, onFlyTo }: LocationCardProps) {
  return (
    <div 
      className="bg-card rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
      onClick={() => onFlyTo(location.latitude, location.longitude)}
      data-testid={`card-location-${location.id}`}
    >
      {/* Surface Type Card - Icon + Text Layout */}
      <div className="flex gap-4 p-4">
        {/* Image/Icon Area */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-3xl shadow-sm">
          {location.icon || "📍"}
        </div>
        
        {/* Text Area */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
              {location.name}
            </h3>
          </div>
          
          {/* Brand/Description */}
          {location.brand && (
            <p className="text-sm text-muted-foreground truncate mb-1">
              {location.brand}
            </p>
          )}
          
          {/* Indicators Area - Badges */}
          <div className="flex items-center gap-1.5 mt-2">
            {location.category && (
              <Badge 
                variant="secondary" 
                className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
              >
                {location.category}
              </Badge>
            )}
            {location.tags?.slice(0, 2).map((tag: string) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 rounded-full border-border text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Action Area - Navigation Button */}
        <div className="flex-shrink-0 flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onFlyTo(location.latitude, location.longitude);
            }}
            data-testid={`button-navigate-${location.id}`}
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Optional: Address Footer */}
      {location.address && (
        <div className="px-4 pb-3 pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{location.address}</span>
          </div>
        </div>
      )}
    </div>
  );
}
