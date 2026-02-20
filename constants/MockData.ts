export type PaymentStatus = 'pending' | 'in_escrow' | 'released' | 'refunded';
export type EscrowStatus = 'unfunded' | 'in_escrow' | 'released' | 'disputed' | 'refunded';
export type CompletionStatus = 'not_started' | 'pending_confirmation' | 'confirmed';
export type DisputeStatus = 'none' | 'disputed' | 'resolved';

export interface Payment {
  id: string;
  gigId: string;
  amountCents: number;
  serviceFeeCents: number;
  netPayoutCents: number;
  status: PaymentStatus;
  paymentIntentId?: string;
  transferId?: string;
  connectedAccountId?: string;
  createdAt: string;
}

export interface Gig {
  id: string;
  collegeId: string;
  title: string;
  description: string;
  pay: string;
  location: string;
  status: 'open' | 'pending' | 'accepted' | 'completed';
  posterName: string;
  posterId: string;
  posterSchool: string;
  acceptedBy?: string;
  acceptedById?: string;
  payment?: Payment;
  paymentIntentId?: string;
  escrowStatus?: EscrowStatus;
  completionStatus?: CompletionStatus;
  disputeStatus?: DisputeStatus;
  createdAt: string;
}

/** Platform fee percentage */
export const PLATFORM_FEE_PERCENT = 10;

/** Helper: format cents to dollar string */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Check if a user is the poster of a gig */
export function isGigPoster(gig: Gig, userId: string): boolean {
  return gig.posterId === userId;
}

/** Check if a user is the worker on a gig */
export function isGigWorker(gig: Gig, userId: string): boolean {
  return gig.acceptedById === userId;
}

/** Parse a pay string like "$20/hr", "$50 flat", "$12/walk" to cents */
export function parsePayToCents(pay: string): number {
  const match = pay.match(/\$(\d+)/);
  if (!match) return 2000;
  return parseInt(match[1], 10) * 100;
}

export interface Review {
  id: string;
  gigId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  gigTitle: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'withdrawal';
  amountCents: number;
  description: string;
  gigId?: string;
  createdAt: string;
}

export type NotificationType =
  | 'gig_accepted' | 'gig_confirmed' | 'payment_submitted' | 'payment_released'
  | 'gig_completed' | 'new_gig' | 'withdrawal' | 'verification_complete' | 'id_verified'
  | 'gig_funded' | 'completion_requested' | 'completion_confirmed' | 'auto_released' | 'dispute_opened';

export type IdVerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  gigId?: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'poster' | 'worker';
  school: string;
  collegeId: string;
  emailVerified: boolean;
  idVerificationStatus: IdVerificationStatus;
  stripeAccountId?: string;
  stripeOnboarded?: boolean;
}

export const CURRENT_USER: User = {
  id: '1',
  name: 'Jordan Rivera',
  email: 'jordan@ufl.edu',
  role: 'worker',
  school: 'University of Florida',
  collegeId: 'uf',
  emailVerified: true,
  idVerificationStatus: 'none',
};

export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'wt_1',
    type: 'credit',
    amountCents: 2700,
    description: 'Payout for "Notes Transcription"',
    gigId: '7',
    createdAt: '2026-02-09',
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_0',
    type: 'new_gig',
    title: 'New Gig on Campus!',
    message: 'Alice Chen posted "Help Move Furniture" at your campus. Check it out!',
    gigId: '1',
    read: false,
    createdAt: '2026-02-17',
  },
  {
    id: 'notif_1',
    type: 'gig_confirmed',
    title: 'Dog Walking Confirmed!',
    message: 'Emily Watson confirmed your acceptance of "Dog Walking". $12.00 is held in escrow.',
    gigId: '6',
    read: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'notif_2',
    type: 'payment_released',
    title: 'Payment Released!',
    message: '$27.00 has been added to your wallet for completing "Notes Transcription".',
    gigId: '7',
    read: true,
    createdAt: '2026-02-09',
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    gigId: '7',
    reviewerId: '1',
    revieweeId: 'david_park',
    reviewerName: 'Jordan Rivera',
    rating: 5,
    comment: 'Great experience! David was super organized and had all the notes ready. Would work with him again.',
    gigTitle: 'Notes Transcription',
    createdAt: '2026-02-09',
  },
  {
    id: 'rev_2',
    gigId: '7',
    reviewerId: 'david_park',
    revieweeId: '1',
    reviewerName: 'David Park',
    rating: 4,
    comment: 'Jordan did a fantastic job transcribing my notes. Accurate and fast turnaround.',
    gigTitle: 'Notes Transcription',
    createdAt: '2026-02-09',
  },
];

/** Helper to build mock payment objects for pre-funded gigs */
function mockPayment(id: string, gigId: string, pay: string, date: string, status: PaymentStatus = 'in_escrow'): Payment {
  const amountCents = parsePayToCents(pay);
  const serviceFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);
  return { id, gigId, amountCents, serviceFeeCents, netPayoutCents: amountCents - serviceFeeCents, status, paymentIntentId: `pi_mock_${gigId}`, createdAt: date };
}

