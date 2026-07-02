const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/db');
const { hashPassword } = require('../src/utils/password');

function buildRes() {
  return {
    statusCode: 200,
    body: null,
    cookies: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    cookie(name, value, options) {
      this.cookies.push({ name, value, options });
      return this;
    },
  };
}

test('login trims and lowercases the email before authenticating', async () => {
  const originalQuery = db.query;
  const passwordHash = await hashPassword('Test1234!');
  let selectEmail;

  db.query = async (text, params) => {
    if (text === 'SELECT * FROM users WHERE email = $1') {
      [selectEmail] = params;
      return {
        rows: [{
          id: 'user-1',
          full_name: 'Test User',
          email: 'tester@example.com',
          role: 'owner',
          password_hash: passwordHash,
          totp_enabled: false,
        }],
      };
    }

    if (text.includes('INSERT INTO sessions')) {
      return { rows: [] };
    }

    if (text.includes('INSERT INTO audit_log')) {
      return { rows: [] };
    }

    throw new Error(`Unexpected query: ${text}`);
  };

  try {
    delete require.cache[require.resolve('../src/controllers/authController')];
    const { login } = require('../src/controllers/authController');
    const req = {
      body: { email: '  Tester@Example.com  ', password: 'Test1234!' },
      headers: { 'user-agent': 'node-test' },
      ip: '127.0.0.1',
    };
    const res = buildRes();

    await login(req, res);

    assert.equal(selectEmail, 'tester@example.com');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.user.email, 'tester@example.com');
    assert.equal(res.cookies.length, 1);
    assert.equal(res.cookies[0].name, 'dph_session');
  } finally {
    db.query = originalQuery;
  }
});

test('login rejects an email that becomes empty after trimming', async () => {
  const originalQuery = db.query;

  db.query = async () => {
    throw new Error('db.query should not be called when the email is blank');
  };

  try {
    delete require.cache[require.resolve('../src/controllers/authController')];
    const { login } = require('../src/controllers/authController');
    const req = { body: { email: '   ', password: 'Test1234!' } };
    const res = buildRes();

    await login(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, 'Email and password are required.');
  } finally {
    db.query = originalQuery;
  }
});
