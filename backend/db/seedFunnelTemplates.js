require('dotenv').config();
const { Pool } = require('pg');
const { searchImages } = require('../src/utils/pexels');

function blk(type, fields) {
  return { id: `blk_${Math.random().toString(36).slice(2, 10)}`, type, ...fields };
}

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
    name: 'Seller Lead Funnel',
    description: 'A 3-step funnel for home valuation leads, consultation bookings, and follow-up.',
    thumbnailQuery: 'luxury home exterior real estate',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Instant Home Value Request',
        metaDescription: 'Capture seller leads with a local valuation offer.',
        imageQuery: 'real estate agent showing home',
        build: (heroImg) => [
          blk('hero', { heading: 'Find out what your home could sell for this season', subheading: 'Request a local valuation and get pricing guidance from an agent who knows your neighborhood.', ctaText: 'Get my valuation', ctaUrl: '{{step:offer}}', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Real estate showing', caption: '' }),
          blk('features', { heading: 'What sellers get', items: [
            { icon: '🏡', title: 'Pricing snapshot', desc: 'A realistic value range based on nearby recent sales.' },
            { icon: '📈', title: 'Market timing advice', desc: 'See whether now is the right time to list or wait.' },
            { icon: '📋', title: 'Prep checklist', desc: 'Get the fastest route to a stronger listing presentation.' },
          ] }),
          blk('cta', { heading: 'Ready to see the next step?', body: 'Tell us a bit about your property and we will map out the smartest pricing strategy.', buttonText: 'Continue', buttonUrl: '{{step:offer}}', bgColor: '#f8fafc' }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'consultation',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Book a Listing Strategy Call',
        metaDescription: 'Turn seller interest into a real appointment.',
        imageQuery: 'property consultation meeting',
        build: (heroImg) => [
          blk('hero', { heading: 'Turn that valuation into a listing plan', subheading: 'Book a 20-minute strategy call and leave with a pricing, staging, and launch plan.', ctaText: 'Book the call', ctaUrl: '{{step:thankyou}}', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Property consultation', caption: '' }),
          blk('testimonials', { heading: 'Recent seller wins', items: [
            { quote: 'We listed with a plan instead of a guess and had two offers the first weekend.', author: 'Maya R.', role: 'Home seller' },
          ] }),
          blk('cta', { heading: 'Your listing plan starts here', body: 'Reserve a call and we will walk through pricing, repairs, timing, and promotion.', buttonText: 'Reserve my call', buttonUrl: '{{step:thankyou}}', bgColor: '#f8fafc' }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Thanks for Reaching Out',
        metaDescription: 'Confirm the request and guide the visitor to the next step.',
        build: () => [
          blk('hero', { heading: 'Thanks — your valuation request is in motion', subheading: 'A local agent will reach out shortly. In the meantime, download the seller prep checklist so you can move faster.', ctaText: 'Download the checklist', ctaUrl: '#', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'What happens next', body: '1. We review your property details.\n2. We compare recent local sales.\n3. We send your valuation range and next-step recommendations.' }),
        ],
      },
    ],
  },
  {
    category: 'E-commerce & Retail',
    name: 'Product Launch Funnel',
    description: 'A 3-step product funnel with lead capture, bundle upsell, and purchase follow-up.',
    thumbnailQuery: 'ecommerce product display retail',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'New Collection Early Access',
        metaDescription: 'Drive signups for a retail product drop.',
        imageQuery: 'fashion retail product display',
        build: (heroImg) => [
          blk('hero', { heading: 'Get early access to the new drop before it sells out', subheading: 'Join the VIP list for launch-day pricing, first pick, and free shipping bonuses.', ctaText: 'Join the VIP list', ctaUrl: '{{step:offer}}', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Retail collection display', caption: '' }),
          blk('features', { heading: 'Why customers join early', items: [
            { icon: '🎁', title: 'Launch-day bundle pricing', desc: 'Save more when you buy the full set together.' },
            { icon: '🚚', title: 'Priority fulfillment', desc: 'VIP customers are packed first on launch day.' },
            { icon: '✨', title: 'Limited-edition bonus', desc: 'Get the accessory that will not be restocked later.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'bundle',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Upgrade to the Launch Bundle',
        metaDescription: 'Present a curated product bundle.',
        imageQuery: 'gift box ecommerce packaging',
        build: (heroImg) => [
          blk('hero', { heading: 'Most VIP buyers choose the launch bundle', subheading: 'Get the hero product, the matching add-on, and the limited bonus in one checkout.', ctaText: 'Claim the bundle', ctaUrl: '{{step:thankyou}}', bgColor: '#7c2d12', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Product bundle packaging', caption: '' }),
          blk('testimonials', { heading: 'What launch customers say', items: [
            { quote: 'The bundle made the decision easy and the bonus piece was the one I used the most.', author: 'Jordan L.', role: 'Repeat customer' },
          ] }),
          blk('cta', { heading: 'Lock in the full set while stock lasts', body: 'Launch bundles typically sell through before individual pieces do.', buttonText: 'Add bundle to cart', buttonUrl: '{{step:thankyou}}', bgColor: '#f8fafc' }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'You Are on the List',
        metaDescription: 'Confirm the launch signup and next steps.',
        build: () => [
          blk('hero', { heading: 'You are in', subheading: 'Watch your inbox for launch access, bonus details, and your order link.', ctaText: 'Browse related products', ctaUrl: '#', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'What happens next', body: 'We will send the launch link, early-bird offer, and bundle reminders before the collection opens.' }),
        ],
      },
    ],
  },
  {
    category: 'SaaS & Tech Startups',
    name: 'Free Trial Funnel',
    description: 'A 3-step SaaS funnel for free-trial signups, upgrade nudges, and onboarding.',
    thumbnailQuery: 'saas dashboard analytics screen',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Start the Trial',
        metaDescription: 'Capture free-trial signups for a SaaS product.',
        imageQuery: 'software dashboard startup team',
        build: (heroImg) => [
          blk('hero', { heading: 'Start your trial and see value before your first team sync', subheading: 'Get your dashboard live in minutes, import your data, and invite the team when you are ready.', ctaText: 'Start free trial', ctaUrl: '{{step:offer}}', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'SaaS dashboard', caption: '' }),
          blk('features', { heading: 'The first 15 minutes', items: [
            { icon: '⚡', title: 'Fast setup', desc: 'Connect your core tools and bring your first data set in.' },
            { icon: '📊', title: 'Live visibility', desc: 'See the bottlenecks and opportunities in one place.' },
            { icon: '👥', title: 'Team-ready', desc: 'Invite stakeholders after your workspace is dialed in.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'demo',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Book a Guided Demo',
        metaDescription: 'Convert trial signups into sales conversations.',
        imageQuery: 'software product demo meeting',
        build: (heroImg) => [
          blk('hero', { heading: 'Want a fast path to your first win?', subheading: 'Book a tailored walkthrough and we will configure the workspace around your current workflow.', ctaText: 'Book the walkthrough', ctaUrl: '{{step:thankyou}}', bgColor: '#1d4ed8', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'SaaS demo call', caption: '' }),
          blk('testimonials', { heading: 'Why teams book the walkthrough', items: [
            { quote: 'We left the demo with an implementation plan and a dashboard the team actually used that same week.', author: 'Lina V.', role: 'Ops lead' },
          ] }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Trial Created',
        metaDescription: 'Confirm the trial and prompt the next step.',
        build: () => [
          blk('hero', { heading: 'Your workspace is ready', subheading: 'Check your inbox for the onboarding link, setup tips, and a short getting-started checklist.', ctaText: 'Read the setup guide', ctaUrl: '#', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Recommended next step', body: 'Invite one teammate, connect one live data source, and review your first dashboard together.' }),
        ],
      },
    ],
  },
  {
    category: 'Health, Fitness & Wellness',
    name: 'Fitness Consultation Funnel',
    description: 'A 3-step funnel for assessment bookings, program upgrades, and onboarding.',
    thumbnailQuery: 'fitness coach gym consultation',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Book a Wellness Assessment',
        metaDescription: 'Drive consultation bookings for a coach or studio.',
        imageQuery: 'personal trainer consultation gym',
        build: (heroImg) => [
          blk('hero', { heading: 'Book your fitness assessment and leave with a plan', subheading: 'Meet with a coach, review your goals, and map out the best path to results you can sustain.', ctaText: 'Book my assessment', ctaUrl: '{{step:offer}}', bgColor: '#14532d', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Fitness consultation', caption: '' }),
          blk('features', { heading: 'Your assessment includes', items: [
            { icon: '📋', title: 'Goal review', desc: 'Clarify the result you want and what has been getting in the way.' },
            { icon: '🏋️', title: 'Movement check', desc: 'Spot limitations before they turn into setbacks.' },
            { icon: '🥗', title: 'Lifestyle plan', desc: 'Get a practical routine for training, recovery, and nutrition.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'program',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Upgrade to the Signature Program',
        metaDescription: 'Present the premium coaching offer.',
        imageQuery: 'fitness class coaching session',
        build: (heroImg) => [
          blk('hero', { heading: 'Most new clients continue into the 12-week program', subheading: 'Get structured coaching, weekly accountability, and a plan built around your real schedule.', ctaText: 'Join the program', ctaUrl: '{{step:thankyou}}', bgColor: '#166534', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Fitness coaching session', caption: '' }),
          blk('testimonials', { heading: 'Client results', items: [
            { quote: 'I stopped guessing, started training with a plan, and finally built momentum that lasted longer than two weeks.', author: 'Danielle P.', role: 'Coaching client' },
          ] }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Assessment Requested',
        metaDescription: 'Confirm the booking request and next steps.',
        build: () => [
          blk('hero', { heading: 'You are booked in', subheading: 'Watch your inbox for scheduling details, prep notes, and what to bring to your assessment.', ctaText: 'Download the prep guide', ctaUrl: '#', bgColor: '#14532d', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Before your session', body: 'Think about your top goal, your current routine, and any injuries or constraints you want your coach to know about.' }),
        ],
      },
    ],
  },
  {
    category: 'Restaurants & Food Delivery',
    name: 'Catering Inquiry Funnel',
    description: 'A 3-step funnel for catering leads, package upgrades, and event follow-up.',
    thumbnailQuery: 'restaurant catering food table',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Request Catering Menu',
        metaDescription: 'Capture catering and event leads for a restaurant.',
        imageQuery: 'catering buffet restaurant',
        build: (heroImg) => [
          blk('hero', { heading: 'Planning an event? Get the catering menu and pricing guide', subheading: 'From private dinners to team lunches, we help hosts feed people well without the scramble.', ctaText: 'Send me the menu', ctaUrl: '{{step:offer}}', bgColor: '#7c2d12', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Restaurant catering spread', caption: '' }),
          blk('features', { heading: 'Popular event formats', items: [
            { icon: '🥗', title: 'Office lunches', desc: 'Simple ordering, easy pickup windows, and dietary options that actually taste good.' },
            { icon: '🍽️', title: 'Private dinners', desc: 'Coursed menus and service plans built around your guest count.' },
            { icon: '🎉', title: 'Celebrations', desc: 'Buffet and family-style packages for birthdays, launches, and rehearsal dinners.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'packages',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Upgrade to a Full-Service Package',
        metaDescription: 'Present premium catering package options.',
        imageQuery: 'restaurant private dining table setup',
        build: (heroImg) => [
          blk('hero', { heading: 'Need more than trays dropped at the door?', subheading: 'Upgrade to a full-service package with setup, staffing, and a custom menu.', ctaText: 'Request the premium package', ctaUrl: '{{step:thankyou}}', bgColor: '#9a3412', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Private dining setup', caption: '' }),
          blk('testimonials', { heading: 'Host feedback', items: [
            { quote: 'The premium package saved us from juggling logistics all night. It felt like hospitality, not just delivery.', author: 'Alicia M.', role: 'Event host' },
          ] }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Catering Request Received',
        metaDescription: 'Confirm the request and expected follow-up.',
        build: () => [
          blk('hero', { heading: 'Thanks — your event details are with the team', subheading: 'We will follow up with menu options, pricing, and next available dates shortly.', ctaText: 'View sample menus', ctaUrl: '#', bgColor: '#7c2d12', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Next step', body: 'A catering coordinator will reach out to confirm your headcount, timing, and any dietary notes.' }),
        ],
      },
    ],
  },
  {
    category: 'Coaching & Consulting',
    name: 'Discovery Call Funnel',
    description: 'A 3-step funnel for coaching applications, premium program offers, and confirmation.',
    thumbnailQuery: 'business coach consulting session',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Book a Discovery Call',
        metaDescription: 'Capture high-intent coaching and consulting prospects.',
        imageQuery: 'consultant coaching call laptop',
        build: (heroImg) => [
          blk('hero', { heading: 'Book a discovery call and find the fastest path forward', subheading: 'A focused strategy session for founders, consultants, and operators who need traction and clarity.', ctaText: 'Book the call', ctaUrl: '{{step:offer}}', bgColor: '#1e293b', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Consulting discovery call', caption: '' }),
          blk('features', { heading: 'What we cover', items: [
            { icon: '🧭', title: 'Current bottleneck', desc: 'Define what is slowing growth right now.' },
            { icon: '📈', title: 'Best next move', desc: 'Pin down the highest-leverage action for the next 30 days.' },
            { icon: '🤝', title: 'Fit check', desc: 'See whether deeper coaching or consulting support makes sense.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'program',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Join the Signature Advisory Program',
        metaDescription: 'Offer a premium retainer or program after the call.',
        imageQuery: 'executive coaching workshop',
        build: (heroImg) => [
          blk('hero', { heading: 'If the fit is right, continue into the advisory program', subheading: 'Weekly support, sharper decision-making, and an outside operator who will keep the plan moving.', ctaText: 'Apply for the program', ctaUrl: '{{step:thankyou}}', bgColor: '#334155', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Executive coaching workshop', caption: '' }),
          blk('testimonials', { heading: 'Client feedback', items: [
            { quote: 'The discovery call gave us clarity; the program gave us momentum we could not manufacture alone.', author: 'Seyi A.', role: 'Founder' },
          ] }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Request Confirmed',
        metaDescription: 'Confirm the coaching inquiry.',
        build: () => [
          blk('hero', { heading: 'You are on the calendar', subheading: 'Watch for a confirmation email with the meeting link, prep questions, and the short intake worksheet.', ctaText: 'Download the intake worksheet', ctaUrl: '#', bgColor: '#1e293b', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'How to prepare', body: 'Bring your current goals, biggest constraint, and the one decision you have been avoiding.' }),
        ],
      },
    ],
  },
  {
    category: 'Creative Portfolio & Agency',
    name: 'Project Inquiry Funnel',
    description: 'A 3-step funnel for creative inquiries, retainer upsells, and project kickoff prep.',
    thumbnailQuery: 'creative studio design portfolio',
    steps: [
      {
        key: 'optin',
        slugSuffix: '',
        stepType: 'optin',
        pageType: 'landing',
        title: 'Start a Creative Project',
        metaDescription: 'Capture portfolio and agency project inquiries.',
        imageQuery: 'creative agency workspace design team',
        build: (heroImg) => [
          blk('hero', { heading: 'Tell us about the project and we will shape the right brief', subheading: 'Brand, web, content, and launch support for teams who need clean creative work done properly.', ctaText: 'Start the brief', ctaUrl: '{{step:offer}}', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Creative studio workspace', caption: '' }),
          blk('features', { heading: 'What clients hire us for', items: [
            { icon: '🎨', title: 'Brand systems', desc: 'Messaging, identity, and rollout support built to scale.' },
            { icon: '💻', title: 'Launch-ready websites', desc: 'Thoughtful pages, not just pretty screens.' },
            { icon: '📸', title: 'Campaign assets', desc: 'Photography, motion, and content packages that ship with the launch.' },
          ] }),
        ],
      },
      {
        key: 'offer',
        slugSuffix: 'retainer',
        stepType: 'upsell',
        pageType: 'landing',
        title: 'Upgrade to an Ongoing Creative Retainer',
        metaDescription: 'Present a retainer or premium package.',
        imageQuery: 'designer client presentation boardroom',
        build: (heroImg) => [
          blk('hero', { heading: 'Need more than a one-off project?', subheading: 'Move into a monthly creative retainer for launch support, iterations, and faster turnaround.', ctaText: 'Ask about the retainer', ctaUrl: '{{step:thankyou}}', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Designer presenting work', caption: '' }),
          blk('testimonials', { heading: 'Why clients stay on retainer', items: [
            { quote: 'The retainer turned our launch scramble into a real creative operating rhythm.', author: 'Nora C.', role: 'Marketing lead' },
          ] }),
        ],
      },
      {
        key: 'thankyou',
        slugSuffix: 'thank-you',
        stepType: 'thankyou',
        pageType: 'landing',
        title: 'Project Request Received',
        metaDescription: 'Confirm the inquiry and next steps.',
        build: () => [
          blk('hero', { heading: 'Thanks — your brief is in review', subheading: 'We will follow up with the next step, recommended scope, and timeline options.', ctaText: 'View recent work', ctaUrl: '#', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'What happens next', body: 'We review the project brief, confirm the scope, and suggest the right engagement model before scheduling a call.' }),
        ],
      },
    ],
  },
];

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let inserted = 0;
  let skipped = 0;

  for (const [i, template] of TEMPLATES.entries()) {
    const { rows: existing } = await pool.query(`SELECT id FROM funnel_templates WHERE name = $1`, [template.name]);
    if (existing.length) {
      console.log(`Skipping funnel template "${template.name}" (already seeded)`);
      skipped += 1;
      continue;
    }

    console.log(`Fetching thumbnail for "${template.name}"...`);
    const thumbnail = await img(template.thumbnailQuery);
    const steps = [];
    for (const step of template.steps) {
      const heroImg = step.imageQuery ? await img(step.imageQuery) : '';
      steps.push({
        key: step.key,
        slugSuffix: step.slugSuffix,
        stepType: step.stepType,
        pageType: step.pageType,
        title: step.title,
        metaDescription: step.metaDescription,
        blocks: step.build(heroImg),
      });
    }

    await pool.query(
      `INSERT INTO funnel_templates (category, name, description, thumbnail_url, steps, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [template.category, template.name, template.description, thumbnail, JSON.stringify(steps), i]
    );
    inserted += 1;
    console.log(`Seeded funnel template "${template.name}"`);
  }

  await pool.end();
  console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
