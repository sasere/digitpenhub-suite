const db = require('../db');

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function listFunnelTemplates(req, res) {
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
            jsonb_array_length(steps) AS step_count
     FROM funnel_templates
     ${where}
     ORDER BY category, sort_order, name`,
    values
  );
  res.json({ templates: rows });
}

async function listCategories(req, res) {
  const { rows } = await db.query(
    `SELECT category, COUNT(*) AS count FROM funnel_templates GROUP BY category ORDER BY category`
  );
  res.json({ categories: rows });
}

async function getFunnelTemplate(req, res) {
  const { rows } = await db.query(`SELECT * FROM funnel_templates WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Funnel template not found.' });
  res.json({ template: rows[0] });
}

async function useFunnelTemplate(req, res) {
  const { rows } = await db.query(`SELECT * FROM funnel_templates WHERE id = $1`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Funnel template not found.' });
  const template = rows[0];
  const steps = Array.isArray(template.steps) ? template.steps : [];
  if (!steps.length) return res.status(400).json({ error: 'This funnel template has no steps.' });

  const funnelName = String((req.body && req.body.name) || template.name || '').trim() || template.name;
  const baseSlug = slugify(funnelName) || 'funnel';
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const { rows: funnelRows } = await client.query(
      `INSERT INTO funnels (org_id, name, description) VALUES ($1,$2,$3) RETURNING *`,
      [req.user.orgId, funnelName, template.description || null]
    );
    const funnel = funnelRows[0];

    let finalBase = baseSlug;
    let suffix = 1;
    while (true) {
      const { rows: exists } = await client.query(
        `SELECT 1 FROM pages WHERE org_id = $1 AND (slug = $2 OR slug LIKE $2 || '-%')`,
        [req.user.orgId, finalBase]
      );
      if (!exists.length) break;
      suffix += 1;
      finalBase = `${baseSlug}-${suffix}`;
    }

    const keyedSteps = steps.map((step, index) => {
      const key = slugify(step.key || step.slugSuffix || step.title || `step-${index + 1}`) || `step-${index + 1}`;
      const slugSuffix = slugify(step.slugSuffix || (index === 0 ? '' : key));
      return {
        ...step,
        key,
        slugSuffix,
        finalSlug: slugSuffix ? `${finalBase}-${slugSuffix}` : finalBase,
      };
    });
    const hrefByKey = Object.fromEntries(keyedSteps.map((step) => [step.key, `/p/${step.finalSlug}`]));

    const createdSteps = [];
    for (let index = 0; index < keyedSteps.length; index += 1) {
      const step = keyedSteps[index];
      const resolvedBlocks = JSON.parse(
        JSON.stringify(Array.isArray(step.blocks) ? step.blocks : []).replace(
          /\{\{step:([a-z0-9-]+)\}\}/g,
          (_, key) => hrefByKey[key] || '#'
        )
      );

      const { rows: pageRows } = await client.query(
        `INSERT INTO pages (org_id, slug, title, meta_description, blocks, status, page_type)
         VALUES ($1,$2,$3,$4,$5,'draft',$6) RETURNING *`,
        [
          req.user.orgId,
          step.finalSlug,
          step.title || `Step ${index + 1}`,
          step.metaDescription || null,
          JSON.stringify(resolvedBlocks),
          step.pageType || 'landing',
        ]
      );
      const page = pageRows[0];

      const { rows: funnelStepRows } = await client.query(
        `INSERT INTO funnel_steps (funnel_id, page_id, step_order, step_type)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [funnel.id, page.id, index, step.stepType || 'page']
      );

      createdSteps.push({
        ...funnelStepRows[0],
        page_id: page.id,
        page_slug: page.slug,
        page_title: page.title,
        page_status: page.status,
        page_type: page.page_type,
      });
    }

    await client.query('COMMIT');
    res.status(201).json({ funnel, steps: createdSteps });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { listFunnelTemplates, listCategories, getFunnelTemplate, useFunnelTemplate };
