import { pool } from './database';
import fs from 'fs';
import path from 'path';

async function migrate(): Promise<void> {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../../migrations/001_create_users_table.sql'),
      'utf8'
    );
    await pool.query(sql);
    console.log('✅ Migration completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();