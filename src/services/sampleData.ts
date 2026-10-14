import type { HealthTip } from '../types/tip';

export const INITIAL_SAMPLE_TIPS: HealthTip[] = [
  {
    id: 'tip-101',
    title: 'Prioritizing 20–30 Minutes of Morning Natural Light to Anchor Circadian Rhythms',
    content: 'Stepping outside into natural daylight within 60 minutes of waking helps synchronize the suprachiasmatic nucleus—the master circadian clock in the brain. Even on cloudy days, outdoor light intensity (typically 1,000 to 10,000+ lux) significantly exceeds typical indoor office lighting (100–500 lux). This suppresses residual melatonin and initiates a healthy cortisol awakening response, promoting daytime alertness and easier sleep onset at night.',
    summary: 'Outdoor natural daylight within an hour of waking stabilizes daytime alertness and reinforces your natural evening sleep drive.',
    category: 'sleep',
    region: 'Global / Indoor Workers',
    submittedBy: 'Dr. Elena S. (Community Contributor)',
    submittedAt: '2025-05-12T08:30:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-05-12T14:15:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Extensive peer-reviewed circadian biology and public sleep hygiene reviews corroborate that early daylight exposure regulates melanopsin retinal ganglion cells and melatonin timing. The tip accurately distinguishes between indoor and outdoor lux levels without making clinical sleep disorder claims.',
      sourcesConsulted: [
        {
          title: 'Light and Circadian Rhythms: Sleep Medicine Clinics Consensus',
          organization: 'National Center for Biotechnology Information (NCBI)',
          url: 'https://ncbi.nlm.nih.gov/pmc/articles/PMC6751071/',
          year: '2019',
          excerpt: 'Morning light exposure advances sleep phase, enhances daytime wakefulness, and promotes nocturnal melatonin secretion.'
        },
        {
          title: 'Healthy Sleep Practices and Environmental Lighting',
          organization: 'Centers for Disease Control and Prevention (CDC)',
          url: 'https://www.cdc.gov/sleep/about/index.html',
          year: '2024',
          excerpt: 'Natural light exposure during morning hours reinforces regular sleep-wake schedules for adolescents and adults.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x7b...9a12 (Integration Planned)'
    }
  },
  {
    id: 'tip-102',
    title: 'The 20-20-20 Eye Rest Rule for Mitigating Digital Screen Strain',
    content: 'When working on screens or reading close-up text for extended periods, pause every 20 minutes to gaze at an object at least 20 feet (about 6 meters) away for 20 seconds. Focusing at distance relaxes the ciliary muscles within the eye and prompts involuntary blink reflexes that replenish the precorneal tear film, reducing ocular dryness and fatigue.',
    summary: 'Rest eye ciliary muscles and replenish tear film by looking 20 feet away for 20 seconds every 20 minutes of screen work.',
    category: 'general',
    region: 'Global',
    submittedBy: 'Kofi A. (Ergonomics Volunteer)',
    submittedAt: '2025-05-18T10:00:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-05-18T16:40:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Widely endorsed by ophthalmology academies and occupational health guidelines as an effective, zero-risk preventive ergonomic habit for digital eye fatigue. Does not claim to cure refractive errors.',
      sourcesConsulted: [
        {
          title: 'Computers, Digital Devices and Eye Strain: Clinical Guidance',
          organization: 'American Academy of Ophthalmology',
          url: 'https://www.aao.org/eye-health/tips-prevention/computer-usage',
          year: '2023',
          excerpt: 'Taking a 20-second break to view something 20 feet away allows ciliary muscles to relax, diminishing fatigue.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x3f...e841 (Integration Planned)'
    }
  },
  {
    id: 'tip-103',
    title: 'Consuming 1 Tablespoon of Raw Apple Cider Vinegar Before Meals Cures Diabetes',
    content: 'Drinking unfiltered apple cider vinegar every morning before eating permanently stabilizes insulin, eliminates the need for diabetic medication, and flushes toxins from the pancreas within 14 days.',
    summary: 'Claim that apple cider vinegar cures diabetes and replaces medical treatments.',
    category: 'nutrition',
    region: 'North America',
    submittedBy: 'HealthVoyager (Community Member)',
    submittedAt: '2025-06-01T11:20:00Z',
    isSampleData: true,
    status: 'evidence-inconsistent',
    review: {
      status: 'evidence-inconsistent',
      reviewedAt: '2025-06-01T17:00:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Public health consensus from major diabetes associations categorically rejects claims that vinegar can cure diabetes or replace prescribed care. While modest studies suggest mild postprandial glucose blunting from acetic acid, claiming curative outcomes or stopping medication creates immediate clinical harm.',
      sourcesConsulted: [
        {
          title: 'Standards of Medical Care in Diabetes: Lifestyle Management & Nutritional Therapy',
          organization: 'American Diabetes Association (ADA)',
          url: 'https://diabetesjournals.org/care',
          year: '2024',
          excerpt: 'No dietary supplement or single food product has been proven to reverse or cure diabetes mellitus. Discontinuing prescribed insulin or oral agents is hazardous.'
        },
        {
          title: 'Mythbusters: Diabetes and Dietary Superfoods',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
          year: '2023',
          excerpt: 'Effective diabetes management requires sustained nutritional patterns, physical activity, and regulated medical care under professional supervision.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x11...09bc (Integration Planned)'
    }
  },
  {
    id: 'tip-104',
    title: 'Daily Post-Meal 10-Minute Gentle Walks for Glycemic Modulation',
    content: 'Engaging in a light 10 to 15-minute stroll shortly after breakfast, lunch, or dinner prompts skeletal muscle contractions to uptake circulating blood glucose independently of peak insulin surges. This attenuates sharp postprandial glucose spikes without requiring strenuous exertion or specialized equipment.',
    summary: 'A short 10-minute walk after meals prompts skeletal muscles to uptake circulating glucose, softening post-meal energy slumps.',
    category: 'physical-activity',
    region: 'Global',
    submittedBy: 'Mateo R. (Community Health Educator)',
    submittedAt: '2025-06-04T14:10:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-06-04T19:30:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Systematic reviews and randomized cross-over trials in sports medicine confirm that brief postprandial walking modulates insulin sensitivity and blunts glycemic excursions across healthy and prediabetic cohorts.',
      sourcesConsulted: [
        {
          title: 'The Effects of Postprandial Exercise on Glucose Regulation: A Meta-Analysis',
          organization: 'Sports Medicine Journal',
          url: 'https://pubmed.ncbi.nlm.nih.gov/35147874/',
          year: '2022',
          excerpt: 'Short bouts of light-intensity physical activity performed shortly after eating produce significant attenuations in glucose curves.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x82...334a (Integration Planned)'
    }
  },
  {
    id: 'tip-105',
    title: 'Drinking 4 Liters of Cold Water Daily Guarantees 5kg Weight Loss per Month',
    content: 'Drinking exactly 4 liters of iced water forces the human stomach to burn over 600 calories per day purely through thermogenesis, resulting in automatic weight reduction without changing any other daily habits.',
    summary: 'Claim that cold water drinking burns 600 kcal/day and guarantees weight reduction.',
    category: 'nutrition',
    region: 'Global',
    submittedBy: 'Anonymous User',
    submittedAt: '2025-06-05T09:15:00Z',
    isSampleData: true,
    status: 'under-challenge',
    review: {
      status: 'under-challenge',
      reviewedAt: '2025-06-05T12:00:00Z',
      evaluator: 'GenLayer Consensus Protocol (Under Dispute Review)',
      reasoning: 'Initial automated check flagged physiological inconsistencies: warming water from 4°C to 37°C requires approximately 33 calories per liter (less than 130 kcal total for 4 liters), far below the 600 kcal claimed. Additionally, excessive rapid water ingestion risks hyponatremia. Community challenge submitted with peer-reviewed thermodynamic calculations.',
      sourcesConsulted: [
        {
          title: 'Water-Induced Thermogenesis: Clinical Re-evaluation',
          organization: 'The Journal of Clinical Endocrinology & Metabolism',
          url: 'https://academic.oup.com/jcem/article/88/12/6015/2661518',
          year: '2020',
          excerpt: 'The energetic cost of warming ingested cold fluid accounts for minimal energy expenditure and cannot cause clinically significant fat loss.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x9c...77de (Challenge Recorded)'
    },
    challenges: [
      {
        id: 'chal-01',
        tipId: 'tip-105',
        createdAt: '2025-06-06T15:20:00Z',
        challengerName: 'Nadia K. (Clinical Biochemist)',
        reason: 'The caloric expenditure of water warming is vastly overstated (only ~130 kcal for 4L, not 600 kcal). Excessive compulsory hydration without electrolyte balance also carries risk of dilutional hyponatremia.',
        evidenceUrl: 'https://academic.oup.com/jcem/article/88/12/6015/2661518',
        status: 'under-review'
      }
    ]
  },
  {
    id: 'tip-106',
    title: 'Handwashing with Ordinary Soap and Running Water for at least 20 Seconds',
    content: 'Washing hands with clean running water and standard soap for a minimum of 20 seconds mechanically loosens and rinses away dirt, grease, and pathogenic microorganisms. The amphiphilic nature of soap molecules disrupts the lipid membranes of enveloped viruses and separates bacteria from skin crevices. Vigorous friction across palms, between fingers, and under nails is the critical mechanical factor.',
    summary: 'Thorough 20-second hand scrubbing with plain soap and running water disrupts pathogen lipid coats and lifts microbes.',
    category: 'hygiene',
    region: 'Global',
    submittedBy: 'Nurse Maya P. (Public Health Advocate)',
    submittedAt: '2025-06-08T07:45:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-06-08T11:20:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Fully supported by WHO, CDC, and global epidemiology benchmarks. Plain soap with adequate friction and duration is universally validated as one of the most cost-effective public health interventions.',
      sourcesConsulted: [
        {
          title: 'WHO Guidelines on Hand Hygiene in Health Care',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/campaigns/world-hand-hygiene-day',
          year: '2023',
          excerpt: 'Hand hygiene with soap and water performed for 20-30 seconds substantially reduces respiratory and diarrheal illness transmission.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x4a...221f (Integration Planned)'
    }
  },
  {
    id: 'tip-107',
    title: 'The "Box Breathing" Technique (4-4-4-4) for Acute Stress Downregulation',
    content: 'Box breathing involves inhaling for a count of 4, holding for 4, exhaling slowly for 4, and holding the lungs empty for 4. Practicing this cycle for 3–5 minutes activates the vagus nerve, increases heart rate variability (HRV), and promotes parasympathetic nervous system dominance during moments of acute cognitive overwhelm or autonomic arousal.',
    summary: 'Equal-cadence box breathing (4-4-4-4) engages vagal tone and parasympathetic recovery during acute stress surges.',
    category: 'mental-wellbeing',
    region: 'Global',
    submittedBy: 'Tara L. (Wellness Facilitator)',
    submittedAt: '2025-06-09T16:00:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-06-09T20:10:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Paced respiration with prolonged exhalation is validated in neurophysiology literature for lowering salivary cortisol and modulating autonomic balance. Framed as acute stress management rather than a treatment for clinical panic or mood disorders.',
      sourcesConsulted: [
        {
          title: 'Brief Structured Respiration Practices Enhance Mood and Reduce Physiological Arousal',
          organization: 'Cell Reports Medicine',
          url: 'https://doi.org/10.1016/j.xcrm.2022.100895',
          year: '2023',
          excerpt: 'Cyclic breathwork and controlled retention exercise positive influence on heart rate variability, anxiety, and autonomic regulation.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x66...118d (Integration Planned)'
    }
  },
  {
    id: 'tip-108',
    title: 'High-Dose Oral Melatonin Supplements Taken Nightly Prevent Brain Aging',
    content: 'Taking 20mg to 50mg of synthetic melatonin every night before bed permanently protects brain neurons from neurodegeneration and guarantees continuous REM sleep cycles.',
    summary: 'Claim that supra-physiological doses of melatonin prevent neurodegeneration and guarantee REM sleep.',
    category: 'sleep',
    region: 'North America / Europe',
    submittedBy: 'BioOptimist (Forum User)',
    submittedAt: '2025-06-10T19:30:00Z',
    isSampleData: true,
    status: 'undetermined',
    review: {
      status: 'undetermined',
      reviewedAt: '2025-06-11T09:00:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'While melatonin has recognized antioxidant properties in cellular studies, human clinical evidence at 20-50mg daily doses lacks long-term safety data, risks circadian desynchronization, and has no validated prophylactic consensus for dementia. The evidence consensus is therefore undetermined / insufficient.',
      sourcesConsulted: [
        {
          title: 'Melatonin for Sleep Disorders: What You Need to Know',
          organization: 'National Center for Complementary and Integrative Health (NIH)',
          url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know',
          year: '2023',
          excerpt: 'Evidence for very high doses of melatonin is inconclusive, and long-term regulatory effects on endogenous hormone production require further study.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x55...390e (Integration Planned)'
    }
  },
  {
    id: 'tip-109',
    title: 'Replacing Sugary Beverages with Herbal Tea or Infused Lemon Water',
    content: 'Replacing sugar-sweetened sodas and fruit punches with unsweetened herbal infusions or water infused with citrus slices reduces daily refined free sugar consumption without requiring drastic dietary overhauls. A standard 330ml soda contains approximately 35 grams of free sugars—exceeding the daily recommendation for most adults.',
    summary: 'Swapping sugary sodas for infused water or herbal tea significantly cuts free sugars while sustaining daily hydration.',
    category: 'nutrition',
    region: 'Global',
    submittedBy: 'Liam C. (Community Dietitian)',
    submittedAt: '2025-06-12T13:00:00Z',
    isSampleData: true,
    status: 'evidence-consistent',
    review: {
      status: 'evidence-consistent',
      reviewedAt: '2025-06-12T17:45:00Z',
      evaluator: 'GenLayer Consensus Protocol (Pre-deployment Benchmark Model)',
      reasoning: 'Aligned with WHO Guideline on Free Sugars Intake for Adults and Children (2015), which strongly recommends reducing free sugar intake below 10% of total energy consumption to curb dental caries and cardiometabolic risk.',
      sourcesConsulted: [
        {
          title: 'Guideline: Sugars Intake for Adults and Children',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/publications/i/item/9789241549028',
          year: '2015',
          excerpt: 'Reducing intake of free sugars throughout the lifecourse reduces the risk of noncommunicable diseases and dental caries.'
        }
      ],
      contractTransactionRef: 'Simulated Contract State: genlayer_testnet_0x71...54c2 (Integration Planned)'
    }
  },
  {
    id: 'tip-110',
    title: 'Weekly 15-Minute Ergonomic Desk and Chair Adjustment Audit',
    content: 'Taking 15 minutes weekly to inspect seated posture—ensuring elbows rest at roughly 90 to 100 degrees, eyes align with the top third of computer monitors, and knees bend at approximately 90 degrees with feet flat on the floor or footrest—prevents repetitive musculoskeletal strain and postural fatigue.',
    summary: 'A weekly check of monitor height, elbow angle, and flat foot support prevents chronic work-station musculoskeletal fatigue.',
    category: 'physical-activity',
    region: 'Global',
    submittedBy: 'Amina D. (Occupational Ergonomics Fellow)',
    submittedAt: '2025-06-13T11:00:00Z',
    isSampleData: true,
    status: 'pending',
    review: undefined // Pending review!
  }
];
