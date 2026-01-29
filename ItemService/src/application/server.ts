import { app } from './app';

const PORT = 3004;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available on http://localhost:${PORT}/docs`);
});