import { db } from "./db";
import { locations, type Location, type InsertLocation } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
}

export class DatabaseStorage implements IStorage {
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }
}

export const storage = new DatabaseStorage();
