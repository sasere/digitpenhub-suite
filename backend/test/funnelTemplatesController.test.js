const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/db');

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

test('useFunnelTemplate creates linked landing pages from template steps', async () => {
  const originalQuery = db.query;
  const originalConnect = db.connect;
  const insertedPages = [];

  db.query = async (text) => {
    if (text === 'SELECT * FROM funnel_templates WHERE id = $1') {
      return {
        rows: [{
          id: 'tpl-1',
          name: 'Test Funnel',
          description: 'Template description',
          steps: [
            {
              key: 'optin',
              slugSuffix: '',
              stepType: 'optin',
              pageType: 'landing',
              title: 'Opt-in Page',
              metaDescription: 'Step one',
              blocks: [{ id: 'blk-1', type: 'hero', ctaUrl: '{{step:offer}}' }],
            },
            {
              key: 'offer',
              slugSuffix: 'offer',
              stepType: 'upsell',
              pageType: 'landing',
              title: 'Offer Page',
              metaDescription: 'Step two',
              blocks: [{ id: 'blk-2', type: 'text', body: 'Offer body' }],
            },
          ],
        }],
      };
    }

    throw new Error(`Unexpected db.query call: ${text}`);
  };

  db.connect = async () => ({
    async query(text, params) {
      if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return { rows: [] };
      if (text.includes('INSERT INTO funnels')) {
        return { rows: [{ id: 'funnel-1', name: params[1], description: params[2], status: 'draft' }] };
      }
      if (text.includes('SELECT 1 FROM pages WHERE org_id = $1')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO pages')) {
        insertedPages.push(params);
        return {
          rows: [{
            id: `page-${insertedPages.length}`,
            slug: params[1],
            title: params[2],
            blocks: JSON.parse(params[4]),
            status: 'draft',
            page_type: params[5],
          }],
        };
      }
      if (text.includes('INSERT INTO funnel_steps')) {
        return { rows: [{ id: `step-${params[2]}`, page_id: params[1], step_order: params[2], step_type: params[3] }] };
      }
      throw new Error(`Unexpected client.query call: ${text}`);
    },
    release() {},
  });

  try {
    delete require.cache[require.resolve('../src/controllers/funnelTemplatesController')];
    const { useFunnelTemplate } = require('../src/controllers/funnelTemplatesController');
    const req = { params: { id: 'tpl-1' }, body: {}, user: { orgId: 'org-1' } };
    const res = buildRes();

    await useFunnelTemplate(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(insertedPages.length, 2);
    assert.equal(insertedPages[0][1], 'test-funnel');
    assert.equal(insertedPages[0][5], 'landing');
    assert.match(insertedPages[0][4], /\/p\/test-funnel-offer/);
    assert.equal(res.body.steps.length, 2);
  } finally {
    db.query = originalQuery;
    db.connect = originalConnect;
  }
});
