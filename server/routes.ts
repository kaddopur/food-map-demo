import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import { readFileSync } from "fs";
import { join } from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ... existing routes ...
  app.get(api.locations.list.path, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get(api.locations.get.path, async (req, res) => {
    const location = await storage.getLocation(Number(req.params.id));
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  });

  app.post(api.locations.create.path, async (req, res) => {
    try {
      const input = api.locations.create.input.parse(req.body);
      const location = await storage.createLocation(input);
      res.status(201).json(location);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

// Seed data
async function seedDatabase() {
  const existingItems = await storage.getLocations();
  if (existingItems.length <= 3) {
    try {
      const dataPath = join(process.cwd(), "attached_assets", "workshop_data_complete_1769572591447.json");
      const rawData = readFileSync(dataPath, "utf-8");
      const data = JSON.parse(rawData);
      
      for (const place of data.places) {
        await storage.createLocation({
          name: place.name,
          description: place.address || place.brand || "",
          latitude: place.lat,
          longitude: place.lng,
          category: place.category,
          icon: place.icon
        });
      }
      console.log(`Seeded ${data.places.length} places from JSON`);
    } catch (err) {
      console.error("Failed to seed from JSON, falling back to basic seed:", err);
      // Center: 25.0771545, 121.5733916
      await storage.createLocation({
        name: "內湖科技園區服務大樓",
        description: "地圖中心點範例",
        latitude: 25.0771545,
        longitude: 121.5733916,
        category: "landmark",
        icon: "🏢"
      });
    }
  }
}

// Run seed on startup (async, don't wait)
seedDatabase().catch(err => console.error("Seed failed:", err));
