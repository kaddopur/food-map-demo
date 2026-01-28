import { Location } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationCardProps {
  location: Location;
  onFlyTo: (lat: number, lng: number) => void;
}

export function LocationCard({ location, onFlyTo }: LocationCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {location.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {location.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
          {location.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={() => onFlyTo(location.latitude, location.longitude)}
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
