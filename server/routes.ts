import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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
  if (existingItems.length === 0) {
    // Center: 25.0771545, 121.5733916
    await storage.createLocation({
      name: "內湖科技園區服務大樓",
      description: "地圖中心點範例",
      latitude: 25.0771545,
      longitude: 121.5733916,
      category: "landmark"
    });
    
    await storage.createLocation({
      name: "覺旅咖啡 Journey Kaffe",
      description: "知名的咖啡廳，適合工作",
      latitude: 25.0805, 
      longitude: 121.5725,
      category: "cafe"
    });

    await storage.createLocation({
      name: "金泰日式料理",
      description: "人氣海鮮蓋飯",
      latitude: 25.0790,
      longitude: 121.5760,
      category: "restaurant"
    });
  }
}

// Run seed on startup (async, don't wait)
seedDatabase().catch(err => console.error("Seed failed:", err));
