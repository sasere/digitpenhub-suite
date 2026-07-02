// Seeds genuine multi-page site templates (Step 1b) — each template is a full
// linked site (home/about/services/etc), not a single page. Idempotent —
// skips any template name that already exists, so re-running only adds new
// ones. Pulls real imagery from Pexels per page, same pattern as
// seedPageTemplates.js.
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

// Each SITE has: category, name, description, and an ordered list of pages.
// Each page: role, slugSuffix, title, navLabel, metaDescription, imageQuery
// (optional — fetched once and passed into build()), build(heroImg) -> blocks.
const SITES = [
  {
    category: 'Real Estate',
    name: 'Harborview Realty — Full Agency Site',
    description: 'A 6-page real estate agency site: home, about, services, featured listings, testimonials, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Harborview Realty', navLabel: 'Home',
        metaDescription: 'Harborview Realty — buy, sell, and manage property with a local team that knows the market.',
        imageQuery: 'modern home exterior real estate',
        build: (heroImg) => [
          blk('hero', { heading: 'Find a home that actually fits your life', subheading: 'Harborview Realty has helped local families buy, sell, and rent property for over 15 years.', ctaText: 'View featured listings', ctaUrl: '__LINK:portfolio__', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Modern home exterior', caption: '' }),
          blk('features', { heading: 'Why sellers and buyers choose Harborview', items: [
            { icon: '🏡', title: 'Local market knowledge', desc: 'Our agents live in the neighborhoods they sell — not just numbers on a spreadsheet.' },
            { icon: '🤝', title: 'No pressure, ever', desc: 'We walk you through every option honestly, even if it means a slower sale.' },
            { icon: '📈', title: 'Pricing that sells', desc: 'Data-backed pricing gets your property sold faster, without leaving money on the table.' },
          ] }),
          blk('cta', { heading: 'Ready to talk about your next move?', body: 'Whether you\'re buying your first home or listing your fifth property, we\'ll give it to you straight.', buttonText: 'Contact our team', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'about', slugSuffix: 'about', title: 'About Harborview Realty', navLabel: 'About',
        metaDescription: 'The story, mission, and team behind Harborview Realty.',
        imageQuery: 'real estate agents team office',
        build: (heroImg) => [
          blk('hero', { heading: 'Built by agents who got tired of the hard sell', subheading: 'Our story, our mission, and the team behind it.', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Our story', body: 'Harborview Realty started in 2009 when our founder, tired of watching clients get pushed into homes that didn\'t fit their budget or their life, decided to build an agency around a simpler idea: tell people the truth, even when it costs you a commission. Fifteen years later, we\'ve grown from a two-desk office above a bakery to a team of twelve agents — but the rule hasn\'t changed.' }),
          blk('text', { heading: 'Our mission', body: 'We believe buying or selling a home should feel like getting advice from a friend who happens to know the market cold — not being sold to. Every listing we take, every offer we write, and every negotiation we run is judged against one question: is this actually in our client\'s best interest?' }),
          blk('image', { url: heroImg, alt: 'Harborview Realty team', caption: 'Part of the Harborview team at our downtown office.' }),
          blk('features', { heading: 'The people behind Harborview', items: [
            { icon: '👩', title: 'Amara Chen, Founder & Principal Broker', desc: '15+ years in residential real estate; leads our pricing strategy and top-tier negotiations.' },
            { icon: '👨', title: 'Daniel Osei, Head of Buyer Services', desc: 'Specializes in first-time buyers — has walked over 300 families through their first purchase.' },
            { icon: '👩', title: 'Priya Nair, Listings & Marketing Lead', desc: 'Runs staging, photography, and pricing analysis for every listing we take on.' },
          ] }),
        ],
      },
      {
        role: 'services', slugSuffix: 'services', title: 'Our Services', navLabel: 'Services',
        metaDescription: 'Buying, selling, rental management, and property investment services from Harborview Realty.',
        imageQuery: 'real estate contract handshake',
        build: (heroImg) => [
          blk('hero', { heading: 'Whatever stage you\'re at, we\'ve done it before', subheading: 'Four core services, one accountable team.', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('features', { heading: 'What we do', items: [
            { icon: '🔑', title: 'Buying a home', desc: 'From pre-approval to closing day, we handle scheduling, negotiation, and paperwork so you can focus on finding the right place.' },
            { icon: '🏷️', title: 'Selling your property', desc: 'Professional staging advice, photography, and a pricing strategy built on real comparable sales — not guesswork.' },
            { icon: '🏢', title: 'Rental & property management', desc: 'Tenant screening, rent collection, and maintenance coordination for landlords who want a hands-off portfolio.' },
            { icon: '📊', title: 'Investment consulting', desc: 'Cash-flow analysis and market forecasts for buyers building a rental property portfolio.' },
          ] }),
          blk('image', { url: heroImg, alt: 'Real estate agreement being signed', caption: '' }),
          blk('cta', { heading: 'Not sure which service you need?', body: 'Tell us what you\'re trying to do and we\'ll point you in the right direction — no obligation.', buttonText: 'Get in touch', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'portfolio', slugSuffix: 'listings', title: 'Featured Listings', navLabel: 'Listings',
        metaDescription: 'Featured property listings currently available through Harborview Realty.',
        imageQuery: 'luxury house interior living room',
        build: (heroImg) => [
          blk('hero', { heading: 'Featured listings', subheading: 'A sample of what\'s currently on the market with us.', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Living room interior', caption: '4-Bed Craftsman, Maple Street — $612,000' }),
          blk('text', { heading: '4-Bed Craftsman, Maple Street — $612,000', body: 'A fully renovated 1920s craftsman with the original woodwork intact, an updated kitchen, and a south-facing garden. Three blocks from the elementary school.' }),
          blk('text', { heading: '2-Bed Condo, Riverside Tower — $349,000', body: 'A top-floor unit with river views, in-unit laundry, and secure parking. Building amenities include a gym and rooftop terrace.' }),
          blk('text', { heading: 'Downtown Retail + Loft, 5th Ave — $780,000', body: 'Ground-floor commercial space with a two-bedroom loft above — ideal for an owner-operator or investor seeking mixed-use income.' }),
          blk('cta', { heading: 'Want to see the full listing sheet?', body: 'Ask about any property above, or tell us what you\'re looking for and we\'ll send matches directly.', buttonText: 'Ask about a listing', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'testimonials', slugSuffix: 'testimonials', title: 'Client Stories', navLabel: 'Testimonials',
        metaDescription: 'What Harborview Realty clients say after buying, selling, or renting with us.',
        build: () => [
          blk('hero', { heading: 'What our clients say', subheading: 'Real feedback from recent buyers, sellers, and landlords.', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('testimonials', { heading: '', items: [
            { quote: 'Daniel walked us through our first purchase like he had all the time in the world, even when we changed our minds twice. We closed on a house we actually love.', author: 'Grace M.', role: 'First-time buyer' },
            { quote: 'Priya\'s pricing call was spot on — we had three offers within a week of listing, all above asking.', author: 'Tunde A.', role: 'Home seller' },
            { quote: 'I manage four rental units through Harborview now. Maintenance requests get handled before I even hear about them.', author: 'Sandra K.', role: 'Property investor' },
          ] }),
          blk('cta', { heading: 'Ready to write your own story?', body: '', buttonText: 'Start the conversation', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact Us', navLabel: 'Contact',
        metaDescription: 'Contact Harborview Realty — office address, phone, email, and hours.',
        build: () => [
          blk('hero', { heading: 'Let\'s talk about your next move', subheading: 'Reach out directly — a real agent will get back to you within one business day.', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Office', body: 'Harborview Realty\n148 Maple Street, Suite 2\nRiverside, CA 92501' }),
          blk('text', { heading: 'Contact details', body: 'Phone: (555) 019-2244\nEmail: hello@harborviewrealty.example\nHours: Mon–Fri 9am–6pm, Sat 10am–2pm' }),
          blk('cta', { heading: 'Email us directly', body: 'We reply to every inquiry personally — no call centers.', buttonText: 'hello@harborviewrealty.example', buttonUrl: 'mailto:hello@harborviewrealty.example', bgColor: '#f8fafc' }),
        ],
      },
    ],
  },
  {
    category: 'SaaS & Tech Startups',
    name: 'Ledgerly — Full SaaS Product Site',
    description: 'A 6-page SaaS site: home, about, platform, testimonials, blog, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Ledgerly', navLabel: 'Home',
        metaDescription: 'Ledgerly — bookkeeping software built for small teams who don\'t have a finance department.',
        imageQuery: 'saas dashboard software screen',
        build: (heroImg) => [
          blk('hero', { heading: 'Bookkeeping software for teams without a finance department', subheading: 'Ledgerly reconciles your accounts, flags what needs attention, and gets out of your way.', ctaText: 'Start free trial', ctaUrl: '#', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Ledgerly dashboard', caption: '' }),
          blk('features', { heading: 'Why teams switch to Ledgerly', items: [
            { icon: '⚡', title: 'Auto-reconciliation', desc: 'Bank feeds match against invoices automatically — most months need zero manual review.' },
            { icon: '📊', title: 'Reports that make sense', desc: 'Cash flow, P&L, and runway — in plain language, not accountant jargon.' },
            { icon: '🔌', title: 'Connects to what you use', desc: 'Stripe, bank feeds, and payroll sync natively, no CSV exports required.' },
          ] }),
          blk('cta', { heading: 'See your real numbers in 10 minutes', body: 'Connect your bank account and get your first reconciled report today.', buttonText: 'Start free trial', buttonUrl: '#', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'about', slugSuffix: 'about', title: 'About Ledgerly', navLabel: 'About',
        metaDescription: 'The story, mission, and team behind Ledgerly.',
        imageQuery: 'startup team working office',
        build: (heroImg) => [
          blk('hero', { heading: 'We built the tool we couldn\'t find', subheading: 'Our story, our mission, and the team behind it.', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Our story', body: 'Ledgerly started as a spreadsheet. Our founder was running finance for a 12-person startup and reconciling transactions by hand every Friday night, using tools built for accounting firms with dedicated staff. In 2021 we set out to build something different: bookkeeping software for the other 99% of small businesses that don\'t have a controller on staff.' }),
          blk('text', { heading: 'Our mission', body: 'Every small business deserves to know, in plain language, whether they made money last month — without hiring an accountant to find out. We measure our success by how rarely our customers need to open a spreadsheet.' }),
          blk('image', { url: heroImg, alt: 'Ledgerly team working', caption: 'The Ledgerly team, remote-first since day one.' }),
          blk('features', { heading: 'The people behind Ledgerly', items: [
            { icon: '👩', title: 'Fatima Al-Rashid, Founder & CEO', desc: 'Former startup finance lead; built the first version of Ledgerly for her own team.' },
            { icon: '👨', title: 'Marcus Webb, Head of Engineering', desc: 'Leads the bank-integration and reconciliation engine that powers every account.' },
            { icon: '👩', title: 'Jade Lin, Head of Customer Success', desc: 'Onboards every new team personally for their first 30 days.' },
          ] }),
        ],
      },
      {
        role: 'services', slugSuffix: 'platform', title: 'The Platform', navLabel: 'Platform',
        metaDescription: 'What\'s included in the Ledgerly platform — reconciliation, reporting, payroll sync, and integrations.',
        imageQuery: 'financial technology charts analytics',
        build: (heroImg) => [
          blk('hero', { heading: 'Everything your books need, nothing you have to babysit', subheading: '', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('features', { heading: 'Core platform', items: [
            { icon: '🏦', title: 'Bank feed reconciliation', desc: 'Live feeds from over 9,000 banks, auto-matched against your invoices and expenses.' },
            { icon: '📄', title: 'Invoicing & expenses', desc: 'Send invoices and log expenses from the same place your books already live.' },
            { icon: '👥', title: 'Payroll sync', desc: 'Connects to major payroll providers so payroll runs post to your books automatically.' },
            { icon: '📈', title: 'Real-time reporting', desc: 'P&L, balance sheet, and cash flow, always current — never a month-end scramble.' },
          ] }),
          blk('image', { url: heroImg, alt: 'Analytics dashboard', caption: '' }),
          blk('cta', { heading: 'See the platform in action', body: 'Start a free trial — no credit card, no sales call required.', buttonText: 'Start free trial', buttonUrl: '#', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'testimonials', slugSuffix: 'testimonials', title: 'Customer Stories', navLabel: 'Testimonials',
        metaDescription: 'What Ledgerly customers say about switching their bookkeeping over.',
        build: () => [
          blk('hero', { heading: 'What our customers say', subheading: '', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('testimonials', { heading: '', items: [
            { quote: 'We switched from a spreadsheet to Ledgerly in an afternoon. I finally know our runway without asking our accountant to run a report.', author: 'Owen Price', role: 'Founder, small e-commerce brand' },
            { quote: 'The payroll sync alone saved us four hours a month of manual journal entries.', author: 'Bianca Ross', role: 'Operations lead, 18-person agency' },
            { quote: 'Support actually answers — Jade walked our whole team through migration personally.', author: 'Kwame Boateng', role: 'CEO, early-stage startup' },
          ] }),
        ],
      },
      {
        role: 'blog', slugSuffix: 'blog', title: 'Blog', navLabel: 'Blog',
        metaDescription: 'Practical bookkeeping and small business finance guidance from the Ledgerly team.',
        imageQuery: 'business finance writing notebook',
        build: (heroImg) => [
          blk('hero', { heading: 'From the Ledgerly blog', subheading: 'Practical finance guidance for teams without a finance department.', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Finance notes', caption: '' }),
          blk('text', { heading: 'Reading your P&L in five minutes a month', body: 'You don\'t need an accounting degree to know if your business made money — here\'s the three-line version every founder should check monthly.' }),
          blk('text', { heading: 'When to hire your first bookkeeper (and when not to)', body: 'Most teams under 15 people don\'t need a bookkeeper — they need better tools. Here\'s how to tell which stage you\'re at.' }),
          blk('text', { heading: 'Reconciliation, explained without the jargon', body: 'What "reconciling your books" actually means, why it matters for fundraising, and how to automate most of it.' }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact Us', navLabel: 'Contact',
        metaDescription: 'Contact the Ledgerly team — sales, support, and general inquiries.',
        build: () => [
          blk('hero', { heading: 'Talk to the team', subheading: 'Sales questions, support requests, or just curious — we read every message.', bgColor: '#1e3a8a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Support', body: 'Email: support@ledgerly.example\nAverage first response time: under 4 business hours.' }),
          blk('text', { heading: 'Sales', body: 'Email: sales@ledgerly.example\nWant a live walkthrough first? Ask and we\'ll set one up.' }),
          blk('cta', { heading: 'Email us directly', body: '', buttonText: 'hello@ledgerly.example', buttonUrl: 'mailto:hello@ledgerly.example', bgColor: '#f8fafc' }),
        ],
      },
    ],
  },
  {
    category: 'Restaurants & Food Delivery',
    name: 'Basil & Ember — Full Restaurant Site',
    description: 'A 6-page restaurant site: home, about, menu, gallery, testimonials, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Basil & Ember', navLabel: 'Home',
        metaDescription: 'Basil & Ember — wood-fired, seasonal cooking in the heart of downtown.',
        imageQuery: 'restaurant interior cozy dining',
        build: (heroImg) => [
          blk('hero', { heading: 'Wood-fired cooking, seasonal ingredients, no shortcuts', subheading: 'Basil & Ember has been serving downtown since 2016 — reservations recommended on weekends.', ctaText: 'Reserve a table', ctaUrl: '__LINK:contact__', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Basil & Ember dining room', caption: '' }),
          blk('features', { heading: 'Why people keep coming back', items: [
            { icon: '🔥', title: 'Wood-fired everything', desc: 'Our oven runs at 900°F — it\'s not just for pizza, it\'s how we cook nearly everything on the menu.' },
            { icon: '🌿', title: 'Seasonal, local ingredients', desc: 'Our menu changes with what\'s actually good right now, sourced from three regional farms.' },
            { icon: '🍷', title: 'A wine list worth exploring', desc: 'Hand-picked by our sommelier, with a strong focus on small independent producers.' },
          ] }),
          blk('cta', { heading: 'Hungry yet?', body: 'See tonight\'s menu or book a table for this weekend.', buttonText: 'View the menu', buttonUrl: '__LINK:services__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'about', slugSuffix: 'about', title: 'Our Story', navLabel: 'About',
        metaDescription: 'The story, mission, and team behind Basil & Ember.',
        imageQuery: 'chef cooking kitchen restaurant',
        build: (heroImg) => [
          blk('hero', { heading: 'A kitchen built around one oven', subheading: 'Our story, our mission, and the people behind it.', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Our story', body: 'Basil & Ember opened in 2016 in a converted auto shop downtown, built around a single wood-fired oven that chef-owner Elena Marchetti had shipped from Naples. What started as a 20-seat pizza spot has grown into a full kitchen, but the oven is still the heart of the restaurant — nearly everything that leaves the kitchen has touched its fire at some point.' }),
          blk('text', { heading: 'Our mission', body: 'We cook what\'s in season, from farms we actually visit, using techniques that don\'t cut corners. No microwaves in this kitchen, no shortcuts on the menu — if it takes three days to make the dough right, it takes three days.' }),
          blk('image', { url: heroImg, alt: 'Chef at the wood-fired oven', caption: 'Chef Elena Marchetti at the oven that started it all.' }),
          blk('features', { heading: 'The team', items: [
            { icon: '👩‍🍳', title: 'Elena Marchetti, Chef & Owner', desc: 'Trained in Naples; opened Basil & Ember around the oven she brought back with her.' },
            { icon: '👨‍🍳', title: 'Ravi Desai, Sous Chef', desc: 'Runs the seasonal menu changes and sources from our three partner farms.' },
            { icon: '🍷', title: 'Clara Dubois, Sommelier & Floor Manager', desc: 'Built our wine list from scratch around independent producers.' },
          ] }),
        ],
      },
      {
        role: 'services', slugSuffix: 'menu', title: 'Menu Highlights', navLabel: 'Menu',
        metaDescription: 'A look at what\'s currently on the menu at Basil & Ember.',
        imageQuery: 'wood fired pizza food plate',
        build: (heroImg) => [
          blk('hero', { heading: 'Tonight\'s menu, built around the season', subheading: 'A sample of what\'s currently on offer — the full menu changes monthly.', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Wood-fired pizza', caption: '' }),
          blk('features', { heading: 'Current highlights', items: [
            { icon: '🍕', title: 'Wood-fired margherita', desc: 'San Marzano tomato, fresh mozzarella, basil, 900°F for 90 seconds.' },
            { icon: '🍝', title: 'Handmade tagliatelle', desc: 'Wild mushroom ragù, made fresh daily — sells out most nights.' },
            { icon: '🥗', title: 'Charred autumn salad', desc: 'Roasted squash, radicchio, candied walnuts, sourced from Hollow Creek Farm.' },
            { icon: '🍮', title: 'Basque burnt cheesecake', desc: 'Our most-requested dessert since day one — not on the printed menu, always available.' },
          ] }),
          blk('cta', { heading: 'Ready to book?', body: 'Weekend tables go fast — reserve a few days ahead if you can.', buttonText: 'Reserve a table', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'portfolio', slugSuffix: 'gallery', title: 'Gallery', navLabel: 'Gallery',
        metaDescription: 'Photos from inside Basil & Ember — the dining room, the kitchen, and the food.',
        imageQuery: 'fine dining food plating',
        build: (heroImg) => [
          blk('hero', { heading: 'A look inside', subheading: 'The dining room, the kitchen, and what comes out of it.', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Plated dish', caption: 'One of our seasonal small plates.' }),
          blk('text', { heading: '', body: 'Follow us on social media for weekly menu updates and behind-the-scenes shots from the kitchen — our menu changes often enough that photos here go out of date fast.' }),
        ],
      },
      {
        role: 'testimonials', slugSuffix: 'reviews', title: 'Reviews', navLabel: 'Reviews',
        metaDescription: 'What guests say about dining at Basil & Ember.',
        build: () => [
          blk('hero', { heading: 'What our guests say', subheading: '', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('testimonials', { heading: '', items: [
            { quote: 'The tagliatelle alone is worth the drive downtown. We\'ve been back four times this year.', author: 'Renee T.', role: 'Regular guest' },
            { quote: 'Best pizza crust in the city, full stop. The char on that oven does something microwaved ovens just can\'t.', author: 'Marcus D.', role: 'Local food blogger' },
            { quote: 'Booked for an anniversary dinner and the staff made it feel genuinely special without being stuffy about it.', author: 'Aisha K.', role: 'Guest' },
          ] }),
          blk('cta', { heading: 'Come see for yourself', body: '', buttonText: 'Reserve a table', buttonUrl: '__LINK:contact__', bgColor: '#f8fafc' }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Reservations & Contact', navLabel: 'Contact',
        metaDescription: 'Reserve a table or contact Basil & Ember directly — address, phone, and hours.',
        build: () => [
          blk('hero', { heading: 'Reserve a table', subheading: 'Call, email, or walk in — weekends fill up fast.', bgColor: '#3f1d0e', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Location', body: 'Basil & Ember\n212 Foundry Lane\nDowntown' }),
          blk('text', { heading: 'Hours & contact', body: 'Tue–Sun, 5pm–11pm (closed Mondays)\nPhone: (555) 048-7731\nEmail: hello@basilandember.example' }),
          blk('cta', { heading: 'Email us to reserve', body: '', buttonText: 'hello@basilandember.example', buttonUrl: 'mailto:hello@basilandember.example', bgColor: '#f8fafc' }),
        ],
      },
    ],
  },
  {
    category: 'E-commerce & Retail',
    name: 'North & Bloom — Full Retail Site',
    description: 'A 5-page retail site: home, story, collection highlights, reviews, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'North & Bloom', navLabel: 'Home',
        metaDescription: 'North & Bloom — a modern retail brand for everyday essentials, gifting, and seasonal launches.',
        imageQuery: 'retail store lifestyle products',
        build: (heroImg) => [
          blk('hero', { heading: 'Everyday products, packaged like they belong in your life', subheading: 'North & Bloom curates practical essentials, thoughtful gifts, and seasonal collections that feel elevated without feeling precious.', ctaText: 'Shop the collection', ctaUrl: '__LINK:shop__', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Retail product display', caption: '' }),
          blk('features', { heading: 'Why customers start here', items: [
            { icon: '🛍️', title: 'Curated essentials', desc: 'Products chosen for repeated use, not one-time impulse buys.' },
            { icon: '🎁', title: 'Gift-ready bundles', desc: 'Simple pairings and seasonal boxes that save shoppers time.' },
            { icon: '🚚', title: 'Fast fulfillment', desc: 'Small-batch launches, packed quickly, with transparent delivery updates.' },
          ] }),
        ],
      },
      {
        role: 'about', slugSuffix: 'story', title: 'Our Story', navLabel: 'Story',
        metaDescription: 'How North & Bloom approaches product curation, launches, and customer experience.',
        imageQuery: 'retail founder packing orders',
        build: (heroImg) => [
          blk('hero', { heading: 'Built for people who want fewer, better things', subheading: 'Our story, our standards, and why we launch the way we do.', bgColor: '#7c2d12', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'How we started', body: 'North & Bloom started with a simple frustration: too many products were either disposable or over-designed. We wanted to build a store around everyday pieces that earn their place by being useful, durable, and easy to gift.' }),
          blk('image', { url: heroImg, alt: 'Founder packing retail orders', caption: 'The small team behind our launch-week packing line.' }),
          blk('text', { heading: 'What we look for', body: 'We test every product in normal use before it goes live. If something does not hold up, solve a real problem, or make daily life a little calmer, it does not stay in the collection.' }),
        ],
      },
      {
        role: 'shop', slugSuffix: 'shop', title: 'Collection Highlights', navLabel: 'Shop',
        metaDescription: 'Featured products, launch bundles, and gifting favorites from North & Bloom.',
        imageQuery: 'gift box retail ecommerce products',
        build: (heroImg) => [
          blk('hero', { heading: 'Collection highlights', subheading: 'A sample of what customers reach for most often.', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Retail gift set', caption: '' }),
          blk('text', { heading: 'Launch bundle — $84', body: 'A three-piece starter set built around the products customers use together most often, packed in a reusable gift box.' }),
          blk('text', { heading: 'Desk reset kit — $38', body: 'Our most popular gift pick for founders, managers, and anyone rebuilding their weekday rhythm.' }),
          blk('text', { heading: 'Seasonal edit — from $18', body: 'Small-batch additions built around one seasonal ritual at a time.' }),
        ],
      },
      {
        role: 'testimonials', slugSuffix: 'reviews', title: 'Reviews', navLabel: 'Reviews',
        metaDescription: 'What shoppers say about ordering from North & Bloom.',
        build: () => [
          blk('hero', { heading: 'What customers say', subheading: '', bgColor: '#7c2d12', textColor: '#ffffff', align: 'center' }),
          blk('testimonials', { heading: '', items: [
            { quote: 'Every item felt like something I would actually use, not shelf filler. The bundle is genuinely thoughtful.', author: 'Priya N.', role: 'Launch customer' },
            { quote: 'Fast shipping, clear updates, and the gift packaging looked premium without being over the top.', author: 'Derrick B.', role: 'Repeat buyer' },
          ] }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact', navLabel: 'Contact',
        metaDescription: 'Contact North & Bloom about orders, gifting, or wholesale inquiries.',
        build: () => [
          blk('hero', { heading: 'Questions about an order, gift, or launch?', subheading: 'Reach out directly and a real team member will get back to you.', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Customer care', body: 'Email: hello@northandbloom.example\nHours: Mon–Fri, 9am–5pm' }),
          blk('text', { heading: 'Wholesale & gifting', body: 'For larger gifting runs, launch collaborations, or wholesale inquiries, tell us the timeline and quantity you have in mind.' }),
        ],
      },
    ],
  },
  {
    category: 'Health, Fitness & Wellness',
    name: 'Summit Method — Full Fitness Site',
    description: 'A 5-page coaching site: home, story, programs, results, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Summit Method', navLabel: 'Home',
        metaDescription: 'Summit Method — strength, mobility, and habit coaching for busy professionals.',
        imageQuery: 'fitness coaching gym workout',
        build: (heroImg) => [
          blk('hero', { heading: 'Coaching that fits real schedules and still gets results', subheading: 'Summit Method combines training, recovery, and habit design for people who need a plan they can actually stick to.', ctaText: 'View programs', ctaUrl: '__LINK:services__', bgColor: '#14532d', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Fitness coaching session', caption: '' }),
          blk('features', { heading: 'What clients get', items: [
            { icon: '🏋️', title: 'Personalized programming', desc: 'Training plans shaped around your goals, equipment, and weekly reality.' },
            { icon: '🧠', title: 'Habit support', desc: 'Nutrition, sleep, and recovery guidance that supports the training plan.' },
            { icon: '📈', title: 'Clear progress tracking', desc: 'Simple checkpoints so momentum is easy to see and maintain.' },
          ] }),
        ],
      },
      {
        role: 'about', slugSuffix: 'about', title: 'Our Story', navLabel: 'Story',
        metaDescription: 'Why Summit Method was built and how the coaching approach works.',
        imageQuery: 'personal trainer coach gym',
        build: (heroImg) => [
          blk('hero', { heading: 'Built for clients who need structure, not hype', subheading: 'Our story, our philosophy, and the coaching standard we hold ourselves to.', bgColor: '#166534', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Why we started', body: 'Summit Method started after too many clients came in frustrated by plans that assumed unlimited time, motivation, and recovery capacity. We built our coaching model around consistency instead: clear priorities, realistic pacing, and honest adjustments when life gets busy.' }),
          blk('image', { url: heroImg, alt: 'Coach in a gym', caption: '' }),
          blk('text', { heading: 'What we believe', body: 'You do not need a harder plan. You need a better one: one that supports your energy, respects your actual calendar, and still pushes forward.' }),
        ],
      },
      {
        role: 'services', slugSuffix: 'programs', title: 'Programs', navLabel: 'Programs',
        metaDescription: 'Summit Method programs for 1:1 coaching, hybrid training, and group accountability.',
        imageQuery: 'group fitness training session',
        build: (heroImg) => [
          blk('hero', { heading: 'Programs built around how you like to train', subheading: '', bgColor: '#14532d', textColor: '#ffffff', align: 'center' }),
          blk('features', { heading: 'Current offers', items: [
            { icon: '👤', title: '1:1 coaching', desc: 'Private coaching for clients who want detailed oversight and accountability.' },
            { icon: '💻', title: 'Hybrid coaching', desc: 'Train online with weekly check-ins, form reviews, and monthly strategy updates.' },
            { icon: '👥', title: 'Small-group accountability', desc: 'Structured training with community support and coach-led checkpoints.' },
          ] }),
          blk('image', { url: heroImg, alt: 'Group training session', caption: '' }),
        ],
      },
      {
        role: 'testimonials', slugSuffix: 'results', title: 'Client Results', navLabel: 'Results',
        metaDescription: 'Client stories and progress examples from Summit Method.',
        build: () => [
          blk('hero', { heading: 'What clients notice first', subheading: '', bgColor: '#166534', textColor: '#ffffff', align: 'center' }),
          blk('testimonials', { heading: '', items: [
            { quote: 'I finally stopped restarting every Monday. The plan fit my real week and that changed everything.', author: 'Melissa G.', role: 'Hybrid coaching client' },
            { quote: 'Mobility work used to feel optional until my coach showed me how much it affected every session after.', author: 'David T.', role: '1:1 client' },
          ] }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact', navLabel: 'Contact',
        metaDescription: 'Book an assessment or contact Summit Method for coaching questions.',
        build: () => [
          blk('hero', { heading: 'Ready to talk through your goals?', subheading: 'Reach out for an assessment, coaching question, or program recommendation.', bgColor: '#14532d', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'How to reach us', body: 'Email: hello@summitmethod.example\nHours: Mon–Sat, 7am–7pm' }),
        ],
      },
    ],
  },
  {
    category: 'Coaching & Consulting',
    name: 'Northline Advisory — Full Consulting Site',
    description: 'A 5-page consulting site: home, about, services, case studies, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Northline Advisory', navLabel: 'Home',
        metaDescription: 'Northline Advisory — strategic consulting for operators, founders, and growth-stage teams.',
        imageQuery: 'business consulting strategy meeting',
        build: (heroImg) => [
          blk('hero', { heading: 'Strategy for leaders who need traction, not theory', subheading: 'Northline Advisory helps teams diagnose bottlenecks, make sharper decisions, and execute with more discipline.', ctaText: 'Explore services', ctaUrl: '__LINK:services__', bgColor: '#1e293b', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Consulting strategy meeting', caption: '' }),
          blk('features', { heading: 'How clients use us', items: [
            { icon: '📈', title: 'Growth strategy', desc: 'Clarify where growth is actually coming from and what is slowing it down.' },
            { icon: '🛠️', title: 'Operating system cleanup', desc: 'Simplify decision-making, meetings, ownership, and reporting rhythms.' },
            { icon: '🤝', title: 'Executive advisory', desc: 'A steady outside voice for high-stakes calls and team alignment.' },
          ] }),
        ],
      },
      {
        role: 'about', slugSuffix: 'about', title: 'About', navLabel: 'About',
        metaDescription: 'The origin story and philosophy behind Northline Advisory.',
        imageQuery: 'executive consultant office',
        build: (heroImg) => [
          blk('hero', { heading: 'Built by operators who care about follow-through', subheading: '', bgColor: '#334155', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Our story', body: 'Northline Advisory was built after years of watching leadership teams leave offsites with impressive slide decks and no real operating rhythm to support them. Our work starts where most strategy projects stop: with the practical systems and ownership needed to make the plan move.' }),
          blk('image', { url: heroImg, alt: 'Executive consultant in office', caption: '' }),
          blk('text', { heading: 'How we work', body: 'We keep the work small enough to be actionable and sharp enough to matter. That means fewer recommendations, tighter ownership, and clearer checkpoints.' }),
        ],
      },
      {
        role: 'services', slugSuffix: 'services', title: 'Services', navLabel: 'Services',
        metaDescription: 'Northline Advisory services for strategy, executive support, and operating rhythm design.',
        imageQuery: 'business workshop presentation team',
        build: (heroImg) => [
          blk('hero', { heading: 'Three ways we usually engage', subheading: '', bgColor: '#1e293b', textColor: '#ffffff', align: 'center' }),
          blk('features', { heading: 'Engagement options', items: [
            { icon: '🧭', title: 'Strategy sprint', desc: 'A short, focused engagement to define priorities, risks, and the next 90 days.' },
            { icon: '📅', title: 'Operating rhythm rebuild', desc: 'Meetings, dashboards, ownership, and cadence redesigned around execution.' },
            { icon: '🎯', title: 'Advisory retainer', desc: 'Monthly decision support for leaders navigating growth, change, or uncertainty.' },
          ] }),
          blk('image', { url: heroImg, alt: 'Business workshop presentation', caption: '' }),
        ],
      },
      {
        role: 'portfolio', slugSuffix: 'case-studies', title: 'Case Studies', navLabel: 'Case Studies',
        metaDescription: 'Selected client outcomes and project examples from Northline Advisory.',
        build: () => [
          blk('hero', { heading: 'A few of the problems we have helped untangle', subheading: '', bgColor: '#334155', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'B2B services team', body: 'Clarified ownership across sales and delivery, reducing handoff delays and improving forecast accuracy in six weeks.' }),
          blk('text', { heading: 'Consumer startup', body: 'Reworked the founder reporting rhythm and leadership cadence so the team could prioritize fewer experiments more decisively.' }),
          blk('text', { heading: 'Professional services firm', body: 'Redesigned operating reviews and client delivery checkpoints, leading to faster escalation and fewer last-minute fires.' }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact', navLabel: 'Contact',
        metaDescription: 'Contact Northline Advisory about a discovery call or consulting engagement.',
        build: () => [
          blk('hero', { heading: 'If the problem is clear, we can probably help', subheading: 'Tell us what is stuck, what is changing, or what decision the team keeps circling.', bgColor: '#1e293b', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Reach out', body: 'Email: hello@northlineadvisory.example\nDiscovery calls available Tue–Thu' }),
        ],
      },
    ],
  },
  {
    category: 'Creative Portfolio & Agency',
    name: 'Signal House — Full Creative Site',
    description: 'A 5-page agency site: home, studio story, services, selected work, and contact.',
    pages: [
      {
        role: 'home', slugSuffix: '', title: 'Signal House', navLabel: 'Home',
        metaDescription: 'Signal House — brand, web, and launch creative for modern teams.',
        imageQuery: 'creative agency design studio team',
        build: (heroImg) => [
          blk('hero', { heading: 'Creative work that ships with the launch, not after it', subheading: 'Signal House helps teams shape brands, websites, and campaigns with enough strategy behind the visuals to make them stick.', ctaText: 'See the work', ctaUrl: '__LINK:portfolio__', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('image', { url: heroImg, alt: 'Creative agency studio', caption: '' }),
          blk('features', { heading: 'What we build', items: [
            { icon: '🎨', title: 'Brand systems', desc: 'Identity, messaging, and rollout support for brands that need more than a logo.' },
            { icon: '💻', title: 'Web launches', desc: 'Design and content systems that move from concept to live site cleanly.' },
            { icon: '📸', title: 'Campaign assets', desc: 'Photography, motion, and launch collateral that match the strategy.' },
          ] }),
        ],
      },
      {
        role: 'about', slugSuffix: 'studio', title: 'Studio Story', navLabel: 'Studio',
        metaDescription: 'The studio philosophy and team behind Signal House.',
        imageQuery: 'design team brainstorming studio',
        build: (heroImg) => [
          blk('hero', { heading: 'A small studio by design', subheading: '', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Why small matters', body: 'Signal House stays intentionally lean so strategy, design, and delivery stay close together. The same people shaping the brief are involved when the work ships, which keeps decisions tighter and launches calmer.' }),
          blk('image', { url: heroImg, alt: 'Design team brainstorming', caption: '' }),
          blk('text', { heading: 'What clients can expect', body: 'Clear recommendations, fewer rounds of drift, and a creative process that respects launch deadlines instead of ignoring them.' }),
        ],
      },
      {
        role: 'services', slugSuffix: 'services', title: 'Services', navLabel: 'Services',
        metaDescription: 'Signal House services for brand design, websites, and launch campaigns.',
        imageQuery: 'website design review presentation',
        build: (heroImg) => [
          blk('hero', { heading: 'Where we usually help most', subheading: '', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('features', { heading: 'Core services', items: [
            { icon: '✍️', title: 'Brand refreshes', desc: 'Sharper positioning, updated visual systems, and launch support for the rollout.' },
            { icon: '🖥️', title: 'Marketing sites', desc: 'Page systems that balance storytelling, proof, and conversion.' },
            { icon: '🚀', title: 'Launch campaigns', desc: 'Creative direction plus the asset package to support the release.' },
          ] }),
          blk('image', { url: heroImg, alt: 'Website design review', caption: '' }),
        ],
      },
      {
        role: 'portfolio', slugSuffix: 'work', title: 'Selected Work', navLabel: 'Work',
        metaDescription: 'Selected projects and outcomes from Signal House.',
        build: () => [
          blk('hero', { heading: 'Selected work', subheading: '', bgColor: '#0f172a', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'B2B SaaS relaunch', body: 'Reframed the homepage, updated the visual system, and launched a clearer proof narrative for sales conversations.' }),
          blk('text', { heading: 'Retail seasonal launch', body: 'Built a light campaign system, product storytelling, and asset kit for a timed collection drop.' }),
          blk('text', { heading: 'Founder-led advisory brand', body: 'Created the identity, site system, and launch kit for a new consulting offer.' }),
        ],
      },
      {
        role: 'contact', slugSuffix: 'contact', title: 'Contact', navLabel: 'Contact',
        metaDescription: 'Contact Signal House about a creative project or launch.',
        build: () => [
          blk('hero', { heading: 'If you have the brief, we can shape the next step', subheading: 'Tell us what is launching, what is changing, or what the current brand is failing to communicate.', bgColor: '#111827', textColor: '#ffffff', align: 'center' }),
          blk('text', { heading: 'Email the studio', body: 'hello@signalhouse.example\nReplies typically within one business day.' }),
        ],
      },
    ],
  },
];

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let sitesInserted = 0, sitesSkipped = 0, pagesInserted = 0;

  for (const [siteIdx, site] of SITES.entries()) {
    const { rows: existing } = await pool.query(`SELECT id, thumbnail_url FROM site_templates WHERE name = $1`, [site.name]);
    const thumbnailQuery = site.pages.find((p) => p.imageQuery)?.imageQuery;
    let thumbnailUrl = '';
    if (thumbnailQuery) {
      console.log(`Preparing thumbnail for "${site.name}" ("${thumbnailQuery}")...`);
      thumbnailUrl = await img(thumbnailQuery);
    }
    if (existing.length) {
      await pool.query(
        `UPDATE site_templates
         SET category = $1,
             description = $2,
             thumbnail_url = COALESCE(NULLIF(thumbnail_url, ''), $3),
             sort_order = $4,
             updated_at = now()
         WHERE id = $5`,
        [site.category, site.description, thumbnailUrl || null, siteIdx, existing[0].id]
      );
      console.log(`Skipping site "${site.name}" (already seeded)`);
      sitesSkipped += 1;
      continue;
    }

    // Resolve link placeholders (__LINK:role__) to nav_label-based hrefs once all
    // slug_suffixes are known, so cross-page CTAs point at the right page.
    const slugByRole = {};
    for (const p of site.pages) slugByRole[p.role] = p.slugSuffix;

    console.log(`\nBuilding site "${site.name}" (${site.pages.length} pages)...`);
    const { rows: siteRows } = await pool.query(
      `INSERT INTO site_templates (category, name, description, thumbnail_url, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [site.category, site.name, site.description, thumbnailUrl || null, siteIdx]
    );
    const siteTemplateId = siteRows[0].id;

    for (const [pageIdx, p] of site.pages.entries()) {
      let heroImg = '';
      if (p.imageQuery) {
        console.log(`  Fetching image for "${p.title}" ("${p.imageQuery}")...`);
        heroImg = await img(p.imageQuery);
      }
      let blocks = p.build(heroImg);
      // Resolve __LINK:role__ placeholders to relative page-role markers; the
      // real /p/<slug> href is filled in at use-time (useSiteTemplate), since
      // the final slug depends on the org's chosen site name. Store as a
      // simple {{role}} token the frontend/backend both understand: here we
      // just leave a same-site relative anchor the use-flow rewrites.
      blocks = JSON.parse(
        JSON.stringify(blocks).replace(/__LINK:([a-z]+)__/g, (_, role) => `{{page:${role}}}`)
      );
      await pool.query(
        `INSERT INTO site_template_pages (site_template_id, page_role, slug_suffix, title, nav_label, meta_description, blocks, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [siteTemplateId, p.role, p.slugSuffix, p.title, p.navLabel, p.metaDescription || null, JSON.stringify(blocks), pageIdx]
      );
      pagesInserted += 1;
      console.log(`  ✓ "${p.title}" (${p.role})`);
    }
    sitesInserted += 1;
  }

  console.log(`\nDone. Sites inserted: ${sitesInserted}, skipped: ${sitesSkipped}, pages inserted: ${pagesInserted}.`);
  await pool.end();
})().catch((err) => { console.error(err); process.exit(1); });
