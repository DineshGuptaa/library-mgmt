import 'reflect-metadata';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const CSV_PATH = '/mnt/work_data/backup/pythonproj/mausam/final_authors.csv';
const DOMAIN = '@libmng.com';

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let current: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = '';
      } else if (ch === '\r') {
        continue;
      } else if (ch === '\n') {
        current.push(field);
        field = '';
        lines.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }
  if (field || current.length) {
    current.push(field);
    lines.push(current);
  }
  if (current.length && current[0] !== '') {
    lines.push(current);
  }
  return lines;
}

function stringifyCSV(rows: string[][]): string {
  return rows.map(row =>
    row.map(field => {
      if (field == null) return '';
      const s = String(field);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',')
  ).join('\n');
}

function sanitizeEmail(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const userRepo = app.select(AppModule).get(getRepositoryToken(User));

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const parsed = parseCSV(raw);
  const header = parsed[0];
  const rows = parsed.slice(1);

  const nameIdx = header.indexOf('name');
  const userIdIdx = header.indexOf('userId');

  let matched = 0;
  let notFound = 0;

  for (const row of rows) {
    const authorName = row[nameIdx];
    const email = sanitizeEmail(authorName) + DOMAIN;

    const user = await userRepo.findOne({ where: { email } });

    if (user) {
      row[userIdIdx] = String(user.id);
      matched++;
    } else {
      notFound++;
    }
  }

  const authorsCSV = stringifyCSV([header, ...rows]);

  console.log('=== UPDATED AUTHORS CSV ===');
  console.log(authorsCSV);
  console.log('--- Summary ---');
  console.log(`Total rows: ${rows.length}`);
  console.log(`Matched to existing user: ${matched}`);
  console.log(`No matching user found: ${notFound}`);

  await app.close();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
