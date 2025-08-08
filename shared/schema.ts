import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gameStories = pgTable("game_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theme: varchar("theme", { length: 50 }).notNull(), // cute, scary, realistic, futuristic, dramatic
  title: text("title").notNull(),
  content: text("content").notNull(),
  scenarioType: text("scenario_type").notNull(),
  imageUrl: text("image_url"),
  contextInfo: text("context_info"),
  order: integer("order").notNull().default(0),
});

export const gameChoices = pgTable("game_choices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull().references(() => gameStories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'environment' or 'economic'
  environmentImpact: integer("environment_impact").notNull(), // +/- points
  economicImpact: integer("economic_impact").notNull(), // +/- points
  carbonImpact: integer("carbon_impact").notNull(), // +/- ppm
  emoji: varchar("emoji", { length: 10 }),
});

export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  theme: varchar("theme", { length: 50 }).notNull(),
  environmentScore: integer("environment_score").notNull().default(50),
  economicScore: integer("economic_score").notNull().default(50),
  carbonEmissions: integer("carbon_emissions").notNull().default(400),
  currentStoryIndex: integer("current_story_index").notNull().default(0),
  isGameOver: boolean("is_game_over").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameSessionChoices = pgTable("game_session_choices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => gameSessions.id),
  storyId: varchar("story_id").notNull().references(() => gameStories.id),
  choiceId: varchar("choice_id").notNull().references(() => gameChoices.id),
  environmentChange: integer("environment_change").notNull(),
  economicChange: integer("economic_change").notNull(),
  carbonChange: integer("carbon_change").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameStorySchema = createInsertSchema(gameStories).omit({
  id: true,
});

export const insertGameChoiceSchema = createInsertSchema(gameChoices).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  createdAt: true,
});

export const insertGameSessionChoiceSchema = createInsertSchema(gameSessionChoices).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGameStory = z.infer<typeof insertGameStorySchema>;
export type GameStory = typeof gameStories.$inferSelect;

export type InsertGameChoice = z.infer<typeof insertGameChoiceSchema>;
export type GameChoice = typeof gameChoices.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertGameSessionChoice = z.infer<typeof insertGameSessionChoiceSchema>;
export type GameSessionChoice = typeof gameSessionChoices.$inferSelect;

// Frontend types
export type StoryWithChoices = GameStory & {
  choices: GameChoice[];
};

export type SessionWithChoices = GameSession & {
  choices: (GameSessionChoice & {
    story: GameStory;
    choice: GameChoice;
  })[];
};

export type PolarBearState = {
  expression: string;
  status: string;
  iceSize: number;
  message: string;
};
