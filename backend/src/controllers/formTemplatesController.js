const db = require('../db');

async function listFormTemplates(req, res) {
  const { category, q } = req.query;
  const conditions = [];
  const values = [];
  let idx = 1;

  if (category) {
    conditions.push(`category = $${idx++}`);
    values.push(category);
  }
  if (q && q.trim()) {
    conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
    values.push(`%${q.trim()}%`);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await db.query(
    `SELECT id, category, name, description, thumbnail_url, sort_order,
            jsonb_array_length(fields) AS field_count
     FROM form_templates
     ${where}
     ORDER BY category, sort_order, name`,
    values
  );
  res.json({ templates: rows });
}

async function listCategories(req, res) {
  const { rows } = await db.query(
    `SELECT category, COUNT(*) AS count FROM form_templates GROUP BY category ORDER BY category`
  );
  res.json({ categories: rows });
}

async function getFormTemplate(req, res) {
  const { rows } = await db.query(`SELECT * FROM form_templates WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Form template not found.' });
  res.json({ template: rows[0] });
}

module.exports = { listFormTemplates, listCategories, getFormTemplate };
