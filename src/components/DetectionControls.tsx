import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useDeadlockStore } from '@/store/useDeadlockStore';
import { useSimulatorStore } from '@/store/useSimulatorStore';
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';

const DetectionControls = () => {
  const isLoading = useDeadlockStore((s) => s.isLoading);
  const error = useDeadlockStore((s) => s.error);
  const simulationType = useDeadlockStore((s) => s.simulationType);
  const wfgSimulationResult = useDeadlockStore((s) => s.wfgSimulationResult);
  const matrixSimulationResult = useDeadlockStore((s) => s.matrixSimulationResult);
  const currentStep = useDeadlockStore((s) => s.currentStep);
  const isAnimating = useDeadlockStore((s) => s.isAnimating);
  const animationSpeed = useDeadlockStore((s) => s.animationSpeed);
  const totalSteps = useDeadlockStore((s) => s.totalSteps);

  const detectDeadlockWithWFG = useDeadlockStore((s) => s.detectDeadlockWithWFG);
  const detectDeadlockWithMatrix = useDeadlockStore((s) => s.detectDeadlockWithMatrix);
  const goToStep = useDeadlockStore((s) => s.goToStep);
  const nextStep = useDeadlockStore((s) => s.nextStep);
  const prevStep = useDeadlockStore((s) => s.prevStep);
  const startAnimation = useDeadlockStore((s) => s.startAnimation);
  const stopAnimation = useDeadlockStore((s) => s.stopAnimation);
  const setSpeed = useDeadlockStore((s) => s.setSpeed);

  const reset = useSimulatorStore((s) => s.reset);

  // Get the current simulation result based on type
  const simulationResult = simulationType === 'wfg' ? wfgSimulationResult : matrixSimulationResult;

  // Get current step data
  const currentStepData = simulationResult?.simulation?.steps[currentStep];

  const handleReset = () => {
    stopAnimation();
    reset();
    goToStep(0);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4">
      <h3 className="text-xl font-semibold text-zinc-200 mb-4">Deadlock Detection Controls</h3>

      {/* Detection controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={detectDeadlockWithWFG}
            disabled={isLoading}
            className={`${simulationType === 'wfg' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'} text-white flex-1 sm:flex-none`}
          >
            {isLoading && simulationType === 'wfg' ? 'Detecting...' : 'WFG Detection'}
          </Button>

          <Button
            onClick={detectDeadlockWithMatrix}
            disabled={isLoading}
            className={`${simulationType === 'matrix' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-700 hover:bg-zinc-600'} text-white flex-1 sm:flex-none`}
          >
            {isLoading && simulationType === 'matrix' ? 'Detecting...' : 'Matrix Detection'}
          </Button>
        </div>

        <Button
          onClick={handleReset}
          variant="destructive"
          className="w-full sm:w-auto"
        >
          Reset All
        </Button>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {simulationResult && (
          <div className="bg-zinc-800 px-3 py-2 rounded-md text-sm">
            <span className={simulationResult.deadlocked ? 'text-red-400' : 'text-green-400'}>
              {simulationResult.deadlocked ? 'Deadlock Detected!' : 'No Deadlock Detected'}
            </span>
          </div>
        )}
      </div>

      {/* Animation controls - only show if we have simulation data */}
      {simulationResult?.simulation?.steps && simulationResult.simulation.steps.length > 0 && (
        <>
          {/* Current step info */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-md p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-zinc-400">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm font-semibold text-zinc-300">{currentStepData?.action || 'No action'}</span>
            </div>
          </div>

          {/* Animation controls */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            {/* Animation buttons */}
            <div className="flex justify-center space-x-3">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0 || isLoading || isAnimating}
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>

              {isAnimating ? (
                <Button
                  onClick={stopAnimation}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  <PauseIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={startAnimation}
                  disabled={currentStep === totalSteps - 1 || isLoading}
                  variant="outline"
                  size="sm"
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
                >
                  <PlayIcon className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={nextStep}
                disabled={currentStep === totalSteps - 1 || isLoading || isAnimating}
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => goToStep(0)}
                disabled={currentStep === 0 || isLoading || isAnimating}
                variant="outline"
                size="sm"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Spacer for grid layout */}
            <div className="hidden sm:block"></div>

            {/* Animation speed */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-zinc-400">Speed:</span>
              <div className="w-full max-w-[200px]">
                <Slider
                  value={[animationSpeed]}
                  min={100}
                  max={3000}
                  step={100}
                  onValueChange={(value: number[]) => setSpeed(value[0])}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-zinc-400">{(animationSpeed / 1000).toFixed(1)}s</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DetectionControls;