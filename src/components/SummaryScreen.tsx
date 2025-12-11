import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface DailySummary {
  totalRooms: number;
  completedRooms: number;
  totalTime: number; // in minutes
  incidents: number;
  efficiency: number; // percentage
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
    // Simulate NFC registration
    alert("Clock out registered with NFC successfully");
  };

  return (
    <div className="min-h-screen bg-background">
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

          <div>
            <h1 className="text-2xl sm:text-3xl mb-2">Daily Summary</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Friday, November 7, 2025</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Main Stats Card */}
        <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-90" />
            <h2 className="text-4xl sm:text-5xl mb-2">{summary.completedRooms}/{summary.totalRooms}</h2>
            <p className="text-sm sm:text-base opacity-90">Rooms completed</p>
          </div>
          <Progress 
            value={(summary.completedRooms / summary.totalRooms) * 100} 
            className="h-2 sm:h-3 bg-white/20"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total time</p>
            <p className="text-xl sm:text-2xl">{formatTime(summary.totalTime)}</p>
          </div>

          <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Incidents</p>
            <p className="text-xl sm:text-2xl">{summary.incidents}</p>
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
                <p className="text-muted-foreground">Daily efficiency</p>
                <p className="text-3xl">{summary.efficiency}%</p>
              </div>
            </div>
          </div>
          <Progress value={summary.efficiency} className="h-3" />
          {summary.efficiency >= 90 && (
            <div className="mt-4 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
              <p className="text-secondary">Excellent work! You exceeded the daily goal.</p>
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="mb-4">Details by room type</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="mb-1">Single Rooms</p>
                <p className="text-muted-foreground">5 completed</p>
              </div>
              <div className="text-right">
                <p className="text-primary">2h 15m</p>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <p className="mb-1">Double Rooms</p>
                <p className="text-muted-foreground">3 completed</p>
              </div>
              <div className="text-right">
                <p className="text-primary">1h 50m</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1">Suites</p>
                <p className="text-muted-foreground">2 completed</p>
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
            Clock out with NFC
          </Button>
        </div>
      </div>
    </div>
  );
}