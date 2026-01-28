import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useLocations } from "@/hooks/use-locations";
import { AddLocationDialog } from "@/components/AddLocationDialog";
import { LocationCard } from "@/components/LocationCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UtensilsCrossed, Map as MapIcon, Loader2, MapPin, Building2, Tag, Sun, Moon, List, Menu } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Initial Center
const CENTER: [number, number] = [25.0771545, 121.5733916];
const ZOOM = 16;

const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

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
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    let filtered = locations;
    
    // Filter by type
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

  const handleFlyTo = (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
  };

  const filterButtons = [
    { id: "all", label: "全部", icon: "🍱" },
    { id: "fast_food", label: "速食", icon: "🍔" },
    { id: "cafe", label: "咖啡", icon: "☕" },
    { id: "bubble_tea", label: "手搖", icon: "🧋" },
  ];

  const handleMobileFlyTo = (lat: number, lng: number) => {
    handleFlyTo(lat, lng);
    setIsMobileListOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <UtensilsCrossed className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Food Map</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Company Favorites</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-foreground shadow-sm"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
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
              onFlyTo={window.innerWidth < 768 ? handleMobileFlyTo : handleFlyTo}
            />
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-md">
        <div className="w-full flex justify-center">
          <AddLocationDialog />
        </div>
      </div>
    </>
  );

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
      <aside className="hidden md:flex flex-col w-[400px] border-r border-border bg-background/50 backdrop-blur-xl h-full z-10 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative h-full w-full">
        {/* Mobile Header Buttons */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-[1001] flex justify-between items-start pointer-events-none">
          <Sheet open={isMobileListOpen} onOpenChange={setIsMobileListOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="secondary" className="pointer-events-auto shadow-lg bg-background/80 backdrop-blur-md border border-border">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[85vw] sm:w-[400px] flex flex-col">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-3 rounded-xl bg-background/80 backdrop-blur-md border border-border shadow-lg text-foreground pointer-events-auto"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Filter Buttons Overlay */}
        <div className="absolute top-[72px] md:top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-background/80 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-xl overflow-x-auto max-w-[90vw] no-scrollbar">
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

        <MapContainer 
          key={theme} 
          center={CENTER} 
          zoom={ZOOM} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution={theme === "dark" ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url={theme === "dark" ? TILE_DARK : TILE_LIGHT}
          />
          
          {filteredLocations.map((location) => {
            const customIcon = L.divIcon({
              html: `<div style="font-size: 24px; background: ${theme === 'dark' ? '#1e1e1e' : 'white'}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid ${theme === 'dark' ? 'hsl(265, 100%, 80%)' : 'hsl(var(--primary))'}; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${location.icon || "📍"}</div>`,
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
