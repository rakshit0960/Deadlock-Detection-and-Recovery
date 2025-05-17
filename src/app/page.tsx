"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200"
    >
      <main className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Deadlock Detection & Recovery Simulator
        </motion.h1>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl mb-12"
        >
          <div className="text-center space-y-6">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-gray-700"
            >
              Welcome to the Deadlock Detection & Recovery Simulator. This tool helps you understand and experiment with deadlock scenarios in operating systems.
            </motion.p>

            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/simulator"
                  className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-lg font-medium shadow-md"
                >
                  Go to Simulator
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/about"
                  className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all text-lg font-medium shadow-md"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">What is Deadlock?</h2>
            <p className="text-gray-600">
              A deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource. Learn more about this fundamental concept in operating systems.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Features</h2>
            <ul className="text-gray-600 space-y-2">
              <li>• Interactive deadlock simulation</li>
              <li>• Real-time resource allocation visualization</li>
              <li>• Multiple deadlock prevention strategies</li>
              <li>• Step-by-step recovery process</li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl"
        >
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="font-semibold mb-2">Create Process</h3>
              <p className="text-gray-600">Add processes and define their resource requirements</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
              <h3 className="font-semibold mb-2">Allocate Resources</h3>
              <p className="text-gray-600">Assign resources and observe system behavior</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <h3 className="font-semibold mb-2">Analyze Results</h3>
              <p className="text-gray-600">Understand deadlock scenarios and recovery methods</p>
            </div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
