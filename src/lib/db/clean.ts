/**
 * Database cleanup utility - Modern interactive CLI
 *
 * A beautiful, interactive tool for cleaning or dropping database tables
 * with safety confirmations and detailed feedback.
 *
 * Usage:
 *   bun run ./src/lib/db/clean.ts                    # Interactive mode
 *   bun run ./src/lib/db/clean.ts --confirm          # Skip prompts
 *   bun run ./src/lib/db/clean.ts --tables=t1,t2     # Specific tables
 *   bun run ./src/lib/db/clean.ts --dry-run          # Preview only
 *   bun run ./src/lib/db/clean.ts --drop --confirm   # Drop tables
 */

import { parseArgs } from 'node:util';

import { sql } from 'drizzle-orm';

import { db } from '@/lib/db/client';

// ============================================================================
// Types
// ============================================================================

interface TableInfo {
  name: string;
}

interface TableStats {
  name: string;
  rowCount: number;
}

interface CleanupStats {
  tablesProcessed: number;
  totalRowsDeleted: number;
  duration: number;
}

type Operation = 'delete' | 'drop';

// ============================================================================
// CLI Arguments
// ============================================================================

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    confirm: { type: 'boolean', default: false },
    tables: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    drop: { type: 'boolean', default: false },
    interactive: { type: 'boolean', default: true },
  },
  strict: true,
  allowPositionals: true,
});

// ============================================================================
// Colors & Formatting
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

const c = {
  error: (text: string) => `${colors.red}${text}${colors.reset}`,
  success: (text: string) => `${colors.green}${text}${colors.reset}`,
  warning: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bright}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`,
  gray: (text: string) => `${colors.gray}${text}${colors.reset}`,
};

const icons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  question: '?',
  arrow: '→',
  bullet: '•',
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
};

// ============================================================================
// Utility Functions
// ============================================================================

function hr(char = '─', width = 60): void {
  console.log(c.gray(char.repeat(width)));
}

function section(title: string): void {
  console.log(`\n${c.bold(title)}`);
  hr();
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function spinner<T>(promise: Promise<T>, message: string): Promise<T> {
  const frames = icons.spinner;
  let i = 0;

  const interval = setInterval(() => {
    process.stdout.write(`\r${c.info(frames[i])} ${message}...`);
    i = (i + 1) % frames.length;
  }, 80);

  try {
    const result = await promise;
    clearInterval(interval);
    process.stdout.write(`\r${' '.repeat(80)}\r`);
    return result;
  } catch (error) {
    clearInterval(interval);
    process.stdout.write(`\r${' '.repeat(80)}\r`);
    throw error;
  }
}

// ============================================================================
// Database Functions
// ============================================================================

async function getAllTables(): Promise<string[]> {
  const tables = await db.all<TableInfo>(sql`
    SELECT name FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
      AND name NOT LIKE '__drizzle%'
    ORDER BY name
  `);
  return tables.map((t) => t.name);
}

async function getTableStats(tables: string[]): Promise<TableStats[]> {
  const stats: TableStats[] = [];

  for (const tableName of tables) {
    try {
      const result = await db.all<{ count: number }>(
        sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`)
      );
      stats.push({
        name: tableName,
        rowCount: result[0]?.count ?? 0,
      });
    } catch (_error) {
      stats.push({ name: tableName, rowCount: 0 });
    }
  }

  return stats;
}

async function hasSequenceTable(): Promise<boolean> {
  const result = await db.all<TableInfo>(sql`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = 'sqlite_sequence'
  `);
  return result.length > 0;
}

// ============================================================================
// CLI Interaction Functions
// ============================================================================

function filterTables(allTables: string[], requestedTables?: string): string[] {
  if (!requestedTables) {
    return allTables;
  }

  const requested = requestedTables
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const filtered = requested.filter((t) => allTables.includes(t));

  const notFound = requested.filter((t) => !allTables.includes(t));
  if (notFound.length > 0) {
    console.log(
      c.warning(`${icons.warning} Tables not found: ${notFound.join(', ')}`)
    );
  }

  return filtered;
}

function promptYesNo(question: string, defaultYes = false): boolean {
  const suffix = defaultYes ? '[Y/n]' : '[y/N]';
  const response = prompt(
    `${c.info(icons.question)} ${question} ${c.dim(suffix)}: `
  );

  if (!response) return defaultYes;
  return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
}

function promptChoice(question: string, choices: string[]): number {
  console.log(`\n${c.info(icons.question)} ${question}\n`);

  choices.forEach((choice, index) => {
    console.log(`  ${c.dim((index + 1).toString())}${c.gray(')')} ${choice}`);
  });

  const response = prompt(
    `\n${c.dim(`Enter your choice (1-${choices.length})`)}: `
  );
  const choice = parseInt(response || '0', 10);

  if (choice >= 1 && choice <= choices.length) {
    return choice - 1;
  }

  return -1;
}

