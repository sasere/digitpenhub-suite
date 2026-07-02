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

test('getFormTemplate returns the requested template payload', async () => {
  const originalQuery = db.query;

  db.query = async (text, params) => {
    if (text === 'SELECT * FROM form_templates WHERE id = $1') {
      assert.equal(params[0], 'form-tpl-1');
      return {
        rows: [{
          id: 'form-tpl-1',
          name: 'Consultation Intake Form',
          description: 'Template description',
          submit_message: 'Thanks for reaching out.',
          fields: [{ id: 1, label: 'Name', type: 'text', required: true }],
        }],
      };
    }
    throw new Error(`Unexpected query: ${text}`);
  };

  try {
    delete require.cache[require.resolve('../src/controllers/formTemplatesController')];
    const { getFormTemplate } = require('../src/controllers/formTemplatesController');
    const req = { params: { id: 'form-tpl-1' } };
    const res = buildRes();

    await getFormTemplate(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.template.name, 'Consultation Intake Form');
    assert.equal(res.body.template.fields.length, 1);
  } finally {
    db.query = originalQuery;
  }
});
