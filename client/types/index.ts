/**
 * Represents a registered user account within the requirements workspace ecosystem.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // transient for input
  passwordHash?: string;
  avatarUrl?: string; // Base64 encoding or user uploaded image URL
}

/**
 * Represents a software workspace dossier holding requirements, classifications, and diagrams.
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  sharedWith: string[]; // List of user emails the project is shared with
  createdAt: string;
}

/**
 * Models a detailed usecase actor-system interaction sequence.
 */
export interface UseCase {
  id: string;
  projectId: string;
  title: string;
  actors: string[]; // e.g. ["Developer", "System"]
  preconditions: string;
  mainFlow: string[]; // Array of step descriptions
  postconditions: string;
  createdAt: string;
}

/**
 * Models Class Responsibility Collaborator metadata structures mapping database objects.
 */
export interface CRCCard {
  id: string;
  projectId: string;
  className: string;
  description: string;
  responsibilities: string[];
  collaborators: string[]; // list of other class names it collaborates with
  linkedUseCaseIds: string[]; // Linked Use Case IDs
  createdAt: string;
}

/**
 * Represents continuous team feedback threads linked to design nodes.
 */
export interface Comment {
  id: string;
  projectId: string; // The project scope
  targetType: 'usecase' | 'crccard'; // What it belongs to
  targetId: string; // ID of the Use Case or CRC Card
  userId: string;
  userName: string;
  userAvatarUrl?: string; // Optional user avatar corresponding to the author
  avatarUrl?: string; // Optional user avatar fallback directly matching Spring domain model
  text: string;
  createdAt: string;
}

/**
 * Wraps generated diagram syntax codes.
 */
export interface DiagramGenerationResult {
  tool: 'plantuml' | 'nomnoml';
  script: string;
}
