'use client';

import { Choice } from '@/types/game';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choice: Choice) => void;
  disabled?: boolean;
}

export default function ChoiceButton({ choice, onClick, disabled = false }: ChoiceButtonProps) {
  return (
    <button
      onClick={() => onClick(choice)}
      disabled={disabled}
      className="w-full p-3 mb-2 text-left border border-violet text-violet hover:bg-violet hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-mono"
    >
      <span className="block">
        &gt; {choice.text}
      </span>
    </button>
  );
}