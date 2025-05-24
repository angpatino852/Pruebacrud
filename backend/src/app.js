import express from 'express';

const app = express();

// Middleware, rutas, etc.
app.get('/', (req, res) => {
  res.send('Hola desde la API');
});

export default app;
