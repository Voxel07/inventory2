import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import pb from '../lib/pocketbase';
import type { Item, StockChange } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [stockChanges, setStockChanges] = useState<StockChange[]>([]);
  const [error, setError] = useState('');
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [stockChange, setStockChange] = useState('');
  const [reason, setReason] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const records = await pb.collection('items').getFullList<Item>({
        sort: '-created',
        expand: 'storage_location',
      });
      setItems(records);
    } catch (err: any) {
      setError(err.message || 'Failed to load items');
    }
  };

  const loadStockHistory = async (itemId: string) => {
    try {
      const records = await pb.collection('stock_changes').getFullList<StockChange>({
        filter: `item = "${itemId}"`,
        sort: '-created',
        expand: 'user',
      });
      setStockChanges(records);
    } catch (err: any) {
      setError(err.message || 'Failed to load stock history');
    }
  };

  const handleOpenStockDialog = (item: Item) => {
    setSelectedItem(item);
    setStockChange('');
    setReason('');
    setStockDialogOpen(true);
  };

  const handleOpenHistoryDialog = async (item: Item) => {
    setSelectedItem(item);
    await loadStockHistory(item.id!);
    setHistoryDialogOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || !stockChange || !reason) return;

    try {
      await pb.collection('stock_changes').create({
        item: selectedItem.id,
        stock_change: parseInt(stockChange),
        reason,
        user: user?.id,
      });

      setStockDialogOpen(false);
      loadItems();
    } catch (err: any) {
      setError(err.message || 'Failed to update stock');
    }
  };

  const getCurrentStock = async (itemId: string): Promise<number> => {
    try {
      const records = await pb.collection('stock_changes').getFullList<StockChange>({
        filter: `item = "${itemId}"`,
      });
      return records.reduce((total, change) => total + change.stock_change, 0);
    } catch {
      return 0;
    }
  };

  const [itemStocks, setItemStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadStocks = async () => {
      const stocks: Record<string, number> = {};
      for (const item of items) {
        if (item.id) {
          stocks[item.id] = await getCurrentStock(item.id);
        }
      }
      setItemStocks(stocks);
    };
    if (items.length > 0) {
      loadStocks();
    }
  }, [items]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Inventory
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Weight (kg)</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Storage Location</TableCell>
                <TableCell>Current Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.weight}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {item.expand?.storage_location?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={itemStocks[item.id!] || 0}
                      color={
                        (itemStocks[item.id!] || 0) > 0
                          ? 'success'
                          : (itemStocks[item.id!] || 0) === 0
                            ? 'default'
                            : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenStockDialog(item)}
                      size="small"
                      title="Update Stock"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => handleOpenHistoryDialog(item)}
                      size="small"
                      title="View History"
                    >
                      <HistoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Update Stock Dialog */}
      <Dialog open={stockDialogOpen} onClose={() => setStockDialogOpen(false)}>
        <DialogTitle>Update Stock: {selectedItem?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Stock Change"
              type="number"
              value={stockChange}
              onChange={(e) => setStockChange(e.target.value)}
              helperText="Use positive numbers to add stock, negative to remove"
              inputProps={{ step: '1' }}
            />
            <TextField
              fullWidth
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Restocking, Sale, Damage"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStock} variant="contained">
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Stock History: {selectedItem?.name}</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockChanges.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell>
                      {new Date(change.created).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={change.stock_change > 0 ? `+${change.stock_change}` : change.stock_change}
                        color={change.stock_change > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{change.reason}</TableCell>
                    <TableCell>{change.expand?.user?.name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
