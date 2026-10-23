# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Build the React pages around the shared API client, using relative /api paths through Vite’s proxy. Keep UI state and accessible loading, empty, and error messages in the presentation tier; leave validation and business rules to the backend.
- Logic tier decision: Keep API routes thin: validate and translate HTTP requests/responses there, and implement capability behavior in explicit TypeScript service functions. Return deliberate 4xx responses for invalid input, and keep database access behind the existing Mongoose models and shared database configuration.
- Data tier decision: Use Mongoose schemas for required-field validation and relationships, and seed stable demo records with upserts. Preserve unrelated user data, make seeding idempotent, and remove a demo user from their previous team when updating their team membership.
- Activity tracking approach: Validate the request and confirm userId and teamId are well-formed IDs for existing records before creating an activity. Store the linked user and team, type, and minutes; compute points and occurredAt in the service, and return deliberate 4xx responses for invalid input.
- Team management approach: Validate required team fields and member IDs, create teams with the submitted name and mascot, and keep member references consistent. Return 400 when the name is missing, and ensure listing preserves each team’s name, mascot, and members.
- Leaderboard approach: Aggregate activity points by team, sort teams by total points in descending order, and return each entry with its team name, total points, and a 1-based rank.
- Workout suggestions approach: Find the user by email, then use their fitness goal and recent activities to prioritize matching workouts. Include a reason for the recommendation, and return a deliberate 4xx response when no user matches.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — schema validation, relationships, or idempotent seed behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend`— endpoint validation, service behavior, or response contracts.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — API integration, rendered data, or loading/empty/error states.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — TypeScript compilation errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`— TypeScript or Vite build errors.
