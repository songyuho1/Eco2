import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User management (keeping existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// New Reigns-style game schema with 4-meter ESG system
export const reignsGameSessions = pgTable("reigns_game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerName: text("player_name").notNull().default("CEO"),
  companyName: text("company_name").notNull().default("GreenCorp"),
  
  // Four core meters (0-100 each, death if any reaches 0 or 100)
  environmentMeter: integer("environment_meter").notNull().default(50), // 환경: 너무 낮으면 기후재앙, 너무 높으면 경제파탄
  economyMeter: integer("economy_meter").notNull().default(50),         // 경제: 너무 낮으면 파산, 너무 높으면 환경파괴
  socialMeter: integer("social_meter").notNull().default(50),           // 사회: 너무 낮으면 사회불안, 너무 높으면 과도한 복지비용
  technologyMeter: integer("technology_meter").notNull().default(50),   // 기술: 너무 낮으면 경쟁력상실, 너무 높으면 일자리상실
  
  currentYear: integer("current_year").notNull().default(2025),
  cardsPlayed: integer("cards_played").notNull().default(0),
  isGameOver: boolean("is_game_over").notNull().default(false),
  deathReason: text("death_reason"), // How the game ended
  
  // Historical data for graphs
  meterHistory: jsonb("meter_history").notNull().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Card system for Reigns-style gameplay
export const decisionCards = pgTable("decision_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  characterName: text("character_name").notNull(), // Who is asking (CEO, Minister, Scientist, etc.)
  characterRole: text("character_role").notNull(),
  characterEmoji: text("character_emoji").notNull().default("👤"),
  
  // Card appearance conditions
  minYear: integer("min_year").notNull().default(2025),
  maxYear: integer("max_year").notNull().default(2100),
  requiredMeters: jsonb("required_meters").default({}),
  
  // Decision options (swipe left vs right)
  leftOptionTitle: text("left_option_title").notNull(),
  leftOptionDescription: text("left_option_description").notNull(),
  rightOptionTitle: text("right_option_title").notNull(),
  rightOptionDescription: text("right_option_description").notNull(),
  
  // Effects of each choice
  leftEffects: jsonb("left_effects").notNull(),
  rightEffects: jsonb("right_effects").notNull(),
  
  // Metadata
  category: text("category").notNull(), // "climate", "energy", "social", "technology", "crisis"
  priority: integer("priority").notNull().default(1), // Higher priority cards appear more often
  isOneTime: boolean("is_one_time").notNull().default(false), // Can only appear once per game
  
  // Educational content
  educationalData: jsonb("educational_data").default({}), // Real-world facts and figures
});

// Decision history
export const gameDecisions = pgTable("game_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => reignsGameSessions.id),
  cardId: varchar("card_id").notNull().references(() => decisionCards.id),
  decision: text("decision").notNull(), // "left" or "right"
  year: integer("year").notNull(),
  metersBefore: jsonb("meters_before").notNull(),
  metersAfter: jsonb("meters_after").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Real-world climate data for educational content
export const climateData = pgTable("climate_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  globalTempAnomaly: integer("global_temp_anomaly").notNull(), // Temperature anomaly in 0.01°C
  co2Concentration: integer("co2_concentration").notNull(),    // CO2 in ppm
  seaLevelRise: integer("sea_level_rise").notNull(),          // Sea level rise in mm
  arcticIceExtent: integer("arctic_ice_extent").notNull(),     // Arctic sea ice extent in 10^6 km²
  extremeEvents: integer("extreme_events").notNull(),         // Number of extreme weather events
  renewablePercent: integer("renewable_percent").notNull(),   // % renewable energy
  source: text("source").notNull().default("NASA/NOAA")
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReignsGameSessionSchema = createInsertSchema(reignsGameSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDecisionCardSchema = createInsertSchema(decisionCards).omit({
  id: true,
});

export const insertGameDecisionSchema = createInsertSchema(gameDecisions).omit({
  id: true,
  createdAt: true,
});

export const insertClimateDataSchema = createInsertSchema(climateData).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ReignsGameSession = typeof reignsGameSessions.$inferSelect;
export type InsertReignsGameSession = z.infer<typeof insertReignsGameSessionSchema>;

export type DecisionCard = typeof decisionCards.$inferSelect;
export type InsertDecisionCard = z.infer<typeof insertDecisionCardSchema>;

export type GameDecision = typeof gameDecisions.$inferSelect;
export type InsertGameDecision = z.infer<typeof insertGameDecisionSchema>;

export type ClimateData = typeof climateData.$inferSelect;
export type InsertClimateData = z.infer<typeof insertClimateDataSchema>;

// Game state types
export type GameMeters = {
  environment: number;
  economy: number;
  social: number;
  technology: number;
};

export type MeterHistoryPoint = {
  year: number;
  environment: number;
  economy: number;
  social: number;
  technology: number;
};

export type GameEndCondition = {
  type: 'environment_collapse' | 'economic_collapse' | 'social_unrest' | 'tech_unemployment' | 
        'environment_extremism' | 'economic_stagnation' | 'social_dictatorship' | 'tech_singularity' | 'survived';
  description: string;
  year: number;
};

// Card effects type
export type CardEffects = {
  environment: number;
  economy: number;
  social: number;
  technology: number;
  yearProgress?: number;
};

// Prediction data for future scenarios
export type FuturePrediction = {
  year: number;
  scenario: 'optimistic' | 'realistic' | 'pessimistic';
  globalTemp: number;      // Temperature rise in °C
  seaLevel: number;        // Sea level rise in cm
  renewableEnergy: number; // % of renewable energy
  co2Concentration: number; // CO2 ppm
  economicImpact: number;  // GDP impact as percentage
  populationImpact: number; // Affected population in millions
};

// Educational content types
export type EducationalContent = {
  fact: string;
  source: string;
  year?: number;
  impact?: string;
  futureProjection?: {
    year: number;
    value: number;
    unit: string;
  };
};

// Game session with decisions for API responses
export type GameSessionWithDecisions = ReignsGameSession & {
  decisions: (GameDecision & {
    card: DecisionCard;
  })[];
};