import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ChevronDown, User, LogOut, Package, Building, Calendar, Home } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout, isAdmin, isAgency } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-flamingo-500">
                <path d="M8 17.0001C7 17.0001 5 17.5001 5 14.5001C5 11.9998 6 8.99935 7 7.99935C8.5 6.5 11 6.5 13 7.5C15 8.5 14 10.9999 14 12.4999C14 13.9999 13 18.5002 8 17.0001Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.9998 7.5C13.9998 7.5 13.4998 9.5 13.9998 12" stroke="#D91B45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18V20" stroke="#D91B45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 19C16 19 16.5 17 14.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 17C18 17 19 15.5 17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-display font-semibold text-navy-900 text-xl">Flamingo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAdmin && (
              <>
                <Link
                  to="/admin/offers"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/offers')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Offres
                </Link>
                <Link
                  to="/admin/offers/new"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/offers/new')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Créer une offre
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/users')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Utilisateurs
                </Link>
                <Link
                  to="/admin/reservations"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/reservations')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Réservations
                </Link>
                <Link
                  to="/admin/payments"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/payments')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Paiements
                </Link>
                <Link
                  to="/admin/passengers-by-offer"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/passengers-by-offer')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Passagers par offre
                </Link>
              </>
            )}

            {isAgency && (
              <>
                <Link
                  to="/agency/offers"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/agency/offers')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Offres
                </Link>
                <Link
                  to="/agency/reservations"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/agency/reservations')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                >
                  Réservations
                </Link>
              </>
            )}

            {/* User dropdown */}
            <div className="relative ml-4">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-navy-600 hover:bg-gray-50 hover:text-navy-900 focus:outline-none"
              >
                <span>{currentUser?.name}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-navy-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  {isAgency && (
                    <Link
                      to="/agency/profile"
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      <User size={16} className="mr-2" />
                      Mon profil
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-navy-600 hover:text-navy-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAdmin && (
              <>
                <Link
                  to="/admin/offers"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/offers')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Package size={18} className="mr-2" />
                  Offres
                </Link>
                <Link
                  to="/admin/offers/new"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/offers/new')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Home size={18} className="mr-2" />
                  Créer une offre
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/users')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <User size={18} className="mr-2" />
                  Utilisateurs
                </Link>
                <Link
                  to="/admin/reservations"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/reservations')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Calendar size={18} className="mr-2" />
                  Réservations
                </Link>
                <Link
                  to="/admin/payments"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/payments')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Package size={18} className="mr-2" />
                  Paiements
                </Link>
                <Link
                  to="/admin/passengers-by-offer"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin/passengers-by-offer')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Package size={18} className="mr-2" />
                  Passagers par offre
                </Link>
              </>
            )}

            {isAgency && (
              <>
                <Link
                  to="/agency/offers"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/agency/offers')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Package size={18} className="mr-2" />
                  Offres
                </Link>
                <Link
                  to="/agency/reservations"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/agency/reservations')
                      ? 'bg-flamingo-50 text-flamingo-700'
                      : 'text-navy-600 hover:bg-gray-50 hover:text-navy-900'
                  }`}
                  onClick={closeMenu}
                >
                  <Calendar size={18} className="mr-2" />
                  Réservations
                </Link>
                <Link
                  to="/agency/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-navy-600 hover:bg-gray-50 hover:text-navy-900"
                  onClick={closeMenu}
                >
                  <User size={18} className="mr-2" />
                  Mon profil
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-flamingo-100 flex items-center justify-center text-flamingo-600">
                  <User size={20} />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-navy-800">{currentUser?.name}</div>
                <div className="text-sm font-medium text-navy-500">{currentUser?.email}</div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-navy-600 hover:bg-gray-50 hover:text-navy-900"
              >
                <LogOut size={18} className="mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;