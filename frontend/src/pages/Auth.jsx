import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(location.pathname === '/register' ? 'signup' : 'login');
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const switchMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    
    // Dispatch custom events to pause/resume expensive background operations
    window.dispatchEvent(new Event('authTransitionStart'));
    setTimeout(() => {
      window.dispatchEvent(new Event('authTransitionEnd'));
    }, 500); // 400ms duration + 100ms buffer
  };

  // Keep URL in sync
  useEffect(() => {
    const path = mode === 'login' ? '/login' : '/register';
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  }, [mode, navigate, location.pathname]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '', college: '' });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setShowPassword(false);
  }, [mode]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(loginData.email, loginData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await register({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        college: signupData.college
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (password.length < 6) return { strength: 0, text: 'Too short', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 1, text: 'Weak', color: 'bg-orange-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, text: 'Strong', color: 'bg-green-500' };
    }
    return { strength: 2, text: 'Medium', color: 'bg-yellow-500' };
  };

  const pwStrength = passwordStrength(signupData.password);
  const inputClasses = "w-full pl-9 pr-4 h-10 bg-[#0F1629]/80 backdrop-blur-md border border-white/5 rounded-xl text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium shadow-inner hover:bg-[#0F1629]";

  // Optimal transition settings
  const transitionSettings = { duration: 0.4, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="h-screen w-full relative bg-[#0B0F1A] text-white overflow-hidden font-sans">
      {/* Texture Noise Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

      {/* Left Branding Panel (translates right on signup) */}
      <motion.div 
        initial={false}
        animate={{ x: isDesktop ? (mode === 'login' ? '0vw' : '45vw') : '0vw' }}
        transition={transitionSettings}
        className="hidden lg:flex absolute top-0 left-0 h-full w-[55vw] flex-col justify-between p-12 xl:p-20 z-10"
        style={{ willChange: 'transform' }}
      >
        {/* Cinematic Lighting & Gradients (Simplified for Performance) */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-purple-600/20 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-transparent z-0 pointer-events-none" />
        
        {/* Subtle glowing divider edge */}
        <motion.div 
          initial={false}
          animate={{ left: mode === 'login' ? '100%' : '0%' }}
          transition={transitionSettings}
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/30 to-transparent shadow-[0_0_25px_rgba(139,92,246,0.5)] z-20 pointer-events-none"
        />

        <div className="relative z-10 flex items-center gap-2">
          <Link to="/" className="inline-flex items-center">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm">
              EventNexus
            </span>
          </Link>
        </div>
        
        <div className="relative z-10 max-w-xl mb-20">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login-text"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight">
                  Manage your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">Events</span><br />
                  with ease.
                </h1>
                <p className="text-gray-400 text-xl leading-relaxed font-light">
                  Join the definitive platform for discovering, hosting, and managing extraordinary events worldwide inside a modern interface.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-text"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight">
                  Start your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.3)]">Journey</span><br />
                  with us.
                </h1>
                <p className="text-gray-400 text-xl leading-relaxed font-light">
                  Create an account to join the community of event enthusiasts, organizers, and attendees.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative z-10 text-sm text-gray-500/80 font-medium">
          © {new Date().getFullYear()} EventNexus. All rights reserved.
        </div>
      </motion.div>

      {/* Right Form Panel (translates left on signup) */}
      <motion.div 
        initial={false}
        animate={{ x: isDesktop ? (mode === 'login' ? '0vw' : '-55vw') : '0vw' }}
        transition={transitionSettings}
        className="absolute top-0 right-0 h-full w-full lg:w-[45vw] flex items-center justify-center p-4 lg:p-6 z-20"
        style={{ willChange: 'transform' }}
      >
        {/* Simplified soft glow behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-purple-600/10 via-transparent to-indigo-600/10 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="w-full max-w-[460px] bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-7 shadow-lg relative shrink-0">
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-5">
            <Link to="/" className="inline-flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">EventNexus</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div 
                key="login-form"
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-1 text-white">Welcome back</h2>
                  <p className="text-gray-400/80 text-xs">Sign in to your account to continue</p>
                </div>
                
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 overflow-hidden backdrop-blur-md">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-400 text-xs font-medium">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="login-email" className="block text-[11px] font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        required
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className={inputClasses}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-[11px] font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className={inputClasses}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 hover:text-gray-300 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center h-4">
                      <input type="checkbox" className="h-3 w-3 rounded bg-[#0F1629]/80 border-white/10 text-purple-500 focus:ring-purple-500/50 focus:ring-offset-0 transition-colors" />
                    </div>
                    <label className="flex flex-1 items-center cursor-pointer group">
                      <span className="ml-2 text-[10px] text-gray-400/90 group-hover:text-gray-300 transition-colors font-light">Remember me</span>
                    </label>
                    <a href="#" className="text-[10px] font-medium text-purple-400/90 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all">
                      Forgot password?
                    </a>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="relative w-full mt-3 h-10 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white fill-white text-[13px] font-semibold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-[#111827] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden border border-white/10 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex items-center justify-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </div>
                  </motion.button>
                </form>

                <p className="mt-4 text-center text-[12px] text-gray-400/80 font-medium tracking-wide">
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] font-semibold transition-all focus:outline-none">
                    Sign up for free
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="signup-form"
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5 text-center lg:text-left">
                  <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-1 text-white">Create an account</h2>
                  <p className="text-gray-400/80 text-xs">Join the community of event enthusiasts</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 overflow-hidden backdrop-blur-md">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-red-400 text-xs font-medium">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSignupSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="signup-name" className="block text-[11px] font-medium text-gray-300 mb-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input id="signup-name" name="name" type="text" required value={signupData.name} onChange={handleSignupChange} className={inputClasses} placeholder="John Doe" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="block text-[11px] font-medium text-gray-300 mb-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input id="signup-email" name="email" type="email" required value={signupData.email} onChange={handleSignupChange} className={inputClasses} placeholder="you@example.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-college" className="block text-[11px] font-medium text-gray-300 mb-1">College / University</label>
                    <div className="relative group">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input id="signup-college" name="college" type="text" value={signupData.college} onChange={handleSignupChange} className={inputClasses} placeholder="IIT Delhi" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-[11px] font-medium text-gray-300 mb-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} required value={signupData.password} onChange={handleSignupChange} className={inputClasses} placeholder="Create a strong password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 hover:text-gray-300 transition-colors focus:outline-none">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {signupData.password && (
                      <div className="mt-1.5 text-[10px] font-medium tracking-wide flex justify-end text-gray-400/80">
                        <span className={pwStrength.color.replace('bg-', 'text-')} style={{ textShadow: "0 0 10px currentColor" }}>{pwStrength.text}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-confirmPassword" className="block text-[11px] font-medium text-gray-300 mb-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/80 w-3.5 h-3.5 transition-colors group-focus-within:text-purple-400" />
                      <input id="signup-confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={signupData.confirmPassword} onChange={handleSignupChange} className={inputClasses} placeholder="Confirm your password" />
                      {signupData.confirmPassword && signupData.password === signupData.confirmPassword && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500/80 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start cursor-pointer group pt-1">
                    <div className="flex items-center h-4">
                      <input id="terms" type="checkbox" required className="h-3 w-3 rounded bg-[#0F1629]/80 border-white/10 text-purple-500 focus:ring-purple-500/50 focus:ring-offset-0 mt-0.5 shrink-0 transition-colors" />
                    </div>
                    <label htmlFor="terms" className="ml-2 text-[10px] text-gray-400/90 group-hover:text-gray-300 transition-colors leading-relaxed font-light">
                      I agree to the <a href="#" className="text-purple-400/90 font-medium hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all">Terms of Service</a> and <a href="#" className="text-purple-400/90 font-medium hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all">Privacy Policy</a>
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="relative w-full mt-3 h-10 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white fill-white text-[13px] font-semibold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-[#111827] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden border border-white/10 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex items-center justify-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Creating account...
                        </>
                      ) : 'Create Account'}
                    </div>
                  </motion.button>
                </form>

                <p className="mt-4 text-center text-[12px] text-gray-400/80 font-medium tracking-wide">
                  Already have an account?{' '}
                  <button onClick={() => switchMode('login')} className="text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] font-semibold transition-all focus:outline-none">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
