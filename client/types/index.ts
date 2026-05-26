export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
}
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  sharedWith: string[];
  createdAt: string;
}
export interface UseCase {
  id: string;
  projectId: string;
  title: string;
  actors: string[];
  preconditions: string;
  mainFlow: string[];
  postconditions: string;
  createdAt: string;
}

export interface CRCCard {
  id: string;
  projectId: string;
  className: string;
  description: string;
  responsibilities: string[];
  collaborators: string[];
  linkedUseCaseIds: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  targetType: 'usecase' | 'crccard';
  targetId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  avatarUrl?: string;
  text: string;
  createdAt: string;
}
export interface DiagramGenerationResult {
  tool: 'plantuml' | 'nomnoml';
  script: string;
}