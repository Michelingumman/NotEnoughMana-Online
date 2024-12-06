Core Game Architecture
Main Flow:

Entry point: src/App.tsx -> Routes to Home.tsx or Game.tsx
Game initialization: useGameState.ts handles setup and real-time updates
Turn management: TurnManager.ts controls game flow
Combat resolution: CombatResolver.ts handles card effects
Key Components:


src/
├── components/game/    # UI Components
├── hooks/             # Game Logic & Firebase Integration
├── lib/              # Firebase Configuration
├── config/           # Game Settings & Card Definitions
├── types/            # TypeScript Interfaces
└── utils/            # Game Mechanics
Card Management
Card Definitions:

Location: src/config/cards/pools/
Structure:

interface CardBase {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  rarity: CardRarity;
  type: string;
  effect: CardEffect;
  requiresTarget: boolean;
  color: string;
  isChallenge?: boolean;
  isLegendary?: boolean;
}
Card Pools:

Common: Basic attack/heal cards
Uncommon: Status effect cards
Rare: Complex utility cards
Epic: Challenge cards
Legendary: Game-changing effects
Game Configuration
Main Config Files:

src/config/gameConfig.ts: Core game parameters
src/config/firebase.ts: Firebase configuration
src/config/cards/rarities.ts: Card rarity settings
Key Settings:


export const GAME_CONFIG = {
  INITIAL_HEALTH: 10.0,
  INITIAL_MANA: 10.0,
  MAX_HEALTH: 10.0,
  MAX_MANA: 10.0,
  MANA_DRINK_AMOUNT: 3.0,
  MAX_PLAYERS: 10,
  MIN_PLAYERS_TO_START: 2
};
Essential Systems
State Management:

Firebase Realtime Database for game state
Zustand for local state (useGameStore.ts)
Effect managers for status effects
Turn Handling:

TurnManager.ts controls turn flow
Phases: start -> main -> end
Status effect processing
Turn transition logic
Combat System:

CombatResolver.ts handles card effects
Damage calculation
Status effect application
Challenge resolution
For common modifications:

Add new cards: Create in appropriate pool file in src/config/cards/pools/
Modify game parameters: Update src/config/gameConfig.ts
Add effects: Extend src/types/effects.ts and implement in EffectManager.ts
The codebase follows a modular architecture with clear separation of concerns, making it maintainable and extensible.