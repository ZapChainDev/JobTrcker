import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';
import { Menu } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavLinks = () => {
    return (
      <>
        <Link to="/meet-creator" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
          Meet Creator
        </Link>
        {currentUser && (
          <>
            <Link to="/" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Home
            </Link>
            <Link to="/discussion" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Discussion
            </Link>
            <Link to="/job-directories" className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Job Directories
            </Link>
          </>
        )}
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Jobtrcker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLinks />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Navigation Menu</SheetTitle>
                <div className="flex flex-col space-y-4 mt-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User menu */}
          {currentUser && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'User'} />
                      <AvatarFallback>{currentUser.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{currentUser?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser?.email || 'No email'}</p>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chat">Chat</Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}; 