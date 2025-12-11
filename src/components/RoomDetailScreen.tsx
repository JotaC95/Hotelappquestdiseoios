import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Play, Pause, Check, Clock, AlertCircle, MessageSquare, Users, CalendarDays, Bed, AlertTriangle, UserPlus, Camera, X, Image as ImageIcon, DoorClosed, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

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
  type: 'missing' | 'broken' | 'needed';
  description: string;
  assignedTo?: string;
  department?: 'cleaner' | 'houseman' | 'maintenance' | 'supervisor';
  createdAt: string;
  imageUrl?: string; // Optional image attachment
}

interface Room {
  id: string;
  number: string;
  type: string;
  roomCategory: 'Departure' | 'Weekly' | 'Pre-arrival' | 'Stay-over' | 'Vacant';
  status: 'pending' | 'in-progress' | 'completed';
  timeRemaining: number;
  estimatedTime: number;
  observations?: string;
  guestInfo?: GuestInfo;
  defaultConfig?: RoomConfiguration;
  customConfig?: RoomConfiguration;
  alerts?: Alert[];
  maintenanceStatus?: 'none' | 'pending' | 'in-progress' | 'completed';
  blockedBy?: 'maintenance' | null;
}

interface RoomDetailScreenProps {
  room: Room;
  onBack: () => void;
  onUpdateRoom: (room: Room) => void;
}

