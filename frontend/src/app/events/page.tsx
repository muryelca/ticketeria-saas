'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
} from '@mui/material';
import { Search, LocationOn, CalendarToday } from '@mui/icons-material';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types';
import { eventService } from '@/services/events';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('PUBLISHED');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventService.getEvents();
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filtro por status
    if (statusFilter) {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por localização
    if (locationFilter) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, locationFilter, statusFilter]);

  const uniqueLocations = Array.from(new Set(events.map(event => event.location)));

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Todos os Eventos
        </Typography>

        {/* Filtros */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar eventos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Localização</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  label="Localização"
                  startAdornment={
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todas as localizações</MenuItem>
                  {uniqueLocations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarToday />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos os status</MenuItem>
                  <MenuItem value="PUBLISHED">Publicados</MenuItem>
                  <MenuItem value="DRAFT">Rascunhos</MenuItem>
                  <MenuItem value="CANCELED">Cancelados</MenuItem>
                  <MenuItem value="FINISHED">Finalizados</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Filtros ativos */}
        {(searchTerm || locationFilter || statusFilter) && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Filtros ativos:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {searchTerm && (
                <Chip
                  label={`Busca: ${searchTerm}`}
                  onDelete={() => setSearchTerm('')}
                  size="small"
                />
              )}
              {locationFilter && (
                <Chip
                  label={`Local: ${locationFilter}`}
                  onDelete={() => setLocationFilter('')}
                  size="small"
                />
              )}
              {statusFilter && (
                <Chip
                  label={`Status: ${statusFilter}`}
                  onDelete={() => setStatusFilter('')}
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Lista de eventos */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando eventos...</Typography>
          </Box>
        ) : filteredEvents.length > 0 ? (
          <Grid container spacing={4}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum evento encontrado com os filtros aplicados
            </Typography>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

