import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-navy-900 text-white py-6">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-flamingo-400 mr-2">
                  <path d="M8 17.0001C7 17.0001 5 17.5001 5 14.5001C5 11.9998 6 8.99935 7 7.99935C8.5 6.5 11 6.5 13 7.5C15 8.5 14 10.9999 14 12.4999C14 13.9999 13 18.5002 8 17.0001Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.9998 7.5C13.9998 7.5 13.4998 9.5 13.9998 12" stroke="#F56476" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18V20" stroke="#F56476" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 19C16 19 16.5 17 14.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 17C18 17 19 15.5 17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-display font-semibold text-lg">Flamingo</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                B2B Travel Management Platform
              </p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Flamingo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;