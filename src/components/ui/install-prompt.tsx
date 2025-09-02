import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { Download, X } from 'lucide-react';
import { canShowInstallPrompt, showInstallPrompt, isStandalone } from '@/utils/pwaUtils';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if we can show install prompt and not already in standalone mode
    const checkInstallability = () => {
      const canInstall = canShowInstallPrompt() && !isStandalone();
      setShowPrompt(canInstall);
    };

    // Check immediately and listen for beforeinstallprompt event
    checkInstallability();
    
    const handleBeforeInstallPrompt = () => {
      checkInstallability();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await showInstallPrompt();
      if (accepted) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Alert className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-card border shadow-lg">
      <Download className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1 pr-2">
          <p className="font-medium">Install DailySalesTracker</p>
          <p className="text-sm text-muted-foreground">
            Get the app for quick access and offline features
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-primary hover:bg-primary/90"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};