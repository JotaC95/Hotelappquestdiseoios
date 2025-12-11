import { useState } from "react";
import { ArrowLeft, Package, CheckCircle2, Clock, AlertTriangle, Bell, Play, Pause, Check, Box, Home, ChevronRight, Bed, DoorOpen, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";

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

interface Alert {
  id: string;
  type: 'missing' | 'broken' | 'needed' | 'preparation' | 'restock';
  description: string;
  assignedTo?: string;
  roomNumber?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  imageUrl?: string;
  createdBy?: string;
  department?: 'houseman' | 'maintenance' | 'security';
}

interface RoomConfig {
  bedType: string;
  secondRoom?: 'open' | 'closed';
  additionalInfo?: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  roomCategory: 'Departure' | 'Weekly' | 'Pre-arrival' | 'Stay-over' | 'Vacant';
  status: 'pending' | 'in-progress' | 'completed';
  cleanedBy?: string;
  assignedCleaner?: string;
  cleaningOrder?: number;
  defaultConfig?: RoomConfig;
  customConfig?: RoomConfig;
  alerts?: Alert[];
  preparedBy?: string;
  preparedAt?: string;
  isPrepared?: boolean;
}

interface HousemanPanelProps {
  onBack: () => void;
  onNavigateToInventory: () => void;
  rooms?: Room[];
  alerts?: Alert[];
}

export function HousemanPanel({ onBack, onNavigateToInventory, rooms = [], alerts: externalAlerts = [] }: HousemanPanelProps) {
  const [tasks, setTasks] = useState<HousemanTask[]>([
    {
      id: '1',
      roomNumber: '201',
      type: 'preparation',
      status: 'pending',
      estimatedTime: 15,
      items: [
        { name: 'Sheets', quantity: 4 },
        { name: 'Towels', quantity: 6 },
        { name: 'Pillowcases', quantity: 4 }
      ]
    },
    {
      id: '2',
      roomNumber: '305',
      type: 'restock',
      status: 'in-progress',
      estimatedTime: 10,
      items: [
        { name: 'Towels', quantity: 2 },
        { name: 'Shampoo', quantity: 4 }
      ]
    },
    {
      id: '3',
      roomNumber: '601',
      type: 'preparation',
      status: 'pending',
      estimatedTime: 20,
      items: [
        { name: 'King Sheets', quantity: 2 },
        { name: 'Premium Towels', quantity: 8 },
        { name: 'VIP Amenities', quantity: 2 }
      ]
    },
    {
      id: '4',
      roomNumber: '405',
      type: 'check',
      status: 'pending',
      estimatedTime: 5
    },
    {
      id: '5',
      roomNumber: '501',
      type: 'preparation',
      status: 'completed',
      estimatedTime: 15,
      completedAt: '09:15 AM',
      items: [
        { name: 'Sheets', quantity: 4 },
        { name: 'Towels', quantity: 6 }
      ]
    }
  ]);

  const [roomPreparations, setRoomPreparations] = useState<Map<string, boolean>>(new Map());
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  // Get rooms sorted by cleaning order
  const sortedRooms = [...rooms].sort((a, b) => {
    // Group by cleaner
    const cleanerA = a.cleanedBy || a.assignedCleaner || '';
    const cleanerB = b.cleanedBy || b.assignedCleaner || '';
    if (cleanerA !== cleanerB) {
      return cleanerA.localeCompare(cleanerB);
    }
    // Then by cleaning order or room number
    if (a.cleaningOrder && b.cleaningOrder) {
      return a.cleaningOrder - b.cleaningOrder;
    }
    return a.number.localeCompare(b.number);
  });

  // Get rooms that need preparation (not completed)
  const roomsToPrepare = sortedRooms.filter(r => r.status !== 'completed');

  // Get alerts for houseman
  const housemanAlerts = externalAlerts.filter(a => 
    a.department === 'houseman' || 
    a.type === 'missing' || 
    a.type === 'needed' || 
    a.type === 'restock' ||
    a.type === 'preparation'
  );

  // Get alerts for specific room
  const getAlertsForRoom = (roomNumber: string): Alert[] => {
    return housemanAlerts.filter(a => 
      a.roomNumber === roomNumber && a.status === 'pending'
    );
  };

  // Get current room
  const currentRoom = roomsToPrepare[currentRoomIndex];

  // Mark room as prepared
  const handleMarkRoomPrepared = (roomId: string) => {
    setRoomPreparations(new Map(roomPreparations.set(roomId, true)));
    // Move to next room
    if (currentRoomIndex < roomsToPrepare.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1);
    }
  };

  // Navigate to specific room
  const goToRoom = (index: number) => {
    setCurrentRoomIndex(index);
  };

  const [alertList, setAlerts] = useState<Alert[]>([
    {
      id: 'a1',
      type: 'preparation',
      description: 'Prepare room 201 with special configuration',
      assignedTo: 'Houseman',
      roomNumber: '201',
      priority: 'high',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'a2',
      type: 'restock',
      description: 'Restock towels in room 305',
      assignedTo: 'Houseman',
      roomNumber: '305',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'a3',
      type: 'preparation',
      description: 'Presidential suite requires VIP amenities',
      assignedTo: 'Houseman',
      roomNumber: '601',
      priority: 'high',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'a4',
      type: 'restock',
      description: 'Room 203 needs full minibar',
      assignedTo: 'Houseman',
      roomNumber: '203',
      priority: 'medium',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date().toISOString()
    }
  ]);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingAlerts = alertList.filter(a => a.status === 'pending');
  const completedAlerts = alertList.filter(a => a.status === 'completed');

  const taskTypeLabels = {
    'preparation': { label: 'Preparación', icon: Package, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'restock': { label: 'Reposición', icon: Box, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'check': { label: 'Revisión', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' }
  };

  const priorityConfig = {
    'high': { label: 'Alta', color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    'medium': { label: 'Media', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    'low': { label: 'Baja', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
  };

  const handleStartTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: 'in-progress' as const } : t
    ));
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as const, completedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) } : t
    ));
  };

  const handleCompleteAlert = (alertId: string) => {
    setAlerts(alertList.map(a =>
      a.id === alertId ? { ...a, status: 'completed' as const, completedAt: new Date().toISOString() } : a
    ));
  };

  const getTotalEstimatedTime = () => {
    return pendingTasks.reduce((acc, task) => acc + task.estimatedTime, 0) +
           inProgressTasks.reduce((acc, task) => acc + task.estimatedTime, 0);
  };

  const progressPercentage = tasks.length > 0 
    ? (completedTasks.length / tasks.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary mb-6 hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
            Cerrar sesión
          </button>

          <div className="mb-6">
            <h1 className="text-3xl mb-2">Panel Houseman 🧑‍🔧</h1>
            <p className="text-muted-foreground">Martes, 25 de Noviembre 2025</p>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="opacity-90 mb-1">Tiempo total estimado</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-3xl">{getTotalEstimatedTime()} min</span>
                </div>
              </div>
              <div className="text-right">
                <p className="opacity-90 mb-1">Progreso del día</p>
                <span className="text-3xl">{completedTasks.length}/{tasks.length}</span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="preparation" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="preparation">
              Preparation
              {roomsToPrepare.length > 0 && (
                <Badge variant="secondary" className="ml-2">{roomsToPrepare.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {pendingAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingAlerts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* Preparation Tab - NEW */}
          <TabsContent value="preparation" className="space-y-4">
            {currentRoom ? (
              <>
                {/* Current Room Card */}
                <Card className="rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Home className="w-8 h-8" />
                        <div>
                          <h2 className="text-2xl">Room {currentRoom.number}</h2>
                          <p className="opacity-90">{currentRoom.type}</p>
                        </div>
                      </div>
                      <Badge className="bg-white text-primary text-lg px-4 py-2">
                        {currentRoomIndex + 1} / {roomsToPrepare.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {currentRoom.roomCategory}
                      </Badge>
                      {currentRoom.cleanedBy && (
                        <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                          Cleaner: {currentRoom.cleanedBy}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Room Configuration */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Bed className="w-5 h-5 text-primary" />
                        Room Configuration
                      </h3>
                      
                      {/* Default Configuration */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                        <p className="text-sm text-blue-700 mb-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          Default Setup
                        </p>
                        {currentRoom.defaultConfig && (
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Bed Type:</span> {currentRoom.defaultConfig.bedType}</p>
                            {currentRoom.defaultConfig.secondRoom && (
                              <p><span className="font-medium">Second Room:</span> {currentRoom.defaultConfig.secondRoom}</p>
                            )}
                            {currentRoom.defaultConfig.additionalInfo && (
                              <p><span className="font-medium">Additional Info:</span> {currentRoom.defaultConfig.additionalInfo}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Custom Configuration if exists */}
                      {currentRoom.customConfig && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                          <p className="text-sm text-orange-700 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Custom Setup Required
                          </p>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Bed Type:</span> {currentRoom.customConfig.bedType}</p>
                            {currentRoom.customConfig.secondRoom && (
                              <p><span className="font-medium">Second Room:</span> {currentRoom.customConfig.secondRoom}</p>
                            )}
                            {currentRoom.customConfig.additionalInfo && (
                              <p className="text-orange-800"><span className="font-medium">Special Request:</span> {currentRoom.customConfig.additionalInfo}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cleaner Alerts for this room */}
                    {getAlertsForRoom(currentRoom.number).length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Bell className="w-5 h-5 text-red-600" />
                          Cleaner Reports
                        </h3>
                        <div className="space-y-2">
                          {getAlertsForRoom(currentRoom.number).map((alert) => {
                            const priority = priorityConfig[alert.priority];
                            return (
                              <div
                                key={alert.id}
                                className={`rounded-xl p-4 border-2 ${priority.border} ${priority.bg}`}
                              >
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className={`w-5 h-5 ${priority.color} flex-shrink-0 mt-0.5`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className={`${priority.bg} ${priority.color} ${priority.border} text-xs`}>
                                        {alert.type}
                                      </Badge>
                                      {alert.createdBy && (
                                        <span className="text-xs text-muted-foreground">
                                          by {alert.createdBy}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm">{alert.description}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleMarkRoomPrepared(currentRoom.id)}
                      className="w-full bg-secondary hover:bg-secondary/90 rounded-xl h-14 text-lg"
                      disabled={roomPreparations.get(currentRoom.id)}
                    >
                      {roomPreparations.get(currentRoom.id) ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Prepared - Next Room
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Mark as Prepared
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Room List */}
                <div>
                  <h3 className="text-xl mb-3 flex items-center justify-between">
                    <span>📋 All Rooms</span>
                    <Badge variant="outline">
                      {Array.from(roomPreparations.values()).filter(Boolean).length} / {roomsToPrepare.length} prepared
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    {roomsToPrepare.map((room, index) => {
                      const isPrepared = roomPreparations.get(room.id);
                      const isCurrent = index === currentRoomIndex;
                      const roomAlerts = getAlertsForRoom(room.number);
                      
                      return (
                        <Card
                          key={room.id}
                          onClick={() => goToRoom(index)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${
                            isCurrent 
                              ? 'border-2 border-primary bg-primary/5' 
                              : isPrepared
                              ? 'bg-secondary/5 border-secondary/30'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isPrepared 
                                  ? 'bg-secondary text-white' 
                                  : isCurrent
                                  ? 'bg-primary text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isPrepared ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  <Home className="w-5 h-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">Room {room.number}</h4>
                                  {roomAlerts.length > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {roomAlerts.length} alert{roomAlerts.length > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{room.type}</span>
                                  <span>•</span>
                                  <span>{room.cleanedBy || 'Unassigned'}</span>
                                </div>
                              </div>
                            </div>
                            {isCurrent && (
                              <ChevronRight className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <Card className="p-12 rounded-2xl text-center">
                <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl mb-2">All Rooms Prepared!</h3>
                <p className="text-muted-foreground">
                  Great job! All rooms are ready for the cleaning team.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-xl mb-3">⏳ Tareas Pendientes</h3>
                <div className="space-y-3">
                  {pendingTasks.map((task) => {
                    const config = taskTypeLabels[task.type];
                    const TaskIcon = config.icon;
                    return (
                      <Card key={task.id} className={`p-5 rounded-2xl border-2 ${config.border} ${config.bg}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TaskIcon className={`w-5 h-5 ${config.color}`} />
                              <h4 className="font-medium">Habitación {task.roomNumber}</h4>
                              <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border}`}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {task.estimatedTime} min estimados
                            </p>
                            {task.items && task.items.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-muted-foreground mb-1">Artículos necesarios:</p>
                                {task.items.map((item, idx) => (
                                  <p key={idx} className="text-sm ml-4">
                                    • {item.name} x{item.quantity}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartTask(task.id)}
                          className="w-full bg-primary rounded-xl"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Iniciar tarea
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <div>
                <h3 className="text-xl mb-3">🔄 En Proceso</h3>
                <div className="space-y-3">
                  {inProgressTasks.map((task) => {
                    const config = taskTypeLabels[task.type];
                    const TaskIcon = config.icon;
                    return (
                      <Card key={task.id} className="p-5 rounded-2xl border-2 border-primary bg-primary/5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TaskIcon className={`w-5 h-5 ${config.color}`} />
                              <h4 className="font-medium">Habitación {task.roomNumber}</h4>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                En proceso
                              </Badge>
                            </div>
                            {task.items && task.items.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {task.items.map((item, idx) => (
                                  <p key={idx} className="text-sm text-muted-foreground">
                                    • {item.name} x{item.quantity}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-full bg-secondary rounded-xl"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar como completada
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-xl mb-3">✅ Completadas Hoy</h3>
                <div className="space-y-3">
                  {completedTasks.map((task) => {
                    const config = taskTypeLabels[task.type];
                    const TaskIcon = config.icon;
                    return (
                      <Card key={task.id} className="p-4 rounded-2xl bg-secondary/5 border-secondary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                            <div>
                              <h4 className="font-medium">Habitación {task.roomNumber}</h4>
                              <p className="text-muted-foreground">{config.label} • {task.completedAt}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <Card className="p-8 rounded-2xl text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No hay tareas asignadas</p>
              </Card>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
              <div>
                <h3 className="text-xl mb-3">🔔 Alertas Pendientes</h3>
                <div className="space-y-3">
                  {pendingAlerts.map((alert) => {
                    const priority = priorityConfig[alert.priority];
                    return (
                      <Card key={alert.id} className={`p-5 rounded-2xl border-2 ${priority.border} ${priority.bg}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <AlertTriangle className={`w-6 h-6 ${priority.color} flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`${priority.bg} ${priority.color} ${priority.border}`}>
                                Prioridad {priority.label}
                              </Badge>
                              {alert.roomNumber && (
                                <Badge variant="outline" className="bg-muted">
                                  Hab. {alert.roomNumber}
                                </Badge>
                              )}
                            </div>
                            <p className="mb-2">{alert.description}</p>
                            <p className="text-muted-foreground">
                              {new Date(alert.createdAt).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCompleteAlert(alert.id)}
                          variant="outline"
                          className="w-full rounded-xl"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Marcar como completada
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed Alerts */}
            {completedAlerts.length > 0 && (
              <div>
                <h3 className="text-xl mb-3">📋 Historial de Alertas</h3>
                <div className="space-y-3">
                  {completedAlerts.map((alert) => (
                    <Card key={alert.id} className="p-4 rounded-2xl bg-muted/30">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {alert.roomNumber && (
                              <Badge variant="outline" className="bg-muted">
                                Hab. {alert.roomNumber}
                              </Badge>
                            )}
                          </div>
                          <p className="mb-1">{alert.description}</p>
                          <p className="text-muted-foreground">
                            Completada: {alert.completedAt && new Date(alert.completedAt).toLocaleString('es-ES', { 
                              day: 'numeric', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {alertList.length === 0 && (
              <Card className="p-8 rounded-2xl text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No hay alertas</p>
              </Card>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="p-8 rounded-2xl text-center">
              <Box className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl mb-2">Gestión de Inventario</h3>
              <p className="text-muted-foreground mb-6">
                Accede al inventario completo del hotel para registrar uso y reposiciones
              </p>
              <Button
                onClick={onNavigateToInventory}
                className="bg-primary rounded-xl h-12"
              >
                <Package className="w-5 h-5 mr-2" />
                Abrir Inventario
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}