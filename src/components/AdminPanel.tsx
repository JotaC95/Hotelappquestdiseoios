import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Users, Home as HomeIcon, UserPlus, Edit, Bed } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

interface RoomType {
  id: string;
  name: string;
  defaultTime: number;
  hasSecondRoom: boolean;
  secondRoomType?: 'open' | 'closed';
  description?: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  timeRemaining: number;
  estimatedTime: number;
  observations?: string;
  assignedTo?: string;
}

interface Cleaner {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface AdminPanelProps {
  onBack: () => void;
  rooms: Room[];
  onAddRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateRoom: (room: Room) => void;
}

export function AdminPanel({ onBack, rooms, onAddRoom, onDeleteRoom, onUpdateRoom }: AdminPanelProps) {
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [showAddCleanerDialog, setShowAddCleanerDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showAddRoomTypeDialog, setShowAddRoomTypeDialog] = useState(false);
  const [showEditRoomTypeDialog, setShowEditRoomTypeDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  // Room Types data
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { 
      id: "1", 
      name: "Single", 
      defaultTime: 20, 
      hasSecondRoom: false,
      description: "Habitación individual estándar"
    },
    { 
      id: "2", 
      name: "Double", 
      defaultTime: 25, 
      hasSecondRoom: false,
      description: "Habitación doble estándar"
    },
    { 
      id: "3", 
      name: "Suite", 
      defaultTime: 40, 
      hasSecondRoom: true,
      secondRoomType: 'open',
      description: "Suite con sala de estar abierta"
    },
    { 
      id: "4", 
      name: "Suite Premium", 
      defaultTime: 50, 
      hasSecondRoom: true,
      secondRoomType: 'closed',
      description: "Suite con habitación adicional cerrada"
    }
  ]);

  // Mock cleaners data
  const [cleaners, setCleaners] = useState<Cleaner[]>([
    { id: "1", name: "María García", status: "active" },
    { id: "2", name: "Juan Pérez", status: "active" },
    { id: "3", name: "Ana Martínez", status: "active" },
    { id: "4", name: "Carlos Ruiz", status: "active" }
  ]);

