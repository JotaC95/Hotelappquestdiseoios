import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardScreen } from "./components/DashboardScreen";
import { RoomDetailScreen } from "./components/RoomDetailScreen";
import { SummaryScreen } from "./components/SummaryScreen";
import { SupervisorPanel } from "./components/SupervisorPanel";
import { AdminPanel } from "./components/AdminPanel";
import { HousemanPanel } from "./components/HousemanPanel";
import { MaintenancePanel } from "./components/MaintenancePanel";
import { InventorySection } from "./components/InventorySection";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "./components/ui/sheet";
import { Button } from "./components/ui/button";
import { User, BarChart3, LogOut, Home } from "lucide-react";

type Screen = 'login' | 'dashboard' | 'room-detail' | 'summary' | 'supervisor' | 'admin' | 'houseman' | 'maintenance' | 'alerts' | 'inventory';
type UserRole = 'cleaner' | 'supervisor' | 'admin' | 'houseman' | 'maintenance' | null;

interface GuestInfo {
  isPresent: boolean;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  nextGuestArrival?: string;
}

interface RoomConfiguration {
  bedType: string;
  secondRoom?: 'open' | 'closed';
  additionalInfo?: string;
}

interface Alert {
  id: string;
  type: 'missing' | 'broken' | 'needed' | 'preparation' | 'restock' | 'reassignment';
  description: string;
  assignedTo?: string;
  department?: 'cleaner' | 'houseman' | 'maintenance' | 'supervisor';
  roomNumber?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  createdBy?: string;
  completedAt?: string;
  imageUrl?: string; // Optional image attachment
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'linen' | 'bedding' | 'towels' | 'amenities';
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked?: string;
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  type: 'use' | 'restock';
  roomNumber?: string;
  user: string;
  date: string;
}

interface HousemanTask {
  id: string;
  roomNumber: string;
  type: 'preparation' | 'restock' | 'check';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedTime: number;
  assignedTo?: string;
  completedAt?: string;
  items?: { name: string; quantity: number }[];
}

