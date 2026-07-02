const test = require('node:test');
const assert = require('node:assert/strict');

function buildRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('generateContent falls back to the canned template when GEMINI_API_KEY is missing', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const aiReliability = require('../src/utils/aiReliability');
  const originalFetchWithTimeout = aiReliability.fetchWithTimeout;
  const originalLogAiCall = aiReliability.logAiCall;
  const calls = [];

  delete process.env.GEMINI_API_KEY;
  aiReliability.fetchWithTimeout = async () => {
    throw new Error('fetchWithTimeout should not be called without GEMINI_API_KEY');
  };
  aiReliability.logAiCall = async (payload) => {
    calls.push(payload);
  };

  try {
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
    const { generateContent } = require('../src/controllers/aiDocumentsController');
    const req = { body: { type: 'writer', prompt: 'Quarterly update' }, user: { orgId: 'org-1' } };
    const res = buildRes();

    await generateContent(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.usedAI, false);
    assert.match(res.body.generated, /# Quarterly update/);
    assert.deepEqual(calls[0], {
      orgId: 'org-1',
      feature: 'ai-documents:writer',
      provider: 'gemini',
      success: true,
      usedFallback: true,
      errorMessage: 'No GEMINI_API_KEY configured',
    });
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    aiReliability.fetchWithTimeout = originalFetchWithTimeout;
    aiReliability.logAiCall = originalLogAiCall;
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
  }
});

test('generateContent uses Gemini when GEMINI_API_KEY is configured', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const aiReliability = require('../src/utils/aiReliability');
  const originalFetchWithTimeout = aiReliability.fetchWithTimeout;
  const originalLogAiCall = aiReliability.logAiCall;
  const calls = [];
  let requestUrl;
  let requestOptions;

  process.env.GEMINI_API_KEY = 'test-key';
  aiReliability.fetchWithTimeout = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return {
      ok: true,
      async json() {
        return {
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Gemini drafted copy.' },
                ],
              },
            },
          ],
        };
      },
    };
  };
  aiReliability.logAiCall = async (payload) => {
    calls.push(payload);
  };

  try {
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
    const { generateContent } = require('../src/controllers/aiDocumentsController');
    const req = { body: { type: 'email', prompt: 'Follow up on the demo', context: 'Prospect is in retail.' }, user: { orgId: 'org-2' } };
    const res = buildRes();

    await generateContent(req, res);

    assert.equal(requestUrl, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    assert.equal(requestOptions.headers['x-goog-api-key'], 'test-key');
    const payload = JSON.parse(requestOptions.body);
    assert.equal(payload.contents[0].parts[0].text, 'Follow up on the demo\n\nContext: Prospect is in retail.');
    assert.equal(payload.systemInstruction.parts[0].text, 'You are an expert email copywriter. Write professional, conversion-focused emails based on the prompt.');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.usedAI, true);
    assert.equal(res.body.generated, 'Gemini drafted copy.');
    assert.equal(calls[0].provider, 'gemini');
    assert.equal(calls[0].success, true);
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    aiReliability.fetchWithTimeout = originalFetchWithTimeout;
    aiReliability.logAiCall = originalLogAiCall;
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
  }
});

test('generateContent falls back to the canned template when Gemini fails', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const aiReliability = require('../src/utils/aiReliability');
  const originalFetchWithTimeout = aiReliability.fetchWithTimeout;
  const originalLogAiCall = aiReliability.logAiCall;
  const calls = [];

  process.env.GEMINI_API_KEY = 'test-key';
  aiReliability.fetchWithTimeout = async () => {
    throw new Error('Gemini offline');
  };
  aiReliability.logAiCall = async (payload) => {
    calls.push(payload);
  };

  try {
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
    const { generateContent } = require('../src/controllers/aiDocumentsController');
    const req = { body: { type: 'proposal', prompt: 'Website redesign project' }, user: { orgId: 'org-3' } };
    const res = buildRes();

    await generateContent(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.usedAI, false);
    assert.match(res.body.generated, /Business Proposal: Website redesign project/);
    assert.equal(res.body.warning, 'AI unavailable, used template.');
    assert.equal(calls[0].provider, 'gemini');
    assert.equal(calls[0].success, false);
    assert.equal(calls[0].usedFallback, true);
    assert.equal(calls[0].errorMessage, 'Gemini offline');
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    aiReliability.fetchWithTimeout = originalFetchWithTimeout;
    aiReliability.logAiCall = originalLogAiCall;
    delete require.cache[require.resolve('../src/controllers/aiDocumentsController')];
  }
});
