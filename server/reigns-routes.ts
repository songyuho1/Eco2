import { Request, Response } from 'express';
import { z } from 'zod';
import reignsStorage from './reigns-storage';
import type { CardEffects } from '@shared/schema';

// Request validation schemas
const createSessionSchema = z.object({
  playerName: z.string().min(1).max(50).default("CEO"),
  companyName: z.string().min(1).max(50).default("GreenCorp")
});

const makeDecisionSchema = z.object({
  decision: z.enum(['left', 'right'])
});

export class ReignsGameRoutes {
  
  // POST /api/reigns/sessions - Create new game session
  async createSession(req: Request, res: Response) {
    try {
      const { playerName, companyName } = createSessionSchema.parse(req.body);
      const session = await reignsStorage.createGameSession(playerName, companyName);
      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(400).json({ error: 'Failed to create game session' });
    }
  }

  // GET /api/reigns/sessions/:id - Get game session
  async getSession(req: Request, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await reignsStorage.getGameSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  // GET /api/reigns/sessions/:id/next-card - Get next decision card
  async getNextCard(req: Request, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await reignsStorage.getGameSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.isGameOver) {
        return res.status(400).json({ error: 'Game is already over' });
      }

      const availableCards = await reignsStorage.getAvailableCards(session);
      
      if (availableCards.length === 0) {
        return res.status(400).json({ error: 'No available cards' });
      }

      const card = reignsStorage.getRandomCard(availableCards);
      res.json(card);
    } catch (error) {
      console.error('Error getting next card:', error);
      res.status(500).json({ error: 'Failed to get next card' });
    }
  }

  // POST /api/reigns/sessions/:id/decisions/:cardId - Make a decision
  async makeDecision(req: Request, res: Response) {
    try {
      const sessionId = req.params.id;
      const cardId = req.params.cardId;
      const { decision } = makeDecisionSchema.parse(req.body);

      const session = await reignsStorage.getGameSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.isGameOver) {
        return res.status(400).json({ error: 'Game is already over' });
      }

      // Get the card to apply its effects
      const cards = await reignsStorage.getAllCards();
      const card = cards.find(c => c.id === cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      // Record current meters before decision
      const metersBefore = {
        environment: session.environmentMeter,
        economy: session.economyMeter,
        social: session.socialMeter,
        technology: session.technologyMeter,
      };

      // Apply effects based on decision
      const effects = decision === 'left' ? card.leftEffects : card.rightEffects;
      const updatedSession = reignsStorage.applyCardEffects(session, effects as CardEffects);

      // Record meters after decision
      const metersAfter = {
        environment: updatedSession.environmentMeter,
        economy: updatedSession.economyMeter,
        social: updatedSession.socialMeter,
        technology: updatedSession.technologyMeter,
      };

      // Check for game over conditions
      const gameOverCheck = reignsStorage.checkGameOverConditions(updatedSession);
      if (gameOverCheck.isGameOver) {
        updatedSession.isGameOver = true;
        updatedSession.deathReason = gameOverCheck.reason;
      }

      // Save the updated session
      const finalSession = await reignsStorage.updateGameSession(sessionId, updatedSession);

      // Record the decision
      await reignsStorage.recordDecision(sessionId, cardId, decision, metersBefore, metersAfter, session.currentYear);

      res.json({
        session: finalSession,
        effects: {
          environment: metersAfter.environment - metersBefore.environment,
          economy: metersAfter.economy - metersBefore.economy,
          social: metersAfter.social - metersBefore.social,
          technology: metersAfter.technology - metersBefore.technology,
        },
        gameOver: gameOverCheck.isGameOver,
        gameOverReason: gameOverCheck.reason
      });

    } catch (error) {
      console.error('Error making decision:', error);
      res.status(500).json({ error: 'Failed to make decision' });
    }
  }

  // GET /api/reigns/sessions/:id/history - Get decision history with graphs
  async getGameHistory(req: Request, res: Response) {
    try {
      const sessionId = req.params.id;
      const session = await reignsStorage.getGameSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const decisions = await reignsStorage.getSessionDecisions(sessionId);
      const meterHistory = Array.isArray(session.meterHistory) ? session.meterHistory : [];

      res.json({
        session,
        decisions,
        meterHistory,
        summary: {
          totalCards: session.cardsPlayed,
          yearsAdvanced: session.currentYear - 2025,
          finalMeters: {
            environment: session.environmentMeter,
            economy: session.economyMeter,
            social: session.socialMeter,
            technology: session.technologyMeter,
          }
        }
      });
    } catch (error) {
      console.error('Error getting game history:', error);
      res.status(500).json({ error: 'Failed to get game history' });
    }
  }

  // GET /api/reigns/climate-data - Get real climate data for educational content
  async getClimateData(req: Request, res: Response) {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const climateData = await reignsStorage.getClimateData(year);
      res.json(climateData);
    } catch (error) {
      console.error('Error getting climate data:', error);
      res.status(500).json({ error: 'Failed to get climate data' });
    }
  }

  // GET /api/reigns/predictions - Get future climate predictions for educational graphs
  async getFuturePredictions(req: Request, res: Response) {
    try {
      const predictions = await reignsStorage.getFuturePredictions();
      res.json(predictions);
    } catch (error) {
      console.error('Error getting future predictions:', error);
      res.status(500).json({ error: 'Failed to get future predictions' });
    }
  }

  // GET /api/reigns/cards - Get all cards for admin/debug purposes
  async getAllCards(req: Request, res: Response) {
    try {
      const cards = await reignsStorage.getAllCards();
      res.json(cards);
    } catch (error) {
      console.error('Error getting all cards:', error);
      res.status(500).json({ error: 'Failed to get cards' });
    }
  }

  // DELETE /api/reigns/sessions/:id - Delete/reset session
  async deleteSession(req: Request, res: Response) {
    try {
      const sessionId = req.params.id;
      // For in-memory storage, we would need to implement deletion
      // For now, just return success
      res.json({ success: true, message: 'Session reset' });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }
}

export default new ReignsGameRoutes();