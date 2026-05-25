/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { User, Project, UseCase, CRCCard, Comment } from '../../client/types/index.js';

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  useCases: UseCase[];
  crcCards: CRCCard[];
  comments: Comment[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

class LocalDBStore {
  private data: DatabaseSchema = {
    users: [],
    projects: [],
    useCases: [],
    crcCards: [],
    comments: [],
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure arrays exist
        if (!this.data.users) this.data.users = [];
        if (!this.data.projects) this.data.projects = [];
        if (!this.data.useCases) this.data.useCases = [];
        if (!this.data.crcCards) this.data.crcCards = [];
        if (!this.data.comments) this.data.comments = [];
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database.json:', e);
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database.json:', e);
    }
  }

  // ==========================================
  // User Operations
  // ==========================================
  
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(userId: string, updated: Partial<User>): User {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    this.data.users[userIndex] = { ...this.data.users[userIndex], ...updated };
    this.save();
    return this.data.users[userIndex];
  }

  // ==========================================
  // Project Operations
  // ==========================================

  public getProjects(): Project[] {
    return this.data.projects;
  }

  public getProjectsForUser(userId: string, email: string): Project[] {
    // Return projects owned by user OR shared with the user's email
    return this.data.projects.filter(p => 
      p.ownerId === userId || 
      (p.sharedWith && p.sharedWith.map(e => e.toLowerCase()).includes(email.toLowerCase()))
    );
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  public createProject(project: Project): Project {
    this.data.projects.push(project);
    this.save();
    return project;
  }

  public updateProject(id: string, updated: Partial<Project>): Project {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    this.data.projects[idx] = { ...this.data.projects[idx], ...updated };
    this.save();
    return this.data.projects[idx];
  }

  public deleteProject(id: string): void {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    // Cascade delete use cases, crc cards, comments
    this.data.useCases = this.data.useCases.filter(uc => uc.projectId !== id);
    this.data.crcCards = this.data.crcCards.filter(card => card.projectId !== id);
    this.data.comments = this.data.comments.filter(c => c.projectId !== id);
    this.save();
  }

  // ==========================================
  // Use Case Operations
  // ==========================================

  public getUseCasesForProject(projectId: string): UseCase[] {
    return this.data.useCases.filter(uc => uc.projectId === projectId);
  }

  public getUseCaseById(id: string): UseCase | undefined {
    return this.data.useCases.find(uc => uc.id === id);
  }

  public createUseCase(useCase: UseCase): UseCase {
    this.data.useCases.push(useCase);
    this.save();
    return useCase;
  }

  public updateUseCase(id: string, updated: Partial<UseCase>): UseCase {
    const idx = this.data.useCases.findIndex(uc => uc.id === id);
    if (idx === -1) throw new Error('UseCase not found');
    this.data.useCases[idx] = { ...this.data.useCases[idx], ...updated };
    this.save();
    return this.data.useCases[idx];
  }

  public deleteUseCase(id: string): void {
    this.data.useCases = this.data.useCases.filter(uc => uc.id !== id);
    // Delete comments Belongs to this usecase
    this.data.comments = this.data.comments.filter(c => !(c.targetType === 'usecase' && c.targetId === id));
    
    // Also remove reference from CRC Card linkedUseCases
    this.data.crcCards = this.data.crcCards.map(card => {
      if (card.linkedUseCaseIds && card.linkedUseCaseIds.includes(id)) {
        return {
          ...card,
          linkedUseCaseIds: card.linkedUseCaseIds.filter(lid => lid !== id),
        };
      }
      return card;
    });

    this.save();
  }

  // ==========================================
  // CRC Card Operations
  // ==========================================

  public getCRCCardsForProject(projectId: string): CRCCard[] {
    return this.data.crcCards.filter(card => card.projectId === projectId);
  }

  public getCRCCardById(id: string): CRCCard | undefined {
    return this.data.crcCards.find(card => card.id === id);
  }

  public createCRCCard(card: CRCCard): CRCCard {
    this.data.crcCards.push(card);
    this.save();
    return card;
  }

  public updateCRCCard(id: string, updated: Partial<CRCCard>): CRCCard {
    const idx = this.data.crcCards.findIndex(card => card.id === id);
    if (idx === -1) throw new Error('CRC Card not found');
    this.data.crcCards[idx] = { ...this.data.crcCards[idx], ...updated };
    this.save();
    return this.data.crcCards[idx];
  }

  public deleteCRCCard(id: string): void {
    this.data.crcCards = this.data.crcCards.filter(card => card.id !== id);
    // Delete comments belonging to this CRC Card
    this.data.comments = this.data.comments.filter(c => !(c.targetType === 'crccard' && c.targetId === id));
    this.save();
  }

  // ==========================================
  // Comments Operations (US19)
  // ==========================================

  public getComments(targetType: 'usecase' | 'crccard', targetId: string): Comment[] {
    return this.data.comments.filter(c => c.targetType === targetType && c.targetId === targetId);
  }

  public getCommentById(id: string): Comment | undefined {
    return this.data.comments.find(c => c.id === id);
  }

  public createComment(comment: Comment): Comment {
    this.data.comments.push(comment);
    this.save();
    return comment;
  }

  public deleteComment(id: string): void {
    this.data.comments = this.data.comments.filter(c => c.id !== id);
    this.save();
  }
}

export const dbStore = new LocalDBStore();
