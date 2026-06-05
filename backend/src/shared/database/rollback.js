import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.resolve(__dirname, '../../../migration_backup');
const srcDir = path.resolve(__dirname, '../../');

function restoreFile(fileName) {
  const backupPath = path.join(backupDir, fileName);
  const destPath = path.join(srcDir, fileName);

  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, destPath);
    console.log(`[Rollback] Successfully restored: ${fileName}`);
  } else {
    console.warn(`[Rollback Warning] Backup file not found: ${fileName}`);
  }
}

try {
  console.log('[Rollback Started] Reverting database files to backup...');
  restoreFile('database.sqlite');
  restoreFile('mongo_mock.json');
  console.log('[Rollback Completed] Reversion complete.');
} catch (err) {
  console.error('[Rollback Error] Failed to restore backups:', err.message);
  process.exit(1);
}
