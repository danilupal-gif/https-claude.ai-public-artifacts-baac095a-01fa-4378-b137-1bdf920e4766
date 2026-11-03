export const brand = {
  name: 'ÉLEVÉ',
  fullName: 'ÉLEVÉ Business Partners',
  tagline: 'Smarter strategy. Seamless systems. More room to grow.',
  story: 'Helping business owners elevate how they operate, automate and scale.',
  positioning:
    'We help business owners simplify operations, automate everyday tasks and create a better customer experience, so you spend less time on the manual details and more time growing your business.',
  domain: 'elevebeyond.com',
  founder: 'Danielle',
}

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Approach', href: '/#approach' },
  { label: 'Services', href: '/#services' },
  { label: 'Process', href: '/#process' },
  { label: 'Fit', href: '/#fit' },
  { label: 'Results', href: '/case-studies' },
  { label: 'Contact', href: '/#contact' },
]

export const pillars = [
  {
    title: 'Simplify operations',
    body: 'Fewer tools doing more. Repeat tasks handled once, the same way, every time.',
  },
  {
    title: 'Strengthen the customer experience',
    body: 'Every inquiry answered, every purchase turned into a smooth start, nobody left waiting.',
  },
  {
    title: 'Build capacity to scale',
    body: 'Systems you understand and own, so growth adds customers instead of hours.',
  },
]

export type Service = {
  name: string
  price: string
  length: string
  summary: string
  includes: string[]
  featured?: boolean
}

export const services: Service[] = [
  {
    name: 'Business Workflow Review',
    price: '$750 – $1,500',
    length: 'About 2 weeks',
    summary: 'A clear picture of how your business runs today, and the few changes that matter most.',
    includes: [
      'Customer journey map, first inquiry to repeat purchase',
      'Review of the tools you already pay for',
      'Baseline numbers recorded before anything changes',
      'Prioritized recommendations you can act on',
    ],
  },
  {
    name: 'Customer Operations Setup',
    price: '$3,500 – $7,500',
    length: 'One journey, end to end',
    summary: 'We build one customer journey properly, test it, and hand it over with owner’s guides.',
    includes: [
      'Lead capture from every channel into one place',
      'Payment-to-onboarding flow that runs on its own',
      'Follow-ups and check-ins on schedule',
      'Owner’s guides so you can run and adjust it yourself',
    ],
    featured: true,
  },
  {
    name: 'Systems Support',
    price: '$500 – $1,500 / month',
    length: 'Ongoing',
    summary: 'Monitoring, fixes and a monthly scorecard, so what we built keeps working as you grow.',
    includes: ['Monitoring and quick fixes', 'Monthly scorecard against your baseline', 'Small improvements as needs change'],
  },
  {
    name: 'Growth Services',
    price: 'Quoted per project',
    length: 'After operations are ready',
    summary: 'Website, email and content work, once the business behind them can handle more demand.',
    includes: ['Website updates and landing pages', 'Email journeys', 'Content support'],
  },
]

export const process = [
  {
    step: 'Review',
    body: 'We map how a customer moves through your business and record where things stand today.',
  },
  {
    step: 'Build',
    body: 'We set up one journey in your own accounts, test it end to end, and you approve every message.',
  },
  {
    step: 'Hand over',
    body: 'You get owner’s guides and a review of results against the baseline. Nothing is a black box.',
  },
  {
    step: 'Support',
    body: 'Optional monthly support keeps it running, with a scorecard so you can see what changed.',
  },
]

export const consultation = {
  intro:
    'Every engagement starts with a Business Workflow Review. No jargon, no pressure, and no changes to your business until you say yes. Here is how it goes.',
  steps: [
    {
      when: 'First conversation',
      title: 'We listen',
      body: 'You walk us through how the business runs today, what takes your time and where customers get stuck.',
    },
    {
      when: 'Week 1',
      title: 'We map and measure',
      body: 'We trace one customer from first inquiry to repeat purchase, review the tools you already pay for and record your starting numbers.',
    },
    {
      when: 'Week 2',
      title: 'We show you the plan',
      body: 'You get the few changes that matter most, in priority order, with what each one saves and what it costs.',
    },
    {
      when: 'Your call',
      title: 'You decide',
      body: 'Run with the plan yourself, or have us build it. Either way, the review and the numbers are yours to keep.',
    },
  ],
  deliverables: [
    'A map of your customer journey',
    'Your baseline numbers, recorded',
    'A review of the tools you pay for',
    'Prioritized recommendations with clear costs',
    'Your own private client portal',
    'A clear yes or no on next steps',
  ],
}

export const fit = [
  'You have steady demand and paying customers',
  'You repeat the same manual tasks every week',
  'You can describe what those tasks cost you',
  'You have the time and budget to make a change',
  'You’re willing to share numbers so results can be measured',
]

export const principles = [
  { title: 'Measured, not guessed', body: 'Every engagement starts with a baseline, so results are real numbers.' },
  { title: 'You approve everything', body: 'Nothing is sent, charged or changed in your business without your say-so.' },
  { title: 'Your accounts, your data', body: 'We build inside the tools you own. You keep everything when we’re done.' },
]

export const serviceOptions = [
  'Business Workflow Review',
  'Customer Operations Setup',
  'Systems Support',
  'Growth Services',
  'Website Creation',
  'Digital Menu Design & Management',
  'Workforce Scheduling & Automation',
  'Food & Beverage Ordering Optimization',
  'Inventory Optimization & Waste Reduction',
  'Not sure yet',
] as const

export const budgetOptions = ['Under $1,500', '$1,500 – $3,500', '$3,500 – $7,500', '$7,500+', 'Not sure yet']

export const timingOptions = ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring']
