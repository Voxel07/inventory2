import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import pb from '../lib/pocketbase';
import type { StorageLocation } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const AddItemPage: React.FC = () => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [stockChange, setStockChange] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadStorageLocations();
  }, []);

  const loadStorageLocations = async () => {
    try {
      const locations = await pb.collection('storage_locations').getFullList<StorageLocation>({
        sort: 'Name',
      });
      setStorageLocations(locations);
    } catch (err) {
      console.error('Failed to load storage locations:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Create the item
      const item = await pb.collection('items').create({
        name,
        weight: parseFloat(weight),
        price: parseFloat(price),
        storage_location: storageLocation,
      });

      // Create initial stock change if provided
      if (stockChange && reason) {
        await pb.collection('stock_changes').create({
          item: item.id,
          stock_change: parseInt(stockChange),
          reason,
          user: user?.id,
        });
      }

      setSuccess(true);
      // Reset form
      setName('');
      setWeight('');
      setPrice('');
      setStorageLocation('');
      setStockChange('');
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add New Item
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Item added successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
           <Grid  size={{xs:12}}>
              <TextField
                required
                fullWidth
                id="name"
                label="Item Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                required
                fullWidth
                id="weight"
                label="Weight"
                name="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
                inputProps={{
                  step: '0.01',
                  min: '0',
                }}
              />
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                required
                fullWidth
                id="price"
                label="Price"
                name="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  step: '0.01',
                  min: '0',
                }}
              />
            </Grid>

            <Grid size={{xs:12}}>
              <FormControl fullWidth required>
                <InputLabel id="storage-location-label">Storage Location</InputLabel>
                <Select
                  labelId="storage-location-label"
                  id="storage-location"
                  value={storageLocation}
                  label="Storage Location"
                  onChange={(e) => setStorageLocation(e.target.value)}
                  disabled={loading}
                >
                  {storageLocations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid  size={{xs:12}}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Initial Stock (Optional)
              </Typography>
            </Grid>

            <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                id="stock-change"
                label="Initial Stock Quantity"
                name="stockChange"
                type="number"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                disabled={loading}
                inputProps={{
                  step: '1',
                }}
              />
            </Grid>

           <Grid size={{xs:12, sm:6}}>
              <TextField
                fullWidth
                id="reason"
                label="Reason"
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                placeholder="e.g., Initial stock"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                disabled={loading}
              >
                Add Item
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};
