import { useState } from "react";
import { ArrowLeft, Package, Search, Plus, Minus, AlertTriangle, TrendingDown, Box, Shirt, Droplet, Sparkles, History } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface InventoryItem {
  id: string;
  name: string;
  category: 'linen' | 'bedding' | 'towels' | 'amenities';
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked?: string;
}

interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  type: 'use' | 'restock';
  roomNumber?: string;
  user: string;
  date: string;
}

interface InventorySectionProps {
  onBack: () => void;
  userRole: 'houseman' | 'admin';
}

export function InventorySection({ onBack, userRole }: InventorySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [transactionType, setTransactionType] = useState<'use' | 'restock'>('use');
  const [transactionQuantity, setTransactionQuantity] = useState("1");
  const [roomNumber, setRoomNumber] = useState("");

  const [inventory, setInventory] = useState<InventoryItem[]>([
    // Linen
    { id: '1', name: 'Sábanas Individual', category: 'linen', quantity: 45, minQuantity: 30, unit: 'unidades', lastRestocked: '20 Nov 2025' },
    { id: '2', name: 'Sábanas Queen', category: 'linen', quantity: 62, minQuantity: 40, unit: 'unidades', lastRestocked: '22 Nov 2025' },
    { id: '3', name: 'Sábanas King', category: 'linen', quantity: 38, minQuantity: 25, unit: 'unidades', lastRestocked: '21 Nov 2025' },
    
    // Bedding
    { id: '4', name: 'Fundas de almohada', category: 'bedding', quantity: 120, minQuantity: 80, unit: 'unidades', lastRestocked: '23 Nov 2025' },
    { id: '5', name: 'Almohadas estándar', category: 'bedding', quantity: 95, minQuantity: 60, unit: 'unidades', lastRestocked: '18 Nov 2025' },
    { id: '6', name: 'Almohadas premium', category: 'bedding', quantity: 28, minQuantity: 20, unit: 'unidades', lastRestocked: '19 Nov 2025' },
    { id: '7', name: 'Edredones', category: 'bedding', quantity: 55, minQuantity: 40, unit: 'unidades', lastRestocked: '20 Nov 2025' },
    
    // Towels
    { id: '8', name: 'Toallas de baño', category: 'towels', quantity: 22, minQuantity: 50, unit: 'unidades', lastRestocked: '15 Nov 2025' },
    { id: '9', name: 'Toallas de mano', category: 'towels', quantity: 88, minQuantity: 60, unit: 'unidades', lastRestocked: '23 Nov 2025' },
    { id: '10', name: 'Toallones', category: 'towels', quantity: 35, minQuantity: 30, unit: 'unidades', lastRestocked: '22 Nov 2025' },
    
    // Amenities
    { id: '11', name: 'Shampoo', category: 'amenities', quantity: 180, minQuantity: 120, unit: 'unidades', lastRestocked: '24 Nov 2025' },
    { id: '12', name: 'Acondicionador', category: 'amenities', quantity: 165, minQuantity: 120, unit: 'unidades', lastRestocked: '24 Nov 2025' },
    { id: '13', name: 'Jabón de tocador', category: 'amenities', quantity: 210, minQuantity: 150, unit: 'unidades', lastRestocked: '23 Nov 2025' },
    { id: '14', name: 'Gel de ducha', category: 'amenities', quantity: 145, minQuantity: 100, unit: 'unidades', lastRestocked: '24 Nov 2025' },
    { id: '15', name: 'Loción corporal', category: 'amenities', quantity: 98, minQuantity: 80, unit: 'unidades', lastRestocked: '22 Nov 2025' }
  ]);

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([
    { id: 't1', itemId: '8', itemName: 'Toallas de baño', quantity: 4, type: 'use', roomNumber: '305', user: 'Houseman', date: new Date().toISOString() },
    { id: 't2', itemId: '11', itemName: 'Shampoo', quantity: 2, type: 'use', roomNumber: '201', user: 'Houseman', date: new Date().toISOString() },
    { id: 't3', itemId: '2', itemName: 'Sábanas Queen', quantity: 20, type: 'restock', user: 'Admin', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 't4', itemId: '9', itemName: 'Toallas de mano', quantity: 6, type: 'use', roomNumber: '601', user: 'Houseman', date: new Date(Date.now() - 3600000).toISOString() }
  ]);

  const categoryIcons = {
    'linen': { icon: Shirt, label: 'Linen', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    'bedding': { icon: Package, label: 'Ropa de cama', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    'towels': { icon: Droplet, label: 'Toallas', color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
    'amenities': { icon: Sparkles, label: 'Amenities', color: 'text-amber-600', bg: 'bg-amber-500/10' }
  };

  const lowStockItems = inventory.filter(item => item.quantity < item.minQuantity);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenTransaction = (item: InventoryItem, type: 'use' | 'restock') => {
    setSelectedItem(item);
    setTransactionType(type);
    setTransactionQuantity("1");
    setRoomNumber("");
    setShowTransactionDialog(true);
  };

  const handleSubmitTransaction = () => {
    if (!selectedItem) return;
    
    const quantity = parseInt(transactionQuantity);
    if (isNaN(quantity) || quantity <= 0) return;

    // Update inventory
    setInventory(inventory.map(item => {
      if (item.id === selectedItem.id) {
        const newQuantity = transactionType === 'use' 
          ? Math.max(0, item.quantity - quantity)
          : item.quantity + quantity;
        
        return {
          ...item,
          quantity: newQuantity,
          lastRestocked: transactionType === 'restock' ? new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : item.lastRestocked
        };
      }
      return item;
    }));

    // Add transaction
    const newTransaction: InventoryTransaction = {
      id: `t${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      quantity,
      type: transactionType,
      roomNumber: transactionType === 'use' ? roomNumber : undefined,
      user: userRole === 'houseman' ? 'Houseman' : 'Admin',
      date: new Date().toISOString()
    };
    setTransactions([newTransaction, ...transactions]);

    setShowTransactionDialog(false);
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

          <div className="mb-4">
            <h1 className="text-3xl mb-2">Inventario del Hotel 📦</h1>
            <p className="text-muted-foreground">Gestión de artículos y suministros</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar artículo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">
              Todos
              <Badge variant="secondary" className="ml-2">{inventory.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="alerts">
              Stock Bajo
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="ml-2">{lowStockItems.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* All Items Tab */}
          <TabsContent value="all" className="space-y-4">
            {Object.entries(categoryIcons).map(([category, config]) => {
              const CategoryIcon = config.icon;
              const items = filteredInventory.filter(item => item.category === category);
              
              if (items.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className={`w-5 h-5 ${config.color}`} />
                    <h3 className="text-xl">{config.label}</h3>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const isLowStock = item.quantity < item.minQuantity;
                      return (
                        <Card key={item.id} className={`p-5 rounded-2xl ${isLowStock ? 'border-2 border-destructive/20 bg-destructive/5' : ''}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{item.name}</h4>
                                {isLowStock && (
                                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    Stock Bajo
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span>Stock actual: <strong className={isLowStock ? 'text-destructive' : ''}>{item.quantity}</strong> {item.unit}</span>
                                <span>•</span>
                                <span>Mínimo: {item.minQuantity} {item.unit}</span>
                              </div>
                              {item.lastRestocked && (
                                <p className="text-muted-foreground mt-1">
                                  Última reposición: {item.lastRestocked}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleOpenTransaction(item, 'use')}
                              variant="outline"
                              className="flex-1 rounded-xl"
                            >
                              <Minus className="w-4 h-4 mr-2" />
                              Registrar uso
                            </Button>
                            <Button
                              onClick={() => handleOpenTransaction(item, 'restock')}
                              className="flex-1 bg-secondary rounded-xl"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Reponer
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredInventory.length === 0 && (
              <Card className="p-8 rounded-2xl text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No se encontraron artículos</p>
              </Card>
            )}
          </TabsContent>

          {/* Low Stock Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div>
              <h3 className="text-xl mb-3">⚠️ Artículos con Stock Bajo</h3>
              {lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item) => {
                    const config = categoryIcons[item.category];
                    const CategoryIcon = config.icon;
                    const stockPercentage = (item.quantity / item.minQuantity) * 100;
                    
                    return (
                      <Card key={item.id} className="p-5 rounded-2xl border-2 border-destructive/20 bg-destructive/5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-destructive/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <Badge variant="outline" className={`${config.bg} ${config.color}`}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-destructive mb-2">
                              Solo quedan {item.quantity} {item.unit} (Mínimo: {item.minQuantity})
                            </p>
                            <div className="bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-destructive"
                                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleOpenTransaction(item, 'restock')}
                          className="w-full bg-secondary rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Reponer ahora
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 rounded-2xl text-center">
                  <Package className="w-12 h-12 text-secondary mx-auto mb-2" />
                  <p className="text-muted-foreground">Todos los artículos tienen stock suficiente</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div>
              <h3 className="text-xl mb-3">📋 Historial de Transacciones</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'use' ? 'bg-primary/10' : 'bg-secondary/10'
                        }`}>
                          {transaction.type === 'use' ? (
                            <Minus className="w-5 h-5 text-primary" />
                          ) : (
                            <Plus className="w-5 h-5 text-secondary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{transaction.itemName}</h4>
                            <Badge variant="outline" className={
                              transaction.type === 'use' 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-secondary/10 text-secondary border-secondary/20'
                            }>
                              {transaction.type === 'use' ? 'Uso' : 'Reposición'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            Cantidad: {transaction.quantity} 
                            {transaction.roomNumber && ` • Habitación ${transaction.roomNumber}`}
                          </p>
                          <p className="text-muted-foreground">
                            {transaction.user} • {new Date(transaction.date).toLocaleString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 rounded-2xl text-center">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay transacciones registradas</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {transactionType === 'use' ? 'Registrar Uso' : 'Reponer Inventario'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={transactionQuantity}
                onChange={(e) => setTransactionQuantity(e.target.value)}
                className="rounded-xl"
              />
              <p className="text-muted-foreground">
                Stock actual: {selectedItem?.quantity} {selectedItem?.unit}
              </p>
            </div>

            {transactionType === 'use' && (
              <div className="space-y-2">
                <Label htmlFor="room">Habitación (opcional)</Label>
                <Input
                  id="room"
                  placeholder="Ej: 201"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowTransactionDialog(false)}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitTransaction}
              className={`flex-1 rounded-xl ${transactionType === 'use' ? 'bg-primary' : 'bg-secondary'}`}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
