import app from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";

async function main() {
  try {
    await connectDB();
    
    // Solo levanta el servidor si NO está en modo test
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT);
      console.log(`Listening on port http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    }

  } catch (error) {
    console.error(error);
  }
}

main();

export default app; // ✅ Exporta el app para que Mocha pueda usarlo
