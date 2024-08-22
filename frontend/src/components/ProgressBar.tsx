interface ProgressBarProps {
  percentage: number;
  stages?: string[];
  message?: string;
}

const isStageActive = (
  percentage: number,
  stage: number,
  totalStages: number
) => {
  if (stage === 1) {
    return true;
  }
  const stagePercentage = 100 / totalStages;
  const stageStart = stagePercentage * (stage - 1);
  return percentage >= stageStart;
};

const currentStage = (percentage: number, totalStages: number) => {
  const stagePercentage = 100 / totalStages;
  return Math.floor(percentage / stagePercentage);
};

interface StageProps {
  stage: number;
  totalStages: number;
  currentPercentage: number;
  children: React.ReactNode;
}

function Stage({ stage, totalStages, currentPercentage, children }: StageProps) {
  const color = isStageActive(currentPercentage, stage, totalStages)
    ? "text-indigo-600"
    : "";
  const textpos =
    stage === 1
      ? "text-left"
      : stage === totalStages
      ? "text-right"
      : "text-center";
  return <div className={`${color} ${textpos}`}>{children}</div>;
}

export default function ProgressBar({
  message,
  percentage,
  stages = [],
}: ProgressBarProps) {
  if (percentage < 0 || percentage > 100) {
    throw new Error("Percentage must be between 0 and 100");
  }

  return (
    <div>
      <h4 className="sr-only">Status</h4>
      {message && (
        <p className="text-sm font-medium text-gray-900">
          {message}...
        </p>
      )}
      {!message && stages && stages.length && (
        <p className="text-sm font-medium text-gray-900">
          {stages[currentStage(percentage, stages.length)]}...
        </p>
      )}
      <div aria-hidden="true" className="mt-6">
        <div className="overflow-hidden rounded-full bg-gray-200">
          <div
            style={{ width: `${percentage}%` }}
            className="h-2 rounded-full bg-indigo-600"
          />
        </div>
        {stages && stages.length > 1 && (
          <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
            {stages.map((stage, index) => (
              <Stage
                key={index}
                stage={index + 1}
                totalStages={stages.length}
                currentPercentage={percentage}
              >
                {stage}
              </Stage>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