interface Room {
  id: string;
  number: string;
  type: string;
  roomCategory: 'Departure' | 'Weekly' | 'Pre-arrival' | 'Stay-over' | 'Vacant';
  status: 'pending' | 'in-progress' | 'completed';
  maintenanceStatus?: 'none' | 'pending' | 'in-progress' | 'completed';
  blockedBy?: 'maintenance' | null;
  timeRemaining: number;
  estimatedTime: number;
  observations?: string;
  cleanedBy?: string;
  guestInfo?: {
    isPresent: boolean;
    checkInDate?: string;
    checkInTime?: string;
    checkOutDate?: string;
    checkOutTime?: string;
    nextGuestArrival?: string;
  };
  defaultConfig?: {
    bedType: string;
    secondRoom?: 'open' | 'closed';
    additionalInfo?: string;
  };
  customConfig?: {
    bedType: string;
    secondRoom?: 'open' | 'closed';
    additionalInfo?: string;
  };
  alerts?: Alert[];
  completedAt?: string;
  timeSpent?: number;
  approved?: boolean;
  timeExtensions?: number;
  totalTimeSpent?: number;
  isOvertime?: boolean;
  dndStatus?: {
    isActive: boolean;
    markedAt?: string;
    markedBy?: string;
    evidencePhoto?: string;
    note?: string;
  };
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // State for standalone alerts (not attached to rooms)
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Mock data - habitaciones
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      number: "201",
      type: "Double",
      roomCategory: "Pre-arrival",
      status: "pending",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 35,
      estimatedTime: 35,
      observations: "Cliente solicitó toallas extra",
      cleanedBy: "María García",
      guestInfo: {
        isPresent: false,
        checkInDate: '26 Nov 2025',
        checkInTime: '15:00',
        checkOutDate: '28 Nov 2025',
        checkOutTime: '11:00',
        nextGuestArrival: '26 Nov 2025, 15:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed + 2 Single beds',
        secondRoom: undefined,
        additionalInfo: ''
      },
      customConfig: {
        bedType: '2 Queen beds',
        secondRoom: undefined,
        additionalInfo: 'Añadir cuna para bebé'
      }
    },
    {
      id: "2",
      number: "203",
      type: "Single",
      roomCategory: "Weekly",
      status: "pending",
      maintenanceStatus: "in-progress",
      blockedBy: "maintenance",
      timeRemaining: 25,
      estimatedTime: 25,
      cleanedBy: "Juan Pérez",
      guestInfo: {
        isPresent: true,
        checkInDate: '20 Nov 2025',
        checkInTime: '14:00',
        checkOutDate: '27 Nov 2025',
        checkOutTime: '12:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed',
        secondRoom: undefined
      },
      alerts: [
        {
          id: '3',
          type: 'broken',
          description: 'Revisar aire acondicionado - Cliente reportó ruido extraño',
          assignedTo: 'Mantenimiento',
          department: 'maintenance',
          roomNumber: '203',
          priority: 'high',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "3",
      number: "305",
      type: "Suite",
      roomCategory: "Stay-over",
      status: "in-progress",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 42,
      estimatedTime: 45,
      observations: "Revisar minibar",
      cleanedBy: "Ana Martínez",
      totalTimeSpent: 58,
      timeExtensions: 2,
      isOvertime: true,
      guestInfo: {
        isPresent: false,
        checkInDate: '24 Nov 2025',
        checkInTime: '16:00',
        checkOutDate: '26 Nov 2025',
        checkOutTime: '11:00'
      },
      defaultConfig: {
        bedType: '2 King beds',
        secondRoom: 'open',
        additionalInfo: 'Sala de estar integrada'
      },
      alerts: [
        {
          id: '1',
          type: 'missing',
          description: 'Faltan 2 toallas en el baño principal',
          assignedTo: 'Juan Pérez',
          department: 'houseman',
          roomNumber: '305',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "4",
      number: "307",
      type: "Double",
      roomCategory: "Departure",
      status: "completed",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 0,
      estimatedTime: 35,
      cleanedBy: "María García",
      completedAt: "10:45 AM",
      timeSpent: 33,
      approved: false,
      guestInfo: {
        isPresent: false,
        checkInDate: '23 Nov 2025',
        checkInTime: '15:00',
        checkOutDate: '25 Nov 2025',
        checkOutTime: '11:00',
        nextGuestArrival: '25 Nov 2025, 16:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed + 2 Single beds'
      }
    },
    {
      id: "5",
      number: "401",
      type: "Single",
      roomCategory: "Vacant",
      status: "completed",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 0,
      estimatedTime: 25,
      cleanedBy: "Juan Pérez",
      completedAt: "11:20 AM",
      timeSpent: 24,
      approved: true,
      guestInfo: {
        isPresent: false,
        nextGuestArrival: '28 Nov 2025, 14:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed'
      }
    },
    {
      id: "6",
      number: "405",
      type: "Double",
      roomCategory: "Pre-arrival",
      status: "pending",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 35,
      estimatedTime: 35,
      guestInfo: {
        isPresent: false,
        nextGuestArrival: '25 Nov 2025, 18:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed + 2 Single beds'
      }
    },
    {
      id: "7",
      number: "501",
      type: "Suite",
      roomCategory: "Departure",
      status: "completed",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 0,
      estimatedTime: 45,
      cleanedBy: "Ana Martínez",
      completedAt: "09:30 AM",
      timeSpent: 43,
      approved: true,
      guestInfo: {
        isPresent: false,
        checkInDate: '22 Nov 2025',
        checkInTime: '15:00',
        checkOutDate: '25 Nov 2025',
        checkOutTime: '10:00',
        nextGuestArrival: '25 Nov 2025, 17:00'
      },
      defaultConfig: {
        bedType: '2 King beds',
        secondRoom: 'closed',
        additionalInfo: 'Segunda habitación independiente'
      }
    },
    {
      id: "8",
      number: "503",
      type: "Single",
      roomCategory: "Weekly",
      status: "pending",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 25,
      estimatedTime: 25,
      guestInfo: {
        isPresent: true,
        checkInDate: '18 Nov 2025',
        checkInTime: '13:00',
        checkOutDate: '2 Dic 2025',
        checkOutTime: '11:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed'
      }
    },
    {
      id: "9",
      number: "505",
      type: "Double",
      roomCategory: "Stay-over",
      status: "completed",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 0,
      estimatedTime: 35,
      cleanedBy: "Carlos Ruiz",
      completedAt: "12:15 PM",
      timeSpent: 36,
      approved: false,
      observations: "Se encontró daño menor en cortina",
      guestInfo: {
        isPresent: true,
        checkInDate: '24 Nov 2025',
        checkInTime: '14:00',
        checkOutDate: '27 Nov 2025',
        checkOutTime: '12:00'
      },
      defaultConfig: {
        bedType: '1 Queen bed + 2 Single beds'
      },
      alerts: [
        {
          id: '2',
          type: 'broken',
          description: 'Cortina del lado izquierdo tiene un pequeño desgarro',
          assignedTo: 'Mantenimiento',
          department: 'maintenance',
          roomNumber: '505',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "10",
      number: "601",
      type: "Suite",
      roomCategory: "Pre-arrival",
      status: "pending",
      maintenanceStatus: "none",
      blockedBy: null,
      timeRemaining: 45,
      estimatedTime: 45,
      observations: "Suite presidencial - Especial atención",
      guestInfo: {
        isPresent: false,
        nextGuestArrival: '25 Nov 2025, 20:00'
      },
      defaultConfig: {
        bedType: '2 King beds',
        secondRoom: 'closed',
        additionalInfo: 'Suite premium con jacuzzi'
      },
      customConfig: {
        bedType: '1 King bed + sofá cama',
        secondRoom: 'open',
        additionalInfo: 'Configurar sala de estar para reunión. Añadir flores frescas y champagne'
      }
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
    } else if (role === 'houseman') {
      setCurrentScreen('houseman');
    } else if (role === 'maintenance') {
      setCurrentScreen('maintenance');
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

  const handleApproveRoom = (roomId: string) => {
    setRooms(rooms.map(r => 
      r.id === roomId ? { ...r, approved: true } : r
    ));
  };

  const handleCompleteMaintenanceTask = (roomId: string) => {
    setRooms(rooms.map(r => 
      r.id === roomId ? { ...r, maintenanceStatus: 'completed', blockedBy: null } : r
    ));
  };

  // Handle room assignment to cleaner
  const handleAssignRoom = (roomId: string, cleanerId: string) => {
    // Get cleaner name from mock data (in real app, this would come from user management)
    const cleanerNames: Record<string, string> = {
      '1': 'María García',
      '2': 'Juan Pérez',
      '3': 'Ana Martínez',
      '4': 'Carlos Ruiz'
    };

    setRooms(rooms.map(r => 
      r.id === roomId ? { ...r, cleanedBy: cleanerNames[cleanerId] || 'Unknown' } : r
    ));
  };

  // Handle adding a new room
  const handleAddRoomFromSupervisor = (room: Partial<Room>) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      number: room.number || '',
      type: room.type || '',
      roomCategory: 'Vacant',
      status: 'pending',
      maintenanceStatus: 'none',
      blockedBy: null,
      timeRemaining: 25,
      estimatedTime: 25,
      guestInfo: {
        isPresent: false
      },
      defaultConfig: {
        bedType: '1 Queen bed'
      }
    };
    setRooms([...rooms, newRoom]);
  };

  // Handle reassignment request from cleaner
  const handleRequestReassignment = (roomId: string, reason: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const newAlert: Alert = {
      id: Date.now().toString(),
      type: 'reassignment',
      description: reason,
      roomNumber: room.number,
      priority: 'high',
      status: 'pending',
      createdAt: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      createdBy: 'Cleaning Staff',
      department: 'supervisor'
    };

    setAlerts([...alerts, newAlert]);
  };

  // Handle resolving an alert
  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(a => 
      a.id === alertId ? { ...a, status: 'completed' as const, completedAt: new Date().toISOString() } : a
    ));
  };

  // Get all alerts including room-attached alerts
  const getAllAlerts = (): Alert[] => {
    const roomAlerts = rooms.flatMap(room => room.alerts || []);
    return [...alerts, ...roomAlerts];
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
            onRequestReassignment={handleRequestReassignment}
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
        return (
          <SupervisorPanel 
            onBack={() => setCurrentScreen('login')} 
            rooms={rooms}
            onApproveRoom={handleApproveRoom}
            onAssignRoom={handleAssignRoom}
            onAddRoom={handleAddRoomFromSupervisor}
            alerts={getAllAlerts()}
            onResolveAlert={handleResolveAlert}
          />
        );
      
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
      
      case 'houseman':
        return (
          <HousemanPanel 
            onBack={() => setCurrentScreen('login')}
            onNavigateToInventory={() => setCurrentScreen('inventory')}
            rooms={rooms}
            alerts={alerts}
          />
        );
      
      case 'maintenance':
        return (
          <MaintenancePanel 
            onBack={() => setCurrentScreen('login')}
            rooms={rooms}
            onCompleteTask={handleCompleteMaintenanceTask}
            onUpdateRoom={handleUpdateRoom}
          />
        );
      
      case 'inventory':
        return (
          <InventorySection 
            onBack={() => {
              if (userRole === 'houseman') {
                setCurrentScreen('houseman');
              } else {
                setCurrentScreen('admin');
              }
            }}
            userRole={userRole === 'houseman' ? 'houseman' : 'admin'}
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
          <SheetContent side="right" className="w-full sm:w-80">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Access navigation options
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 sm:mt-8 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 sm:h-14 rounded-xl text-sm sm:text-base"
                onClick={handleGoToDashboard}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 sm:h-14 rounded-xl text-sm sm:text-base"
                onClick={handleGoToSummary}
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                Day Summary
              </Button>

              <div className="pt-4 sm:pt-6 border-t border-border">
                <div className="bg-muted/30 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base">Cleaning Staff</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Morning Shift</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 sm:h-14 rounded-xl border-destructive text-destructive hover:bg-destructive hover:text-white text-sm sm:text-base"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}