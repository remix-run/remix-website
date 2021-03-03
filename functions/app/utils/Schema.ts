/**
 * All of firebase collections we have so we don't mispell them, and so it's
 * easy to know what we've got!
 */
export enum Collections {
  users = "users",
  completedStripeSessions = "completedStripeSessions",
  xTokensUsers = "xTokensUsers",
  tokens = "tokens",
}

/**
 * While firebase keeps "user auth" records, this is a place for us to put
 * anything else we want to track on a user.
 */
export interface User {
  /**
   * UID from Firebase auth
   */
  uid: string;

  /**
   * The email address they registered with. Don't use for billing, get the
   * email address they have with stripe.
   */
  email: string;

  /**
   * Their stripe customer id.
   */
  stripeCustomerId: string;
}

/**
 * We track completed sessions so that people can't share their registration
 * URL after stripe checkout and register all sorts of people on the stripe
 * session. Once the checkout is complete, we mark it in the db and check on
 * the registration page.
 */
export interface CompletedStripeSession {
  /**
   * Indicates the session has been fulfilled and is complete
   */
  fulfilled: boolean;
  /**
   * The uid who bought it
   */
  uid: string;
}
