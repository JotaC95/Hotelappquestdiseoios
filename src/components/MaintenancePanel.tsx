import { useState } from "react";
import { ArrowLeft, Wrench, Clock, CheckCircle2, AlertCircle, Search, X } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
  alerts?: Alert[];
}

interface Alert {
  id: string;
  type: 'missing' | 'broken' | 'needed' | 'preparation' | 'restock';
  description: string;
  assignedTo?: string;
  department?: 'cleaner' | 'houseman' | 'maintenance' | 'supervisor';
  roomNumber?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
  imageUrl?: string; // Optional image attachment
}

interface MaintenancePanelProps {
  onBack: () => void;
  rooms: Room[];
  onCompleteTask: (roomId: string) => void;
  onUpdateRoom: (room: Room) => void;
}

export function MaintenancePanel({ onBack, rooms, onCompleteTask, onUpdateRoom }: MaintenancePanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filtrar habitaciones que tienen alertas de mantenimiento
  const roomsWithMaintenanceTasks = rooms.filter(room => 
    room.alerts && room.alerts.some(alert => 
      alert.department === 'maintenance' && alert.status === 'pending'
    )
  );

  const handleStartTask = (room: Room) => {
    const updatedRoom = {
      ...room,
      maintenanceStatus: 'in-progress' as const
    };
    onUpdateRoom(updatedRoom);
  };

  const handleCompleteTask = (room: Room) => {
    // Actualizar todas las alertas de mantenimiento a completadas
    const updatedAlerts = room.alerts?.map(alert => 
      alert.department === 'maintenance' 
        ? { ...alert, status: 'completed' as const, completedAt: new Date().toISOString() }
        : alert
    );

    const updatedRoom = {
      ...room,
      alerts: updatedAlerts,
      maintenanceStatus: 'completed' as const,
      blockedBy: null
    };
    
    onUpdateRoom(updatedRoom);
    onCompleteTask(room.id);
  };

  const getMaintenanceAlerts = (room: Room): Alert[] => {
    return room.alerts?.filter(alert => alert.department === 'maintenance') || [];
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[priority];
  };

  const getMaintenanceStatusColor = (room: Room) => {
    if (room.maintenanceStatus === 'in-progress') {
      return 'bg-orange-100 text-orange-700';
    }
    if (room.maintenanceStatus === 'completed') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getMaintenanceStatusLabel = (room: Room) => {
    if (room.maintenanceStatus === 'in-progress') {
      return 'En Proceso';
    }
    if (room.maintenanceStatus === 'completed') {
      return 'Completada';
    }
    return 'Pendiente';
  };

  const filteredRooms = roomsWithMaintenanceTasks.filter(room => {
    const matchesSearch = 
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getMaintenanceAlerts(room).some(alert => 
        alert.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'pending' && room.maintenanceStatus !== 'in-progress' && room.maintenanceStatus !== 'completed') ||
      (filterStatus === 'in-progress' && room.maintenanceStatus === 'in-progress') ||
      (filterStatus === 'completed' && room.maintenanceStatus === 'completed');
    
    return matchesSearch && matchesFilter;
  });

  const pendingRooms = filteredRooms.filter(r => 
    r.maintenanceStatus !== 'in-progress' && r.maintenanceStatus !== 'completed'
  );
  const inProgressRooms = filteredRooms.filter(r => r.maintenanceStatus === 'in-progress');
  const completedRooms = filteredRooms.filter(r => r.maintenanceStatus === 'completed');

  const renderRoomCard = (room: Room) => {
    const alerts = getMaintenanceAlerts(room);
    
    return (
      <Card key={room.id} className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono">
                  Hab. {room.number}
                </Badge>
                <Badge variant="outline" className="bg-muted">
                  {room.type}
                </Badge>
                <Badge variant="outline" className={
                  room.roomCategory === 'Pre-arrival' ? 'bg-blue-100 text-blue-700' :
                  room.roomCategory === 'Departure' ? 'bg-red-100 text-red-700' :
                  room.roomCategory === 'Weekly' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }>
                  {room.roomCategory}
                </Badge>
              </div>
              <CardTitle className="text-base mb-2">Tareas de Mantenimiento</CardTitle>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-muted/30 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(alert.priority || 'medium')}>
                        {alert.priority === 'low' && 'Baja'}
                        {alert.priority === 'medium' && 'Media'}
                        {alert.priority === 'high' && 'Alta'}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        {alert.type === 'broken' && '🔧 Reparación'}
                        {alert.type === 'missing' && '🔍 Revisión'}
                        {alert.type === 'needed' && '📦 Instalación'}
                      </Badge>
                    </div>
                    <p className="text-sm">{alert.description}</p>
                    {alert.assignedTo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Asignado a: {alert.assignedTo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <CardDescription className="mt-2">
                Reportado: {new Date(alerts[0]?.createdAt || '').toLocaleString('es-ES')}
              </CardDescription>
            </div>
            <Badge className={getMaintenanceStatusColor(room)}>
              {getMaintenanceStatusLabel(room)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {room.observations && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{room.observations}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {room.maintenanceStatus !== 'in-progress' && room.maintenanceStatus !== 'completed' && (
                <Button
                  onClick={() => handleStartTask(room)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Iniciar Tarea
                </Button>
              )}
              {room.maintenanceStatus === 'in-progress' && (
                <Button
                  onClick={() => handleCompleteTask(room)}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Completada
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 text-white p-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-orange-600 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl mb-1">Mantenimiento</h1>
            <p className="text-orange-100">Panel de tareas de mantenimiento</p>
          </div>
          <Wrench className="w-8 h-8" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-orange-600/40 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl mb-1">{pendingRooms.length}</div>
            <div className="text-orange-100">Pendientes</div>
          </div>
          <div className="bg-orange-600/40 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl mb-1">{inProgressRooms.length}</div>
            <div className="text-orange-100">En Proceso</div>
          </div>
          <div className="bg-orange-600/40 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl mb-1">{completedRooms.length}</div>
            <div className="text-orange-100">Completadas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 space-y-3 bg-white border-b">
        <Input
          placeholder="Buscar por habitación o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las tareas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="in-progress">En Proceso</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Tabs */}
      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="all">
              Todas ({filteredRooms.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pendientes ({pendingRooms.length})
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              En Proceso ({inProgressRooms.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({completedRooms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredRooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {roomsWithMaintenanceTasks.length === 0 
                    ? 'No hay tareas de mantenimiento'
                    : 'No se encontraron tareas con los filtros aplicados'}
                </CardContent>
              </Card>
            ) : (
              filteredRooms.map(renderRoomCard)
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingRooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay tareas pendientes
                </CardContent>
              </Card>
            ) : (
              pendingRooms.map(renderRoomCard)
            )}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-3 mt-4">
            {inProgressRooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay tareas en proceso
                </CardContent>
              </Card>
            ) : (
              inProgressRooms.map(renderRoomCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3 mt-4">
            {completedRooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay tareas completadas
                </CardContent>
              </Card>
            ) : (
              completedRooms.map(renderRoomCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}