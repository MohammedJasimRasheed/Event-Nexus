import { Code } from 'lucide-react';

const Hackathons = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
            <Code className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Hackathons</h1>
            <p className="text-slate-600 dark:text-gray-400 font-medium">Join exciting hackathons and build amazing projects</p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="glass-panel-premium p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white mb-3">Coming Soon!</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-6 font-medium">
              Get ready to participate in the most exciting hackathons.
              Build, compete, and win amazing prizes!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/10 backdrop-blur-md border border-primary-500/20 text-primary-600 dark:text-primary-400 rounded-lg">
              <span className="font-bold uppercase tracking-wider text-xs">Feature under development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hackathons;
