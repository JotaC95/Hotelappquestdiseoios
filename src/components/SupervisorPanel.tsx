import { useState } from "react";
import { ArrowLeft, Users, CheckCircle2, Clock, AlertCircle, Filter } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CleanerStatus {
  id: string;
  name: string;
  avatar: string;
  assignedRooms: number;
  completedRooms: number;
  activeRoom?: string;
  efficiency: number;
  timeWorked: number; // en minutos
}

interface SupervisorPanelProps {
  onBack: () => void;
}

export function SupervisorPanel({ onBack }: SupervisorPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
              <h1 className="text-3xl mb-2">Panel Supervisor</h1>
              <p className="text-muted-foreground">Viernes, 7 de Noviembre 2025</p>
            </div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
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
                <p className="opacity-90 mb-1">Completadas</p>
                <p className="text-2xl">{totalCompleted}</p>
              </div>
              <div>
                <p className="opacity-90 mb-1">Eficiencia</p>
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

      {/* Filters */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cleaners List */}
      <div className="p-6 space-y-4">
        {cleaners.map((cleaner) => (
          <div
            key={cleaner.id}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center">
                  <span className="text-lg">{cleaner.avatar}</span>
                </div>
                <div>
                  <h3 className="text-xl mb-1">{cleaner.name}</h3>
                  <p className="text-muted-foreground">
                    {cleaner.completedRooms}/{cleaner.assignedRooms} habitaciones
                  </p>
                </div>
              </div>
              {cleaner.activeRoom ? (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Clock className="w-3 h-3 mr-1" />
                  Hab. {cleaner.activeRoom}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Finalizado
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground mb-1">Eficiencia</p>
                <p className="text-xl">{cleaner.efficiency}%</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-muted-foreground mb-1">Tiempo trabajado</p>
                <p className="text-xl">{formatTime(cleaner.timeWorked)}</p>
              </div>
            </div>

            <Progress 
              value={(cleaner.completedRooms / cleaner.assignedRooms) * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6">
        <Button className="w-14 h-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90">
          <AlertCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