// ============================================================================
// Operation Functions
// ============================================================================

async function deleteTables(tables: string[]): Promise<number> {
  let totalRows = 0;

  for (const tableName of tables) {
    const before = await db.all<{ count: number }>(
      sql.raw(`SELECT COUNT(*) as count FROM "${tableName}"`)
    );
    const rowCount = before[0]?.count ?? 0;

    await db.run(sql.raw(`DELETE FROM "${tableName}"`));
    totalRows += rowCount;

    console.log(
      `${c.success(icons.success)} ${c.bold(tableName)} ${c.gray(`(${formatNumber(rowCount)} rows deleted)`)}`
    );
  }

  return totalRows;
}

async function dropTables(tables: string[]): Promise<void> {
  for (const tableName of tables) {
    await db.run(sql.raw(`DROP TABLE IF EXISTS "${tableName}"`));
    console.log(
      `${c.success(icons.success)} ${c.bold(tableName)} ${c.gray('(dropped)')}`
    );
  }
}

async function resetSequences(): Promise<void> {
  if (await hasSequenceTable()) {
    await db.run(sql`DELETE FROM sqlite_sequence`);
    console.log(
      `${c.success(icons.success)} ${c.dim('Reset autoincrement sequences')}`
    );
  }
}

// ============================================================================
// Display Functions
// ============================================================================

function displayBanner(): void {
  console.log('');
  console.log(c.bold('🗑️  Database Cleanup Utility'));
  console.log(c.gray('   Clean or drop database tables with safety'));
  console.log('');
}

function displayTableStats(stats: TableStats[], operation: Operation): void {
  const totalRows = stats.reduce((sum, s) => sum + s.rowCount, 0);

  section(`📋 Tables to ${operation === 'drop' ? 'drop' : 'clean'}`);

  stats.forEach((stat) => {
    const rowInfo =
      operation === 'delete'
        ? c.gray(`(${formatNumber(stat.rowCount)} rows)`)
        : c.gray('(schema + data)');
    console.log(`  ${icons.bullet} ${c.bold(stat.name)} ${rowInfo}`);
  });

  console.log('');
  console.log(
    c.dim(`Total: ${stats.length} table${stats.length !== 1 ? 's' : ''}`)
  );
  if (operation === 'delete' && totalRows > 0) {
    console.log(c.dim(`Rows to delete: ${formatNumber(totalRows)}`));
  }
}

function displayWarning(operation: Operation): void {
  console.log('');
  if (operation === 'drop') {
    console.log(
      c.error(
        `${icons.warning} WARNING: This will DROP tables entirely (schema and data)!`
      )
    );
    console.log(c.error(`${icons.warning} This action is IRREVERSIBLE!`));
  } else {
    console.log(
      c.warning(
        `${icons.warning} This will DELETE ALL DATA from the selected tables!`
      )
    );
    console.log(c.warning(`${icons.warning} This action cannot be undone!`));
  }
  console.log('');
}

function displayResults(stats: CleanupStats, operation: Operation): void {
  section('✅ Cleanup Complete');

  console.log(
    `  ${icons.bullet} Tables ${operation === 'drop' ? 'dropped' : 'cleaned'}: ${c.bold(stats.tablesProcessed.toString())}`
  );

  if (operation === 'delete') {
    console.log(
      `  ${icons.bullet} Rows deleted: ${c.bold(formatNumber(stats.totalRowsDeleted))}`
    );
  }

  console.log(
    `  ${icons.bullet} Duration: ${c.bold(formatDuration(stats.duration))}`
  );
  console.log('');
}

// ============================================================================
// Main Cleanup Function
// ============================================================================

