'use client';

interface ScenarioToggleProps {
  selectedScenario: string;
  onScenarioChange: (scenario: string) => void;
  scenarios?: { id: string; label: string }[];
}

export default function ScenarioToggle({ 
  selectedScenario, 
  onScenarioChange,
  scenarios = [
    { id: 'base', label: 'Base' },
    { id: 'best', label: 'Best Case' },
    { id: 'worst', label: 'Worst Case' },
  ]
}: ScenarioToggleProps) {
  return (
    <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => onScenarioChange(scenario.id)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            selectedScenario === scenario.id
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          {scenario.label}
        </button>
      ))}
    </div>
  );
}

