import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CreditCard, LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: 'cleaner' | 'supervisor' | 'admin') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showNFC, setShowNFC] = useState(false);

  const handleLogin = () => {
    if (username && password) {
      // Simular login según el usuario
      const lowerUsername = username.toLowerCase();
      let role: 'cleaner' | 'supervisor' | 'admin' = 'cleaner';
      
      if (lowerUsername.includes('admin')) {
        role = 'admin';
      } else if (lowerUsername.includes('super')) {
        role = 'supervisor';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl mb-2">HotelAppQuest</h1>
          <p className="text-muted-foreground">Gestión de Limpieza Hotelera</p>
        </div>

        {/* Formulario de login */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl bg-input-background border border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-input-background border border-border"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
              disabled={!username || !password}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Ingresar
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-muted-foreground">o</span>
            </div>
          </div>

          {/* NFC Login */}
          <Button
            onClick={handleNFCLogin}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-border hover:bg-accent"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Registrar con NFC
          </Button>

          {showNFC && (
            <div className="mt-6 p-4 bg-secondary/10 border border-secondary rounded-xl text-center">
              <div className="animate-pulse">
                <CreditCard className="w-12 h-12 mx-auto mb-2 text-secondary" />
                <p className="text-secondary">Acerca tu tarjeta NFC...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground mt-8">
          Versión 1.0.0
        </p>
        
        {/* Helper text */}
        <div className="mt-6 p-4 bg-muted/30 rounded-xl">
          <p className="text-center text-muted-foreground mb-2">💡 Usuarios de prueba:</p>
          <div className="space-y-1 text-center">
            <p className="text-sm">👤 <span className="text-primary">admin</span> - Panel Administrador</p>
            <p className="text-sm">👁️ <span className="text-primary">supervisor</span> - Panel Supervisor</p>
            <p className="text-sm">🧹 <span className="text-primary">limpieza</span> - Panel Personal</p>
          </div>
        </div>
      </div>
    </div>
  );
}