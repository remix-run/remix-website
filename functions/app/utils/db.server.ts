import { firestore } from "firebase-admin";

// Automatically type our firebase collections
let converter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
    snap.data() as T,
});

let collection = <T>(collectionPath: string) =>
  firestore().collection(collectionPath).withConverter(converter<T>());

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
  stripeCustomerId?: string;

  /**
   * If the user has associated their account with GitHub, this is their login
   * so we can give them access to repos, etc.
   */
  githubLogin?: string;
}

export interface CompletedStripeSession {
  /**
   * Indicates the session has been fulfilled and is complete
   */
  fulfilled: boolean;
  /**
   * The uid who bought it
   */
  userRef: FirebaseFirestore.DocumentReference<User>;
}

export interface Token {
  /**
   * The date it was issued
   */
  issuedAt: FirebaseFirestore.Timestamp;

  /**
   * Which user owns it
   */
  ownerRef: FirebaseFirestore.DocumentReference<User>;

  /**
   * Which stripe price this was purchased with.
   */
  price: string;

  /**
   * How many seats on the license.
   */
  quantity: number;

  /**
   * The highest version of Remix it's valid for. When somebody unsubscribes,
   * we let them use forever the latest version of Remix at the time of
   * cancellation.
   */
  version: string;

  /**
   * The last time the token was accessed. Empty if it's never been used.
   */
  lastUsedAt?: FirebaseFirestore.Timestamp;
}

export interface XTokensUser {
  /**
   * The role of the user with access to this token. Team licenses have
   * multiple seats, the owner can invite people to use it. When they accept
   * the invitation, they are added as a "member" to the token.
   */
  role: "owner" | "member";

  /**
   * Ref to the token
   */
  tokenRef: FirebaseFirestore.DocumentReference<Token>;

  /**
   * ref to the user
   */
  userRef: FirebaseFirestore.DocumentReference<User>;

  // ownerRef: FirebaseFirestore.DocumentReference<User>;
}

////////////////////////////////////////////////////////////////////////////////
/**
 * Access all firebase data through this object and you'll get intellisense and
 * type safety.
 *
 * ```ts
 * // instead of
 * let ref = firestore().doc(`/users/${uid}`)
 *
 * // use this
 * let ref = db.users.doc(uid)
 * ```
 *
 * From there it's all the same:
 *
 * ```ts
 * let userRef = db.users.doc(uid);
 * let doc = await userRef.get()
 * await userRef.set({ type: "safe", values: true });
 *
 * let tokenRef = db.tokens.doc(tokenId);
 * let query = await db.xTokensUsers.where("tokenRef", "==", tokenRef).get();
 * ```
 */
export let db = {
  /**
   * We track completed sessions so that people can't share their registration
   * URL after stripe checkout and register all sorts of people on the stripe
   * session. Once the checkout is complete, we mark it in the db and check on
   * the registration page before allowing them to register.
   */
  completedStripeSessions: collection<CompletedStripeSession>(
    "completedStripeSessions"
  ),

  /**
   * NPM License keys for customers to get access to remix packages. The id
   * of the token is the license key itself.
   */
  tokens: collection<Token>("tokens"),

  /**
   * While firebase keeps "user auth" records, this is a place for us to put
   * anything else we want to track on a user.
   */
  users: collection<User>("users"),

  /**
   * Lookup table to find all tokens a user has access to.
   */
  xTokensUsers: collection<XTokensUser>("xTokensUsers"),
};

/////////////////////////////////////////////////
// make a serialize function so the dashboard doesn't have to construct all it's
// own weird stuff
//
// let doc = await tokenRef.get()
// serialize(doc, { include: [doc.ownerRef] })