export function RoomDetailScreen({ room, onBack, onUpdateRoom }: RoomDetailScreenProps) {
  const [isRunning, setIsRunning] = useState(room.status === 'in-progress');
  const [timeLeft, setTimeLeft] = useState(room.timeRemaining * 60);
  const [showNFC, setShowNFC] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDNDDialog, setShowDNDDialog] = useState(false);
  const [dndPhoto, setDndPhoto] = useState<string | null>(null);
  const [dndNote, setDndNote] = useState('');
  const [newAlert, setNewAlert] = useState({
    type: 'missing' as 'missing' | 'broken' | 'needed',
    description: '',
    assignedTo: '',
    department: 'houseman' as 'cleaner' | 'houseman' | 'maintenance' | 'supervisor'
  });

  // Mock guest info for demonstration
  const guestInfo: GuestInfo = room.guestInfo || {
    isPresent: room.roomCategory === 'Stay-over',
    checkInDate: '25 Nov 2025',
    checkInTime: '15:00',
    checkOutDate: '27 Nov 2025',
    checkOutTime: '11:00',
    nextGuestArrival: room.roomCategory === 'Pre-arrival' ? '26 Nov 2025, 16:00' : undefined
  };

  // Mock configurations
  const defaultConfig: RoomConfiguration = room.defaultConfig || {
    bedType: room.type === 'Suite' ? '2 King beds' : room.type === 'Double' ? '1 Queen bed + 2 Single beds' : '1 Queen bed',
    secondRoom: room.type === 'Suite' ? 'open' : undefined,
    additionalInfo: ''
  };

  const customConfig: RoomConfiguration | undefined = room.customConfig;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCleaning = () => {
    setShowNFC(true);
    setTimeout(() => {
      setShowNFC(false);
      setIsRunning(true);
      onUpdateRoom({ ...room, status: 'in-progress' });
    }, 1500);
  };

  const handleAddTime = () => {
    setTimeLeft((prev) => prev + 600);
  };

  const handleComplete = () => {
    setIsRunning(false);
    onUpdateRoom({ ...room, status: 'completed', timeRemaining: 0 });
  };

  const handleAddAlert = () => {
    if (newAlert.description) {
      const alert: Alert = {
        id: Date.now().toString(),
        type: newAlert.type,
        description: newAlert.description,
        assignedTo: newAlert.assignedTo || undefined,
        department: newAlert.department,
        createdAt: new Date().toISOString(),
        imageUrl: selectedImage
      };
      
      const updatedRoom = {
        ...room,
        alerts: [...(room.alerts || []), alert]
      };
      
      // Si se asigna a mantenimiento, marcar la habitación como bloqueada
      if (newAlert.department === 'maintenance') {
        updatedRoom.maintenanceStatus = 'pending';
        updatedRoom.blockedBy = 'maintenance';
      }
      
      onUpdateRoom(updatedRoom);
      setShowAlertDialog(false);
      setNewAlert({ type: 'missing', description: '', assignedTo: '', department: 'houseman' });
      setSelectedImage(null);
    }
  };

  const handleAddDND = () => {
    if (dndNote) {
      const alert: Alert = {
        id: Date.now().toString(),
        type: 'needed',
        description: dndNote,
        assignedTo: '',
        department: 'houseman',
        createdAt: new Date().toISOString(),
        imageUrl: dndPhoto
      };
      
      const updatedRoom = {
        ...room,
        alerts: [...(room.alerts || []), alert]
      };
      
      onUpdateRoom(updatedRoom);
      setShowDNDDialog(false);
      setDndNote('');
      setDndPhoto(null);
    }
  };

  const progressPercentage = ((room.estimatedTime * 60 - timeLeft) / (room.estimatedTime * 60)) * 100;

  const alertTypeLabels = {
    'missing': 'Missing',
    'broken': 'Broken',
    'needed': 'Needed...'
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-4 sm:p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary mb-4 sm:mb-6 hover:opacity-80"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl mb-2">Room {room.number}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-3">{room.type}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
                  {room.status === 'completed' ? 'Completed' : room.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </Badge>
                <Badge variant="outline" className={
                  room.roomCategory === 'Departure' ? 'bg-red-500/10 text-red-600 border-red-500/20 text-xs sm:text-sm' :
                  room.roomCategory === 'Pre-arrival' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs sm:text-sm' :
                  room.roomCategory === 'Stay-over' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs sm:text-sm' :
                  room.roomCategory === 'Weekly' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs sm:text-sm' :
                  'bg-gray-500/10 text-gray-600 border-gray-500/20 text-xs sm:text-sm'
                }>
                  {room.roomCategory}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Card */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-sm sm:text-base opacity-90 mb-2">Time remaining</p>
            <div className="text-5xl sm:text-7xl mb-4 font-light tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {room.status === 'pending' && (
            <Button
              onClick={handleStartCleaning}
              className="w-full h-12 sm:h-14 bg-white text-primary hover:bg-white/90 rounded-xl text-sm sm:text-base"
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start cleaning with NFC
            </Button>
          )}

          {room.status === 'in-progress' && (
            <div className="flex gap-3">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 h-14 bg-white text-primary hover:bg-white/90 rounded-xl"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 h-14 bg-secondary text-white hover:bg-secondary/90 rounded-xl"
              >
                <Check className="w-5 h-5 mr-2" />
                Complete
              </Button>
            </div>
          )}
        </div>

        {/* NFC Modal */}
        {showNFC && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CreditCard className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl mb-2">Place your NFC card</h3>
                <p className="text-muted-foreground">Registering cleaning start...</p>
              </div>
            </div>
          </div>
        )}

        {/* Guest Information */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Guest Information</h3>
              <p className="text-muted-foreground mb-3">
                Status: {guestInfo.isPresent ? '🟢 In room' : '🔴 Out of room'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3 pl-13">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Check-in:</span>
              <span>{guestInfo.checkInDate} • {guestInfo.checkInTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Check-out:</span>
              <span>{guestInfo.checkOutDate} • {guestInfo.checkOutTime}</span>
            </div>
            {guestInfo.nextGuestArrival && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">Next guest:</span>
                <span className="text-blue-600">{guestInfo.nextGuestArrival}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Room Configuration */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bed className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Room Configuration</h3>
            </div>
          </div>
          
          <div className="space-y-4 pl-13">
            {/* Default Configuration */}
            <div>
              <p className="text-muted-foreground mb-2">Default Configuration:</p>
              <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                <p>🛏️ {defaultConfig.bedType}</p>
                {defaultConfig.secondRoom && (
                  <p>
                    {defaultConfig.secondRoom === 'closed' ? '🚪 Second room closed' : '🏠 Second room open'}
                  </p>
                )}
                {defaultConfig.additionalInfo && (
                  <p className="text-muted-foreground">• {defaultConfig.additionalInfo}</p>
                )}
              </div>
            </div>

            {/* Custom Configuration */}
            {customConfig && (
              <div>
                <p className="text-muted-foreground mb-2">Custom Configuration:</p>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
                  <p>🛏️ {customConfig.bedType}</p>
                  {customConfig.secondRoom && (
                    <p>
                      {customConfig.secondRoom === 'closed' ? '🚪 Second room closed' : '🏠 Second room open'}
                    </p>
                  )}
                  {customConfig.additionalInfo && (
                    <p className="text-primary">• {customConfig.additionalInfo}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Observations */}
        {room.observations && (
          <Card className="p-5 rounded-2xl border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mb-2">Observations</h3>
                <p className="text-muted-foreground">{room.observations}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Existing Alerts */}
        {room.alerts && room.alerts.length > 0 && (
          <Card className="p-5 rounded-2xl border-destructive/20 bg-destructive/5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="mb-2">Active Alerts</h3>
              </div>
            </div>
            <div className="space-y-3 pl-8">
              {room.alerts.map((alert) => (
                <div key={alert.id} className="bg-card rounded-xl p-3 border border-destructive/20">
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      {alertTypeLabels[alert.type]}
                    </Badge>
                  </div>
                  <p className="mb-2">{alert.description}</p>
                  {alert.imageUrl && (
                    <img 
                      src={alert.imageUrl} 
                      alt="Alert attachment" 
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  {alert.assignedTo && (
                    <p className="text-muted-foreground">👤 Assigned to: {alert.assignedTo}</p>
                  )}
                  {alert.department && (
                    <Badge variant="outline" className="mt-2">
                      {alert.department === 'maintenance' && '🔧 Maintenance'}
                      {alert.department === 'houseman' && '🧑‍🔧 Houseman'}
                      {alert.department === 'cleaner' && '🧹 Cleaning'}
                      {alert.department === 'supervisor' && '👁️ Supervisor'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleAddTime}
            variant="outline"
            className="w-full h-14 rounded-xl border-2"
            disabled={room.status === 'completed'}
          >
            <Clock className="w-5 h-5 mr-2" />
            Add +10 minutes
          </Button>

          <Button
            onClick={() => setShowAlertDialog(true)}
            variant="outline"
            className="w-full h-14 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
            disabled={room.status === 'completed'}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report alert
          </Button>

          <Button
            onClick={() => setShowDNDDialog(true)}
            variant="outline"
            className="w-full h-14 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
            disabled={room.status === 'completed'}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Add DND note
          </Button>
        </div>
      </div>

      {/* Add Alert Dialog */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Report Alert</DialogTitle>
            <DialogDescription>
              Register a problem or task for this room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-type">Alert type</Label>
              <Select 
                value={newAlert.type} 
                onValueChange={(value: 'missing' | 'broken' | 'needed') => 
                  setNewAlert({ ...newAlert, type: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing">🔍 Missing</SelectItem>
                  <SelectItem value="broken">🔧 Broken</SelectItem>
                  <SelectItem value="needed">📦 Needed...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-description">Description</Label>
              <Textarea
                id="alert-description"
                placeholder="Describe the problem or need..."
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-department">Assign to department</Label>
              <Select 
                value={newAlert.department} 
                onValueChange={(value: 'cleaner' | 'houseman' | 'maintenance' | 'supervisor') => 
                  setNewAlert({ ...newAlert, department: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="houseman">🧑‍🔧 Houseman</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="cleaner">🧹 Cleaning</SelectItem>
                  <SelectItem value="supervisor">👁️ Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-assign">Assign to person (optional)</Label>
              <Input
                id="alert-assign"
                placeholder="Responsible name"
                value={newAlert.assignedTo}
                onChange={(e) => setNewAlert({ ...newAlert, assignedTo: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-image">Attach image (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Take a photo or select an image of the problem</p>
              {!selectedImage ? (
                <div className="flex gap-2">
                  <label 
                    htmlFor="alert-image" 
                    className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="text-sm">Take photo</span>
                    <Input
                      id="alert-image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSelectedImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <label 
                    htmlFor="alert-image-file" 
                    className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm">Select</span>
                    <Input
                      id="alert-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSelectedImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    onClick={() => setSelectedImage(null)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAlertDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAlert}
              className="flex-1 bg-destructive rounded-xl"
              disabled={!newAlert.description}
            >
              Create alert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add DND Dialog */}
      <Dialog open={showDNDDialog} onOpenChange={setShowDNDDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add DND Note</DialogTitle>
            <DialogDescription>
              Add a note for the room
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dnd-note">Note</Label>
              <Textarea
                id="dnd-note"
                placeholder="Enter your note..."
                value={dndNote}
                onChange={(e) => setDndNote(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dnd-image">Attach image (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Take a photo or select an image of the problem</p>
              {!dndPhoto ? (
                <div className="flex gap-2">
                  <label 
                    htmlFor="dnd-image" 
                    className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="text-sm">Take photo</span>
                    <Input
                      id="dnd-image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDndPhoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <label 
                    htmlFor="dnd-image-file" 
                    className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="text-sm">Select</span>
                    <Input
                      id="dnd-image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDndPhoto(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-primary">
                  <img 
                    src={dndPhoto} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    onClick={() => setDndPhoto(null)}
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDNDDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDND}
              className="flex-1 bg-destructive rounded-xl"
              disabled={!dndNote}
            >
              Add DND note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}