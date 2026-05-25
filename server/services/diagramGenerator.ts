/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UseCase, CRCCard } from '../../client/types/index.js';

// ==========================================
// Strategy Pattern Interfaces
// ==========================================

export interface UseCaseScriptStrategy {
  generate(useCases: UseCase[]): string;
}

export interface ClassDiagramScriptStrategy {
  generate(crcCards: CRCCard[]): string;
}

// ==========================================
// Template Method Pattern Base Classes
// ==========================================

/**
 * Abstract class defining the skeleton for Use Case script generation (Template Method).
 */
export abstract class UseCaseScriptTemplate implements UseCaseScriptStrategy {
  public generate(useCases: UseCase[]): string {
    let script = '';
    script += this.generateHeader();
    script += this.defineActors(useCases);
    script += this.generateUseCases(useCases);
    script += this.createAssociations(useCases);
    script += this.generateFooter();
    return script;
  }

  protected abstract generateHeader(): string;
  protected abstract defineActors(useCases: UseCase[]): string;
  protected abstract generateUseCases(useCases: UseCase[]): string;
  protected abstract createAssociations(useCases: UseCase[]): string;
  protected abstract generateFooter(): string;
}

/**
 * Abstract class defining the skeleton for Class script generation (Template Method).
 */
export abstract class ClassDiagramScriptTemplate implements ClassDiagramScriptStrategy {
  public generate(crcCards: CRCCard[]): string {
    let script = '';
    script += this.generateHeader();
    script += this.generateClasses(crcCards);
    script += this.defineAssociations(crcCards);
    script += this.generateFooter();
    return script;
  }

  protected abstract generateHeader(): string;
  protected abstract generateClasses(crcCards: CRCCard[]): string;
  protected abstract defineAssociations(crcCards: CRCCard[]): string;
  protected abstract generateFooter(): string;
}

// ==========================================
// Concrete PlantUML Strategies
// ==========================================

export class PlantUMLUseCaseGenerator extends UseCaseScriptTemplate {
  protected generateHeader(): string {
    return "@startuml\n' PlantUML Use Case Script\nleft to right direction\nskinparam packageStyle rectangle\n\n";
  }

  protected defineActors(useCases: UseCase[]): string {
    const actorsSet = new Set<string>();
    useCases.forEach(uc => {
      if (Array.isArray(uc.actors)) {
        uc.actors.forEach(actor => {
          if (actor.trim()) actorsSet.add(actor.trim());
        });
      }
    });

    let script = '';
    actorsSet.forEach(actor => {
      const safeId = actor.replace(/[^a-zA-Z0-9]/g, '_');
      script += `actor :${actor}: as ${safeId}\n`;
    });
    if (actorsSet.size > 0) script += '\n';
    return script;
  }

  protected generateUseCases(useCases: UseCase[]): string {
    let script = '';
    useCases.forEach((uc, index) => {
      const ucId = `UC${index + 1}`;
      script += `usecase "${uc.title}" as ${ucId}\n`;
    });
    if (useCases.length > 0) script += '\n';
    return script;
  }

  protected createAssociations(useCases: UseCase[]): string {
    let script = '';
    useCases.forEach((uc, index) => {
      const ucId = `UC${index + 1}`;
      if (Array.isArray(uc.actors)) {
        uc.actors.forEach(actor => {
          if (actor.trim()) {
            const safeId = actor.replace(/[^a-zA-Z0-9]/g, '_');
            script += `${safeId} --> ${ucId}\n`;
          }
        });
      }
    });
    return script;
  }

  protected generateFooter(): string {
    return "\n@endum\n";
  }
}

export class PlantUMLClassGenerator extends ClassDiagramScriptTemplate {
  protected generateHeader(): string {
    return "@startuml\n' PlantUML Class Diagram (CRC Cards)\nskinparam classAttributeIconSize 0\n\n";
  }

  protected generateClasses(crcCards: CRCCard[]): string {
    let script = '';
    crcCards.forEach(card => {
      const safeId = card.className.replace(/[^a-zA-Z0-9]/g, '_');
      script += `class ${safeId} {\n`;
      script += `  .. Responsibilities ..\n`;
      if (Array.isArray(card.responsibilities)) {
        card.responsibilities.forEach(resp => {
          if (resp.trim()) {
            script += `  + ${resp.trim()}\n`;
          }
        });
      }
      script += `}\n\n`;
    });
    return script;
  }

