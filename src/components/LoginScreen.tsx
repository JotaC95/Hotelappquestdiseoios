import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CreditCard, LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: 'cleaner' | 'supervisor' | 'admin' | 'houseman' | 'maintenance' | 'reception' | 'administrator') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showNFC, setShowNFC] = useState(false);

  const handleLogin = () => {
    if (username && password) {
      // Simulate login based on username
      const lowerUsername = username.toLowerCase();
      let role: 'cleaner' | 'supervisor' | 'admin' | 'houseman' | 'maintenance' | 'reception' | 'administrator' = 'cleaner';
      
      if (lowerUsername.includes('admin')) {
        role = 'admin';
      } else if (lowerUsername.includes('super')) {
        role = 'supervisor';
      } else if (lowerUsername.includes('house')) {
        role = 'houseman';
      } else if (lowerUsername.includes('maint') || lowerUsername.includes('mantenimiento')) {
        role = 'maintenance';
      } else if (lowerUsername.includes('reception')) {
        role = 'reception';
      } else if (lowerUsername.includes('administrator')) {
        role = 'administrator';
      }
      
      onLogin(role);
    }
  };

  const handleNFCLogin = () => {
    setShowNFC(true);
    setTimeout(() => {
      onLogin('cleaner');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl sm:rounded-3xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl mb-2">HotelAppQuest</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Hotel Housekeeping Management</p>
        </div>

        {/* Login form */}
        <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-border">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 sm:h-12 rounded-xl bg-input-background border border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 sm:h-12 rounded-xl bg-input-background border border-border"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full h-11 sm:h-12 rounded-xl bg-primary hover:bg-primary/90"
              disabled={!username || !password}
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-sm sm:text-base text-muted-foreground">or</span>
            </div>
          </div>

          {/* NFC Login */}
          <Button
            onClick={handleNFCLogin}
            variant="outline"
            className="w-full h-11 sm:h-12 rounded-xl border-2 border-border hover:bg-accent"
          >
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Check in with NFC
          </Button>

          {showNFC && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-secondary/10 border border-secondary rounded-xl text-center">
              <div className="animate-pulse">
                <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-secondary" />
                <p className="text-sm sm:text-base text-secondary">Place your NFC card...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm sm:text-base text-muted-foreground mt-6 sm:mt-8">
          Version 1.0.0
        </p>
        
        {/* Helper text */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted/30 rounded-xl">
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-2">💡 Test users:</p>
          <div className="space-y-1 text-center text-xs sm:text-sm">
            <p>👤 <span className="text-primary">admin</span> - Admin Panel</p>
            <p>👁️ <span className="text-primary">supervisor</span> - Supervisor Panel</p>
            <p>🧑‍🔧 <span className="text-primary">houseman</span> - Houseman Panel</p>
            <p>🔧 <span className="text-primary">maintenance</span> - Maintenance Panel</p>
            <p>🧹 <span className="text-primary">cleaner</span> - Cleaner Panel</p>
            <p>💼 <span className="text-primary">reception</span> - Reception Panel</p>
            <p>🔑 <span className="text-primary">administrator</span> - Administrator Panel</p>
          </div>
        </div>
      </div>
    </div>
  );
}