export const MOCK_GIGS: Gig[] = [
  // ── University of Florida gigs ──
  {
    id: '1',
    collegeId: 'uf',
    title: 'Help Move Furniture',
    description: 'Need two people to help move a couch, desk, and boxes from my dorm room to an off-campus apartment near Midtown. Should take about 2 hours. I have a truck.',
    pay: '$20/hr',
    location: 'Rawlings Hall',
    status: 'open',
    posterName: 'Alice Chen',
    posterId: 'alice_chen',
    posterSchool: 'University of Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_1',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m1', '1', '$20/hr', '2026-02-17'),
    createdAt: '2026-02-17',
  },
  {
    id: '2',
    collegeId: 'uf',
    title: 'Campus Tour Guide',
    description: 'Looking for an enthusiastic Gator to give campus tours to prospective students and their families this weekend. Must know campus well.',
    pay: '$15/hr',
    location: 'Admissions Office, Criser Hall',
    status: 'open',
    posterName: 'Marcus Thompson',
    posterId: 'marcus_thompson',
    posterSchool: 'University of Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_2',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m2', '2', '$15/hr', '2026-02-16'),
    createdAt: '2026-02-16',
  },
  {
    id: '3',
    collegeId: 'uf',
    title: 'Event Setup & Cleanup',
    description: 'Help set up tables, chairs, and decorations for the Spring Formal on Friday evening. Cleanup after the event ends at midnight.',
    pay: '$50 flat',
    location: 'Reitz Union Ballroom',
    status: 'open',
    posterName: 'Priya Patel',
    posterId: 'priya_patel',
    posterSchool: 'University of Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_3',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m3', '3', '$50 flat', '2026-02-15'),
    createdAt: '2026-02-15',
  },
  {
    id: '4',
    collegeId: 'uf',
    title: 'Calculus II Tutoring',
    description: 'Need a tutor for MAC 2312. Meeting twice a week for an hour each. Must have gotten an A in the course.',
    pay: '$25/hr',
    location: 'Library West, Study Room 4',
    status: 'open',
    posterName: 'Tyler Brooks',
    posterId: 'tyler_brooks',
    posterSchool: 'University of Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_4',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m4', '4', '$25/hr', '2026-02-14'),
    createdAt: '2026-02-14',
  },
  {
    id: '5',
    collegeId: 'uf',
    title: 'Photography for Club Event',
    description: 'Our robotics club needs a photographer for our annual showcase at the Herbert Wertheim Lab. About 3 hours of work, editing included.',
    pay: '$75 flat',
    location: 'Wertheim Lab Lobby',
    status: 'open',
    posterName: 'Sara Kim',
    posterId: 'sara_kim',
    posterSchool: 'University of Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_5',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m5', '5', '$75 flat', '2026-02-13'),
    createdAt: '2026-02-13',
  },
  {
    id: '6',
    collegeId: 'uf',
    title: 'Dog Walking',
    description: 'Need someone to walk my golden retriever Tuesday and Thursday afternoons while I\'m in lab. 30 minutes each walk around campus.',
    pay: '$12/walk',
    location: 'Campus Lodge Apartments',
    status: 'accepted',
    posterName: 'Emily Watson',
    posterId: 'emily_watson',
    posterSchool: 'University of Florida',
    acceptedBy: 'Jordan Rivera',
    acceptedById: '1',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_6',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: {
      id: 'pay_1',
      gigId: '6',
      amountCents: 1200,
      serviceFeeCents: 120,
      netPayoutCents: 1080,
      status: 'in_escrow',
      paymentIntentId: 'pi_mock_6',
      createdAt: '2026-02-10',
    },
    createdAt: '2026-02-10',
  },
  {
    id: '7',
    collegeId: 'uf',
    title: 'Notes Transcription',
    description: 'I need someone to type up handwritten lecture notes from my Biology 201 class. About 40 pages total.',
    pay: '$30 flat',
    location: 'Remote / Digital',
    status: 'completed',
    posterName: 'David Park',
    posterId: 'david_park',
    posterSchool: 'University of Florida',
    acceptedBy: 'Jordan Rivera',
    acceptedById: '1',
    escrowStatus: 'released',
    paymentIntentId: 'pi_mock_7',
    completionStatus: 'confirmed',
    disputeStatus: 'none',
    payment: {
      id: 'pay_2',
      gigId: '7',
      amountCents: 3000,
      serviceFeeCents: 300,
      netPayoutCents: 2700,
      status: 'released',
      paymentIntentId: 'pi_mock_7',
      createdAt: '2026-02-08',
    },
    createdAt: '2026-02-08',
  },

  {
    id: '15',
    collegeId: 'uf',
    title: 'Laundry Pickup & Delivery',
    description: 'Need someone to pick up my laundry from Broward Hall and drop it off at the laundromat on University Ave. About 1 hour total.',
    pay: '$18 flat',
    location: 'Broward Hall',
    status: 'accepted',
    posterName: 'Sam Williams',
    posterId: 'sam_williams',
    posterSchool: 'University of Florida',
    acceptedBy: 'Jordan Rivera',
    acceptedById: '1',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_15',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: {
      id: 'pay_3',
      gigId: '15',
      amountCents: 1800,
      serviceFeeCents: 180,
      netPayoutCents: 1620,
      status: 'in_escrow',
      paymentIntentId: 'pi_mock_15',
      createdAt: '2026-02-17',
    },
    createdAt: '2026-02-17',
  },

  // ── Florida State University gigs ──
  {
    id: '8',
    collegeId: 'fsu',
    title: 'Barista Shift Cover',
    description: 'Need someone to cover my shift at the Strozier Library cafe this Saturday from 8am-12pm. Experience preferred but not required.',
    pay: '$14/hr',
    location: 'Strozier Library Cafe',
    status: 'open',
    posterName: 'Nora Finch',
    posterId: 'nora_finch',
    posterSchool: 'Florida State University',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_8',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m8', '8', '$14/hr', '2026-02-17'),
    createdAt: '2026-02-17',
  },
  {
    id: '9',
    collegeId: 'fsu',
    title: 'Graphic Design for Yearbook',
    description: 'Yearbook committee needs a student designer to create divider pages and the cover. Photoshop/Illustrator skills required.',
    pay: '$100 flat',
    location: 'Diffenbaugh Building, Room 210',
    status: 'open',
    posterName: 'Leo Chang',
    posterId: 'leo_chang',
    posterSchool: 'Florida State University',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_9',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m9', '9', '$100 flat', '2026-02-14'),
    createdAt: '2026-02-14',
  },
  {
    id: '10',
    collegeId: 'fsu',
    title: 'Game Day Parking Assistant',
    description: 'Help direct traffic and manage parking for the home baseball game at Dick Howser Stadium. Must be available Saturday 10am-3pm.',
    pay: '$16/hr',
    location: 'Dick Howser Stadium',
    status: 'open',
    posterName: 'Coach Williams',
    posterId: 'coach_williams',
    posterSchool: 'Florida State University',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_10',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m10', '10', '$16/hr', '2026-02-12'),
    createdAt: '2026-02-12',
  },

  // ── UCF gigs ──
  {
    id: '11',
    collegeId: 'ucf',
    title: 'Python Tutor for Intro CS',
    description: 'Struggling with COP 3223. Need a patient tutor who can help me understand loops, functions, and basic data structures.',
    pay: '$22/hr',
    location: 'John C. Hitt Library, 2nd Floor',
    status: 'open',
    posterName: 'Mia Santos',
    posterId: 'mia_santos',
    posterSchool: 'University of Central Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_11',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m11', '11', '$22/hr', '2026-02-16'),
    createdAt: '2026-02-16',
  },
  {
    id: '12',
    collegeId: 'ucf',
    title: 'Pool Lifeguard Sub',
    description: 'Need a certified lifeguard to cover my shift at the RWC pool on Wednesday evening 5-9pm. Must have current certification.',
    pay: '$18/hr',
    location: 'Recreation & Wellness Center',
    status: 'open',
    posterName: 'Jake Morales',
    posterId: 'jake_morales',
    posterSchool: 'University of Central Florida',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_12',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m12', '12', '$18/hr', '2026-02-13'),
    createdAt: '2026-02-13',
  },

  // ── FIU gigs ──
  {
    id: '13',
    collegeId: 'fiu',
    title: 'Spanish-English Translation',
    description: 'Need a fluent Spanish speaker to translate a 10-page research document for my capstone project. Academic language required.',
    pay: '$60 flat',
    location: 'Remote / Digital',
    status: 'open',
    posterName: 'Andrea Lopez',
    posterId: 'andrea_lopez',
    posterSchool: 'Florida International University',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_13',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m13', '13', '$60 flat', '2026-02-15'),
    createdAt: '2026-02-15',
  },
  {
    id: '14',
    collegeId: 'fiu',
    title: 'Beach Cleanup Volunteer Coordinator',
    description: 'Help organize and lead a group of 20 students for the FIU beach cleanup at Key Biscayne this Saturday morning.',
    pay: '$40 flat',
    location: 'Key Biscayne Beach',
    status: 'open',
    posterName: 'Carlos Vega',
    posterId: 'carlos_vega',
    posterSchool: 'Florida International University',
    escrowStatus: 'in_escrow',
    paymentIntentId: 'pi_mock_14',
    completionStatus: 'not_started',
    disputeStatus: 'none',
    payment: mockPayment('pay_m14', '14', '$40 flat', '2026-02-11'),
    createdAt: '2026-02-11',
  },
];
