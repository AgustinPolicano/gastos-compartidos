import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL!;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en .env');
  }

  console.log('🔄 Ejecutando migraciones...');

  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  await migrate(db, { migrationsFolder: './drizzle' });

  await migrationClient.end();

  console.log('✅ Migraciones completadas');
  process.exit(0);
};

runMigrations().catch((err) => {
  console.error('❌ Error en migraciones:', err);
  process.exit(1);
});
