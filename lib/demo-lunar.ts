// Curated sample history, not an AI evaluation result. Quotes are fictional.
// State is explicit: a proposal or discussion never becomes an approval.
export type DemoState = 'approved' | 'in_progress' | 'out_of_scope' | 'undecided';
type Source = 'slack' | 'figma' | 'linear';
type Author = 'Anna' | 'John' | 'Sara' | 'Michael' | 'Priya';
export interface LunarEvent {
  key: string;
  hoursAgo: number;
  source: Source;
  author: Author;
  type: string;
  action: string;
  content: string;
  reason: string;
  state?: DemoState;
}
export interface LunarArea {
  subject: string;
  scope: string;
  importance: 'high' | 'medium' | 'low';
  events: LunarEvent[];
  conflict?: { event: string; type: string; description: string; resolvedBy?: string };
}
export const LUNAR_DESCRIPTION =
  'Lunar food delivery · iOS and Android launch. A three-week design handoff with scope decisions, QA findings and a scheduled-order pilot.';
export const LUNAR_PEOPLE: Record<Author, { role: string; source: Source }> = {
  Anna: { role: 'designer', source: 'figma' },
  John: { role: 'pm', source: 'slack' },
  Sara: { role: 'client', source: 'slack' },
  Michael: { role: 'other', source: 'linear' },
  Priya: { role: 'other', source: 'linear' },
};

// hoursAgo is relative to seed time, including recent activity without future dates.
const event = (
  key: string, hoursAgo: number, source: Source, author: Author,
  type: string, action: string, content: string, reason: string, state?: DemoState,
): LunarEvent => ({ key, hoursAgo, source, author, type, action, content, reason, state });