  // Form states
  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "",
    estimatedTime: 25,
    observations: ""
  });

  const [newCleaner, setNewCleaner] = useState({
    name: ""
  });

  const [newRoomType, setNewRoomType] = useState<Partial<RoomType>>({
    name: "",
    defaultTime: 25,
    hasSecondRoom: false,
    secondRoomType: undefined,
    description: ""
  });

  const handleAddRoom = () => {
    if (newRoom.number && newRoom.type) {
      const room: Room = {
        id: Date.now().toString(),
        number: newRoom.number,
        type: newRoom.type,
        status: 'pending',
        timeRemaining: newRoom.estimatedTime,
        estimatedTime: newRoom.estimatedTime,
        observations: newRoom.observations || undefined
      };
      onAddRoom(room);
      setShowAddRoomDialog(false);
      setNewRoom({ number: "", type: "", estimatedTime: 25, observations: "" });
    }
  };

  const handleAddCleaner = () => {
    if (newCleaner.name) {
      const cleaner: Cleaner = {
        id: Date.now().toString(),
        name: newCleaner.name,
        status: "active"
      };
      setCleaners([...cleaners, cleaner]);
      setShowAddCleanerDialog(false);
      setNewCleaner({ name: "" });
    }
  };

  const handleAddRoomType = () => {
    if (newRoomType.name && newRoomType.defaultTime) {
      const roomType: RoomType = {
        id: Date.now().toString(),
        name: newRoomType.name,
        defaultTime: newRoomType.defaultTime,
        hasSecondRoom: newRoomType.hasSecondRoom || false,
        secondRoomType: newRoomType.hasSecondRoom ? newRoomType.secondRoomType : undefined,
        description: newRoomType.description
      };
      setRoomTypes([...roomTypes, roomType]);
      setShowAddRoomTypeDialog(false);
      setNewRoomType({ name: "", defaultTime: 25, hasSecondRoom: false, description: "" });
    }
  };

  const handleEditRoomType = () => {
    if (selectedRoomType && newRoomType.name && newRoomType.defaultTime) {
      const updatedRoomType: RoomType = {
        id: selectedRoomType.id,
        name: newRoomType.name,
        defaultTime: newRoomType.defaultTime,
        hasSecondRoom: newRoomType.hasSecondRoom || false,
        secondRoomType: newRoomType.hasSecondRoom ? newRoomType.secondRoomType : undefined,
        description: newRoomType.description
      };
      setRoomTypes(roomTypes.map(rt => rt.id === selectedRoomType.id ? updatedRoomType : rt));
      setShowEditRoomTypeDialog(false);
      setSelectedRoomType(null);
      setNewRoomType({ name: "", defaultTime: 25, hasSecondRoom: false, description: "" });
    }
  };

  const handleDeleteCleaner = (cleanerId: string) => {
    setCleaners(cleaners.filter(c => c.id !== cleanerId));
  };

  const handleDeleteRoomType = (roomTypeId: string) => {
    setRoomTypes(roomTypes.filter(rt => rt.id !== roomTypeId));
  };

  const handleOpenEditRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setNewRoomType({
      name: roomType.name,
      defaultTime: roomType.defaultTime,
      hasSecondRoom: roomType.hasSecondRoom,
      secondRoomType: roomType.secondRoomType,
      description: roomType.description
    });
    setShowEditRoomTypeDialog(true);
  };

  const handleAssignRoom = (cleanerId: string) => {
    if (selectedRoom) {
      const cleaner = cleaners.find(c => c.id === cleanerId);
      onUpdateRoom({ ...selectedRoom, assignedTo: cleaner?.name });
      setShowAssignDialog(false);
      setSelectedRoom(null);
    }
  };

  const handleRoomTypeSelect = (roomTypeName: string) => {
    const selectedType = roomTypes.find(rt => rt.name === roomTypeName);
    if (selectedType) {
      setNewRoom({
        ...newRoom,
        type: roomTypeName,
        estimatedTime: selectedType.defaultTime
      });
    }
  };

  const getStatusBadge = (status: Room['status']) => {
    const styles = {
      'completed': 'bg-secondary/10 text-secondary border-secondary/20',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      'pending': 'bg-muted text-muted-foreground border-border'
    };

    const labels = {
      'completed': 'Finalizada',
      'in-progress': 'En proceso',
      'pending': 'Pendiente'
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const stats = {
    totalRooms: rooms.length,
    pendingRooms: rooms.filter(r => r.status === 'pending').length,
    inProgressRooms: rooms.filter(r => r.status === 'in-progress').length,
    completedRooms: rooms.filter(r => r.status === 'completed').length,
    totalCleaners: cleaners.filter(c => c.status === 'active').length,
    totalRoomTypes: roomTypes.length
  };

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
            Volver
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">Panel Administrador</h1>
              <p className="text-muted-foreground">Viernes, 7 de Noviembre 2025</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-4 text-white">
              <HomeIcon className="w-8 h-8 mb-2 opacity-80" />
              <p className="opacity-90 mb-1">Total Habitaciones</p>
              <p className="text-3xl">{stats.totalRooms}</p>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl p-4 text-white">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="opacity-90 mb-1">Personal Activo</p>
              <p className="text-3xl">{stats.totalCleaners}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rooms">Habitaciones</TabsTrigger>
            <TabsTrigger value="types">Tipos</TabsTrigger>
            <TabsTrigger value="staff">Personal</TabsTrigger>
          </TabsList>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl">Gestión de Habitaciones</h3>
                <p className="text-muted-foreground">
                  {stats.pendingRooms} pendientes • {stats.inProgressRooms} en proceso • {stats.completedRooms} completadas
                </p>
              </div>
              <Button
                onClick={() => setShowAddRoomDialog(true)}
                className="bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir
              </Button>
            </div>

            <div className="space-y-3">
              {rooms.map((room) => (
                <Card key={room.id} className="p-5 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl">Habitación {room.number}</h3>
                        {getStatusBadge(room.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{room.type} • {room.estimatedTime} min</p>
                        {room.assignedTo && (
                          <p className="text-primary">Asignada a: {room.assignedTo}</p>
                        )}
                        {room.observations && (
                          <p className="text-muted-foreground">📝 {room.observations}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowAssignDialog(true);
                        }}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => onDeleteRoom(room.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Room Types Tab */}
          <TabsContent value="types" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl">Tipos de Habitación</h3>
                <p className="text-muted-foreground">{stats.totalRoomTypes} tipos configurados</p>
              </div>
              <Button
                onClick={() => {
                  setNewRoomType({ name: "", defaultTime: 25, hasSecondRoom: false, description: "" });
                  setShowAddRoomTypeDialog(true);
                }}
                className="bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir
              </Button>
            </div>

            <div className="space-y-3">
              {roomTypes.map((roomType) => (
                <Card key={roomType.id} className="p-5 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Bed className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">{roomType.name}</h3>
                          <p className="text-muted-foreground">⏱️ {roomType.defaultTime} minutos</p>
                        </div>
                      </div>
                      
                      {roomType.description && (
                        <p className="text-muted-foreground mb-2">{roomType.description}</p>
                      )}
                      
                      <div className="flex gap-2 flex-wrap">
                        {roomType.hasSecondRoom && (
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                            {roomType.secondRoomType === 'closed' ? '🚪 Segunda habitación cerrada' : '🏠 Segunda habitación abierta'}
                          </Badge>
                        )}
                        {!roomType.hasSecondRoom && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            Habitación simple
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => handleOpenEditRoomType(roomType)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDeleteRoomType(roomType.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl">Gestión de Personal</h3>
                <p className="text-muted-foreground">{stats.totalCleaners} empleados activos</p>
              </div>
              <Button
                onClick={() => setShowAddCleanerDialog(true)}
                className="bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Añadir
              </Button>
            </div>

            <div className="space-y-3">
              {cleaners.map((cleaner) => {
                const assignedRooms = rooms.filter(r => r.assignedTo === cleaner.name);
                const completedRooms = assignedRooms.filter(r => r.status === 'completed');
                
                return (
                  <Card key={cleaner.id} className="p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                          {cleaner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg mb-1">{cleaner.name}</h3>
                          <p className="text-muted-foreground">
                            {assignedRooms.length} habitaciones asignadas • {completedRooms.length} completadas
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          Activo
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                          onClick={() => handleDeleteCleaner(cleaner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Habitación</DialogTitle>
            <DialogDescription>Crea una nueva tarea de limpieza</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="room-number">Número de habitación</Label>
              <Input
                id="room-number"
                placeholder="Ej: 301"
                value={newRoom.number}
                onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-type">Tipo de habitación</Label>
              <Select value={newRoom.type} onValueChange={handleRoomTypeSelect}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.name}>
                      {rt.name} ({rt.defaultTime} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-time">Tiempo estimado (minutos)</Label>
              <Input
                id="estimated-time"
                type="number"
                value={newRoom.estimatedTime}
                onChange={(e) => setNewRoom({ ...newRoom, estimatedTime: parseInt(e.target.value) || 25 })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones (opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Notas especiales..."
                value={newRoom.observations}
                onChange={(e) => setNewRoom({ ...newRoom, observations: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddRoomDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddRoom}
              className="flex-1 bg-primary rounded-xl"
              disabled={!newRoom.number || !newRoom.type}
            >
              Añadir habitación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Room Type Dialog */}
      <Dialog open={showAddRoomTypeDialog} onOpenChange={setShowAddRoomTypeDialog}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Tipo de Habitación</DialogTitle>
            <DialogDescription>Define un nuevo tipo con sus especificaciones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Nombre del tipo</Label>
              <Input
                id="type-name"
                placeholder="Ej: Junior Suite"
                value={newRoomType.name}
                onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-time">Tiempo de limpieza por defecto (minutos)</Label>
              <Input
                id="type-time"
                type="number"
                placeholder="25"
                value={newRoomType.defaultTime}
                onChange={(e) => setNewRoomType({ ...newRoomType, defaultTime: parseInt(e.target.value) || 25 })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-description">Descripción (opcional)</Label>
              <Textarea
                id="type-description"
                placeholder="Describe las características de este tipo..."
                value={newRoomType.description}
                onChange={(e) => setNewRoomType({ ...newRoomType, description: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="space-y-1">
                  <Label htmlFor="has-second-room">¿Tiene segunda habitación?</Label>
                  <p className="text-muted-foreground">Indica si incluye un espacio adicional</p>
                </div>
                <Switch
                  id="has-second-room"
                  checked={newRoomType.hasSecondRoom}
                  onCheckedChange={(checked) => setNewRoomType({ 
                    ...newRoomType, 
                    hasSecondRoom: checked,
                    secondRoomType: checked ? 'open' : undefined
                  })}
                />
              </div>
              
              {newRoomType.hasSecondRoom && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <Label htmlFor="second-room-type">Tipo de segunda habitación</Label>
                  <Select 
                    value={newRoomType.secondRoomType} 
                    onValueChange={(value: 'open' | 'closed') => setNewRoomType({ ...newRoomType, secondRoomType: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">🏠 Abierta (sala de estar integrada)</SelectItem>
                      <SelectItem value="closed">🚪 Cerrada (habitación separada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddRoomTypeDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddRoomType}
              className="flex-1 bg-primary rounded-xl"
              disabled={!newRoomType.name || !newRoomType.defaultTime}
            >
              Añadir tipo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Room Type Dialog */}
      <Dialog open={showEditRoomTypeDialog} onOpenChange={setShowEditRoomTypeDialog}>
        <DialogContent className="rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Habitación</DialogTitle>
            <DialogDescription>Modifica las especificaciones del tipo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type-name">Nombre del tipo</Label>
              <Input
                id="edit-type-name"
                placeholder="Ej: Junior Suite"
                value={newRoomType.name}
                onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type-time">Tiempo de limpieza por defecto (minutos)</Label>
              <Input
                id="edit-type-time"
                type="number"
                placeholder="25"
                value={newRoomType.defaultTime}
                onChange={(e) => setNewRoomType({ ...newRoomType, defaultTime: parseInt(e.target.value) || 25 })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type-description">Descripción (opcional)</Label>
              <Textarea
                id="edit-type-description"
                placeholder="Describe las características de este tipo..."
                value={newRoomType.description}
                onChange={(e) => setNewRoomType({ ...newRoomType, description: e.target.value })}
                className="rounded-xl min-h-[80px]"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="space-y-1">
                  <Label htmlFor="edit-has-second-room">¿Tiene segunda habitación?</Label>
                  <p className="text-muted-foreground">Indica si incluye un espacio adicional</p>
                </div>
                <Switch
                  id="edit-has-second-room"
                  checked={newRoomType.hasSecondRoom}
                  onCheckedChange={(checked) => setNewRoomType({ 
                    ...newRoomType, 
                    hasSecondRoom: checked,
                    secondRoomType: checked ? (newRoomType.secondRoomType || 'open') : undefined
                  })}
                />
              </div>
              
              {newRoomType.hasSecondRoom && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <Label htmlFor="edit-second-room-type">Tipo de segunda habitación</Label>
                  <Select 
                    value={newRoomType.secondRoomType} 
                    onValueChange={(value: 'open' | 'closed') => setNewRoomType({ ...newRoomType, secondRoomType: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">🏠 Abierta (sala de estar integrada)</SelectItem>
                      <SelectItem value="closed">🚪 Cerrada (habitación separada)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditRoomTypeDialog(false);
                setSelectedRoomType(null);
              }}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditRoomType}
              className="flex-1 bg-primary rounded-xl"
              disabled={!newRoomType.name || !newRoomType.defaultTime}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Cleaner Dialog */}
      <Dialog open={showAddCleanerDialog} onOpenChange={setShowAddCleanerDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Personal</DialogTitle>
            <DialogDescription>Registra un nuevo empleado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cleaner-name">Nombre completo</Label>
              <Input
                id="cleaner-name"
                placeholder="Ej: María González"
                value={newCleaner.name}
                onChange={(e) => setNewCleaner({ name: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddCleanerDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCleaner}
              className="flex-1 bg-primary rounded-xl"
            >
              Añadir empleado
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Room Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Asignar Habitación</DialogTitle>
            <DialogDescription>
              Asignar habitación {selectedRoom?.number} a un empleado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {cleaners.map((cleaner) => (
              <Button
                key={cleaner.id}
                variant="outline"
                onClick={() => handleAssignRoom(cleaner.id)}
                className="w-full justify-start h-14 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-3">
                  {cleaner.name.split(' ').map(n => n[0]).join('')}
                </div>
                {cleaner.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
