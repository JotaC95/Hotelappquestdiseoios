import { Clock, CheckCircle2, Circle, AlertCircle, Menu } from "lucide-react";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite';
  status: 'pending' | 'in-progress' | 'completed';
  timeRemaining: number; // en minutos
  estimatedTime: number;
}

interface DashboardScreenProps {
  onSelectRoom: (room: Room) => void;
  onOpenMenu: () => void;
  rooms: Room[];
}

export function DashboardScreen({ onSelectRoom, onOpenMenu, rooms }: DashboardScreenProps) {
  const totalTimeRemaining = rooms
    .filter(r => r.status !== 'completed')
    .reduce((acc, r) => acc + r.timeRemaining, 0);
  
  const completedRooms = rooms.filter(r => r.status === 'completed').length;
  const progressPercentage = (completedRooms / rooms.length) * 100;

  const getStatusIcon = (status: Room['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case 'in-progress':
        return <AlertCircle className="w-5 h-5 text-primary" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
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

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl mb-1">Mis Habitaciones</h1>
              <p className="text-muted-foreground">Viernes, 7 de Noviembre 2025</p>
            </div>
            <button 
              onClick={onOpenMenu}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-accent"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="opacity-90 mb-1">Tiempo total restante</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-3xl">{Math.floor(totalTimeRemaining / 60)}h {totalTimeRemaining % 60}m</span>
                </div>
              </div>
              <div className="text-right">
                <p className="opacity-90 mb-1">Progreso del día</p>
                <span className="text-3xl">{completedRooms}/{rooms.length}</span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div className="p-6 space-y-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className="w-full bg-card rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(room.status)}
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl">Habitación {room.number}</h3>
                  </div>
                  <p className="text-muted-foreground">{room.type}</p>
                </div>
              </div>
              {getStatusBadge(room.status)}
            </div>

            {room.status !== 'completed' && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Tiempo estimado: {room.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">{room.timeRemaining} min restantes</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
