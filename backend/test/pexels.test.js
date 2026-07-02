const test = require('node:test');
const assert = require('node:assert/strict');

function loadPexelsModule() {
  delete require.cache[require.resolve('../src/utils/pexels')];
  return require('../src/utils/pexels');
}

test('searchImages rotates to the next key after a 429 response', async () => {
  const originalFetch = global.fetch;
  const originalKeys = {};
  for (let i = 1; i <= 7; i++) {
    originalKeys[i] = process.env[`PEXELS_API_KEY_${i}`];
  }

  process.env.PEXELS_API_KEY_1 = 'key-1';
  process.env.PEXELS_API_KEY_2 = 'key-2';
  for (let i = 3; i <= 7; i++) delete process.env[`PEXELS_API_KEY_${i}`];

  const authHeaders = [];
  global.fetch = async (_url, options) => {
    authHeaders.push(options.headers.Authorization);
    if (authHeaders.length === 1) {
      return { ok: false, status: 429 };
    }
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          photos: [{
            id: 10,
            width: 1200,
            height: 800,
            alt: 'Team photo',
            photographer: 'Pexels User',
            photographer_url: 'https://pexels.test/user',
            src: { large2x: 'https://img.test/large2x.jpg', medium: 'https://img.test/medium.jpg' },
          }],
        };
      },
    };
  };

  try {
    const { searchImages } = loadPexelsModule();
    const images = await searchImages('office team', { perPage: 1 });
    assert.equal(authHeaders.length, 2);
    assert.deepEqual(authHeaders, ['key-1', 'key-2']);
    assert.equal(images.length, 1);
    assert.equal(images[0].url, 'https://img.test/large2x.jpg');
  } finally {
    global.fetch = originalFetch;
    for (let i = 1; i <= 7; i++) {
      const key = originalKeys[i];
      if (key === undefined) delete process.env[`PEXELS_API_KEY_${i}`];
      else process.env[`PEXELS_API_KEY_${i}`] = key;
    }
    delete require.cache[require.resolve('../src/utils/pexels')];
  }
});

test('searchImages caches identical searches and dedupes concurrent requests', async () => {
  const originalFetch = global.fetch;
  const originalKeys = {};
  for (let i = 1; i <= 7; i++) {
    originalKeys[i] = process.env[`PEXELS_API_KEY_${i}`];
  }

  process.env.PEXELS_API_KEY_1 = 'key-1';
  for (let i = 2; i <= 7; i++) delete process.env[`PEXELS_API_KEY_${i}`];

  let fetchCalls = 0;
  let release;
  const blocker = new Promise((resolve) => { release = resolve; });

  global.fetch = async () => {
    fetchCalls += 1;
    await blocker;
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          photos: [{
            id: 11,
            width: 1000,
            height: 700,
            alt: 'Cafe interior',
            photographer: 'Pexels User',
            photographer_url: 'https://pexels.test/user',
            src: { large: 'https://img.test/large.jpg', medium: 'https://img.test/medium.jpg' },
          }],
        };
      },
    };
  };

  try {
    const { searchImages } = loadPexelsModule();
    const first = searchImages('  cafe interior  ', { perPage: 1, orientation: 'landscape' });
    const second = searchImages('cafe   interior', { perPage: 1, orientation: 'landscape' });
    release();
    const [firstResult, secondResult] = await Promise.all([first, second]);
    const thirdResult = await searchImages('cafe interior', { perPage: 1, orientation: 'landscape' });

    assert.equal(fetchCalls, 1);
    assert.deepEqual(firstResult, secondResult);
    assert.deepEqual(secondResult, thirdResult);
    assert.equal(thirdResult[0].url, 'https://img.test/large.jpg');
  } finally {
    global.fetch = originalFetch;
    for (let i = 1; i <= 7; i++) {
      const key = originalKeys[i];
      if (key === undefined) delete process.env[`PEXELS_API_KEY_${i}`];
      else process.env[`PEXELS_API_KEY_${i}`] = key;
    }
    delete require.cache[require.resolve('../src/utils/pexels')];
  }
});
