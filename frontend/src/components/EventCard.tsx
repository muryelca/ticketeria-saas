'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Event } from '@/types';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const router = useRouter();

  const handleViewEvent = () => {
    router.push(`/events/${event.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'CANCELED':
        return 'error';
      case 'FINISHED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Publicado';
      case 'DRAFT':
        return 'Rascunho';
      case 'CANCELED':
        return 'Cancelado';
      case 'FINISHED':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {event.bannerUrl && (
        <CardMedia
          component="img"
          height="200"
          image={event.bannerUrl}
          alt={event.title}
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {event.title}
          </Typography>
          <Chip
            label={getStatusLabel(event.status)}
            color={getStatusColor(event.status) as any}
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {event.description}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            📍 {event.location}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            📅 {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </Typography>
          {event.endDate && (
            <Typography variant="body2" color="text.secondary">
              🏁 {format(new Date(event.endDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </Typography>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleViewEvent}
          disabled={event.status === 'CANCELED' || event.status === 'FINISHED'}
        >
          {event.status === 'PUBLISHED' ? 'Ver Ingressos' : 'Ver Detalhes'}
        </Button>
      </CardContent>
    </Card>
  );
};

