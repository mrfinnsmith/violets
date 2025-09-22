# Valkyries Detective CYOA Game - Product Requirements Document

## Overview
Browser-based text adventure featuring Golden State Valkyries as secret detectives solving A.C.E.S. (Anti-California Evil Society) crimes.

## Technical Stack
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React useReducer
- **Data Storage**: JSON file
- **Progress Saving**: localStorage (anonymous)
- **Analytics**: Mixpanel + Supabase
- **Hosting**: Vercel
- **Domain**: Custom (user-provided)

## Core Features

### Game Engine
- Single page application
- Node-based story system
- Choice-driven progression
- Local progress saving (no accounts)
- Mobile-first responsive design

### Story Structure
- JSON-based content management
- Flexible branching paths
- Story progression tracking only
- No RPG stats initially

### Analytics

**localStorage (client-side)**
- Current node ID
- Visited nodes array
- Choice history
- Session ID
- Session start time

**Mixpanel Events**
- Story events: `node_visited`, `choice_made`, `game_started`, `back_button_used`
- UI events: `game_loaded`, `settings_opened`, `share_clicked`, `restart_clicked`

### Analytics

**localStorage (client-side)**
- Current node ID
- Visited nodes array
- Choice history
- Session ID
- Session start time

**Mixpanel Events**
- Story events: `node_visited`, `choice_made`, `game_started`, `back_button_used`
- UI events: `game_loaded`, `settings_opened`, `share_clicked`, `restart_clicked`

**Supabase Tables**

**sessions**
- session_id (UUID, primary key)
- started_at (timestamp)
- device_type (string)
- Purpose: Track unique game sessions

**completions**
- session_id (UUID, foreign key)
- completed_at (timestamp)
- ending_node_id (string)
- completion_number (integer)
- Purpose: Track multiple story endings per session

**player_choices**
- session_id (UUID, foreign key)
- node_id (string)
- choice_index (integer)
- next_node_id (string)
- timestamp (timestamp)
- Purpose: Track every choice made by players

**node_versions**
- node_id (string)
- version_number (integer)
- content_json (JSON - full node text and choices)
- created_at (timestamp)
- Purpose: Store historical versions of story content for analytics context

## Data Structure

### GameNode Interface
```typescript
interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  isEnding?: boolean;
}

interface Choice {
  text: string;
  nextNodeId: string;
  conditions?: string[];
}

interface GameState {
  currentNodeId: string;
  visitedNodes: string[];
  choices: Record<string, string>;
}
```

## File Architecture
```
/components
  ├── GameDisplay.tsx (main game component)
  ├── ChoiceButton.tsx (individual choices)
  └── ProgressBar.tsx (story progress)
/data
  └── story.json (all game nodes)
/types
  └── game.ts (TypeScript interfaces)
/lib
  ├── analytics.ts (Mixpanel integration)
  └── storage.ts (localStorage utilities)
```

## Story Content
- **Target**: Stolen piano from Golden Gate Park Flower Piano installation
- **Antagonist**: A.C.E.S. (Anti-California Evil Society)
- **Protagonists**: Veronica Burton, Laeticia Amihere, Carla Leite
- **Structure**: 35-node critical path with branching options

## Design Requirements
- Mobile-first responsive layout
- Single theme (fixed colors/fonts)
- Dark/light mode consideration for future iteration
- Clean, readable typography
- Touch-friendly choice buttons

## Success Metrics
- Node completion rates
- Choice distribution analytics
- Drop-off points identification
- Story path popularity

## Development Phases
1. **Phase 1**: Core game engine + basic story
2. **Phase 2**: Analytics integration
3. **Phase 3**: Content expansion via JSON editing

## Constraints
- No user accounts/authentication
- No server-side database
- JSON-only content management
- Anonymous analytics only