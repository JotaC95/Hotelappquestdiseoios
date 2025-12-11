import { useState } from "react";
import { ArrowLeft, Users, CheckCircle2, Clock, AlertCircle, Filter, ClipboardCheck, Home as HomeIcon, Bell, Plus, UserCog, RefreshCw, Image as ImageIcon, ChevronDown, ChevronUp, Circle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CleanerStatus {
  id: string;
  name: string;
  avatar: string;
  assignedRooms: number;
  completedRooms: number;
  activeRoom?: string;
  efficiency: number;
  timeWorked: number; // in minutes
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
  imageUrl?: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  approved?: boolean;
  cleanedBy?: string;
  assignedTo?: string;
  completedAt?: string;
  timeSpent?: number;
  observations?: string;
  alerts?: Alert[];
  timeExtensions?: number;
  totalTimeSpent?: number;
  isOvertime?: boolean;
  timeRemaining?: number;
  estimatedTime?: number;
}

interface SupervisorPanelProps {
  onBack: () => void;
  rooms: Room[];
  onApproveRoom: (roomId: string) => void;
  onAssignRoom?: (roomId: string, cleanerId: string) => void;
  onAddRoom?: (room: Partial<Room>) => void;
  alerts?: Alert[];
  onResolveAlert?: (alertId: string) => void;
}

export function SupervisorPanel({ 
  onBack, 
  rooms, 
  onApproveRoom,
  onAssignRoom,
  onAddRoom,
  alerts = [],
  onResolveAlert
}: SupervisorPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState<string>("");
  const [expandedCleaner, setExpandedCleaner] = useState<string | null>(null);

  // New room form state
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomType, setNewRoomType] = useState("");

  const cleaners: CleanerStatus[] = [
    {
      id: "1",
      name: "María García",
      avatar: "MG",
      assignedRooms: 12,
      completedRooms: 8,
      activeRoom: "201",
      efficiency: 92,
      timeWorked: 245
    },
    {
      id: "2",
      name: "Juan Pérez",
      avatar: "JP",
      assignedRooms: 10,
      completedRooms: 10,
      efficiency: 98,
      timeWorked: 290
    },
    {
      id: "3",
      name: "Ana Martínez",
      avatar: "AM",
      assignedRooms: 11,
      completedRooms: 6,
      activeRoom: "305",
      efficiency: 85,
      timeWorked: 180
    },
    {
      id: "4",
      name: "Carlos Ruiz",
      avatar: "CR",
      assignedRooms: 13,
      completedRooms: 9,
      activeRoom: "412",
      efficiency: 88,
      timeWorked: 265
    }
  ];

  const totalRooms = cleaners.reduce((acc, c) => acc + c.assignedRooms, 0);
  const totalCompleted = cleaners.reduce((acc, c) => acc + c.completedRooms, 0);
  const averageEfficiency = cleaners.reduce((acc, c) => acc + c.efficiency, 0) / cleaners.length;

  // Filter completed rooms
  const completedRooms = rooms.filter(r => r.status === 'completed');
  const approvedRooms = completedRooms.filter(r => r.approved);
  const pendingReviewRooms = completedRooms.filter(r => !r.approved);

  // Filter alerts
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const reassignmentRequests = pendingAlerts.filter(a => a.type === 'reassignment');
  const urgentAlerts = pendingAlerts.filter(a => a.priority === 'high');

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleReviewRoom = (room: Room) => {
    setSelectedRoom(room);
    setShowReviewDialog(true);
  };

  const handleApproveRoom = () => {
    if (selectedRoom) {
      onApproveRoom(selectedRoom.id);
      setShowReviewDialog(false);
      setSelectedRoom(null);
    }
  };

  const handleOpenAssignDialog = (room: Room) => {
    setSelectedRoom(room);
    setSelectedCleaner("");
    setShowAssignDialog(true);
  };

  const handleAssignRoom = () => {
    if (selectedRoom && selectedCleaner && onAssignRoom) {
      onAssignRoom(selectedRoom.id, selectedCleaner);
      setShowAssignDialog(false);
      setSelectedRoom(null);
      setSelectedCleaner("");
    }
  };

  const handleAddRoom = () => {
    if (newRoomNumber && newRoomType && onAddRoom) {
      onAddRoom({
        number: newRoomNumber,
        type: newRoomType,
        status: 'pending'
      });
      setShowAddRoomDialog(false);
      setNewRoomNumber("");
      setNewRoomType("");
    }
  };

  const handleOpenReassignDialog = (alert: Alert) => {
    const room = rooms.find(r => r.number === alert.roomNumber);
    if (room) {
      setSelectedRoom(room);
      setSelectedAlert(alert);
      setSelectedCleaner("");
      setShowReassignDialog(true);
    }
  };

  const handleReassignRoom = () => {
    if (selectedRoom && selectedCleaner && selectedAlert && onAssignRoom && onResolveAlert) {
      onAssignRoom(selectedRoom.id, selectedCleaner);
      onResolveAlert(selectedAlert.id);
      setShowReassignDialog(false);
      setSelectedRoom(null);
      setSelectedAlert(null);
      setSelectedCleaner("");
    }
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertDialog(true);
  };

  const handleResolveAlert = () => {
    if (selectedAlert && onResolveAlert) {
      onResolveAlert(selectedAlert.id);
      setShowAlertDialog(false);
      setSelectedAlert(null);
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[priority];
  };

  const getAlertTypeLabel = (type: Alert['type']) => {
    const labels = {
      missing: 'Missing Item',
      broken: 'Broken Item',
      needed: 'Item Needed',
      preparation: 'Preparation',
      restock: 'Restock',
      reassignment: 'Reassignment Request'
    };
    return labels[type];
  };

  // Get rooms assigned to a specific cleaner
  const getRoomsForCleaner = (cleanerName: string): Room[] => {
    return rooms.filter(r => r.cleanedBy === cleanerName);
  };

  // Calculate remaining time for cleaner's rooms
  const getRemainingTimeForCleaner = (cleanerName: string): number => {
    const cleanerRooms = getRoomsForCleaner(cleanerName);
    return cleanerRooms
      .filter(r => r.status !== 'completed')
      .reduce((acc, r) => acc + (r.timeRemaining || 0), 0);
  };

  // Check if cleaner has overtime rooms
  const hasOvertimeRooms = (cleanerName: string): boolean => {
    const cleanerRooms = getRoomsForCleaner(cleanerName);
    return cleanerRooms.some(r => r.isOvertime);
  };

  // Toggle cleaner expansion
  const toggleCleanerExpansion = (cleanerId: string) => {
    setExpandedCleaner(expandedCleaner === cleanerId ? null : cleanerId);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary mb-6 hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl mb-2">Supervisor Panel</h1>
              <p className="text-muted-foreground">Tuesday, December 10, 2025</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center relative">
              <Users className="w-6 h-6 text-white" />
              {urgentAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">{urgentAlerts.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="opacity-90 mb-1">Total</p>
                <p className="text-2xl">{totalRooms}</p>
              </div>
              <div>
                <p className="opacity-90 mb-1">Completed</p>
                <p className="text-2xl">{totalCompleted}</p>
              </div>
              <div>
                <p className="opacity-90 mb-1">Efficiency</p>
                <p className="text-2xl">{averageEfficiency.toFixed(0)}%</p>
              </div>
            </div>
            <Progress 
              value={(totalCompleted / totalRooms) * 100} 
              className="h-2 bg-white/20"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="w-full grid grid-cols-4 px-6 py-4 bg-card border-b border-border">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completed
            {pendingReviewRooms.length > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground h-5 min-w-5 px-1.5">
                {pendingReviewRooms.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {pendingAlerts.length > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white h-5 min-w-5 px-1.5">
                {pendingAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-0">
          {/* Filters */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cleaners List */}
          <div className="p-6 space-y-4">
            {cleaners.map((cleaner) => {
              const cleanerRooms = getRoomsForCleaner(cleaner.name);
              const remainingTime = getRemainingTimeForCleaner(cleaner.name);
              const hasOvertime = hasOvertimeRooms(cleaner.name);
              const isExpanded = expandedCleaner === cleaner.id;

              return (
                <div
                  key={cleaner.id}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center relative">
                        <span className="text-lg">{cleaner.avatar}</span>
                        {hasOvertime && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl mb-1">{cleaner.name}</h3>
                        <p className="text-muted-foreground">
                          {cleaner.completedRooms}/{cleaner.assignedRooms} rooms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cleaner.activeRoom ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          <Clock className="w-3 h-3 mr-1" />
                          Room {cleaner.activeRoom}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Finished
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/30 rounded-xl p-3">
                      <p className="text-muted-foreground mb-1 text-sm">Efficiency</p>
                      <p className="text-xl">{cleaner.efficiency}%</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <p className="text-muted-foreground mb-1 text-sm">Time worked</p>
                      <p className="text-xl">{formatTime(cleaner.timeWorked)}</p>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3">
                      <p className="text-muted-foreground mb-1 text-sm">Time left</p>
                      <p className="text-xl">{remainingTime > 0 ? `${remainingTime}m` : '0m'}</p>
                    </div>
                  </div>

                  {hasOvertime && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700">
                        This cleaner has rooms with overtime (&gt;50 min)
                      </p>
                    </div>
                  )}

                  <Progress 
                    value={(cleaner.completedRooms / cleaner.assignedRooms) * 100} 
                    className="h-2 mb-4"
                  />

                  {/* Expand/Collapse Button */}
                  <Button
                    variant="outline"
                    onClick={() => toggleCleanerExpansion(cleaner.id)}
                    className="w-full rounded-xl flex items-center justify-between"
                  >
                    <span>View Assigned Rooms ({cleanerRooms.length})</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Expanded Room List */}
                  {isExpanded && cleanerRooms.length > 0 && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        Assigned Rooms
                      </h4>
                      {cleanerRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`rounded-xl p-4 border ${
                            room.isOvertime
                              ? 'bg-red-50 border-red-200'
                              : room.status === 'completed' && !room.approved
                              ? 'bg-orange-50 border-orange-200'
                              : room.status === 'completed'
                              ? 'bg-secondary/5 border-secondary/30'
                              : room.status === 'in-progress'
                              ? 'bg-primary/5 border-primary/30'
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium">Room {room.number}</h5>
                                {room.status === 'completed' && !room.approved && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                                    Needs Review
                                  </Badge>
                                )}
                                {room.status === 'completed' && room.approved && (
                                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                )}
                                {room.status === 'in-progress' && (
                                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    In Progress
                                  </Badge>
                                )}
                                {room.status === 'pending' && (
                                  <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                                    <Circle className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{room.type}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {room.status !== 'completed' && room.timeRemaining !== undefined && (
                              <div className="bg-white/50 rounded-lg p-2">
                                <p className="text-xs text-muted-foreground mb-1">Time Remaining</p>
                                <p className="text-sm font-medium">{room.timeRemaining} min</p>
                              </div>
                            )}
                            {room.estimatedTime !== undefined && (
                              <div className="bg-white/50 rounded-lg p-2">
                                <p className="text-xs text-muted-foreground mb-1">Estimated</p>
                                <p className="text-sm font-medium">{room.estimatedTime} min</p>
                              </div>
                            )}
                            {room.totalTimeSpent !== undefined && (
                              <div className={`rounded-lg p-2 ${
                                room.isOvertime ? 'bg-red-100' : 'bg-white/50'
                              }`}>
                                <p className="text-xs text-muted-foreground mb-1">Time Spent</p>
                                <p className={`text-sm font-medium ${
                                  room.isOvertime ? 'text-red-700' : ''
                                }`}>
                                  {room.totalTimeSpent} min
                                  {room.isOvertime && ' ⚠️'}
                                </p>
                              </div>
                            )}
                            {room.timeExtensions !== undefined && room.timeExtensions > 0 && (
                              <div className="bg-yellow-50 rounded-lg p-2">
                                <p className="text-xs text-muted-foreground mb-1">Extensions</p>
                                <p className="text-sm font-medium text-yellow-700">
                                  +10 min × {room.timeExtensions}
                                </p>
                              </div>
                            )}
                          </div>

                          {room.isOvertime && (
                            <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <p className="text-xs text-red-700">
                                Overtime: Exceeded 50 minutes
                              </p>
                            </div>
                          )}

                          {room.observations && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-2">
                              <p className="text-xs text-blue-700">📝 {room.observations}</p>
                            </div>
                          )}

                          {room.status === 'completed' && !room.approved && (
                            <Button
                              onClick={() => handleReviewRoom(room)}
                              size="sm"
                              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 rounded-lg"
                            >
                              <ClipboardCheck className="w-3 h-3 mr-2" />
                              Review Now
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && cleanerRooms.length === 0 && (
                    <div className="mt-4 pt-4 border-t border-border text-center py-8">
                      <HomeIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">No rooms assigned</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Completed Rooms Tab */}
        <TabsContent value="completed" className="mt-0">
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 border-none text-white">
                <ClipboardCheck className="w-8 h-8 mb-2 opacity-80" />
                <p className="opacity-90 mb-1">Approved</p>
                <p className="text-3xl">{approvedRooms.length}</p>
              </Card>
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white">
                <HomeIcon className="w-8 h-8 mb-2 opacity-80" />
                <p className="opacity-90 mb-1">Pending</p>
                <p className="text-3xl">{pendingReviewRooms.length}</p>
              </Card>
            </div>

            {/* Pending Review Section */}
            {pendingReviewRooms.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl">Pending Review</h3>
                  <Badge className="bg-orange-500 text-white">
                    {pendingReviewRooms.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {pendingReviewRooms.map((room) => (
                    <Card key={room.id} className="p-5 rounded-2xl border-orange-200 bg-orange-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl">Room {room.number}</h3>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                              To review
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">{room.type}</p>
                            {room.cleanedBy && (
                              <p className="text-primary">Cleaned by: {room.cleanedBy}</p>
                            )}
                            {room.completedAt && (
                              <p className="text-muted-foreground">⏱️ {room.completedAt}</p>
                            )}
                            {room.observations && (
                              <p className="text-muted-foreground">📝 {room.observations}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleReviewRoom(room)}
                          className="bg-orange-500 hover:bg-orange-600 rounded-xl"
                        >
                          <ClipboardCheck className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Section */}
            {approvedRooms.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <h3 className="text-xl">Approved</h3>
                </div>
                <div className="space-y-3">
                  {approvedRooms.map((room) => (
                    <Card key={room.id} className="p-5 rounded-2xl border-secondary/30 bg-secondary/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl">Room {room.number}</h3>
                            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">{room.type}</p>
                            {room.cleanedBy && (
                              <p className="text-primary">Cleaned by: {room.cleanedBy}</p>
                            )}
                            {room.completedAt && (
                              <p className="text-muted-foreground">⏱️ {room.completedAt}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedRooms.length === 0 && (
              <div className="text-center py-12">
                <HomeIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No completed rooms</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-0">
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 border-none text-white">
                <Bell className="w-8 h-8 mb-2 opacity-80" />
                <p className="opacity-90 mb-1">Urgent</p>
                <p className="text-3xl">{urgentAlerts.length}</p>
              </Card>
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white">
                <RefreshCw className="w-8 h-8 mb-2 opacity-80" />
                <p className="opacity-90 mb-1">Reassignments</p>
                <p className="text-3xl">{reassignmentRequests.length}</p>
              </Card>
            </div>

            {/* Reassignment Requests */}
            {reassignmentRequests.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  <h3 className="text-xl">Reassignment Requests</h3>
                  <Badge className="bg-blue-500 text-white">
                    {reassignmentRequests.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {reassignmentRequests.map((alert) => (
                    <Card key={alert.id} className="p-5 rounded-2xl border-blue-200 bg-blue-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl">Room {alert.roomNumber}</h3>
                            <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground">{alert.description}</p>
                            {alert.createdBy && (
                              <p className="text-primary text-sm">Requested by: {alert.createdBy}</p>
                            )}
                            <p className="text-muted-foreground text-sm">⏱️ {alert.createdAt}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOpenReassignDialog(alert)}
                          className="bg-blue-500 hover:bg-blue-600 rounded-xl"
                        >
                          <UserCog className="w-4 h-4 mr-2" />
                          Reassign
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Pending Alerts */}
            {pendingAlerts.filter(a => a.type !== 'reassignment').length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="text-xl">All Alerts</h3>
                </div>
                <div className="space-y-3">
                  {pendingAlerts.filter(a => a.type !== 'reassignment').map((alert) => (
                    <Card key={alert.id} className="p-5 rounded-2xl border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                              {alert.priority}
                            </Badge>
                            <Badge variant="outline">
                              {getAlertTypeLabel(alert.type)}
                            </Badge>
                            {alert.roomNumber && (
                              <span className="text-sm text-muted-foreground">Room {alert.roomNumber}</span>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {alert.assignedTo && <span>Assigned: {alert.assignedTo}</span>}
                            <span>⏱️ {alert.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alert.imageUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAlert(alert)}
                              className="rounded-xl"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAlert(alert)}
                            className="rounded-xl"
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingAlerts.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No pending alerts</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="mt-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl">All Rooms</h3>
              <Button
                onClick={() => setShowAddRoomDialog(true)}
                className="bg-primary hover:bg-primary/90 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>

            <div className="space-y-3">
              {rooms.map((room) => (
                <Card key={room.id} className="p-5 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl">Room {room.number}</h3>
                        <Badge variant="outline" className={
                          room.status === 'completed' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                          room.status === 'in-progress' ? 'bg-primary/10 text-primary border-primary/20' :
                          'bg-muted text-muted-foreground border-border'
                        }>
                          {room.status === 'completed' ? 'Completed' : 
                           room.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">{room.type}</p>
                        {room.assignedTo && (
                          <p className="text-primary text-sm">Assigned to: {room.assignedTo}</p>
                        )}
                      </div>
                    </div>
                    {room.status === 'pending' && (
                      <Button
                        onClick={() => handleOpenAssignDialog(room)}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {rooms.length === 0 && (
              <div className="text-center py-12">
                <HomeIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No rooms available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Review Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              Confirm that the cleaning meets standards
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoom && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedRoom.type}</span>
                </div>
                {selectedRoom.cleanedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">{selectedRoom.cleanedBy}</span>
                  </div>
                )}
                {selectedRoom.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium">{selectedRoom.completedAt}</span>
                  </div>
                )}
                {selectedRoom.timeSpent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{selectedRoom.timeSpent} min</span>
                  </div>
                )}
              </div>

              {selectedRoom.observations && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-muted-foreground mb-2">Staff observations:</p>
                  <p>{selectedRoom.observations}</p>
                </div>
              )}

              <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
                <p className="text-sm text-center">
                  By approving, this room will be marked as <span className="font-semibold text-secondary">completed and reviewed</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveRoom}
              className="flex-1 bg-secondary hover:bg-secondary/90 rounded-xl"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assign Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              Select a cleaner to assign this room
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cleaner</Label>
              <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a cleaner" />
                </SelectTrigger>
                <SelectContent>
                  {cleaners.map((cleaner) => (
                    <SelectItem key={cleaner.id} value={cleaner.id}>
                      {cleaner.name} ({cleaner.completedRooms}/{cleaner.assignedRooms} rooms)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoom && (
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room:</span>
                  <span className="font-medium">{selectedRoom.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedRoom.type}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRoom}
              disabled={!selectedCleaner}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={showAddRoomDialog} onOpenChange={setShowAddRoomDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Add a new room to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                placeholder="e.g. 201"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select value={newRoomType} onValueChange={setNewRoomType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                  <SelectItem value="Premium Suite">Premium Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddRoomDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={!newRoomNumber || !newRoomType}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reassign Room {selectedRoom?.number}</DialogTitle>
            <DialogDescription>
              Select a new cleaner for this room
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedAlert && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 mb-1">Reason:</p>
                <p className="text-blue-900">{selectedAlert.description}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>New Cleaner</Label>
              <Select value={selectedCleaner} onValueChange={setSelectedCleaner}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a cleaner" />
                </SelectTrigger>
                <SelectContent>
                  {cleaners.map((cleaner) => (
                    <SelectItem key={cleaner.id} value={cleaner.id}>
                      {cleaner.name} ({cleaner.completedRooms}/{cleaner.assignedRooms} rooms)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRoom && (
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room:</span>
                  <span className="font-medium">{selectedRoom.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedRoom.type}</span>
                </div>
                {selectedRoom.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current cleaner:</span>
                    <span className="font-medium">{selectedRoom.assignedTo}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassignRoom}
              disabled={!selectedCleaner}
              className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reassign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Details Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              {selectedAlert && getAlertTypeLabel(selectedAlert.type)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge className={getPriorityColor(selectedAlert.priority)}>
                    {selectedAlert.priority}
                  </Badge>
                </div>
                {selectedAlert.roomNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium">{selectedAlert.roomNumber}</span>
                  </div>
                )}
                {selectedAlert.assignedTo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium">{selectedAlert.assignedTo}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{selectedAlert.createdAt}</span>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-muted-foreground mb-2">Description:</p>
                <p>{selectedAlert.description}</p>
              </div>

              {selectedAlert.imageUrl && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-muted-foreground mb-2">Attached Image:</p>
                  <img 
                    src={selectedAlert.imageUrl} 
                    alt="Alert attachment" 
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAlertDialog(false)}
              className="flex-1 rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={handleResolveAlert}
              className="flex-1 bg-secondary hover:bg-secondary/90 rounded-xl"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={() => setShowAddRoomDialog(true)}
          className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}