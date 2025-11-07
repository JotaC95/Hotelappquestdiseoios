import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface DailySummary {
  totalRooms: number;
  completedRooms: number;
  totalTime: number; // en minutos
  incidents: number;
  efficiency: number; // porcentaje
}

interface SummaryScreenProps {
  onBack: () => void;
  summary: DailySummary;
}

export function SummaryScreen({ onBack, summary }: SummaryScreenProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleClockOut = () => {
    // Simular registro NFC
    alert("Salida registrada con NFC exitosamente");
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

          <div>
            <h1 className="text-3xl mb-2">Resumen del Día</h1>
            <p className="text-muted-foreground">Viernes, 7 de Noviembre 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Main Stats Card */}
        <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-3xl p-8 text-white shadow-2xl">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-5xl mb-2">{summary.completedRooms}/{summary.totalRooms}</h2>
            <p className="opacity-90">Habitaciones completadas</p>
          </div>
          <Progress 
            value={(summary.completedRooms / summary.totalRooms) * 100} 
            className="h-3 bg-white/20"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground mb-1">Tiempo total</p>
            <p className="text-2xl">{formatTime(summary.totalTime)}</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <p className="text-muted-foreground mb-1">Incidencias</p>
            <p className="text-2xl">{summary.incidents}</p>
          </div>
        </div>

        {/* Efficiency Card */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">Eficiencia del día</p>
                <p className="text-3xl">{summary.efficiency}%</p>
              </div>
            </div>
          </div>
          <Progress value={summary.efficiency} className="h-3" />
          {summary.efficiency >= 90 && (
            <div className="mt-4 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
              <p className="text-secondary">¡Excelente trabajo! Superaste el objetivo del día.</p>
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="mb-4">Detalles por tipo de habitación</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="mb-1">Habitaciones Single</p>
                <p className="text-muted-foreground">5 completadas</p>
              </div>
              <div className="text-right">
                <p className="text-primary">2h 15m</p>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="mb-1">Habitaciones Double</p>
                <p className="text-muted-foreground">3 completadas</p>
              </div>
              <div className="text-right">
                <p className="text-primary">1h 50m</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Suites</p>
                <p className="text-muted-foreground">2 completadas</p>
              </div>
              <div className="text-right">
                <p className="text-primary">2h 30m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clock Out Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleClockOut}
            className="w-full h-16 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg"
          >
            <CreditCard className="w-6 h-6 mr-3" />
            Registrar salida con NFC
          </Button>
        </div>
      </div>
    </div>
  );
}
