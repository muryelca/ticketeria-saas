'use client';

import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Ticketeria
            </Typography>
            <Typography variant="body2">
              A melhor plataforma para venda de ingressos de eventos.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Para Organizadores
            </Typography>
            <Link href="/organizer" color="inherit" display="block">
              Criar Evento
            </Link>
            <Link href="/organizer" color="inherit" display="block">
              Gerenciar Vendas
            </Link>
            <Link href="/organizer" color="inherit" display="block">
              Relatórios
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Para Promoters
            </Typography>
            <Link href="/promoter" color="inherit" display="block">
              Meus Cupons
            </Link>
            <Link href="/promoter" color="inherit" display="block">
              Estatísticas
            </Link>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Suporte
            </Typography>
            <Link href="/help" color="inherit" display="block">
              Central de Ajuda
            </Link>
            <Link href="/contact" color="inherit" display="block">
              Contato
            </Link>
            <Link href="/terms" color="inherit" display="block">
              Termos de Uso
            </Link>
          </Grid>
        </Grid>
        <Box mt={4} pt={4} borderTop={1} borderColor="rgba(255,255,255,0.2)">
          <Typography variant="body2" align="center">
            © 2024 Ticketeria. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

