package server.services;

import server.domainmodel.CRCCard;
import server.domainmodel.UseCase;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

public class DiagramGeneratorService {

    public interface UseCaseScriptStrategy {
        String generate(List<UseCase> useCases);
    }

    public interface ClassDiagramScriptStrategy {
        String generate(List<CRCCard> crcCards);
    }

    public static abstract class UseCaseScriptTemplate implements UseCaseScriptStrategy {
        @Override
        public final String generate(List<UseCase> useCases) {
            StringBuilder sb = new StringBuilder();
            sb.append(generateHeader());
            sb.append(defineActors(useCases));
            sb.append(generateUseCases(useCases));
            sb.append(createAssociations(useCases));
            sb.append(generateFooter());
            return sb.toString();
        }

        protected abstract String generateHeader();
        protected abstract String defineActors(List<UseCase> useCases);
        protected abstract String generateUseCases(List<UseCase> useCases);
        protected abstract String createAssociations(List<UseCase> useCases);
        protected abstract String generateFooter();
    }

    public static class PlantUMLUseCaseGenerator extends UseCaseScriptTemplate {
        @Override
        protected String generateHeader() {
            return "@startuml\n' PlantUML Use Case Script\nleft to right direction\nskinparam packageStyle rectangle\n\n";
        }

        @Override
        protected String defineActors(List<UseCase> useCases) {
            Set<String> actorsSet = new HashSet<>();
            for (UseCase uc : useCases) {
                if (uc.getActors() != null) {
                    for (String actor : uc.getActors()) {
                        if (actor != null && !actor.trim().isEmpty()) {
                            actorsSet.add(actor.trim());
                        }
                    }
                }
            }

            StringBuilder sb = new StringBuilder();
            for (String actor : actorsSet) {
                String safeId = actor.replaceAll("[^a-zA-Z0-9]", "_");
                sb.append("actor :").append(actor).append(": as ").append(safeId).append("\n");
            }
            if (!actorsSet.isEmpty()) sb.append("\n");
            return sb.toString();
        }

        @Override
        protected String generateUseCases(List<UseCase> useCases) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < useCases.size(); i++) {
                UseCase uc = useCases.get(i);
                sb.append("usecase \"").append(uc.getTitle()).append("\" as UC").append(i + 1).append("\n");
            }
            if (!useCases.isEmpty()) sb.append("\n");
            return sb.toString();
        }

        @Override
        protected String createAssociations(List<UseCase> useCases) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < useCases.size(); i++) {
                UseCase uc = useCases.get(i);
                String ucId = "UC" + (i + 1);
                if (uc.getActors() != null) {
                    for (String actor : uc.getActors()) {
                        if (actor != null && !actor.trim().isEmpty()) {
                            String safeId = actor.replaceAll("[^a-zA-Z0-9]", "_");
                            sb.append(safeId).append(" --> ").append(ucId).append("\n");
                        }
                    }
                }
            }
            return sb.toString();
        }

        @Override
        protected String generateFooter() {
            return "\n@endum\n";
        }
    }
    public static class NomnomlUseCaseGenerator extends UseCaseScriptTemplate {
        @Override
        protected String generateHeader() {
            return "#direction: right\n#zoom: 1\n#bgColor: #fdfdfd\n#stroke: #333\n\n";
        }

        @Override
        protected String defineActors(List<UseCase> useCases) {
            Set<String> actorsSet = new java.util.LinkedHashSet<>();
            for (UseCase uc : useCases) {
                if (uc.getActors() != null) {
                    for (String actor : uc.getActors()) {
                        if (actor != null && !actor.trim().isEmpty()) {
                            actorsSet.add(actor.trim());
                        }
                    }
                }
            }

            StringBuilder sb = new StringBuilder();
            for (String actor : actorsSet) {
                sb.append("[<actor> ").append(actor).append("]\n");
            }
            if (!actorsSet.isEmpty()) sb.append("\n");
            return sb.toString();
        }

        @Override
        protected String generateUseCases(List<UseCase> useCases) {
            StringBuilder sb = new StringBuilder();
            for (UseCase uc : useCases) {
                sb.append("[<usecase> ").append(uc.getTitle()).append("]\n");
            }
            if (!useCases.isEmpty()) sb.append("\n");
            return sb.toString();
        }

        @Override
        protected String createAssociations(List<UseCase> useCases) {
            StringBuilder sb = new StringBuilder();
            for (UseCase uc : useCases) {
                if (uc.getActors() != null) {
                    for (String actor : uc.getActors()) {
                        if (actor != null && !actor.trim().isEmpty()) {
                            sb.append("[<actor> ").append(actor).append("] -> [<usecase> ").append(uc.getTitle()).append("]\n");
                        }
                    }
                }
            }
            return sb.toString();
        }

        @Override
        protected String generateFooter() {
            return "";
        }
    }

    public static UseCaseScriptStrategy getUseCaseStrategy(String tool) {
        if ("nomnoml".equalsIgnoreCase(tool)) {
            return new NomnomlUseCaseGenerator();
        } else {
            return new PlantUMLUseCaseGenerator();
        }
    }
}