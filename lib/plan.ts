export const plan = {
  slug: 'dreamworks365',
  client: 'Keon',
  business: 'Dreamworks365 The Deep Reset',
  shortName: 'The Deep Reset',
  consultant: 'Danielle',
  firm: 'ÉLEVÉ Business Partners',
  tagline: 'Strategy, Operations & Automation',
  engagement: 'Customer Operations Setup · Pilot',
  window: 'Nov 9 – Dec 18, 2026',
  startDate: '2026-11-09',
  endDate: '2026-12-18',
  preparedOn: 'November 2, 2026',
  reviewDate: 'Friday, December 18',
}

export const discovery = {
  date: 'November 1',
  priorities: [
    {
      title: 'Monetization',
      body: 'Know what each program actually earns after delivery costs, so you push the right packages into January.',
    },
    {
      title: 'Lead generation',
      body: 'Capture every interested person from every channel in one place, with a reply inside 24 hours.',
    },
    {
      title: 'Systems',
      body: 'Turn payments into smooth starts and keep participants supported, without you doing it all by hand.',
    },
  ],
}

export const outcomes = [
  'Anyone with a health concern gets a personal reply from you the same day.',
  'Every payment turns into a smooth start: waiver signed, intake done, order shipped.',
  'No interested person waits more than 24 hours for a reply.',
  'Participants who go quiet are noticed within 2 days.',
  'You know what each program earns before pushing more sales.',
  'You are ready for the January rush.',
]

export type Milestone = {
  key: string
  week: string
  due: string
  dueDate: string
  title: string
  summary: string
  deliverables: string[]
}

export const milestones: Milestone[] = [
  {
    key: 'milestone:foundations',
    week: 'Week 1',
    due: 'Nov 13',
    dueDate: '2026-11-13',
    title: 'Foundations',
    summary: 'We get set up, measure where things stand today, and find where people drop off.',
    deliverables: [
      'Access to your tools shared and confirmed',
      'Cost per program filled in together',
      'Baseline numbers recorded before anything changes',
      'The biggest drop-off point in your customer journey identified',
    ],
  },
  {
    key: 'milestone:capture-onboarding',
    week: 'Weeks 2 – 3',
    due: 'Nov 27',
    dueDate: '2026-11-27',
    title: 'Capture & onboarding',
    summary: 'Every lead lands in one place, and every payment starts onboarding on its own.',
    deliverables: [
      'Website fixes so the path to purchase is clear',
      'Automatic lead capture from every channel',
      'Payment-to-onboarding flow: waiver, intake and shipping kick off after purchase',
      'A full test purchase, start to finish',
      'Profit picture for each program',
    ],
  },
  {
    key: 'milestone:follow-up-visibility',
    week: 'Weeks 4 – 5',
    due: 'Dec 11',
    dueDate: '2026-12-11',
    title: 'Follow-up & visibility',
    summary: 'Follow-ups and check-ins run on time, and you can see everything in one view.',
    deliverables: [
      'Follow-ups for new leads and stalled assessments',
      'Participant check-ins, with quiet participants flagged',
      'One view of every person and where they are',
      'A short morning briefing of what needs you today',
    ],
  },
  {
    key: 'milestone:test-handover',
    week: 'Week 6',
    due: 'Dec 18',
    dueDate: '2026-12-18',
    title: 'Test & hand over',
    summary: 'We test with a small group, hand everything over, and review results together.',
    deliverables: [
      'Small-group test with real participants',
      'Owner’s guides so you can run and adjust everything yourself',
      'Pilot review: results against the baseline and next steps',
    ],
  },
]

export const journey = [
  'New lead',
  'Assessment started',
  'Assessment done',
  'Call booked',
  'Paid',
  'Onboarding',
  'In reset',
  'Paused',
  'Finished',
]

export const measures = [
  { measure: 'Admin hours per week on tasks the pilot changes', source: 'Your estimate for a normal week' },
  { measure: 'Paid customers needing manual onboarding help', source: 'Last 30 days' },
  { measure: 'Time from payment to completed onboarding', source: 'Median, last 30 days' },
  { measure: 'Assessment completion', source: 'Started vs. finished' },
  { measure: 'Post-purchase intake completion', source: 'Started vs. finished' },
  { measure: 'Program completion', source: 'We’ll confirm how it’s counted', known: 'about 70%' },
]

export const programs = [
  { name: '21-day Starter', price: '$350', note: 'One guided cycle' },
  { name: '60-day Deep Reset', price: '$599', note: 'Recommended · two cycles plus maintenance' },
  {
    name: 'Transformation',
    price: 'from $799',
    note: 'Includes up to $300 in partner services',
    known: { 'Partner services': 'Up to $300' } as Record<string, string>,
  },
  { name: 'Reset for Two', price: '$950', note: 'Two participants' },
]

export const costColumns = ['Product + packaging', 'Shipping + fees', 'Partner services', 'Your hours']

export type Need = { key: string; item: string; detail: string; due: string; dueDate: string }

export const needs: Need[] = [
  {
    key: 'need:admin-access',
    item: 'Admin access',
    detail: 'HubSpot, Stripe, Calendly, your Lovable app and your website editor.',
    due: 'Nov 9',
    dueDate: '2026-11-09',
  },
  {
    key: 'need:lead-channels',
    item: 'Lead channels & dates',
    detail: 'Every place people find you, plus upcoming events or speaking dates.',
    due: 'Nov 13',
    dueDate: '2026-11-13',
  },
  {
    key: 'need:program-costs',
    item: 'Cost per program',
    detail: 'What each program costs you to deliver. We’ll fill in the table together.',
    due: 'Nov 13',
    dueDate: '2026-11-13',
  },
  {
    key: 'need:message-approvals',
    item: 'Message approvals',
    detail: 'Your OK on the welcome, waiver and reminder messages, in your voice.',
    due: 'Nov 20',
    dueDate: '2026-11-20',
  },
  {
    key: 'need:care-rules',
    item: 'Customer care rules',
    detail: 'When to reply, when to escalate, and what always comes straight to you.',
    due: 'Nov 20',
    dueDate: '2026-11-20',
  },
]

export const principles = [
  {
    title: 'You approve every message',
    body: 'Drafts are prepared for you. Nothing is sent, charged or changed without your say-so.',
  },
  {
    title: 'Health is always personal',
    body: 'Health questions, eligibility and protocols always come to you directly, flagged first.',
  },
  {
    title: 'Your data stays yours',
    body: 'Everything is built in your own accounts. Customer details are kept private and to a minimum.',
  },
  {
    title: 'Measured, not guessed',
    body: 'We record a baseline in week 1 and compare against it, so results are real numbers.',
  },
]

export const milestoneStatuses = ['not_started', 'in_progress', 'done'] as const
export const needStatuses = ['open', 'done'] as const
export type MilestoneStatus = (typeof milestoneStatuses)[number]
export type NeedStatus = (typeof needStatuses)[number]