export const LUNAR_AREAS: LunarArea[] = [
  {
    subject: 'home screen', scope: 'Mobile', importance: 'high',
    events: [
      event('home-draft', 480, 'figma', 'Anna', 'change', 'add',
        'Home v3 is ready: nearby restaurants, recent orders and a free-delivery banner above the list. Empty states are on the next frame.',
        'Home layout and empty states ready for review.', 'in_progress'),
      event('home-approved', 408, 'slack', 'Sara', 'approval', 'approve',
        'Home screen approved for iOS and Android. Keep the banner saying “Free delivery over £20”; the launch offer applies to every restaurant in the pilot.',
        'Home approved with a £20 free-delivery banner across the pilot.', 'approved'),
    ],
  },
  {
    subject: 'bottom navigation', scope: 'Mobile', importance: 'medium',
    events: [
      event('nav-draft', 477, 'figma', 'Anna', 'change', 'modify',
        'Reduced the navigation to Home, Orders and Account. Search lives on Home; saved addresses are under Account.',
        'Three tabs replace the five-tab exploration.', 'in_progress'),
      event('nav-approved', 430, 'slack', 'Sara', 'approval', 'approve',
        'Approved: Home, Orders, Account. Please keep the text labels visible; the icon-only version was harder to use in the sessions.',
        'Three labelled tabs approved after usability review.', 'approved'),
      event('nav-idea', 50, 'slack', 'Anna', 'idea', 'discuss',
        'For a later release, we could try a separate Offers tab. Just parking the idea here, no changes to the three-tab handoff.',
        'Offers tab suggested for later; approved navigation stays unchanged.'),
    ],
  },
  {
    subject: 'checkout flow', scope: 'Mobile', importance: 'high',
    events: [
      event('checkout-draft', 432, 'figma', 'Anna', 'change', 'add',
        'Checkout v4 combines address, payment and order summary on one screen. The final button shows the full amount including delivery.',
        'Single-screen checkout ready for sign-off.', 'in_progress'),
      event('checkout-approved', 384, 'slack', 'Sara', 'approval', 'approve',
        'Checkout approved for launch: every payment is captured immediately, so show “Order confirmed” after payment succeeds. We do not need a pending-payment screen.',
        'Checkout approved on the assumption that payment is captured immediately.', 'approved'),
    ],
  },
  {
    subject: 'payment method', scope: 'Scheduled orders', importance: 'high',
    events: [
      event('payment-card', 400, 'slack', 'John', 'decision', 'approve',
        'Launch payment scope is cards and Apple Pay. Both capture at checkout. Cash and bank transfer stay outside this release.',
        'Cards and Apple Pay approved for the initial release.', 'approved'),
      event('payment-constraint', 30, 'linear', 'Michael', 'change', 'modify',
        'LUN-142: scheduled orders now authorize the card at checkout and capture only when the restaurant accepts. If authorization expires, the customer must retry. Immediate orders still capture at checkout.',
        'Scheduled orders now authorize first and capture after restaurant acceptance.'),
      event('payment-approved', 22, 'slack', 'Sara', 'approval', 'approve',
        'Approved the scheduled-order payment change: authorize at checkout and capture only when the restaurant accepts. John, please get the customer-facing states reviewed before the pilot.',
        'Delayed capture approved for scheduled orders; customer-facing states need review.', 'approved'),
    ],
  },
  {
    subject: 'dark mode', scope: 'Mobile', importance: 'medium',
    events: [
      event('dark-approved', 336, 'slack', 'Sara', 'approval', 'approve',
        'Dark mode is approved for the mobile launch only. The restaurant portal stays light. Follow the device setting rather than adding a separate switch.',
        'System-driven dark mode approved for mobile only.', 'approved'),
      event('dark-qa', 41, 'linear', 'Priya', 'discussion', 'discuss',
        'LUN-155: two disabled checkout labels fail contrast in dark mode. Light mode passes. I can retest tomorrow if Anna updates those tokens.',
        'QA found two dark-mode contrast failures; light mode passes.'),
      event('dark-remove', 8, 'slack', 'John', 'request', 'remove',
        'Can we remove dark mode from the launch build and ship it in 1.1? The two contrast fixes still need a regression pass. Sara, this would change your earlier mobile sign-off.',
        'PM requests deferring approved dark mode to 1.1.'),
    ],
    conflict: {
      event: 'dark-remove', type: 'scope_change',
      description: 'Mobile dark mode was approved. John now proposes moving it to 1.1 because contrast fixes still need QA.',
    },
  },
  {
    subject: 'avatar upload', scope: 'MVP', importance: 'low',
    events: [
      event('avatar-excluded', 456, 'slack', 'John', 'decision', 'reject',
        'For MVP, use initials in Account. Avatar upload is out of scope: we have no image moderation or delete flow yet.',
        'Avatar upload excluded from MVP; use initials.', 'out_of_scope'),
      event('avatar-added', 11, 'figma', 'Anna', 'change', 'add',
        'Account v6 includes an upload-photo entry from the brand review. It is a proposal, not part of the agreed MVP yet. I kept the initials fallback on the next frame.',
        'New Account mock proposes avatar upload outside the agreed MVP.'),
    ],
    conflict: {
      event: 'avatar-added', type: 'scope_change',
      description: 'Account v6 introduces photo upload, but MVP explicitly uses initials. Moderation and photo deletion are still unscoped.',
    },
  },
  {
    subject: 'app icon', scope: 'Mobile', importance: 'low',
    events: [
      event('icon-blue', 360, 'slack', 'Sara', 'approval', 'approve',
        'The blue moon icon is approved for the store listing. Keep the white crescent and remove the tiny wordmark.',
        'Blue moon icon approved for store assets.', 'approved'),
      event('icon-green', 288, 'slack', 'John', 'request', 'modify',
        'Research preferred the green background in the five-person test. Could we switch before exporting store assets? We have not checked it against the brand palette yet.',
        'PM proposes green based on a small usability test.'),
      event('icon-settled', 240, 'slack', 'Sara', 'decision', 'approve',
        'Final decision after the brand review: keep the blue moon icon. Green performed better on one screen but conflicts with the restaurant-partner badge. John and I are aligned; export blue.',
        'Client and PM settle on blue after reviewing the research.', 'approved'),
      event('icon-export', 230, 'figma', 'Anna', 'discussion', 'discuss',
        'Blue icon exports are attached at 1024px, plus iOS and Android masks. The green exploration is archived.',
        'Approved blue assets exported; green exploration archived.'),
    ],
    conflict: {
      event: 'icon-green', type: 'state_change', resolvedBy: 'icon-settled',
      description: 'Green research variant conflicted with the approved blue icon. Client and PM agreed to keep blue after brand review.',
    },
  },
  {
    subject: 'notification permissions', scope: 'First order', importance: 'medium',
    events: [
      event('notification-question', 120, 'slack', 'John', 'discussion', 'discuss',
        'We still need to choose when to ask for push permission: after the first order, or from the tracking screen. No native prompt during onboarding.',
        'Prompt timing remains undecided; onboarding prompt ruled out.', 'undecided'),
      event('notification-options', 47, 'figma', 'Anna', 'discussion', 'discuss',
        'Both permission variants are ready. After-order has more context; tracking keeps checkout quieter. Sara, which one should we hand off? Neither is marked approved.',
        'Two contextual permission variants await a final choice.'),
    ],
  },
  {
    subject: 'address entry', scope: 'Mobile', importance: 'high',
    events: [
      event('address-condition', 312, 'slack', 'Sara', 'approval', 'approve',
        'Address entry is approved provided customers can enter an address manually when postcode lookup fails. Flat number must remain optional.',
        'Address entry approved with manual fallback and optional flat number.', 'approved'),
      event('address-build', 70, 'linear', 'Michael', 'commitment', 'in_progress',
        'LUN-128: manual address fallback is being implemented. The lookup timeout goes to the same form, preserving postcode and flat number. QA handoff is tomorrow.',
        'Manual fallback in implementation; agreed requirements retained.', 'in_progress'),
      event('address-check', 5, 'linear', 'Priya', 'discussion', 'discuss',
        'Tested a failed postcode lookup on Android: postcode survives the fallback, but street resets when returning from the map. Left a reproduction on LUN-128; not ready for sign-off.',
        'QA reports a street-field reset before final acceptance.'),
    ],
  },
  {
    subject: 'delivery time estimate', scope: 'Busy periods', importance: 'high',
    events: [
      event('eta-review', 168, 'figma', 'Anna', 'discussion', 'discuss',
        'Two ETA treatments for review: a range such as 25–40 min, or “Around 7:30 pm”. Need a product decision before I finish restaurant cards.',
        'ETA presentation awaits a product decision.', 'undecided'),
      event('eta-limit', 27, 'linear', 'Michael', 'discussion', 'discuss',
        'LUN-151: dispatch provides a range, not a guaranteed arrival time. During busy periods the upper bound can move after restaurant acceptance.',
        'Dispatch supports ranges, not a guaranteed arrival time.'),
      event('eta-dispute', 3, 'slack', 'Sara', 'discussion', 'discuss',
        'Marketing prefers a single arrival time, but Michael says dispatch only guarantees a range. Please review the two mocks with Operations before we choose. Neither option is signed off.',
        'Marketing and engineering disagree; Operations review needed.'),
    ],
    conflict: {
      event: 'eta-dispute', type: 'state_change',
      description: 'Marketing wants a single arrival time; dispatch only supports a range. Neither treatment is approved. Operations needs to confirm the promise.',
    },
  },
  {
    subject: 'delivery fee', scope: 'Pilot restaurants', importance: 'high',
    events: [
      event('fee-original', 450, 'slack', 'Sara', 'decision', 'approve',
        'Pilot launch offer agreed: free delivery on baskets over £20 at every partner restaurant. Below that, delivery is £2.49.',
        'Pilot free-delivery threshold set at £20.', 'approved'),
      event('fee-revised', 18, 'slack', 'Sara', 'decision', 'modify',
        'Operations has approved the revised pilot offer: free delivery starts at £25, replacing £20, at every partner restaurant. Below £25 the fee stays £2.49. This applies from launch.',
        'Free-delivery threshold raised to £25 for launch.', 'approved'),
    ],
  },
  {
    subject: 'accessibility', scope: 'Checkout', importance: 'high',
    events: [
      event('a11y-scope', 264, 'slack', 'John', 'commitment', 'in_progress',
        'Checkout acceptance includes VoiceOver labels, 44pt touch targets and text scaling to 200%. Priya owns the device check; contrast alone is not enough.',
        'Accessibility acceptance criteria assigned for checkout.', 'in_progress'),
      event('a11y-progress', 7, 'linear', 'Priya', 'change', 'modify',
        'LUN-161: VoiceOver labels and touch targets pass on iPhone SE. At 200% text, the delivery-fee row overlaps the total. Keeping the ticket in progress until layout is fixed.',
        'VoiceOver and targets pass; large-text checkout layout still needs a fix.', 'in_progress'),
    ],
  },
  {
    subject: 'loyalty rewards', scope: 'Post-launch', importance: 'low',
    events: [
      event('loyalty-idea', 390, 'figma', 'Anna', 'idea', 'discuss',
        'Exploration only: a stamp card in Account for repeat orders. There is no rewards API in the current handoff.',
        'Loyalty stamp card explored, with no implementation commitment.', 'undecided'),
      event('loyalty-excluded', 340, 'slack', 'Sara', 'decision', 'reject',
        'Agreed with John: loyalty rewards move to post-launch. Remove the stamp-card entry from MVP navigation; do not reserve an empty screen for it.',
        'Loyalty rewards explicitly deferred to post-launch.', 'out_of_scope'),
    ],
  },
  {
    subject: 'reorder flow', scope: 'Order history', importance: 'medium',
    events: [
      event('reorder-condition', 216, 'slack', 'Sara', 'approval', 'approve',
        'Reorder is approved only if unavailable items are called out before payment. Never silently substitute a dish; let the customer remove it or return to the menu.',
        'Reorder approved with explicit handling of unavailable items.', 'approved'),
      event('reorder-progress', 53, 'figma', 'Anna', 'change', 'modify',
        'Reorder v2 now highlights unavailable dishes and offers Remove item or Open menu. Still finishing the all-items-unavailable state; ready for engineering review after that.',
        'Unavailable-item treatment designed; empty reorder state in progress.', 'in_progress'),
    ],
  },
  {
    subject: 'order tracking', scope: 'Immediate orders', importance: 'medium',
    events: [
      event('tracking-condition', 192, 'slack', 'Sara', 'approval', 'approve',
        'Tracking approved for immediate orders: show Preparing, Courier assigned and On the way. If location is stale for over two minutes, hide the moving pin and show the last update time.',
        'Tracking approved with an explicit stale-location fallback.', 'approved'),
      event('tracking-qa', 26, 'linear', 'Priya', 'discussion', 'discuss',
        'LUN-137: simulated a three-minute GPS gap. Pin is hidden, last-update time appears, and order status still refreshes. The approved fallback passes on both platforms.',
        'Stale-location fallback passes QA on iOS and Android.'),
    ],
  },
];

export const LUNAR_IMPACTS = [
  {
    source: 'payment-approved', target: 'checkout-approved',
    assumption: 'every payment is captured immediately',
    signal: 'authorize at checkout and capture only when the restaurant accepts',
    reason: 'Scheduled orders no longer capture payment at checkout. Review the immediate confirmation screen and add the waiting and retry states before the pilot.',
    dependency: 'The checkout approval explicitly assumed immediate capture for every payment.',
  },
  {
    source: 'fee-revised', target: 'home-approved',
    assumption: 'Free delivery over £20',
    signal: 'free delivery starts at £25, replacing £20',
    reason: 'The approved home banner still promises free delivery over £20. The launch offer now starts at £25, so the banner needs another review.',
    dependency: 'The home banner quotes the same pilot-wide delivery threshold that Operations changed.',
  },
];
