import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Play, Pause, Check, Clock, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite';
  status: 'pending' | 'in-progress' | 'completed';
  timeRemaining: number;
  estimatedTime: number;
  observations?: string;
}

interface RoomDetailScreenProps {
  room: Room;
  onBack: () => void;
  onUpdateRoom: (room: Room) => void;
}

export function RoomDetailScreen({ room, onBack, onUpdateRoom }: RoomDetailScreenProps) {
  const [isRunning, setIsRunning] = useState(room.status === 'in-progress');
  const [timeLeft, setTimeLeft] = useState(room.timeRemaining * 60); // en segundos
  const [showNFC, setShowNFC] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

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
    setTimeLeft((prev) => prev + 600); // +10 minutos
  };

  const handleComplete = () => {
    setIsRunning(false);
    onUpdateRoom({ ...room, status: 'completed', timeRemaining: 0 });
  };

  const progressPercentage = ((room.estimatedTime * 60 - timeLeft) / (room.estimatedTime * 60)) * 100;

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

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl mb-2">Habitación {room.number}</h1>
              <p className="text-muted-foreground mb-3">{room.type}</p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {room.status === 'completed' ? 'Finalizada' : room.status === 'in-progress' ? 'En proceso' : 'Pendiente'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Card */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white shadow-2xl mb-6">
          <div className="text-center mb-6">
            <p className="opacity-90 mb-2">Tiempo restante</p>
            <div className="text-7xl mb-4 font-light tracking-tight">
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
              className="w-full h-14 bg-white text-primary hover:bg-white/90 rounded-xl"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Iniciar limpieza con NFC
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
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Reanudar
                  </>
                )}
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 h-14 bg-secondary text-white hover:bg-secondary/90 rounded-xl"
              >
                <Check className="w-5 h-5 mr-2" />
                Finalizar
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
                <h3 className="text-xl mb-2">Acerca tu tarjeta NFC</h3>
                <p className="text-muted-foreground">Registrando inicio de limpieza...</p>
              </div>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {room.observations && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="mb-2">Observaciones</h3>
                <p className="text-muted-foreground">{room.observations}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="space-y-3">
          <Button
            onClick={handleAddTime}
            variant="outline"
            className="w-full h-14 rounded-xl border-2"
            disabled={room.status === 'completed'}
          >
            <Clock className="w-5 h-5 mr-2" />
            Agregar +10 minutos
          </Button>

          <Button
            onClick={() => setShowCommentBox(!showCommentBox)}
            variant="outline"
            className="w-full h-14 rounded-xl border-2"
            disabled={room.status === 'completed'}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Reportar problema
          </Button>

          {showCommentBox && (
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <Textarea
                placeholder="Describe el problema encontrado..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-32 rounded-xl mb-3"
              />
              <Button className="w-full bg-primary rounded-xl">
                Enviar reporte
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
