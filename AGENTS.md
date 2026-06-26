# Agent Instructions

- **Master Prompt**: Always refer to `docs/Samrajyam_Product_Backlog.md` for the current sprint goals, product backlog, and strict architectural rules.
- **Architectural Rules**:
  - DO NOT regenerate the project.
  - DO NOT replace the architecture.
  - DO NOT modify the backend API, Express server config, Firebase deployment, Gemini integration, or dotenv configuration.
  - DO NOT modify PORT handling.
  - Only make incremental, production-ready improvements.
- **Design System**: Adhere strictly to the existing Samrajyam Design System. Do not redesign the application. Use Light/Dark/System themes.
- **User Experience**: The application must be mobile-first, responsive, and provide feedback for every action (Loading, Success, Error, Empty State). No blank screens or silent failures.
