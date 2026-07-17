import { addWaitlistEmail } from '../../../server/neonWaitlist';
import { createWaitlistPost } from '../../../server/waitlist';

export const POST = createWaitlistPost(addWaitlistEmail);
