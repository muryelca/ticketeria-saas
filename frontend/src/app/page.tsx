'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { Event } from '@/types';
import { eventService } from '@/services/events';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventService.getEvents({ status: 'PUBLISHED' });
        setEvents(eventsData.slice(0, 6)); // Mostrar apenas os 6 primeiros eventos
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Encontre os Melhores Eventos
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4, opacity: 0.9 }}>
            Descubra experiências incríveis e garante seu ingresso com facilidade
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            onClick={() => router.push('/events')}
            sx={{ mr: 2 }}
          >
            Ver Todos os Eventos
          </Button>
          <Button
            variant="outlined"
            size="large"
            color="inherit"
            onClick={() => router.push('/organizer')}
          >
            Criar Evento
          </Button>
        </Container>
      </Box>

      {/* Featured Events Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Eventos em Destaque
        </Typography>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Carregando eventos...</Typography>
          </Box>
        ) : events.length > 0 ? (
          <Grid container spacing={4}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum evento disponível no momento
            </Typography>
          </Box>
        )}

        {events.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/events')}
            >
              Ver Todos os Eventos
            </Button>
          </Box>
        )}
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
            Por que escolher a Ticketeria?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                    🎫
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Fácil de Usar
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Interface intuitiva para comprar ingressos em poucos cliques
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                    🔒
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Seguro
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Pagamentos seguros com as melhores tecnologias de proteção
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h4" component="div" sx={{ mb: 2 }}>
                    📱
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom>
                    Mobile First
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Acesse de qualquer dispositivo, a qualquer hora e lugar
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Pronto para começar?
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Crie sua conta e comece a vender ingressos hoje mesmo
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => router.push('/register')}
        >
          Criar Conta Grátis
        </Button>
      </Container>
    </Layout>
  );
}

