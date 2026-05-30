import fs from 'fs';
import path from 'path';

const CSV_PATH = '/mnt/work_data/backup/pythonproj/mausam/final_authors.csv';
const DOMAIN = '@libmng.com';
const PASSWORD = '$2b$10$EGnoeir7jyQIy4/n4kkSJe7HM7ubKRdWBiiW11w7YyR986a8GWpnK';

function parseCSV(text) {
  const lines = [];
  let current = [];
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

  return lines;
}

function stringifyCSV(rows) {
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

function sanitizeEmail(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
}

// Read and parse CSV
const raw = fs.readFileSync(CSV_PATH, 'utf-8');
const parsed = parseCSV(raw);
const header = parsed[0];
const rows = parsed.slice(1);

const nameIdx = header.indexOf('name');
const userIdIdx = header.indexOf('userId');

let maxId = 0;
for (const row of rows) {
  const uid = parseInt(row[userIdIdx], 10);
  if (!isNaN(uid) && uid > maxId) maxId = uid;
}

let nextId = maxId + 1;
const emailCount = new Map();
const users = [];

for (const row of rows) {
  const name = row[nameIdx];
  let email = sanitizeEmail(name);

  if (emailCount.has(email)) {
    const count = emailCount.get(email) + 1;
    emailCount.set(email, count);
    email = `${email}${count}`;
  } else {
    emailCount.set(email, 0);
  }

  const uid = nextId++;
  users.push({
    id: uid,
    email: email + DOMAIN,
    password: PASSWORD,
    isProfileCompleted: 'true',
    role: 'AUTHOR',
  });

  row[userIdIdx] = String(uid);
}

// Output updated authors CSV
const authorsCSV = stringifyCSV([header, ...rows]);

// Build users CSV
const userHeader = ['id', 'email', 'password', 'isProfileCompleted', 'role'];
const userRows = users.map(u => [u.id, u.email, u.password, u.isProfileCompleted, u.role]);
const usersCSV = stringifyCSV([userHeader, ...userRows]);

console.log('=== UPDATED AUTHORS CSV ===');
console.log(authorsCSV);
console.log('=== USERS CSV ===');
console.log(usersCSV);