async function cleanup(): Promise<void> {
  const startTime = Date.now();

  // Display banner for interactive mode
  if (values.interactive && !values.confirm) {
    displayBanner();
  }

  // Get all tables
  const allTables = await spinner(getAllTables(), 'Loading database tables');

  if (allTables.length === 0) {
    console.log(c.info(`${icons.info} No tables found in database.`));
    process.exit(0);
  }

  // Determine operation type
  const operation: Operation = values.drop ? 'drop' : 'delete';

  // Interactive table selection
  let tablesToProcess: string[];

  if (values.tables) {
    tablesToProcess = filterTables(allTables, values.tables);
  } else if (values.interactive && !values.confirm) {
    const choice = promptChoice('What would you like to do?', [
      `${operation === 'drop' ? 'Drop' : 'Clean'} all tables (${allTables.length} tables)`,
      'Select specific tables',
      'Cancel',
    ]);

    if (choice === -1 || choice === 2) {
      console.log(c.dim('\nCancelled.'));
      process.exit(0);
    }

    if (choice === 1) {
      console.log(
        c.dim('\nFeature not yet implemented. Use --tables=t1,t2 for now.')
      );
      process.exit(0);
    }

    tablesToProcess = allTables;
  } else {
    tablesToProcess = allTables;
  }

  if (tablesToProcess.length === 0) {
    console.log(c.info(`${icons.info} No tables to process.`));
    process.exit(0);
  }

  // Get table statistics
  const stats = await spinner(
    getTableStats(tablesToProcess),
    'Analyzing tables'
  );

  // Display what will be done
  displayTableStats(stats, operation);

  // Handle dry run
  if (values['dry-run']) {
    console.log(c.info(`${icons.info} DRY RUN - No changes will be made`));
    process.exit(0);
  }

  // Confirm operation
  if (!values.confirm) {
    displayWarning(operation);

    const confirmed = promptYesNo(
      `Are you absolutely sure you want to ${operation === 'drop' ? 'drop' : 'delete data from'} these tables?`,
      false
    );

    if (!confirmed) {
      console.log(c.dim('\nCancelled.'));
      process.exit(0);
    }
  }

  // Perform cleanup
  section(`🗑️  ${operation === 'drop' ? 'Dropping tables' : 'Deleting data'}`);

  let totalRowsDeleted = 0;
  let foreignKeysDisabled = false;

  try {
    // Disable foreign keys
    await db.run(sql`PRAGMA foreign_keys = OFF`);
    foreignKeysDisabled = true;

    if (operation === 'drop') {
      await dropTables(tablesToProcess);
    } else {
      totalRowsDeleted = await deleteTables(tablesToProcess);
      await resetSequences();
    }

    // Re-enable foreign keys
    await db.run(sql`PRAGMA foreign_keys = ON`);
    foreignKeysDisabled = false;

    // Display results
    const duration = Date.now() - startTime;
    displayResults(
      {
        tablesProcessed: tablesToProcess.length,
        totalRowsDeleted,
        duration,
      },
      operation
    );
  } catch (error) {
    console.log('');
    console.log(c.error(`${icons.error} Error during cleanup:`));
    console.log(
      c.error(`  ${error instanceof Error ? error.message : String(error)}`)
    );

    // Ensure foreign keys are re-enabled
    if (foreignKeysDisabled) {
      try {
        await db.run(sql`PRAGMA foreign_keys = ON`);
        console.log(c.success(`${icons.success} Database state restored`));
      } catch (fkError) {
        console.log(c.error(`${icons.error} Failed to re-enable foreign keys`));
        console.log(
          c.error(
            `  ${fkError instanceof Error ? fkError.message : String(fkError)}`
          )
        );
      }
    }

    throw error; // Re-throw to be caught by entry point handler
  }
}

// ============================================================================
// Graceful Exit Handling
// ============================================================================

let isCleaningUp = false;
let cleanupPromise: Promise<void> | null = null;

async function gracefulExit(signal: string): Promise<void> {
  if (isCleaningUp) {
    console.log(c.warning(`\n${icons.warning} Force closing...`));
    process.exit(1);
  }

  isCleaningUp = true;
  console.log(
    c.warning(`\n\n${icons.warning} Received ${signal}, cleaning up...`)
  );

  try {
    // If cleanup is in progress, wait for it
    if (cleanupPromise) {
      await Promise.race([
        cleanupPromise,
        new Promise((resolve) => setTimeout(resolve, 5000)), // 5s timeout
      ]);
    }

    // Ensure foreign keys are re-enabled
    try {
      await db.run(sql`PRAGMA foreign_keys = ON`);
      console.log(c.success(`${icons.success} Database state restored`));
    } catch (_error) {
      console.log(
        c.error(`${icons.error} Warning: Could not restore database state`)
      );
    }

    console.log(c.dim('Goodbye!\n'));
    process.exit(0);
  } catch (_error) {
    console.log(c.error(`${icons.error} Error during cleanup`));
    process.exit(1);
  }
}

// Register signal handlers
process.on('SIGINT', () => gracefulExit('SIGINT'));
process.on('SIGTERM', () => gracefulExit('SIGTERM'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.log('');
  console.log(c.error(`${icons.error} Unhandled rejection:`));
  console.log(
    c.error(`  ${reason instanceof Error ? reason.message : String(reason)}`)
  );
  gracefulExit('unhandledRejection').then(() => process.exit(1));
});

// ============================================================================
// Entry Point
// ============================================================================

cleanupPromise = cleanup()
  .then(() => {
    cleanupPromise = null;
  })
  .catch((error) => {
    console.log('');
    console.log(c.error(`${icons.error} Unexpected error:`));
    console.log(
      c.error(`  ${error instanceof Error ? error.message : String(error)}`)
    );
    gracefulExit('error').then(() => process.exit(1));
  });
