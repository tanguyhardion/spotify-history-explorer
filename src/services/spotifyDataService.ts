import { addPlaysBulk, clearPlays, getAllPlays, hasData } from "../db";
import { processFiles } from "../utils";
import type { Play } from "../types";

/**
 * Service for managing Spotify data operations
 * Handles file processing, database operations, and data management
 */
export class SpotifyDataService {
  /**
   * Processes uploaded files and saves data to database
   */
  static async importData(files: FileList): Promise<Play[]> {
    try {
      const plays = await processFiles(files);
      await this.saveToDatabase(plays);
      return plays;
    } catch (error) {
      console.error("Failed to import Spotify data:", error);
      throw error;
    }
  }

  /**
   * Loads existing data from database
   */
  static async loadData(): Promise<Play[]> {
    try {
      if (await hasData()) {
        const plays = await getAllPlays();
        // Sort by timestamp descending by default
        return plays.sort((a, b) => a.ts > b.ts ? -1 : a.ts < b.ts ? 1 : 0);
      }
      return [];
    } catch (error) {
      console.error("Failed to load Spotify data:", error);
      throw new Error("Failed to load your saved listening history");
    }
  }

  /**
   * Clears all data from database
   */
  static async clearData(): Promise<void> {
    try {
      await clearPlays();
    } catch (error) {
      console.error("Failed to clear Spotify data:", error);
      throw new Error("Failed to clear existing data");
    }
  }

  /**
   * Checks if any data exists in database
   */
  static async hasExistingData(): Promise<boolean> {
    try {
      return await hasData();
    } catch (error) {
      console.error("Failed to check for existing data:", error);
      return false;
    }
  }

  /**
   * Saves plays to database in chunks for better performance
   */
  private static async saveToDatabase(plays: Play[]): Promise<void> {
    await clearPlays();
    
    const CHUNK_SIZE = 2000;
    for (let i = 0; i < plays.length; i += CHUNK_SIZE) {
      const chunk = plays.slice(i, i + CHUNK_SIZE);
      await addPlaysBulk(chunk);
    }
  }
}