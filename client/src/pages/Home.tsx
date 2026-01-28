import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useLocations } from "@/hooks/use-locations";
import { SidebarContent } from "@/components/SidebarContent";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, Sun, Moon, Menu, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const CENTER: [number, number] = [25.0771545, 121.5733916];
const ZOOM = 16;

const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function MapController({ 
  selectedLocationId, 
  locations,
  markerRefs 
}: { 
  selectedLocationId: number | null;
  locations: any[];
  markerRefs: React.MutableRefObject<Map<number, L.Marker>>;
}) {
  const map = useMap();
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any pending popup timeout when selection changes
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
    
    if (selectedLocationId !== null) {
      const location = locations.find(loc => loc.id === selectedLocationId);
      if (location) {
        // Stop any ongoing animation
        map.stop();
        
        map.setView([location.latitude, location.longitude], 17, {
          animate: true,
          duration: 0.8
        });
        
        // Open popup after animation completes
        popupTimeoutRef.current = setTimeout(() => {
          const marker = markerRefs.current.get(selectedLocationId);
          if (marker) {
            marker.openPopup();
          }
        }, 900);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [selectedLocationId, locations, map, markerRefs]);
  
  return null;
}

export default function Home() {
  const { data: locations, isLoading } = useLocations();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const markerRefs = useRef<Map<number, L.Marker>>(new Map());

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    
    let filtered = locations;
    
    if (filterType === "fast_food") {
      filtered = filtered.filter(loc => loc.category === "burger" || loc.category === "chicken" || loc.category === "sandwich" || loc.category === "dumplings" || loc.category === "beef_bowl" || loc.category === "breakfast");
    } else if (filterType === "cafe") {
      filtered = filtered.filter(loc => loc.category === "coffee" || loc.category === "independent" || loc.category === "tea" || loc.category === "bakery");
    } else if (filterType === "bubble_tea") {
      filtered = filtered.filter(loc => loc.category === "bubble_tea");
    }

    if (!search) return filtered;
    return filtered.filter(loc => 
      loc.name.toLowerCase().includes(search.toLowerCase()) || 
      loc.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [locations, search, filterType]);

  const handleSelectLocation = useCallback((id: number) => {
    setSelectedLocationId(id);
  }, []);

  const handleMobileSelectLocation = useCallback((id: number) => {
    handleSelectLocation(id);
    setIsMobileListOpen(false);
  }, [handleSelectLocation]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const filterButtons = [
    { id: "all", label: "全部", icon: "🍱" },
    { id: "fast_food", label: "速食", icon: "🍔" },
    { id: "cafe", label: "咖啡", icon: "☕" },
    { id: "bubble_tea", label: "手搖", icon: "🧋" },
  ];

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[400px] border-r border-border bg-background/50 backdrop-blur-xl h-full z-[100] shadow-xl">
        <SidebarContent 
          locations={filteredLocations}
          onSearch={handleSearch}
          onSelectLocation={handleSelectLocation}
          initialSearch={search}
        />
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative h-full w-full">
        {/* Top Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[50] flex items-center justify-between gap-4 pointer-events-none">
          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex-shrink-0 pointer-events-auto">
            <Sheet open={isMobileListOpen} onOpenChange={setIsMobileListOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="secondary" className="shadow-lg bg-background/80 backdrop-blur-md border border-border h-12 w-12 rounded-xl">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] sm:w-[400px] flex flex-col border-none [&>button]:hidden">
                <div className="absolute top-4 right-4 z-50">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsMobileListOpen(false)} 
                    className="rounded-xl h-10 w-10 hover:bg-background/80"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <SidebarContent 
                  locations={filteredLocations}
                  onSearch={handleSearch}
                  onSelectLocation={handleMobileSelectLocation}
                  initialSearch={search}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Filter Buttons Overlay */}
          <div className="flex-1 flex justify-center pointer-events-auto overflow-hidden">
            <div className="flex gap-2 bg-background/80 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-xl overflow-x-auto no-scrollbar max-w-full">
              {filterButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                    ${filterType === btn.id 
                      ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <span>{btn.icon}</span>
                  <span className="hidden xs:inline">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <div className="flex-shrink-0 pointer-events-auto">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 h-12 w-12 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-md border border-border shadow-lg text-foreground transition-all hover-elevate active-elevate-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <MapContainer 
          center={CENTER} 
          zoom={ZOOM} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
          zoomControl={false}
          trackResize={true}
        >
          <TileLayer
            key={theme}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={theme === "dark" ? TILE_DARK : TILE_LIGHT}
          />
          
          {filteredLocations.map((location) => {
            const customIcon = L.divIcon({
              html: `<div style="font-size: 24px; background: ${theme === 'dark' ? '#1F1F1F' : 'white'}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #06C755; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${location.icon || "📍"}</div>`,
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
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current.set(location.id, ref);
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[220px] max-w-[280px]">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-base leading-tight text-foreground">{location.name}</h3>
                      <span className="text-xl mt-0.5 shrink-0">{location.icon}</span>
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
          
          <MapController 
            selectedLocationId={selectedLocationId} 
            locations={filteredLocations}
            markerRefs={markerRefs}
          />
        </MapContainer>
      </main>
    </div>
  );
}
