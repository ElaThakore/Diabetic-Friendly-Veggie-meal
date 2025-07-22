import React from 'react';
import { BookOpen, Download, Smartphone, Wifi } from 'lucide-react';
import { Button } from './ui/button';

const Header = ({ onDownloadMemoir, isOnline, isInstallable, onInstallApp }) => {
  return (
    <header className="bg-white border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Memory Keeper
              </h1>
              <p className="text-lg text-gray-600">
                Share your stories {isOnline ? '(Online)' : '(Offline)'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isInstallable && (
              <Button
                onClick={onInstallApp}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 text-lg px-6 py-3 hover:bg-blue-50 border-2 border-blue-300"
              >
                <Smartphone className="h-5 w-5" />
                <span>Install App</span>
              </Button>
            )}
            
            <Button
              onClick={onDownloadMemoir}
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 text-lg px-6 py-3 hover:bg-gray-50 border-2 border-gray-300"
            >
              <Download className="h-5 w-5" />
              <span>Export Memories</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;