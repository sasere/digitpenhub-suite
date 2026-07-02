require('dotenv').config();
const { Pool } = require('pg');
const { searchImages } = require('../src/utils/pexels');

async function img(query) {
  try {
    const results = await searchImages(query, { perPage: 1, orientation: 'landscape' });
    return results[0]?.url || '';
  } catch (err) {
    console.warn(`  ! image search failed for "${query}": ${err.message}`);
    return '';
  }
}

const TEMPLATES = [
  {
    category: 'Real Estate',
    name: 'Buyer Inquiry Form',
    description: 'A qualifying form for buyers comparing neighborhoods, timelines, and budgets.',
    thumbnailQuery: 'real estate open house modern home',
    submitMessage: 'Thanks for reaching out. A local agent will review your goals and get back to you shortly.',
    fields: [
      { id: 101, label: 'Full name', type: 'text', required: true, options: [] },
      { id: 102, label: 'Email', type: 'email', required: true, options: [] },
      { id: 103, label: 'Phone', type: 'phone', required: true, options: [] },
      { id: 104, label: 'I am interested in', type: 'radio', required: true, options: ['Buying', 'Selling', 'Investing'] },
      { id: 105, label: 'Target neighborhoods', type: 'textarea', required: true, options: [], showIf: { fieldId: 104, operator: 'equals', value: 'Buying' } },
      { id: 106, label: 'Price range', type: 'select', required: true, options: ['Under $300k', '$300k-$500k', '$500k-$750k', '$750k+'] },
      { id: 107, label: 'Ideal move timeline', type: 'select', required: true, options: ['ASAP', '1-3 months', '3-6 months', '6+ months'] },
    ],
  },
  {
    category: 'E-commerce & Retail',
    name: 'VIP Product Waitlist Form',
    description: 'A pre-launch capture form for product interest, budget, and bundle preferences.',
    thumbnailQuery: 'ecommerce fashion product retail',
    submitMessage: 'You are on the list. Watch for launch-day access, product drops, and bundle offers.',
    fields: [
      { id: 201, label: 'Name', type: 'text', required: true, options: [] },
      { id: 202, label: 'Email', type: 'email', required: true, options: [] },
      { id: 203, label: 'Phone (optional)', type: 'phone', required: false, options: [] },
      { id: 204, label: 'What are you shopping for?', type: 'select', required: true, options: ['Everyday essentials', 'Launch collection', 'Gift set', 'Corporate gifting'] },
      { id: 205, label: 'Estimated budget', type: 'select', required: true, options: ['Under $50', '$50-$100', '$100-$250', '$250+'] },
      { id: 206, label: 'Need help selecting products?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 207, label: 'Tell us the style or products you want', type: 'textarea', required: true, options: [], showIf: { fieldId: 206, operator: 'equals', value: 'Yes' } },
    ],
  },
  {
    category: 'SaaS & Tech Startups',
    name: 'Demo Request Form',
    description: 'A SaaS demo request form that qualifies team size, use case, and implementation needs.',
    thumbnailQuery: 'software demo saas laptop analytics',
    submitMessage: 'Thanks. We will review your use case and send a demo time with the right product specialist.',
    fields: [
      { id: 301, label: 'Full name', type: 'text', required: true, options: [] },
      { id: 302, label: 'Work email', type: 'email', required: true, options: [] },
      { id: 303, label: 'Company', type: 'text', required: true, options: [] },
      { id: 304, label: 'Team size', type: 'select', required: true, options: ['1-10', '11-25', '26-50', '51-200', '200+'] },
      { id: 305, label: 'Primary use case', type: 'textarea', required: true, options: [] },
      { id: 306, label: 'Need migration help?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 307, label: 'Current system or workflow', type: 'text', required: true, options: [], showIf: { fieldId: 306, operator: 'equals', value: 'Yes' } },
    ],
  },
  {
    category: 'Health, Fitness & Wellness',
    name: 'Consultation Intake Form',
    description: 'A coaching or studio intake form for goals, constraints, and preferred support.',
    thumbnailQuery: 'fitness consultation trainer client',
    submitMessage: 'Thanks for submitting your goals. A coach will review your intake and confirm the next step.',
    fields: [
      { id: 401, label: 'Name', type: 'text', required: true, options: [] },
      { id: 402, label: 'Email', type: 'email', required: true, options: [] },
      { id: 403, label: 'Main goal', type: 'select', required: true, options: ['Lose weight', 'Build strength', 'Improve energy', 'Rehab / mobility', 'General wellness'] },
      { id: 404, label: 'Preferred coaching format', type: 'radio', required: true, options: ['In-person', 'Online', 'Hybrid'] },
      { id: 405, label: 'Do you have any injuries or limitations?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 406, label: 'Please describe any injuries or limitations', type: 'textarea', required: true, options: [], showIf: { fieldId: 405, operator: 'equals', value: 'Yes' } },
      { id: 407, label: 'How many days per week can you realistically commit?', type: 'select', required: true, options: ['1-2', '3-4', '5+', 'Not sure yet'] },
    ],
  },
  {
    category: 'Restaurants & Food Delivery',
    name: 'Catering Inquiry Form',
    description: 'An event-catering form with event type, date, guest count, and logistics.',
    thumbnailQuery: 'restaurant catering buffet event',
    submitMessage: 'Thanks for the catering inquiry. We will follow up with menu ideas and availability shortly.',
    fields: [
      { id: 501, label: 'Contact name', type: 'text', required: true, options: [] },
      { id: 502, label: 'Email', type: 'email', required: true, options: [] },
      { id: 503, label: 'Phone', type: 'phone', required: true, options: [] },
      { id: 504, label: 'Event type', type: 'select', required: true, options: ['Corporate lunch', 'Private dinner', 'Wedding / rehearsal', 'Birthday / celebration', 'Other'] },
      { id: 505, label: 'Event date', type: 'date', required: true, options: [] },
      { id: 506, label: 'Estimated guest count', type: 'number', required: true, options: [] },
      { id: 507, label: 'Need on-site staffing?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 508, label: 'Venue or delivery address', type: 'textarea', required: true, options: [] },
    ],
  },
  {
    category: 'Coaching & Consulting',
    name: 'Discovery Call Application',
    description: 'A qualifying application for consulting or coaching discovery calls.',
    thumbnailQuery: 'consulting strategy session office',
    submitMessage: 'Thanks. We will review your application and send the best next step for your situation.',
    fields: [
      { id: 601, label: 'Full name', type: 'text', required: true, options: [] },
      { id: 602, label: 'Email', type: 'email', required: true, options: [] },
      { id: 603, label: 'Business / role', type: 'text', required: true, options: [] },
      { id: 604, label: 'Biggest challenge right now', type: 'textarea', required: true, options: [] },
      { id: 605, label: 'How urgent is this?', type: 'select', required: true, options: ['Need help this month', 'Need help this quarter', 'Planning ahead'] },
      { id: 606, label: 'Are you evaluating paid support right now?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 607, label: 'What outcome would make this a clear win?', type: 'textarea', required: true, options: [] },
    ],
  },
  {
    category: 'Creative Portfolio & Agency',
    name: 'Creative Project Brief Form',
    description: 'A project brief for agencies, designers, photographers, and creative studios.',
    thumbnailQuery: 'creative agency portfolio project planning',
    submitMessage: 'Thanks for sharing the project brief. We will review it and send back scope and timing options.',
    fields: [
      { id: 701, label: 'Name', type: 'text', required: true, options: [] },
      { id: 702, label: 'Email', type: 'email', required: true, options: [] },
      { id: 703, label: 'Company / brand', type: 'text', required: false, options: [] },
      { id: 704, label: 'Project type', type: 'select', required: true, options: ['Brand identity', 'Website design', 'Content production', 'Campaign assets', 'Other'] },
      { id: 705, label: 'Target launch window', type: 'select', required: true, options: ['Within 2 weeks', 'This month', 'Next quarter', 'Flexible'] },
      { id: 706, label: 'Budget range', type: 'select', required: true, options: ['Under $2k', '$2k-$5k', '$5k-$15k', '$15k+'] },
      { id: 707, label: 'Need photography or video support?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { id: 708, label: 'Project details', type: 'textarea', required: true, options: [] },
      { id: 709, label: 'Shoot location or content notes', type: 'textarea', required: true, options: [], showIf: { fieldId: 707, operator: 'equals', value: 'Yes' } },
    ],
  },
];

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let inserted = 0;
  let skipped = 0;

  for (const [i, template] of TEMPLATES.entries()) {
    const { rows: existing } = await pool.query(`SELECT id FROM form_templates WHERE name = $1`, [template.name]);
    if (existing.length) {
      console.log(`Skipping form template "${template.name}" (already seeded)`);
      skipped += 1;
      continue;
    }

    console.log(`Fetching thumbnail for "${template.name}"...`);
    const thumbnail = await img(template.thumbnailQuery);
    await pool.query(
      `INSERT INTO form_templates (category, name, description, thumbnail_url, fields, submit_message, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [template.category, template.name, template.description, thumbnail, JSON.stringify(template.fields), template.submitMessage, i]
    );
    inserted += 1;
    console.log(`Seeded form template "${template.name}"`);
  }

  await pool.end();
  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
