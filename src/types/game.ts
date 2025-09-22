export interface GameNode {
  id: string;
  text: string;
  choices: Choice[];
  isEnding?: boolean;
}

export interface Choice {
  text: string;
  nextNodeId: string;
  conditions?: string[];
}

export interface GameState {
  currentNodeId: string;
  visitedNodes: string[];
  choices: Record<string, string>;
}

export interface AnalyticsEvent {
  event: string;
  properties: {
    nodeId: string;
    choiceText?: string;
    nextNodeId?: string;
    timestamp: number;
  };
}