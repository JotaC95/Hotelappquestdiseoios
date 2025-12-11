import { useState } from "react";
import { Clock, CheckCircle2, Circle, AlertCircle, Menu, Wrench, ChevronDown, ChevronUp, EyeOff, Eye, RefreshCw, DoorClosed } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
  dndStatus?: {
    isActive: boolean;
    markedAt?: string;
    markedBy?: string;
    evidencePhoto?: string;
    note?: string;
  };
}

interface DashboardScreenProps {
  onSelectRoom: (room: Room) => void;
  onOpenMenu: () => void;
  rooms: Room[];
  onRequestReassignment?: (roomId: string, reason: string) => void;
}

export function DashboardScreen({ onSelectRoom, onOpenMenu, rooms, onRequestReassignment }: DashboardScreenProps) {
  const [showPendingTimers, setShowPendingTimers] = useState(true);
  const [showCompletedList, setShowCompletedList] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedRoomForReassign, setSelectedRoomForReassign] = useState<Room | null>(null);
  const [reassignReason, setReassignReason] = useState("");

  const handleOpenReassignDialog = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoomForReassign(room);
    setReassignReason("");
    setShowReassignDialog(true);
  };

  const handleRequestReassignment = () => {
    if (selectedRoomForReassign && reassignReason.trim() && onRequestReassignment) {
      onRequestReassignment(selectedRoomForReassign.id, reassignReason);
      setShowReassignDialog(false);
      setSelectedRoomForReassign(null);
      setReassignReason("");
    }
  };

  // Function to extract guest arrival time
  const getArrivalTime = (room: Room): number => {
    if (room.guestInfo?.nextGuestArrival) {
      const timeMatch = room.guestInfo.nextGuestArrival.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      }
    }
    return 9999; // No arrival time goes to the end
  };

  // Function to sort rooms by hierarchy
  const sortRoomsByHierarchy = (roomsToSort: Room[]) => {
    return [...roomsToSort].sort((a, b) => {
      // First, sort by category according to hierarchy
      const categoryPriority: { [key: string]: number } = {
        'Pre-arrival': 1,
        'Departure': 2,
        'Weekly': 3,
        'Stay-over': 4,
        'Vacant': 5
      };

      const aPriority = categoryPriority[a.roomCategory] || 99;
      const bPriority = categoryPriority[b.roomCategory] || 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // If both are Pre-arrival, sort by arrival time
      if (a.roomCategory === 'Pre-arrival' && b.roomCategory === 'Pre-arrival') {
        const aTime = getArrivalTime(a);
        const bTime = getArrivalTime(b);
        if (aTime !== bTime) {
          return aTime - bTime;
        }
      }

      // If they are in the same category, sort by room number
      return parseInt(a.number) - parseInt(b.number);
    });
  };

  const pendingRooms = sortRoomsByHierarchy(
    rooms.filter(r => r.status !== 'completed')
  );
  
  const completedRooms = rooms.filter(r => r.status === 'completed')
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));
  
  const totalTimeRemaining = pendingRooms.reduce((acc, r) => acc + r.timeRemaining, 0);
  
  const progressPercentage = (completedRooms.length / rooms.length) * 100;

  const getStatusIcon = (room: Room) => {
    // If blocked by maintenance, show maintenance icon
    if (room.blockedBy === 'maintenance' && room.maintenanceStatus === 'in-progress') {
      return <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    }
    if (room.blockedBy === 'maintenance' && room.maintenanceStatus === 'pending') {
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
    }
    
    switch (room.status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />;
      case 'in-progress':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />;
      default:
        return <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (room: Room) => {
    // If in maintenance
    if (room.blockedBy === 'maintenance') {
      if (room.maintenanceStatus === 'in-progress') {
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            In Maintenance
          </Badge>
        );
      }
      if (room.maintenanceStatus === 'pending') {
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            Pending Maint.
          </Badge>
        );
      }
    }
    
    // If maintenance was recently completed
    if (room.maintenanceStatus === 'completed' && room.status === 'pending') {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          Ready to Clean
        </Badge>
      );
    }

    const styles = {
      'completed': 'bg-secondary/10 text-secondary border-secondary/20',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      'pending': 'bg-muted text-muted-foreground border-border'
    };

    const labels = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'pending': 'Pending'
    };

    return (
      <Badge variant="outline" className={styles[room.status]}>
        {labels[room.status]}
      </Badge>
    );
  };

  const getCategoryBadge = (category: Room['roomCategory']) => {
    const styles = {
      'Departure': 'bg-red-500/10 text-red-600 border-red-500/20',
      'Pre-arrival': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'Stay-over': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      'Weekly': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'Vacant': 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    };

    return (
      <Badge variant="outline" className={styles[category]}>
        {category}
      </Badge>
    );
  };

  const getRoomCardStyle = (room: Room) => {
    let baseStyle = "w-full bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]";
    
    // If blocked by maintenance, orange border
    if (room.blockedBy === 'maintenance') {
      return `${baseStyle} border-orange-500 border-2`;
    }
    
    // If maintenance recently completed
    if (room.maintenanceStatus === 'completed' && room.status === 'pending') {
      return `${baseStyle} border-green-500 border-2`;
    }
    
    return `${baseStyle} border-border`;
  };

  const renderRoomCard = (room: Room) => (
    <div key={room.id} className="relative">
      <button
        onClick={() => onSelectRoom(room)}
        className={getRoomCardStyle(room)}
      >
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {getStatusIcon(room)}
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl">Room {room.number}</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-2">{room.type}</p>
              <div className="flex gap-2 flex-wrap">
                {getCategoryBadge(room.roomCategory)}
                {room.blockedBy === 'maintenance' && (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                    <Wrench className="w-3 h-3 mr-1" />
                    Blocked
                  </Badge>
                )}
                {room.dndStatus?.isActive && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                    <DoorClosed className="w-3 h-3 mr-1" />
                    DND
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(room)}</div>
        </div>

        {room.status !== 'completed' && showPendingTimers && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Estimated time: {room.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              {room.blockedBy === 'maintenance' ? (
                <span className="text-xs sm:text-sm text-orange-600">Under maintenance</span>
              ) : (
                <span className="text-xs sm:text-sm text-primary">{room.timeRemaining} min remaining</span>
              )}
            </div>
          </div>
        )}

        {/* Additional information for Pre-arrivals */}
        {room.roomCategory === 'Pre-arrival' && room.guestInfo?.nextGuestArrival && showPendingTimers && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Arrival: {room.guestInfo.nextGuestArrival}</span>
            </div>
          </div>
        )}

        {/* Show who blocked the room */}
        {room.blockedBy === 'maintenance' && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-orange-600">
              <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Responsible: Maintenance</span>
            </div>
          </div>
        )}
      </button>

      {/* Reassign Button - Only for pending or in-progress rooms */}
      {room.status !== 'completed' && onRequestReassignment && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleOpenReassignDialog(room, e)}
          className="absolute top-2 right-2 z-10 rounded-lg gap-1 h-8 px-2"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden sm:inline text-xs">Request Reassign</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pb-4 sm:pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl mb-1">My Rooms</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Tuesday, December 9, 2025</p>
            </div>
            <button 
              onClick={onOpenMenu}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="text-sm sm:text-base opacity-90 mb-1">Total time remaining</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-2xl sm:text-3xl">{Math.floor(totalTimeRemaining / 60)}h {totalTimeRemaining % 60}m</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm sm:text-base opacity-90 mb-1">Day progress</p>
                <span className="text-2xl sm:text-3xl">{completedRooms.length}/{rooms.length}</span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Pending Rooms Section */}
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-lg sm:text-xl">Pending Rooms</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{pendingRooms.length} rooms</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPendingTimers(!showPendingTimers)}
            className="gap-2 text-xs sm:text-sm"
          >
            {showPendingTimers ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{showPendingTimers ? 'Hide' : 'Show'} timers</span>
            <span className="sm:hidden">{showPendingTimers ? 'Hide' : 'Show'}</span>
          </Button>
        </div>
        
        {pendingRooms.length === 0 ? (
          <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-border">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-secondary mx-auto mb-3" />
            <p className="text-sm sm:text-base text-muted-foreground">All rooms completed!</p>
          </div>
        ) : (
          pendingRooms.map(renderRoomCard)
        )}
      </div>

      {/* Completed Rooms Section */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <button
          onClick={() => setShowCompletedList(!showCompletedList)}
          className="w-full flex items-center justify-between mb-3 sm:mb-4 p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl border border-border hover:bg-accent transition-colors"
        >
          <div className="text-left">
            <h2 className="text-lg sm:text-xl">Completed Rooms</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{completedRooms.length} rooms</p>
          </div>
          {showCompletedList ? (
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          )}
        </button>
        
        {showCompletedList && (
          <div className="space-y-3">
            {completedRooms.length === 0 ? (
              <div className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-border">
                <p className="text-sm sm:text-base text-muted-foreground">No rooms completed yet</p>
              </div>
            ) : (
              completedRooms.map(renderRoomCard)
            )}
          </div>
        )}
      </div>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Request Room Reassignment</DialogTitle>
            <DialogDescription>
              Tell your supervisor why you need this room reassigned
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoomForReassign && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room:</span>
                  <span className="font-medium">{selectedRoomForReassign.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{selectedRoomForReassign.type}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for reassignment</Label>
                <Textarea
                  id="reason"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="E.g., Emergency, health issue, too many rooms assigned, need assistance..."
                  className="h-24 rounded-xl"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Your supervisor will be notified and can reassign this room to another team member
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestReassignment}
              disabled={!reassignReason.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}