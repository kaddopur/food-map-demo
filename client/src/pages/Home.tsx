import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useLocations } from "@/hooks/use-locations";
import { AddLocationDialog } from "@/components/AddLocationDialog";
import { LocationCard } from "@/components/LocationCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, Map as MapIcon, Loader2, MapPin, Building2, Tag } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Initial Center
const CENTER: [number, number] = [25.0771545, 121.5733916];
const ZOOM = 16;

function MapController({ selectedCoords }: { selectedCoords: [number, number] | null }) {
  const map = useMap();
  
  if (selectedCoords) {
    map.flyTo(selectedCoords, 18, {
      animate: true,
      duration: 1.5
    });
  }
  return null;
}

export default function Home() {
  const { data: locations, isLoading, error } = useLocations();
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    if (!search) return locations;
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(search.toLowerCase()) || 
      loc.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [locations, search]);

  const handleFlyTo = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading tasty spots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-destructive/5 text-destructive">
        <div className="text-center space-y-2">
          <p className="font-bold text-xl">Failed to load map data</p>
          <p className="text-sm opacity-80">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[400px] border-r border-border bg-background/50 backdrop-blur-xl h-full z-10 shadow-xl">
        <div className="p-6 border-b border-border bg-white/50">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No locations found</p>
            </div>
          ) : (
            filteredLocations.map((location) => (
              <LocationCard 
                key={location.id} 
                location={location} 
                onFlyTo={handleFlyTo}
              />
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-white/50 backdrop-blur-md">
          <div className="w-full flex justify-center">
            <AddLocationDialog />
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative h-full w-full">
        {/* Mobile Header / Search Overlay */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-[1000] flex gap-2">
           <div className="flex-1 relative shadow-lg rounded-xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Input 
              placeholder="Search..." 
              className="pl-9 h-12 rounded-xl bg-white border-none shadow-sm text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
           </div>
           <div className="bg-white rounded-xl shadow-lg h-12 w-12 flex items-center justify-center">
             <UtensilsCrossed className="h-6 w-6 text-primary" />
           </div>
        </div>

        <MapContainer 
          center={CENTER} 
          zoom={ZOOM} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredLocations.map((location) => {
            const customIcon = L.divIcon({
              html: `<div style="font-size: 24px; background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; items-center; justify-content: center; border: 2px solid hsl(var(--primary)); box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${location.icon || "📍"}</div>`,
              className: "custom-div-icon",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            });

            return (
              <Marker 
                key={location.id} 
                position={[location.latitude, location.longitude]}
                icon={customIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[220px] max-w-[280px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-xl leading-tight text-foreground">{location.name}</h3>
                      <span className="text-2xl mt-1 shrink-0">{location.icon}</span>
                    </div>

                    {location.brand && (
                      <div className="flex items-center gap-1.5 text-sm text-primary font-medium mb-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{location.brand}</span>
                      </div>
                    )}

                    {location.address && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="leading-normal">{location.address}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
                      {location.category && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider font-bold bg-primary/10 text-primary border-none">
                          {location.category}
                        </Badge>
                      )}
                      {location.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-muted-foreground/30 text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          <MapController selectedCoords={selectedLocation} />
        </MapContainer>

        {/* Mobile FAB */}
        <div className="md:hidden absolute bottom-6 right-6 z-[1000]">
          <AddLocationDialog />
        </div>
      </main>
    </div>
  );
}
