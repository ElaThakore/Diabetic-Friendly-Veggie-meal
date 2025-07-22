import React from 'react';
import { BookOpen, User, Settings, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header = ({ onDownloadMemoir, onOpenSettings }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                WhispersBack
              </h1>
              <p className="text-sm text-gray-600">Your Memory Journal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onDownloadMemoir}
              className="hidden sm:flex items-center space-x-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Download Memoir</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-8 w-8 ring-2 ring-purple-100">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;