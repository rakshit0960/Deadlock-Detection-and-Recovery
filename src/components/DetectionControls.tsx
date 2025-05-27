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
  ArrowsRightLeftIcon,
  CircleStackIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Small spinner SVG using Heroicons
const Spinner = ({ className = 'h-4 w-4' }) => (
  <ArrowPathIcon className={`${className} animate-spin`} />
);

const DetectionControls = () => {
  const isLoading = useDeadlockStore((s) => s.isLoading);
  const error = useDeadlockStore((s) => s.error);
  const simulationType = useDeadlockStore((s) => s.simulationType);
  const wfgSimulationResult = useDeadlockStore((s) => s.wfgSimulationResult);
  const matrixSimulationResult = useDeadlockStore((s) => s.matrixSimulationResult);
  const recoverySimulationResult = useDeadlockStore((s) => s.recoverySimulationResult);
  const currentStep = useDeadlockStore((s) => s.currentStep);
  const isAnimating = useDeadlockStore((s) => s.isAnimating);
  const animationSpeed = useDeadlockStore((s) => s.animationSpeed);
  const totalSteps = useDeadlockStore((s) => s.totalSteps);

  const detectDeadlockWithWFG = useDeadlockStore((s) => s.detectDeadlockWithWFG);
  const detectDeadlockWithMatrix = useDeadlockStore((s) => s.detectDeadlockWithMatrix);
  const runDeadlockRecovery = useDeadlockStore((s) => s.runDeadlockRecovery);
  const goToStep = useDeadlockStore((s) => s.goToStep);
  const nextStep = useDeadlockStore((s) => s.nextStep);
  const prevStep = useDeadlockStore((s) => s.prevStep);
  const startAnimation = useDeadlockStore((s) => s.startAnimation);
  const stopAnimation = useDeadlockStore((s) => s.stopAnimation);
  const setSpeed = useDeadlockStore((s) => s.setSpeed);

  const reset = useSimulatorStore((s) => s.reset);

  // Get the current simulation result based on type
  const simulationResult = simulationType === 'wfg'
    ? wfgSimulationResult
    : simulationType === 'matrix'
      ? matrixSimulationResult
      : null;

  const handleReset = () => {
    stopAnimation();
    reset();
    goToStep(0);
  };

  // Determine status message
  const getStatus = () => {
    if (simulationType === 'recovery' && recoverySimulationResult) {
      const lastStep = recoverySimulationResult.steps[recoverySimulationResult.steps.length - 1];
      if (lastStep?.result) {
        return {
          message: lastStep.result === 'No Deadlock' ? 'Recovery Successful' : 'Recovery Failed',
          isError: lastStep.result !== 'No Deadlock'
        };
      }
      return null;
    }
    if (simulationResult) {
      return {
        message: simulationResult.deadlocked ? 'Deadlock Detected' : 'No Deadlock',
        isError: simulationResult.deadlocked
      };
    }
    return null;
  };

  const status = getStatus();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Detection & Recovery</CardTitle>
        {status && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${status.isError
            ? 'bg-destructive/10 text-destructive border-destructive/20'
            : 'bg-success/10 text-success border-success/20'
            }`}>
            {status.message}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detection Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={detectDeadlockWithWFG}
            disabled={isLoading}
            variant="outline"
            className={`relative h-20 flex flex-col items-center justify-center gap-2 transition-all
              ${simulationType === 'wfg' ? 'bg-primary/5 border-primary/50 hover:bg-primary/10' : ''}`}
          >
            <ArrowsRightLeftIcon className={`h-5 w-5 ${simulationType === 'wfg' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={simulationType === 'wfg' ? 'text-primary font-medium' : 'text-muted-foreground'}>WFG Detection</span>
            {isLoading && simulationType === 'wfg' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md backdrop-blur-sm">
                <Spinner className="text-primary" />
              </div>
            )}
          </Button>

          <Button
            onClick={detectDeadlockWithMatrix}
            disabled={isLoading}
            variant="outline"
            className={`relative h-20 flex flex-col items-center justify-center gap-2 transition-all
              ${simulationType === 'matrix' ? 'bg-primary/5 border-primary/50 hover:bg-primary/10' : ''}`}
          >
            <CircleStackIcon className={`h-5 w-5 ${simulationType === 'matrix' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={simulationType === 'matrix' ? 'text-primary font-medium' : 'text-muted-foreground'}>Matrix Detection</span>
            {isLoading && simulationType === 'matrix' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md backdrop-blur-sm">
                <Spinner className="text-primary" />
              </div>
            )}
          </Button>

          <Button
            onClick={runDeadlockRecovery}
            disabled={!!(isLoading || !simulationType || (simulationResult && !simulationResult.deadlocked))}
            variant="outline"
            className={`relative h-20 flex flex-col items-center justify-center gap-2 transition-all
              ${simulationType === 'recovery' ? 'bg-destructive/5 border-destructive/50 hover:bg-destructive/10' : ''}`}
          >
            <BoltIcon className={`h-5 w-5 ${simulationType === 'recovery' ? 'text-destructive' : 'text-muted-foreground'}`} />
            <span className={simulationType === 'recovery' ? 'text-destructive font-medium' : 'text-muted-foreground'}>RL Recovery</span>
            {isLoading && simulationType === 'recovery' && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md backdrop-blur-sm">
                <Spinner className="text-destructive" />
              </div>
            )}
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Animation controls */}
        {simulationType !== 'recovery' && simulationResult?.simulation?.steps && simulationResult.simulation.steps.length > 0 && (
          <div className="space-y-4 border rounded-lg p-4">
            {/* Current step info */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {totalSteps}</span>
              <span className="text-sm font-medium">{simulationResult.simulation.steps[currentStep]?.action || 'No action'}</span>
            </div>

            <div className="flex justify-between items-center">
              {/* Animation buttons */}
              <div className="flex justify-center gap-2">
                <Button onClick={prevStep} disabled={currentStep === 0 || isLoading || isAnimating} variant="outline" size="sm">
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>

                {isAnimating ? (
                  <Button onClick={stopAnimation} variant="outline" size="sm">
                    <PauseIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={startAnimation} disabled={currentStep === totalSteps - 1 || isLoading} variant="outline" size="sm">
                    <PlayIcon className="h-4 w-4" />
                  </Button>
                )}

                <Button onClick={nextStep} disabled={currentStep === totalSteps - 1 || isLoading || isAnimating} variant="outline" size="sm">
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>

                <Button onClick={() => goToStep(0)} disabled={currentStep === 0 || isLoading || isAnimating} variant="outline" size="sm">
                  <Spinner />
                </Button>
              </div>

              <div className="hidden sm:block" />

              {/* Animation speed */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Speed</span>
                <div className="flex-1">
                  <Slider
                    value={[animationSpeed]}
                    min={50}
                    max={2000}
                    step={50}
                    onValueChange={(v: number[]) => setSpeed(v[0])}
                    disabled={isLoading}
                    className="w-[120px]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpeed(Math.max(50, animationSpeed - 50))}
                    disabled={isLoading || animationSpeed <= 50}
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium tabular-nums w-16 text-center">
                    {(animationSpeed / 1000).toFixed(2)}s
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSpeed(Math.min(2000, animationSpeed + 50))}
                    disabled={isLoading || animationSpeed >= 2000}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset button */}
        <Button
          onClick={handleReset}
          variant="outline"
          className="w-full"
        >
          Reset All
        </Button>
      </CardContent>
    </Card>
  );
};

export default DetectionControls;