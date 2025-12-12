import { useState } from "react";
import { ArrowLeft, Users, Home, Package, Settings, BarChart3, Calendar, Shield, UserPlus, Trash2, Edit, Plus, Download, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface User {
  id: string;
  name: string;
  role: 'cleaner' | 'houseman' | 'supervisor' | 'maintenance' | 'reception' | 'administrator';
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  performance?: number;
}

interface Room {
  id: string;
  number: string;
  type: string;
  roomCategory: 'Departure' | 'Weekly' | 'Pre-arrival' | 'Stay-over' | 'Vacant';
  status: 'pending' | 'in-progress' | 'completed';
  floor?: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
}

interface SystemConfig {
  defaultCleaningTime: number;
  overtimeThreshold: number;
  autoAssignment: boolean;
  nfcEnabled: boolean;
}

interface AdministratorPanelProps {
  onBack: () => void;
}

export function AdministratorPanel({ onBack }: AdministratorPanelProps) {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'María García', role: 'cleaner', email: 'maria@hotel.com', phone: '555-0101', status: 'active', performance: 95 },
    { id: '2', name: 'Juan Pérez', role: 'cleaner', email: 'juan@hotel.com', phone: '555-0102', status: 'active', performance: 88 },
    { id: '3', name: 'Ana Martínez', role: 'supervisor', email: 'ana@hotel.com', phone: '555-0103', status: 'active', performance: 92 },
    { id: '4', name: 'Carlos López', role: 'houseman', email: 'carlos@hotel.com', phone: '555-0104', status: 'active', performance: 90 },
    { id: '5', name: 'Sofia Rodríguez', role: 'maintenance', email: 'sofia@hotel.com', phone: '555-0105', status: 'active', performance: 87 },
    { id: '6', name: 'Luis Fernández', role: 'reception', email: 'luis@hotel.com', phone: '555-0106', status: 'active', performance: 93 }
  ]);

  const [rooms] = useState<Room[]>([
    { id: '1', number: '101', type: 'Single', roomCategory: 'Departure', status: 'completed', floor: 1 },
    { id: '2', number: '102', type: 'Double', roomCategory: 'Stay-over', status: 'in-progress', floor: 1 },
    { id: '3', number: '201', type: 'Suite', roomCategory: 'Pre-arrival', status: 'pending', floor: 2 },
    { id: '4', number: '305', type: 'Double', roomCategory: 'Weekly', status: 'pending', floor: 3 }
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Towels', category: 'Linen', quantity: 150, minStock: 100, unit: 'pcs' },
    { id: '2', name: 'Bed Sheets', category: 'Linen', quantity: 80, minStock: 50, unit: 'sets' },
    { id: '3', name: 'Shampoo', category: 'Amenities', quantity: 45, minStock: 50, unit: 'bottles' },
    { id: '4', name: 'Soap', category: 'Amenities', quantity: 200, minStock: 100, unit: 'pcs' }
  ]);

  const [config, setConfig] = useState<SystemConfig>({
    defaultCleaningTime: 30,
    overtimeThreshold: 50,
    autoAssignment: false,
    nfcEnabled: true
  });

  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    role: 'cleaner',
    email: '',
    phone: '',
    status: 'active'
  });

  // Statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalRooms: rooms.length,
    completedToday: rooms.filter(r => r.status === 'completed').length,
    lowStockItems: inventory.filter(i => i.quantity <= i.minStock).length,
    avgPerformance: Math.round(users.reduce((acc, u) => acc + (u.performance || 0), 0) / users.length)
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        role: newUser.role as User['role'],
        email: newUser.email,
        phone: newUser.phone || '',
        status: newUser.status as 'active' | 'inactive',
        performance: 0
      };
      setUsers([...users, user]);
      setNewUser({ name: '', role: 'cleaner', email: '', phone: '', status: 'active' });
      setShowUserDialog(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u
    ));
  };

  const roleLabels = {
    'cleaner': { label: 'Cleaner', icon: '🧹', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    'houseman': { label: 'Houseman', icon: '🧑‍🔧', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    'supervisor': { label: 'Supervisor', icon: '👁️', color: 'text-green-600', bg: 'bg-green-500/10' },
    'maintenance': { label: 'Maintenance', icon: '🔧', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    'reception': { label: 'Reception', icon: '💼', color: 'text-teal-600', bg: 'bg-teal-500/10' },
    'administrator': { label: 'Administrator', icon: '🔑', color: 'text-red-600', bg: 'bg-red-500/10' }
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
            <h1 className="text-3xl mb-2">Administrator Panel 🔑</h1>
            <p className="text-muted-foreground">System Management & Control</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-sm text-primary">Total Users</p>
              </div>
              <p className="text-2xl text-primary">{stats.totalUsers}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-secondary" />
                <p className="text-sm text-secondary">Active</p>
              </div>
              <p className="text-2xl text-secondary">{stats.activeUsers}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-600">Total Rooms</p>
              </div>
              <p className="text-2xl text-blue-600">{stats.totalRooms}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-600">Completed</p>
              </div>
              <p className="text-2xl text-green-600">{stats.completedToday}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-orange-600">Low Stock</p>
              </div>
              <p className="text-2xl text-orange-600">{stats.lowStockItems}</p>
            </Card>
            <Card className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-purple-600">Avg Perf.</p>
              </div>
              <p className="text-2xl text-purple-600">{stats.avgPerformance}%</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Home className="w-4 h-4 mr-2" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">User Management</h2>
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({ name: '', role: 'cleaner', email: '', phone: '', status: 'active' });
                  setShowUserDialog(true);
                }}
                className="bg-primary rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="space-y-3">
              {users.map((user) => {
                const roleConfig = roleLabels[user.role];
                return (
                  <Card key={user.id} className="p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 ${roleConfig.bg} rounded-xl flex items-center justify-center text-2xl`}>
                          {roleConfig.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{user.name}</h3>
                            <Badge variant="outline" className={`${roleConfig.bg} ${roleConfig.color}`}>
                              {roleConfig.label}
                            </Badge>
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📧 {user.email}</span>
                            <span>📱 {user.phone}</span>
                            {user.performance && (
                              <span className="text-primary">
                                📊 Performance: {user.performance}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleToggleUserStatus(user.id)}
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                        >
                          {user.status === 'active' ? '⏸️' : '▶️'}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingUser(user);
                            setNewUser(user);
                            setShowUserDialog(true);
                          }}
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="outline"
                          size="icon"
                          className="rounded-xl text-red-600 hover:bg-red-50"
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

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Room Management</h2>
              <Button
                onClick={() => setShowRoomDialog(true)}
                className="bg-primary rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="p-5 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Room {room.number}</h3>
                        <p className="text-sm text-muted-foreground">{room.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline">{room.roomCategory}</Badge>
                    <Badge variant={
                      room.status === 'completed' ? 'default' : 
                      room.status === 'in-progress' ? 'secondary' : 
                      'outline'
                    }>
                      {room.status}
                    </Badge>
                    <Badge variant="outline">Floor {room.floor}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl">Inventory Management</h2>
              <Button className="bg-primary rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="space-y-3">
              {inventory.map((item) => {
                const isLowStock = item.quantity <= item.minStock;
                return (
                  <Card key={item.id} className={`p-5 rounded-2xl ${isLowStock ? 'border-2 border-orange-500/20 bg-orange-500/5' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 ${isLowStock ? 'bg-orange-500/10' : 'bg-primary/10'} rounded-xl flex items-center justify-center`}>
                          <Package className={`w-6 h-6 ${isLowStock ? 'text-orange-600' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <Badge variant="outline">{item.category}</Badge>
                            {isLowStock && (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Current: {item.quantity} {item.unit}</span>
                            <span>Min: {item.minStock} {item.unit}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Restock
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-2xl mb-4">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                  <h3 className="text-lg">Daily Report</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Generate detailed daily performance report
                </p>
                <Button className="w-full bg-primary rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Card>

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-secondary" />
                  <h3 className="text-lg">Monthly Report</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Generate comprehensive monthly analysis
                </p>
                <Button className="w-full bg-secondary rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Card>

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg">Performance Report</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Employee performance and productivity
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Card>

              <Card className="p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg">Inventory Report</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Stock levels and usage patterns
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-2xl mb-4">System Settings</h2>

            <Card className="p-6 rounded-2xl">
              <h3 className="text-lg mb-4">General Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Default Cleaning Time</Label>
                    <p className="text-sm text-muted-foreground">Standard time per room</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.defaultCleaningTime}
                      onChange={(e) => setConfig({...config, defaultCleaningTime: parseInt(e.target.value)})}
                      className="w-20 rounded-xl"
                    />
                    <span>min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Overtime Threshold</Label>
                    <p className="text-sm text-muted-foreground">Alert when exceeding</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.overtimeThreshold}
                      onChange={(e) => setConfig({...config, overtimeThreshold: parseInt(e.target.value)})}
                      className="w-20 rounded-xl"
                    />
                    <span>min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Assignment</Label>
                    <p className="text-sm text-muted-foreground">Automatically assign rooms</p>
                  </div>
                  <Button
                    onClick={() => setConfig({...config, autoAssignment: !config.autoAssignment})}
                    variant={config.autoAssignment ? 'default' : 'outline'}
                    className="rounded-xl"
                  >
                    {config.autoAssignment ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>NFC Check-in</Label>
                    <p className="text-sm text-muted-foreground">Enable NFC authentication</p>
                  </div>
                  <Button
                    onClick={() => setConfig({...config, nfcEnabled: !config.nfcEnabled})}
                    variant={config.nfcEnabled ? 'default' : 'outline'}
                    className="rounded-xl"
                  >
                    {config.nfcEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>

              <Button className="w-full bg-primary rounded-xl mt-6">
                Save Settings
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({...newUser, role: value as User['role']})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaner">🧹 Cleaner</SelectItem>
                  <SelectItem value="houseman">🧑‍🔧 Houseman</SelectItem>
                  <SelectItem value="supervisor">👁️ Supervisor</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="reception">💼 Reception</SelectItem>
                  <SelectItem value="administrator">🔑 Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="email@hotel.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone</Label>
              <Input
                id="user-phone"
                type="tel"
                placeholder="555-0000"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-status">Status</Label>
              <Select 
                value={newUser.status} 
                onValueChange={(value) => setNewUser({...newUser, status: value as 'active' | 'inactive'})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">🟢 Active</SelectItem>
                  <SelectItem value="inactive">🔴 Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUserDialog(false);
                setNewUser({ name: '', role: 'cleaner', email: '', phone: '', status: 'active' });
                setEditingUser(null);
              }}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              className="flex-1 bg-primary rounded-xl"
              disabled={!newUser.name || !newUser.email}
            >
              {editingUser ? 'Update' : 'Add User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
