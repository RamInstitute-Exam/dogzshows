export const MOCK_EVENTS = [
  { 
    id: 1, 
    slug: 'national-speciality-show-2026',
    name: 'National Specialty Show', 
    date: 'Oct 15, 2026', 
    location: 'Mumbai, IN', 
    venue: 'Jio World Convention Centre',
    type: 'FCI CACIB', 
    status: 'Registration Open', 
    bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    club: 'Kennel Club of India (KCI)',
    judgeCount: 5,
    entryFee: '₹2,500',
    closingDate: 'Sep 30, 2026',
    availableSlots: 120,
    prizePool: '₹5,00,000'
  },
  { 
    id: 2, 
    slug: 'winter-classic-championship-2026',
    name: 'Winter Classic Championship', 
    date: 'Dec 02, 2026', 
    location: 'Delhi, IN', 
    venue: 'Pragati Maidan',
    type: 'National', 
    status: 'Upcoming', 
    bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    club: 'Delhi Kennel Club',
    judgeCount: 3,
    entryFee: '₹1,500',
    closingDate: 'Nov 15, 2026',
    availableSlots: 200,
    prizePool: '₹2,50,000'
  },
  { 
    id: 3, 
    slug: 'golden-retriever-specialty-2027',
    name: 'Golden Retriever Specialty', 
    date: 'Jan 20, 2027', 
    location: 'Bangalore, IN', 
    venue: 'BIEC Ground',
    type: 'Breed Specialty', 
    status: 'Draft', 
    bg: 'bg-gradient-to-br from-pink-500 to-red-500',
    club: 'Golden Retriever Club of India',
    judgeCount: 2,
    entryFee: '₹3,000',
    closingDate: 'Jan 05, 2027',
    availableSlots: 50,
    prizePool: '₹1,00,000'
  },
];

export const MOCK_EVENT_DETAIL = {
  ...MOCK_EVENTS[0],
  expectedDogs: '450+',
  about: "The National Specialty Show is the premier event of the year, bringing together the finest purebred dogs from across the country to compete for the ultimate 'Best in Show' title under esteemed international FCI judges. Our objective is to promote responsible breeding and elevate the standard of dog shows in India.",
  rules: [
    "All participating dogs must be registered with the KCI.",
    "Dogs must have up-to-date vaccination records including Anti-Rabies.",
    "Aggressive dogs will be immediately disqualified and asked to leave the premises.",
    "Females in heat are strictly not allowed."
  ],
  timeline: [
    { time: '08:00 AM', title: 'Gates Open & Vet Check', description: 'All dogs must undergo mandatory veterinary inspection before entering the show rings.' },
    { time: '09:30 AM', title: 'Opening Ceremony', description: 'Welcome address by the Club President and introduction of International Judges.' },
    { time: '10:00 AM', title: 'Breed Judging Begins', description: 'Simultaneous judging across all 5 rings for different FCI groups.' },
    { time: '01:00 PM', title: 'Lunch Break', description: 'Catered lunch available at the food pavilion.' },
    { time: '02:00 PM', title: 'Group Competitions', description: 'Best of Breed winners compete for Best in Group.' },
    { time: '05:00 PM', title: 'Best in Show Lineup', description: 'The grand finale where Group winners compete for the ultimate title.' },
    { time: '06:30 PM', title: 'Prize Distribution', description: 'Trophies, certificates, and prize money distribution.' }
  ],
  judges: [
    { id: 1, name: 'Dr. Robert Harrison', country: 'UK', experience: '25 Years', groups: 'Groups 1, 2, 8', image: '/images/judge_1_1781314873936.png' },
    { id: 2, name: 'Elena Rodriguez', country: 'Spain', experience: '15 Years', groups: 'Groups 3, 5', image: '/images/judge_2_retry_1781314965487.png' },
    { id: 3, name: 'James Peterson', country: 'USA', experience: '30 Years', groups: 'All Breeds', image: '/images/judge_3_1781314897888.png' },
    { id: 4, name: 'Marco Rossi', country: 'Italy', experience: '20 Years', groups: 'Groups 4, 6', image: '/images/judge_4_1781314908793.png' },
    { id: 5, name: 'Yuki Tanaka', country: 'Japan', experience: '18 Years', groups: 'Groups 5, 9', image: '/images/judge_5_1781314918866.png' },
    { id: 6, name: 'Klaus Weber', country: 'Germany', experience: '35 Years', groups: 'Groups 2, 7', image: '/images/judge_6_1781314930133.png' },
  ],
  ageClasses: [
    { name: 'Minor Puppy', age: '3 to 6 Months', desc: 'For puppies beginning their show career.' },
    { name: 'Puppy', age: '6 to 9 Months', desc: 'For developing puppies.' },
    { name: 'Junior', age: '9 to 18 Months', desc: 'For young adult dogs.' },
    { name: 'Intermediate', age: '15 to 24 Months', desc: 'For dogs bridging into adulthood.' },
    { name: 'Open', age: '15 Months+', desc: 'Open to all dogs of the breed.' },
    { name: 'Champion', age: '15 Months+', desc: 'Only for dogs who have already earned a Champion title.' },
    { name: 'Veteran', age: '8 Years+', desc: 'Honoring senior dogs.' },
  ],
  faqs: [
    { question: 'What documents do I need to carry?', answer: 'You must carry your dog\'s original KCI Registration Certificate, updated Vaccination Booklet (specifically Anti-Rabies), and a valid ID proof of the owner/handler.' },
    { question: 'Is parking available at the venue?', answer: 'Yes, VIP and General parking are available. We recommend arriving early as parking is on a first-come, first-served basis.' },
    { question: 'Can I bring my dog if it is not participating?', answer: 'No, only registered dogs are allowed inside the show premises to ensure safety and prevent overcrowding.' },
    { question: 'What is the refund policy?', answer: 'Entry fees are non-refundable under any circumstances, including absence of the dog or handler on the day of the show.' }
  ]
};
