'use client';

import { useEffect, useReducer, useState } from 'react';
import { GameNode, GameState, Choice } from '@/types/game';
import { saveGameState, loadGameState, clearGameState, hasExistingGame } from '@/lib/storage';
import { initAnalytics, trackChoice, trackNodeVisit, trackGameComplete } from '@/lib/analytics';
import ChoiceButton from './ChoiceButton';
import TopMenu from './TopMenu';
import AppleIIeImageProcessor from './AppleIIeImageProcessor';
import storyData from '@/data/story.json';

interface GameAction {
  type: 'LOAD_GAME' | 'MAKE_CHOICE' | 'RESTART_GAME';
  payload?: GameState | { choice: Choice; nextNodeId: string };
}

const initialState: GameState = {
  currentNodeId: 'start',
  visitedNodes: [],
  choices: {},
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      return (action.payload as GameState) || initialState;
    
    case 'MAKE_CHOICE':
      const { choice, nextNodeId } = action.payload as { choice: Choice; nextNodeId: string };
      const newState = {
        ...state,
        currentNodeId: nextNodeId,
        visitedNodes: [...state.visitedNodes, state.currentNodeId],
        choices: {
          ...state.choices,
          [state.currentNodeId]: choice.text,
        },
      };
      return newState;
    
    case 'RESTART_GAME':
      return initialState;
    
    default:
      return state;
  }
}

export default function GameDisplay() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);

  useEffect(() => {
    initAnalytics();
    
    const existingGame = loadGameState();
    if (existingGame && hasExistingGame()) {
      setShowContinuePrompt(true);
    } else {
      dispatch({ type: 'LOAD_GAME', payload: initialState });
      trackNodeVisit('start');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !showContinuePrompt) {
      saveGameState(gameState);
    }
  }, [gameState, isLoading, showContinuePrompt]);

  const handleContinueGame = () => {
    const savedState = loadGameState();
    if (savedState) {
      dispatch({ type: 'LOAD_GAME', payload: savedState });
      trackNodeVisit(savedState.currentNodeId);
    }
    setShowContinuePrompt(false);
  };

  const handleNewGame = () => {
    clearGameState();
    dispatch({ type: 'RESTART_GAME' });
    trackNodeVisit('start');
    setShowContinuePrompt(false);
  };

  const handleChoice = (choice: Choice) => {
    const nextNodeId = choice.nextNodeId;
    
    trackChoice(gameState.currentNodeId, choice.text, nextNodeId);
    
    dispatch({
      type: 'MAKE_CHOICE',
      payload: { choice, nextNodeId },
    });

    trackNodeVisit(nextNodeId);

    const nextNode = storyData[nextNodeId as keyof typeof storyData] as GameNode;
    if (nextNode?.isEnding) {
      const totalChoices = Object.keys(gameState.choices).length + 1;
      trackGameComplete(nextNodeId, totalChoices);
    }
  };

  const handleRestart = () => {
    clearGameState();
    dispatch({ type: 'RESTART_GAME' });
    trackNodeVisit('start');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopMenu />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-violet text-xl font-mono blinking-cursor">LOADING</div>
        </div>
      </div>
    );
  }

  if (showContinuePrompt) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopMenu />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="border border-violet p-8 max-w-md w-full font-mono">
            <div className="text-violet mb-6">
              <div className="mb-4 blinking-cursor">CONTINUE YOUR INVESTIGATION?</div>
              <div className="text-sm mb-6">
                YOU HAVE A DETECTIVE CASE IN PROGRESS.<br/>
                WOULD YOU LIKE TO CONTINUE WHERE YOU<br/>
                LEFT OFF OR START A NEW INVESTIGATION?
              </div>
            </div>
            <div className="space-y-4">
              <button
                onClick={handleContinueGame}
                className="w-full p-2 border border-violet text-violet hover:bg-violet hover:text-black transition-colors duration-200 font-mono"
              >
                &gt; CONTINUE INVESTIGATION
              </button>
              <button
                onClick={handleNewGame}
                className="w-full p-2 border border-violet text-violet hover:bg-violet hover:text-black transition-colors duration-200 font-mono"
              >
                &gt; START NEW CASE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentNode = storyData[gameState.currentNodeId as keyof typeof storyData] as GameNode;

  if (!currentNode) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopMenu />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="border border-violet p-8 max-w-md w-full text-center font-mono">
            <div className="text-violet mb-4 blinking-cursor">ERROR</div>
            <div className="text-violet mb-4 text-sm">
              STORY NODE NOT FOUND: {gameState.currentNodeId}
            </div>
            <button
              onClick={handleRestart}
              className="px-6 py-2 border border-violet text-violet hover:bg-violet hover:text-black transition-colors duration-200 font-mono"
            >
              &gt; RESTART GAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <TopMenu />
      <div className="container mx-auto max-w-4xl mt-4">
        <div className="border border-violet font-mono">
          <div className="border-b border-violet p-4">
            <div className="text-violet text-center">
              <div className="text-xl mb-2 blinking-cursor">VALKYRIES DETECTIVE AGENCY</div>
              <div className="text-sm">
                GOLDEN STATE VALKYRIES SECRET INVESTIGATION UNIT
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="border border-violet p-4 mb-6">
              {currentNode.imageUrl && (
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4">
                  <AppleIIeImageProcessor
                    src={currentNode.imageUrl}
                    alt={currentNode.imageAlt || "Scene illustration"}
                    className="border border-violet"
                  />
                  <div className="text-violet">
                    {currentNode.text.split('\n\n').map((paragraph, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </div>
                    ))}
                    <span className="blinking-cursor"></span>
                  </div>
                </div>
              )}
              {!currentNode.imageUrl && (
                <div className="text-violet">
                  {currentNode.text.split('\n\n').map((paragraph, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      {paragraph}
                    </div>
                  ))}
                  <span className="blinking-cursor"></span>
                </div>
              )}
            </div>

            {currentNode.isEnding ? (
              <div className="text-center space-y-4">
                <div className="border border-violet p-4">
                  <div className="text-violet font-mono blinking-cursor">
                    *** INVESTIGATION COMPLETE ***
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="px-8 py-3 border border-violet text-violet hover:bg-violet hover:text-black transition-colors duration-200 font-mono"
                >
                  &gt; START NEW INVESTIGATION
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentNode.choices.map((choice, index) => (
                  <ChoiceButton
                    key={index}
                    choice={choice}
                    onClick={handleChoice}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-violet text-center">
              <button
                onClick={handleRestart}
                className="text-violet hover:bg-violet hover:text-black transition-colors duration-200 text-sm font-mono px-4 py-1"
              >
                &gt; RESTART INVESTIGATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}