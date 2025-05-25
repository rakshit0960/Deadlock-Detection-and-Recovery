# Deadlock Detection and Recovery System using Reinforcement Learning

This project implements an innovative approach to deadlock detection and recovery by combining traditional algorithms with modern reinforcement learning techniques. The system uses a FastAPI backend for deadlock detection and a sophisticated RL-based recovery mechanism, along with a Next.js frontend for visualization.

## Key Features

- **Reinforcement Learning Based Recovery**:

  - Uses Proximal Policy Optimization (PPO) algorithm
  - Custom environment modeling deadlock scenarios
  - Trained on diverse system states
  - Optimizes for minimal resource wastage and system downtime

- **Traditional Detection Methods**:

  - Matrix-based detection using Banker's Algorithm
  - Wait-for-graph based cycle detection

- **Interactive Visualization**:
  - Real-time system state monitoring
  - Process and resource allocation visualization
  - Deadlock detection and recovery visualization

## Reinforcement Learning Architecture

### Environment Design

- **State Space**: Represents system state including:

  - Process states (running, waiting, blocked)
  - Resource allocation matrix
  - Resource request matrix
  - Waiting time for each process

- **Action Space**: Available recovery actions:

  - Process termination
  - Resource preemption
  - Process priority adjustment
  - Resource reallocation

- **Reward Function**: Optimizes for:
  - Minimizing number of terminated processes
  - Reducing system recovery time
  - Maintaining fair resource distribution
  - Maximizing system throughput

### Training Process

The RL model is trained using PPO (Proximal Policy Optimization) with the following parameters:

- Learning rate: Adaptive
- Training episodes: 100,000
- Environment steps per update: 2048
- Discount factor (gamma): 0.99

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── main.py       # Main API endpoints
│   ├── matrix.py     # Matrix-based detection
│   ├── env.py        # Custom RL environment
│   └── train_model.py # PPO model training script
└── src/              # Next.js frontend
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Train the RL model (optional, pre-trained model included):

```bash
python train_model.py
```

5. Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`. API documentation can be accessed at `http://localhost:8000/docs`.

### Frontend Setup

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Endpoints

- `POST /api/matrix`: Matrix-based deadlock detection

  - Input: Resource allocation and request matrices
  - Output: Deadlock status and involved processes

- `POST /api/wfg`: Wait-for-graph based detection

  - Input: Process dependencies
  - Output: Deadlock cycles and affected processes

- `POST /api/deadlock_recovery`: RL-based deadlock recovery
  - Input: Current system state (process states, resource allocation)
  - Output: Optimal recovery actions with confidence scores

## How It Works

### Deadlock Detection

The system uses two complementary approaches for deadlock detection:

1. **Matrix-based Detection**: Uses resource allocation and request matrices to identify potential deadlocks using the Banker's Algorithm.

2. **Wait-for-Graph**: Constructs a graph of process dependencies to identify cycles that indicate deadlocks.

### Reinforcement Learning Based Recovery

The system employs a sophisticated RL approach for deadlock recovery:

1. **State Observation**:

   - Monitors system state including process states and resource allocation
   - Tracks waiting times and resource utilization

2. **Action Selection**:

   - The PPO model evaluates possible recovery actions
   - Selects optimal action based on current state
   - Considers long-term impact on system performance

3. **Execution and Learning**:

   - Implements selected recovery action
   - Updates model based on action outcomes
   - Continuously improves recovery strategy

4. **Performance Metrics**:
   - Recovery time
   - Resource utilization
   - Process completion rate
   - System throughput

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
