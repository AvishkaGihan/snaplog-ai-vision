# SnapLog AI Vision

Fashion inventory management app powered by AI vision extraction. Built with Expo, Firebase, and TypeScript.

## Project Structure

This is a monorepo using npm workspaces:

- **`contracts/`** - Shared TypeScript schemas and enums (Zod-based validation)
- **`functions/`** - Firebase Cloud Functions (backend API)
- **`mobile/`** - Expo mobile app (React Native + Expo Router)

## Prerequisites

- Node.js 20+
- npm 10+
- Firebase CLI (optional for deployment)

## Installation

```bash
# Clone the repository
git clone https://github.com/AvishkaGihan/snaplog-ai-vision.git
cd snaplog-ai-vision

# Install all dependencies
npm install

# Build shared contracts
npm run build -w contracts
```

## Development

### Mobile App

```bash
# Start Expo dev server
npm run dev -w mobile

# Or use specific platform
npm run android -w mobile
npm run ios -w mobile
npm run web -w mobile
```

### Firebase Functions

```bash
# Build functions
npm run build -w functions

# Watch mode for development
npm run dev -w functions

# Serve with emulators
npm run serve -w functions
```

### Contracts

```bash
# Build contracts package
npm run build -w contracts

# Watch mode
npm run dev -w contracts
```

## Workspace Commands

Run commands for all packages:

```bash
# Build all
npm run build

# Typecheck all
npm run typecheck

# Lint all
npm run lint
```

Run command for specific package:

```bash
npm run <script> -w <package>
```

## Architecture

- **Monorepo**: npm workspaces
- **TypeScript**: End-to-end type safety
- **Frontend**: Expo Router (tabs template)
- **Backend**: Firebase Functions (asia-south1 region)
- **Database**: Firestore (per-user isolation)
- **Storage**: Firebase Storage (image-only, per-user isolation)
- **Validation**: Zod schemas in shared contracts

## Key Features

- Item status state machine (DRAFT_LOCAL → UPLOADING → ANALYZING → READY → CONFIRMED)
- Category taxonomy (18 predefined categories)
- AI response validation with strict JSON schema
- Per-user data isolation via Firestore and Storage rules
- Callable functions: `analyzeItem`, `exportInventoryCsv`, `requestAccountDeletion`

## Firebase Configuration

### Region

All functions run in `asia-south1` (Mumbai) for optimal latency.

### Security Rules

- Firestore: Per-user isolation (`users/{uid}/...`)
- Storage: Per-user isolation + image-only (max 5MB)

## Development Workflow

1. Make changes to contracts → build contracts
2. Make changes to functions/mobile → import from contracts
3. Run tests (coming soon)
4. Push to main → CI validates lint/typecheck/build

## CI/CD

GitHub Actions workflow validates:

- ✓ Lint
- ✓ Typecheck
- ✓ Build

Path filters ensure only changed packages are validated.

## License

Private project - all rights reserved.
