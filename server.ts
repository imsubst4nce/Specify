/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/repositories/dbStore.js';
import { mysqlDb } from './server/repositories/mysqlConnection.js';
import { UseCaseScriptFactory, ClassDiagramScriptFactory } from './server/services/diagramGenerator.js';
import { User, Project, UseCase, CRCCard, Comment } from './client/types/index.js';

// Simple middleware to extract user from Authorization header
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const user = dbStore.getUserById(token);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
  (req as any).user = user;
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads
  app.use(express.json());

  // Database Connection Health Check API (for MySQL connectivity test)
  app.get('/api/db-check', async (req, res) => {
    try {
      const status = await mysqlDb.testConnection();
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message || e });
    }
  });

  // =========================================================================
  // AUTHENTICATION CONTROLLER HANDLERS (US1, US2, US3)
  // =========================================================================

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }

    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      email,
      passwordHash: Buffer.from(password).toString('base64'), // Simple hash for local server
    };

    dbStore.createUser(newUser);
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, avatarUrl: newUser.avatarUrl },
      token: newUser.id,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const incomingHash = Buffer.from(password).toString('base64');
    if (user.passwordHash !== incomingHash) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      token: user.id,
    });
  });

  app.get('/api/auth/me', authenticateUser, (req, res) => {
    const user = (req as any).user;
    res.json({ id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl });
  });

  app.put('/api/auth/profile', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { name, email, password, currentPassword, avatarUrl } = req.body;

    if (!currentPassword) {
      res.status(400).json({ error: 'Current password is required for verification' });
      return;
    }

    const currentHash = Buffer.from(currentPassword).toString('base64');
    if (user.passwordHash !== currentHash) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    const updates: Partial<User> = {};
    if (name) updates.name = name;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (email) {
      // Check for uniqueness if changing email
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const existing = dbStore.getUserByEmail(email);
        if (existing) {
          res.status(400).json({ error: 'Email is already taken by another user' });
          return;
        }
        updates.email = email;
      }
    }
    if (password) {
      updates.passwordHash = Buffer.from(password).toString('base64');
    }

    const updatedUser = dbStore.updateUser(user.id, updates);
    res.json({
      message: 'Profile updated successfully',
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatarUrl: updatedUser.avatarUrl },
    });
  });

  // =========================================================================
  // PROJECTS CONTROLLER HANDLERS (US4, US5, US6, US18)
  // =========================================================================

  app.get('/api/projects', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const userProjects = dbStore.getProjectsForUser(user.id, user.email);
    res.json(userProjects);
  });

  app.get('/api/projects/:id', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const project = dbStore.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Verify ownership or collaboration access
    const isOwner = project.ownerId === user.id;
    const isCollaborator = project.sharedWith?.map(e => e.toLowerCase()).includes(user.email.toLowerCase());
    if (!isOwner && !isCollaborator) {
      res.status(403).json({ error: 'Access denied to this project' });
      return;
    }

    res.json(project);
  });

  app.post('/api/projects', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      description: description || '',
      ownerId: user.id,
      sharedWith: [],
      createdAt: new Date().toISOString(),
    };

    dbStore.createProject(newProject);
    res.status(201).json(newProject);
  });

  app.delete('/api/projects/:id', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const project = dbStore.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Only owner can delete project
    if (project.ownerId !== user.id) {
      res.status(403).json({ error: 'Only the project owner can delete this project' });
      return;
    }

    dbStore.deleteProject(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  });

  // US18 Share project with teammates
  app.post('/api/projects/:id/share', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { email } = req.body;
    const project = dbStore.getProjectById(req.params.id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.ownerId !== user.id) {
      res.status(403).json({ error: 'Only the project owner can share this project' });
      return;
    }

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid teammate' + "'" + 's email address is required' });
      return;
    }

    if (email.toLowerCase() === user.email.toLowerCase()) {
      res.status(400).json({ error: 'You cannot share the project with yourself' });
      return;
    }

    const currentShares = project.sharedWith || [];
    if (currentShares.map(e => e.toLowerCase()).includes(email.toLowerCase())) {
      res.status(400).json({ error: 'Project is already shared with this teammate' });
      return;
    }

    const updatedShares = [...currentShares, email.toLowerCase()];
    dbStore.updateProject(project.id, { sharedWith: updatedShares });

    res.json({
      message: `Project shared successfully with ${email}`,
      sharedWith: updatedShares,
    });
  });

  // =========================================================================
  // USE CASE CONTROLLER HANDLERS (US7, US8, US9, US10)
  // =========================================================================

  app.get('/api/projects/:projectId/usecases', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const project = dbStore.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const list = dbStore.getUseCasesForProject(projectId);
    res.json(list);
  });

  app.post('/api/projects/:projectId/usecases', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const { title, actors, preconditions, mainFlow, postconditions } = req.body;

    const project = dbStore.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (!title) {
      res.status(400).json({ error: 'Use case title is required' });
      return;
    }

    const newUseCase: UseCase = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      title,
      actors: Array.isArray(actors) ? actors : [],
      preconditions: preconditions || '',
      mainFlow: Array.isArray(mainFlow) ? mainFlow : [],
      postconditions: postconditions || '',
      createdAt: new Date().toISOString(),
    };

    dbStore.createUseCase(newUseCase);
    res.status(201).json(newUseCase);
  });

  app.put('/api/projects/:projectId/usecases/:id', authenticateUser, (req, res) => {
    const { id } = req.params;
    const { title, actors, preconditions, mainFlow, postconditions } = req.body;

    const useCase = dbStore.getUseCaseById(id);
    if (!useCase) {
      res.status(404).json({ error: 'Use case not found' });
      return;
    }

    const updates: Partial<UseCase> = {};
    if (title !== undefined) updates.title = title;
    if (actors !== undefined) updates.actors = actors;
    if (preconditions !== undefined) updates.preconditions = preconditions;
    if (mainFlow !== undefined) updates.mainFlow = mainFlow;
    if (postconditions !== undefined) updates.postconditions = postconditions;

    const updated = dbStore.updateUseCase(id, updates);
    res.json(updated);
  });

  app.delete('/api/projects/:projectId/usecases/:id', authenticateUser, (req, res) => {
    const { id } = req.params;
    const useCase = dbStore.getUseCaseById(id);
    if (!useCase) {
      res.status(404).json({ error: 'Use case not found' });
      return;
    }
    dbStore.deleteUseCase(id);
    res.json({ message: 'Use case deleted successfully' });
  });

  // =========================================================================
  // CRC CARDS CONTROLLER HANDLERS (US11, US12, US13, US14)
  // =========================================================================

  app.get('/api/projects/:projectId/crccards', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const project = dbStore.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    const list = dbStore.getCRCCardsForProject(projectId);
    res.json(list);
  });

  app.post('/api/projects/:projectId/crccards', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const { className, description, responsibilities, collaborators } = req.body;

    const project = dbStore.getProjectById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (!className) {
      res.status(400).json({ error: 'Class name is required' });
      return;
    }

    const newCard: CRCCard = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      className,
      description: description || '',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      linkedUseCaseIds: [],
      createdAt: new Date().toISOString(),
    };

    dbStore.createCRCCard(newCard);
    res.status(201).json(newCard);
  });

  app.put('/api/projects/:projectId/crccards/:id', authenticateUser, (req, res) => {
    const { id } = req.params;
    const { className, description, responsibilities, collaborators, linkedUseCaseIds } = req.body;

    const card = dbStore.getCRCCardById(id);
    if (!card) {
      res.status(404).json({ error: 'CRC Card not found' });
      return;
    }

    const updates: Partial<CRCCard> = {};
    if (className !== undefined) updates.className = className;
    if (description !== undefined) updates.description = description;
    if (responsibilities !== undefined) updates.responsibilities = responsibilities;
    if (collaborators !== undefined) updates.collaborators = collaborators;
    if (linkedUseCaseIds !== undefined) updates.linkedUseCaseIds = linkedUseCaseIds;

    const updated = dbStore.updateCRCCard(id, updates);
    res.json(updated);
  });

  app.delete('/api/projects/:projectId/crccards/:id', authenticateUser, (req, res) => {
    const { id } = req.params;
    const card = dbStore.getCRCCardById(id);
    if (!card) {
      res.status(404).json({ error: 'CRC Card not found' });
      return;
    }
    dbStore.deleteCRCCard(id);
    res.json({ message: 'CRC Card deleted successfully' });
  });

  // US13 Link Use Cases to CRC Card
  app.post('/api/projects/:projectId/crccards/:id/link', authenticateUser, (req, res) => {
    const { id } = req.params;
    const { linkedUseCaseIds } = req.body;

    const card = dbStore.getCRCCardById(id);
    if (!card) {
      res.status(404).json({ error: 'CRC Card not found' });
      return;
    }

    if (!Array.isArray(linkedUseCaseIds)) {
      res.status(400).json({ error: 'linkedUseCaseIds must be a string array' });
      return;
    }

    const updated = dbStore.updateCRCCard(id, { linkedUseCaseIds });
    res.json(updated);
  });

  // =========================================================================
  // DIAGRAMS GENERATION SCRIPT API (US15, US16 with design patterns)
  // =========================================================================

  // US15 Generate Use Cases Visualization script via Strategy/Template Method Factories
  app.get('/api/projects/:projectId/diagrams/usecases', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const tool = (req.query.tool as string) || 'plantuml';

    try {
      const useCases = dbStore.getUseCasesForProject(projectId);
      const generator = UseCaseScriptFactory.create(tool);
      const script = generator.generate(useCases);
      
      res.json({
        tool,
        script,
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to generate use cases script' });
    }
  });

  // US16 Generate CRC Class Diagram script via Strategy/Template Method Factories
  app.get('/api/projects/:projectId/diagrams/classes', authenticateUser, (req, res) => {
    const { projectId } = req.params;
    const tool = (req.query.tool as string) || 'plantuml';

    try {
      const crcCards = dbStore.getCRCCardsForProject(projectId);
      const generator = ClassDiagramScriptFactory.create(tool);
      const script = generator.generate(crcCards);

      res.json({
        tool,
        script,
      });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Failed to generate class diagram script' });
    }
  });

  // =========================================================================
  // COLLABORATION COMMENTS (US19)
  // =========================================================================

  app.get('/api/comments/:targetType/:targetId', authenticateUser, (req, res) => {
    const { targetType, targetId } = req.params;
    if (targetType !== 'usecase' && targetType !== 'crccard') {
      res.status(400).json({ error: 'Invalid target type' });
      return;
    }
    const list = dbStore.getComments(targetType, targetId);
    
    // Enrich list with current avatar URLs of authors
    const enrichedList = list.map(c => {
      const author = dbStore.getUserById(c.userId);
      return {
        ...c,
        userAvatarUrl: author?.avatarUrl
      };
    });
    res.json(enrichedList);
  });

  app.post('/api/comments', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { projectId, targetType, targetId, text } = req.body;

    if (!projectId || !targetType || !targetId || !text) {
      res.status(400).json({ error: 'projectId, targetType, targetId, and text are required' });
      return;
    }

    if (targetType !== 'usecase' && targetType !== 'crccard') {
      res.status(400).json({ error: 'Invalid target type' });
      return;
    }

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 11),
      projectId,
      targetType,
      targetId,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      text,
      createdAt: new Date().toISOString(),
    };

    dbStore.createComment(newComment);
    res.status(201).json(newComment);
  });

  app.delete('/api/comments/:id', authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { id } = req.params;
    const comment = dbStore.getCommentById(id);

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    // Check ownership
    if (comment.userId !== user.id) {
      res.status(403).json({ error: 'Only the author of this comment can delete it' });
      return;
    }

    dbStore.deleteComment(id);
    res.json({ message: 'Comment deleted successfully' });
  });

  // =========================================================================
  // SERVING FILES & SPA ROUTING
  // =========================================================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server startup failed:', err);
});
