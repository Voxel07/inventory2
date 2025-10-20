import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import pb from '../lib/pocketbase';

export const AddStorageLocationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [postion, setPostion] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await pb.collection('storage_locations').create({
        Name: name,
        Position: postion,
        Location: location
      });

      setSuccess(true);
      // Reset form
      setName('');
      setPostion('');
      setLocation('');
    } catch (err: any) {
      setError(err.message || 'Failed to add storage location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Storage Location
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Storage location added successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{xs:12}}>
              <TextField
                required
                fullWidth
                id="name"
                label="Location Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="e.g., Regal A3"
              />
            </Grid>

             <Grid size={{xs:12}}>
              <TextField
                required
                fullWidth
                id="postion"
                label="Postion Name"
                name="postion"
                value={postion}
                onChange={(e) => setPostion(e.target.value)}
                disabled={loading}
                placeholder="e.g., Regal A3, Fach 2"
              />
            </Grid>

            <Grid size={{xs:12}}>
              <TextField
                fullWidth
                id="location"
                label="Location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
                placeholder="Optional location of the storage location"
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
                Add Storage Location
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};
