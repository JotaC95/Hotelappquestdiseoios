import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { RoomDetailScreen } from "./components/RoomDetailScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { SupervisorPanel } from "./components/SupervisorPanel";
import { AdminPanel } from "./components/AdminPanel";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { User, BarChart3, LogOut, Home } from "lucide-react";

type Screen = 'login' | 'dashboard' | 'room-detail' | 'summary' | 'supervisor' | 'admin';
type UserRole = 'cleaner' | 'supervisor' | 'admin' | null;

interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite';
  status: 'pending' | 'in-progress' | 'completed';
  timeRemaining: number;
  estimatedTime: number;
  observations?: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Mock data - habitaciones
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      number: "201",
      type: "Double",
      status: "pending",
      timeRemaining: 35,
      estimatedTime: 35,
      observations: "Cliente solicitó toallas extra"
    },
    {
      id: "2",
      number: "203",
      type: "Single",
      status: "pending",
      timeRemaining: 25,
      estimatedTime: 25
    },
    {
      id: "3",
      number: "305",
      type: "Suite",
      status: "in-progress",
      timeRemaining: 42,
      estimatedTime: 45,
      observations: "Revisar minibar"
    },
    {
      id: "4",
      number: "307",
      type: "Double",
      status: "completed",
      timeRemaining: 0,
      estimatedTime: 35
    },
    {
      id: "5",
      number: "401",
      type: "Single",
      status: "completed",
      timeRemaining: 0,
      estimatedTime: 25
    },
    {
      id: "6",
      number: "405",
      type: "Double",
      status: "pending",
      timeRemaining: 35,
      estimatedTime: 35
    },
    {
      id: "7",
      number: "501",
      type: "Suite",
      status: "completed",
      timeRemaining: 0,
      estimatedTime: 45
    },
    {
      id: "8",
      number: "503",
      type: "Single",
      status: "pending",
      timeRemaining: 25,
      estimatedTime: 25
    },
    {
      id: "9",
      number: "505",
      type: "Double",
      status: "completed",
      timeRemaining: 0,
      estimatedTime: 35
    },
    {
      id: "10",
      number: "601",
      type: "Suite",
      status: "pending",
      timeRemaining: 45,
      estimatedTime: 45,
      observations: "Suite presidencial - Especial atención"
    }
  ]);

  // Mock data - resumen del día
  const dailySummary = {
    totalRooms: 10,
    completedRooms: rooms.filter(r => r.status === 'completed').length,
    totalTime: 385,
    incidents: 2,
    efficiency: 94
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    if (role === 'supervisor') {
      setCurrentScreen('supervisor');
    } else if (role === 'admin') {
      setCurrentScreen('admin');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentScreen('room-detail');
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    setSelectedRoom(updatedRoom);
  };

  const handleLogout = () => {
    setCurrentScreen('login');
    setUserRole(null);
    setSelectedRoom(null);
    setMenuOpen(false);
  };

  const handleGoToDashboard = () => {
    setCurrentScreen('dashboard');
    setMenuOpen(false);
  };

  const handleGoToSummary = () => {
    setCurrentScreen('summary');
    setMenuOpen(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      
      case 'dashboard':
        return (
          <DashboardScreen
            rooms={rooms}
            onSelectRoom={handleSelectRoom}
            onOpenMenu={() => setMenuOpen(true)}
          />
        );
      
      case 'room-detail':
        return selectedRoom ? (
          <RoomDetailScreen
            room={selectedRoom}
            onBack={() => setCurrentScreen('dashboard')}
            onUpdateRoom={handleUpdateRoom}
          />
        ) : null;
      
      case 'summary':
        return (
          <SummaryScreen
            summary={dailySummary}
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      
      case 'supervisor':
        return <SupervisorPanel onBack={() => setCurrentScreen('login')} />;
      
      case 'admin':
        return (
          <AdminPanel 
            onBack={() => setCurrentScreen('login')} 
            rooms={rooms}
            onAddRoom={(room) => setRooms([...rooms, room])}
            onDeleteRoom={(roomId) => setRooms(rooms.filter(r => r.id !== roomId))}
            onUpdateRoom={handleUpdateRoom}
          />
        );
      
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {renderScreen()}

      {/* Menu lateral (solo para cleaners) */}
      {userRole === 'cleaner' && currentScreen !== 'login' && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
              <SheetDescription>
                Accede a las opciones de navegación
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-8 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 rounded-xl"
                onClick={handleGoToDashboard}
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 rounded-xl"
                onClick={handleGoToSummary}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Resumen del día
              </Button>

              <div className="pt-6 border-t border-border">
                <div className="bg-muted/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Personal de Limpieza</p>
                      <p className="text-muted-foreground">Turno mañana</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start h-14 rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}