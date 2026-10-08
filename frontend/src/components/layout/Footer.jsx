import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Github, href: "https://github.com/Kaushik00007", name: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/kaushik-k-dev/", name: "LinkedIn" },
    { icon: Mail, href: "#", name: "Email" },
  ];

  const quickLinks = [
    { name: 'Browse Events', path: '/events' },
    { name: 'Participating Colleges', path: '/colleges' },
    { name: 'Hackathons', path: '/events?category=hackathon' },
    { name: 'Coding Contests', path: '/events?category=coding-contest' },
    { name: 'Workshops', path: '/events?category=workshop' },
    { name: 'Submit Event', path: '/create-event' },
  ];

  const categories = [
    { name: 'Seminars', path: '/events?category=seminar' },
    { name: 'Tech Talks', path: '/events?category=tech-talk' },
    { name: 'Cultural Events', path: '/events?category=cultural' },
    { name: 'Sports', path: '/events?category=sports' },
    { name: 'Networking', path: '/events?category=networking' },
  ];

  return (
    <footer className="relative bg-[#0b1629] text-gray-400 overflow-hidden font-sans border-t border-white/5">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] translate-y-1/2 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-16 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">

          {/* Branding - Left Side (Spans 2 columns) */}
          <div className="md:col-span-2 flex flex-col items-start pr-0 md:pr-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              We love great <span className="text-blue-500">events</span> <br className="hidden sm:block" />
              and the <span className="text-orange-400">people</span> who make them happen.
            </h2>
            <p className="text-base lg:text-lg text-gray-400 mb-8 max-w-md leading-relaxed font-medium">
              Your one-stop platform to discover college events, hackathons, coding contests, workshops, and more.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-auto">
              {socialLinks.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  aria-label={item.name}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links - Column 3 */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - Column 4 */}
          <div className="md:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">Categories</h3>
            <ul className="space-y-4">
              {categories.map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} EventNexus. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors duration-300 font-medium">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors duration-300 font-medium">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors duration-300 font-medium">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
