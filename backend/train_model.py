from stable_baselines3 import PPO
from env import DeadlockRecoveryEnv

# Create and configure the environment
env = DeadlockRecoveryEnv(num_processes=10, num_resources=5)

# Create the model
model = PPO("MlpPolicy", env, verbose=1)

# Train the model
model.learn(total_timesteps=100000)

# Save the trained model
model.save("ppo_deadlock_multi_env")