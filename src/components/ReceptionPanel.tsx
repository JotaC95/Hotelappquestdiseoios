import { useState } from "react";
import { ArrowLeft, Home, Search, Filter, Calendar, Users, Clock, CheckCircle2, AlertTriangle, ChevronRight, Bell, UserPlus, Settings, DoorClosed } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";

interface Room {
  id: string;
  number: string;
  type: string;
  roomCategory: 'Departure' | 'Weekly' | 'Pre-arrival' | 'Stay-over' | 'Vacant';
  status: 'pending' | 'in-progress' | 'completed';
  maintenanceStatus?: 'none' | 'pending' | 'in-progress' | 'completed';
  blockedBy?: 'maintenance' | null;
  cleanedBy?: string;
  assignedCleaner?: string;
  timeRemaining: number;
  estimatedTime: number;
  dndStatus?: {
    isActive: boolean;
    markedAt?: string;
    markedBy?: string;
    evidencePhoto?: string;
    note?: string;
  };
  guestInfo?: {
    isPresent: boolean;
    checkInDate?: string;
    checkOutDate?: string;
    nextGuestArrival?: string;
  };
}

interface Alert {
  id: string;
  type: 'missing' | 'broken' | 'needed' | 'preparation' | 'restock';
  description: string;
  roomNumber?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  createdBy?: string;
  department?: string;
}

interface ReceptionPanelProps {
  onBack: () => void;
  rooms?: Room[];
  alerts?: Alert[];
  onUpdateRoom?: (room: Room) => void;
}

export function ReceptionPanel({ onBack, rooms = [], alerts = [], onUpdateRoom }: ReceptionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignCleaner, setAssignCleaner] = useState('');

  // Mock cleaners list
  const cleaners = [
    'María García',
    'Juan Pérez',
    'Ana Martínez',
    'Carlos López',
    'Sofia Rodríguez'
  ];

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.includes(searchQuery) || 
                         room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || room.roomCategory === filterCategory;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get room statistics
  const stats = {
    total: rooms.length,
    completed: rooms.filter(r => r.status === 'completed').length,
    inProgress: rooms.filter(r => r.status === 'in-progress').length,
    pending: rooms.filter(r => r.status === 'pending').length,
    blocked: rooms.filter(r => r.blockedBy === 'maintenance').length,
    dnd: rooms.filter(r => r.dndStatus?.isActive).length
  };

  // Get pending alerts count
  const pendingAlerts = alerts.filter(a => a.status === 'pending').length;

  const handleAssignRoom = () => {
    if (selectedRoom && assignCleaner) {
      const updatedRoom = {
        ...selectedRoom,
        assignedCleaner: assignCleaner,
        cleanedBy: assignCleaner
      };
      onUpdateRoom?.(updatedRoom);
      setShowAssignDialog(false);
      setAssignCleaner('');
      setSelectedRoom(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    const configs = {
      'Departure': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', label: 'Departure' },
      'Pre-arrival': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', label: 'Pre-arrival' },
      'Stay-over': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', label: 'Stay-over' },
      'Weekly': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20', label: 'Weekly' },
      'Vacant': { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20', label: 'Vacant' }
    };
    const config = configs[category as keyof typeof configs] || configs.Vacant;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'completed': { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20', label: 'Completed', icon: CheckCircle2 },
      'in-progress': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', label: 'In Progress', icon: Clock },
      'pending': { bg: 'bg-gray-500/10', text: 'text-gray-600', border: 'border-gray-500/20', label: 'Pending', icon: Clock }
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
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
            Sign Out
          </button>

          <div className="mb-6">
            <h1 className="text-3xl mb-2">Reception Panel 💼</h1>
            <p className="text-muted-foreground">Tuesday, December 12, 2025</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <p className="text-sm text-blue-600 mb-1">Total Rooms</p>
              <p className="text-2xl text-blue-600">{stats.total}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <p className="text-sm text-secondary mb-1">Completed</p>
              <p className="text-2xl text-secondary">{stats.completed}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <p className="text-sm text-primary mb-1">In Progress</p>
              <p className="text-2xl text-primary">{stats.inProgress}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-gray-500/20">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl text-gray-600">{stats.pending}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <p className="text-sm text-orange-600 mb-1">Blocked</p>
              <p className="text-2xl text-orange-600">{stats.blocked}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <p className="text-sm text-red-600 mb-1">DND</p>
              <p className="text-2xl text-red-600">{stats.dnd}</p>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl h-12"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px] rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Departure">Departure</SelectItem>
                <SelectItem value="Pre-arrival">Pre-arrival</SelectItem>
                <SelectItem value="Stay-over">Stay-over</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Vacant">Vacant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px] rounded-xl h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="rooms">
              Rooms
              <Badge variant="secondary" className="ml-2">{filteredRooms.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {pendingAlerts > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingAlerts}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-3">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <Card key={room.id} className="p-5 rounded-2xl hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">Room {room.number}</h3>
                          {getStatusBadge(room.status)}
                          {getCategoryBadge(room.roomCategory)}
                          {room.blockedBy === 'maintenance' && (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                              🔧 Blocked
                            </Badge>
                          )}
                          {room.dndStatus?.isActive && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                              <DoorClosed className="w-3 h-3 mr-1" />
                              DND
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{room.type}</span>
                          {room.assignedCleaner && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {room.assignedCleaner}
                              </span>
                            </>
                          )}
                          {room.status === 'in-progress' && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-primary">
                                <Clock className="w-4 h-4" />
                                {room.timeRemaining} min left
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowAssignDialog(true);
                      }}
                      variant="outline"
                      className="rounded-xl"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {room.assignedCleaner ? 'Reassign' : 'Assign'}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 rounded-2xl text-center">
                <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl mb-2">No rooms found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </Card>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-3">
            {alerts.filter(a => a.status === 'pending').length > 0 ? (
              alerts.filter(a => a.status === 'pending').map((alert) => {
                const priorityConfig = {
                  'high': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', label: 'High' },
                  'medium': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', label: 'Medium' },
                  'low': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', label: 'Low' }
                };
                const config = priorityConfig[alert.priority];
                
                return (
                  <Card key={alert.id} className={`p-5 rounded-2xl border-2 ${config.border} ${config.bg}`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-6 h-6 ${config.text} flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`${config.bg} ${config.text} ${config.border}`}>
                            Priority {config.label}
                          </Badge>
                          {alert.roomNumber && (
                            <Badge variant="outline" className="bg-muted">
                              Room {alert.roomNumber}
                            </Badge>
                          )}
                          {alert.department && (
                            <Badge variant="outline" className="bg-muted text-xs">
                              {alert.department}
                            </Badge>
                          )}
                        </div>
                        <p className="mb-2">{alert.description}</p>
                        {alert.createdBy && (
                          <p className="text-sm text-muted-foreground">
                            Created by: {alert.createdBy}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 rounded-2xl text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl mb-2">No pending alerts</h3>
                <p className="text-muted-foreground">All alerts have been resolved</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Cleaner</DialogTitle>
            <DialogDescription>
              Select a cleaner for Room {selectedRoom?.number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cleaner-select">Cleaner</Label>
              <Select value={assignCleaner} onValueChange={setAssignCleaner}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a cleaner" />
                </SelectTrigger>
                <SelectContent>
                  {cleaners.map((cleaner) => (
                    <SelectItem key={cleaner} value={cleaner}>
                      {cleaner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignDialog(false);
                setAssignCleaner('');
                setSelectedRoom(null);
              }}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRoom}
              className="flex-1 bg-primary rounded-xl"
              disabled={!assignCleaner}
            >
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
