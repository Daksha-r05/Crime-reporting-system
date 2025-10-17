import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">CrimeAlert</h3>
            <p className="text-gray-300 text-sm">
              Making communities safer through technology and collaboration.
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/report-crime" className="hover:text-white transition-colors">Report Crime</a></li>
              <li><a href="/profile" className="hover:text-white transition-colors">Profile</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 text-sm">
              Emergency: 100<br />
              Support: support@crimealert.com<br />
              Phone: 8147044285
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 CrimeAlert. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ for safer communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
