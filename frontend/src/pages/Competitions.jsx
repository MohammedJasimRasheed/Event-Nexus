import { Trophy } from 'lucide-react';

const Competitions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Competitions</h1>
            <p className="text-gray-600">Compete in coding contests and win prizes</p>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              Participate in exciting coding competitions and showcase your skills. 
              Compete with the best and win amazing rewards!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 text-primary-600 rounded-lg">
              <span className="font-medium">Feature under development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competitions;