  protected defineAssociations(crcCards: CRCCard[]): string {
    let script = '';
    const connections = new Set<string>();
    crcCards.forEach(card => {
      const safeId = card.className.replace(/[^a-zA-Z0-9]/g, '_');
      if (Array.isArray(card.collaborators)) {
        card.collaborators.forEach(collab => {
          const trimmed = collab.trim();
          if (trimmed) {
            const collabSafeId = trimmed.replace(/[^a-zA-Z0-9]/g, '_');
            const key1 = `${safeId} --> ${collabSafeId}`;
            const key2 = `${collabSafeId} --> ${safeId}`;
            if (!connections.has(key1) && !connections.has(key2)) {
              script += `${safeId} --> ${collabSafeId} : Collaborates\n`;
              connections.add(key1);
            }
          }
        });
      }
    });
    return script;
  }

  protected generateFooter(): string {
    return "\n@endum\n";
  }
}

// ==========================================
// Concrete Nomnoml Strategies
// ==========================================

export class NomnomlUseCaseGenerator extends UseCaseScriptTemplate {
  protected generateHeader(): string {
    return "#direction: right\n#zoom: 1\n#bgColor: #fdfdfd\n#stroke: #333\n\n";
  }

  protected defineActors(useCases: UseCase[]): string {
    const actorsSet = new Set<string>();
    useCases.forEach(uc => {
      if (Array.isArray(uc.actors)) {
        uc.actors.forEach(actor => {
          if (actor.trim()) actorsSet.add(actor.trim());
        });
      }
    });

    let script = '';
    actorsSet.forEach(actor => {
      script += `[<actor> ${actor}]\n`;
    });
    if (actorsSet.size > 0) script += '\n';
    return script;
  }

  protected generateUseCases(useCases: UseCase[]): string {
    let script = '';
    useCases.forEach(uc => {
      script += `[<usecase> ${uc.title}]\n`;
    });
    if (useCases.length > 0) script += '\n';
    return script;
  }

  protected createAssociations(useCases: UseCase[]): string {
    let script = '';
    useCases.forEach(uc => {
      if (Array.isArray(uc.actors)) {
        uc.actors.forEach(actor => {
          if (actor.trim()) {
            script += `[<actor> ${actor}] -> [<usecase> ${uc.title}]\n`;
          }
        });
      }
    });
    return script;
  }

  protected generateFooter(): string {
    return "";
  }
}

export class NomnomlClassGenerator extends ClassDiagramScriptTemplate {
  protected generateHeader(): string {
    return "#direction: down\n#zoom: 1\n#bgColor: #fdfdfd\n#stroke: #333\n\n";
  }

  protected generateClasses(crcCards: CRCCard[]): string {
    let script = '';
    crcCards.forEach(card => {
      const escapedClassName = card.className.replace(/[|\]\[]/g, '_');
      const filteredResp = (card.responsibilities || [])
        .map(r => r.trim().replace(/[|\]\[]/g, '_'))
        .filter(Boolean);

      if (filteredResp.length > 0) {
        script += `[${escapedClassName}|${filteredResp.join(';')}]\n`;
      } else {
        script += `[${escapedClassName}]\n`;
      }
    });
    if (crcCards.length > 0) script += '\n';
    return script;
  }

  protected defineAssociations(crcCards: CRCCard[]): string {
    let script = '';
    const connections = new Set<string>();
    crcCards.forEach(card => {
      const cleanClassName = card.className.replace(/[|\]\[]/g, '_');
      if (Array.isArray(card.collaborators)) {
        card.collaborators.forEach(collab => {
          const trimmed = collab.trim();
          if (trimmed) {
            const cleanCollabName = trimmed.replace(/[|\]\[]/g, '_');
            const key1 = `${cleanClassName} -> ${cleanCollabName}`;
            if (!connections.has(key1)) {
              script += `[${cleanClassName}] -> [${cleanCollabName}]\n`;
              connections.add(key1);
            }
          }
        });
      }
    });
    return script;
  }

  protected generateFooter(): string {
    return "";
  }
}

// ==========================================
// Parameterized Factory Pattern Classes
// ==========================================

export class UseCaseScriptFactory {
  public static create(tool: string): UseCaseScriptStrategy {
    const normalized = tool.toLowerCase();
    if (normalized === 'plantuml') {
      return new PlantUMLUseCaseGenerator();
    } else if (normalized === 'nomnoml') {
      return new NomnomlUseCaseGenerator();
    } else {
      throw new Error(`Unsupported diagrams tool: ${tool}`);
    }
  }
}

export class ClassDiagramScriptFactory {
  public static create(tool: string): ClassDiagramScriptStrategy {
    const normalized = tool.toLowerCase();
    if (normalized === 'plantuml') {
      return new PlantUMLClassGenerator();
    } else if (normalized === 'nomnoml') {
      return new NomnomlClassGenerator();
    } else {
      throw new Error(`Unsupported diagrams tool: ${tool}`);
    }
  }
}
