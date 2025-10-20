import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import pb from '../lib/pocketbase';
import { AddStorageLocationPage } from './AddStorageLocationPage';

type StorageLocation = {
  id: string;
  Name?: string;
  Position?: string;
  Location?: string;
};

const StorageLocationsPage: React.FC = () => {
  const [items, setItems] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<StorageLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await pb.collection('storage_locations').getFullList({
        sort: '-created',
      });
      setItems(list as unknown as StorageLocation[]);
    } catch (err: any) {
      setError(err?.message || 'Failed to load storage locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();

    // Subscribe to realtime changes in the storage_locations collection
    // PocketBase realtime events have the format: { action: 'create'|'update'|'delete', record }
    // pb.collection(...).subscribe may return a Promise that resolves to an unsubscribe function
    let unsubscribeFn: (() => void) | undefined;

    (async () => {
      try {
        const unsub = await pb.collection('storage_locations').subscribe('*', (e: any) => {
          try {
            const { action, record } = e;
            setItems((prev) => {
              if (action === 'create') {
                // prepend new items to match sort '-created'
                return [record as StorageLocation, ...prev];
              }
              if (action === 'update') {
                return prev.map((it) => (it.id === record.id ? (record as StorageLocation) : it));
              }
              if (action === 'delete') {
                return prev.filter((it) => it.id !== record.id);
              }
              return prev;
            });
          } catch (err: any) {
            // ignore subscription parsing errors but surface a message
            setError(err?.message || 'Realtime update failed');
          }
        });

        // In some SDK versions subscribe returns the unsubscribe function directly,
        // in others it returns a Promise that resolves to the function. Normalize both.
        unsubscribeFn = typeof unsub === 'function' ? unsub : (await unsub) as unknown as () => void;
      } catch (err: any) {
        // Subscription setup failed; show an error but keep the list functionality
        setError(err?.message || 'Failed to subscribe to realtime updates');
      }
    })();

    return () => {
      try {
        if (unsubscribeFn) unsubscribeFn();
      } catch (e) {
        // no-op
      }
    };
  }, []);

  const openEdit = (item: StorageLocation) => {
    setSelected({ ...item });
  };

  const closeEdit = () => setSelected(null);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await pb.collection('storage_locations').update(selected.id, {
        Name: selected.Name || '',
        Position: selected.Position || '',
        Location: selected.Location || '',
      });
      await fetchList();
      closeEdit();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('storage_locations').delete(id);
      await fetchList();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5">Storage Locations</Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchList} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No storage locations found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.Name}</TableCell>
                  <TableCell>{it.Position}</TableCell>
                  <TableCell>{it.Location}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openEdit(it)} size="small" title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(it.id)}
                      size="small"
                      title="Delete"
                      disabled={deleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={!!selected} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Storage Location</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            value={selected?.Name ?? ''}
            onChange={(e) => setSelected((s) => (s ? { ...s, Name: e.target.value } : s))}
          />
          <TextField
            margin="normal"
            label="Position"
            fullWidth
            value={selected?.Position ?? ''}
            onChange={(e) => setSelected((s) => (s ? { ...s, Position: e.target.value } : s))}
          />
          <TextField
            margin="normal"
            label="Location"
            fullWidth
            value={selected?.Location ?? ''}
            onChange={(e) => setSelected((s) => (s ? { ...s, Location: e.target.value } : s))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <AddStorageLocationPage />
    </Container>
  );
};

export default StorageLocationsPage;