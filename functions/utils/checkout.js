const { db, admin } = require("./firebase");
const { addToPackages } = require("./github");
const { stripe } = require("./stripe");

////////////////////////////////////////////////////////////////////////////////
// Checkout Workflow!

////////////////////////////////////////////////////////////////////////////////
// 1. It all starts when the user clicks "checkout" on /buy/<product> page and
//    we call api/createCheckout
async function createCheckout(uid, username, idToken, hostname) {
  console.log("createCheckout", uid, username);

  let product = {
    price_data: {
      currency: "usd",
      product_data: {
        name: "Remix Indie License",
      },
      unit_amount: 25000,
    },
    quantity: 1,
  };

  let baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000"
      : `https://${hostname}`;
  let urls = {
    success_url: `${baseUrl}/order/success?idToken=${idToken}`,
    cancel_url: `${baseUrl}/order/failed?idToken=${idToken}`,
  };

  // Create a stripe session
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [product],
    mode: "payment",
    ...urls,
  });

  // Add them to firestore so we can pick this back up again after a successful
  // stripe transaction
  await db.doc(`checkout/${uid}`).set({ githubLogin: username });

  // Client needs the stripe session id
  return session;
}

////////////////////////////////////////////////////////////////////////////////
// 2. Browser takes session id and redirects to stripe checkout

////////////////////////////////////////////////////////////////////////////////
// 3. Success: Stripe redirects to success_url
async function completeOrder(idToken) {
  // just want to verify we've actually got somebody here, not just a random
  // copy/paste of the URL to try to get a free account or something
  let token = await admin.auth().verifyIdToken(idToken);

  // preload data for the client
  let doc = await db.doc(`checkout/${token.uid}`).get();
  let data = doc.data();

  let orderRef = db.doc(`order/${data.githubLogin}`);
  let orderDoc = await orderRef.set({
    uid: token.uid,
    userCreated: false,
    addedToPackages: false,
    acceptedInvitation: false,
  });

  // kick off setting up the user, and then we'll subscribe in the client
  // to see the status in real time
  createNewAccount(token, data.githubLogin);

  // return data for the client
  return {
    username: data.githubLogin,
    data: (await orderRef.get()).data(),
  };
}

////////////////////////////////////////////////////////////////////////////////
// 4. This runs out of the request cycle in step 3, the client subscribes to
//    the order path to get realtime updates on progress, like accepting the
//    GitHub invitation.
async function createNewAccount(token, username) {
  console.log("READING CHECKOUT REF");
  console.log(username);
  let orderRef = db.doc(`order/${username}`);
  let orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new Error(`order/${username} Doesn't exist!`);
  let orderData = orderDoc.data();

  // Create the user doc
  console.log("CREATING USER");
  let userPath = `users/${username}`;
  await db.doc(userPath).set({
    uid: token.uid,
    license: "indie",
    quantity: 1,
    purchasedAt: admin.firestore.Timestamp.now(),
  });
  await orderRef.update({
    userCreated: true,
  });

  console.log("ADDING TO PACKAGE");
  await addToPackages(username);
  await orderRef.update({
    addedToPackages: true,
  });
}

////////////////////////////////////////////////////////////////////////////////
// 5. User accepts invitation on github, the /api/githubWebhook is called

////////////////////////////////////////////////////////////////////////////////
// 6. Called from the githubWebhook after user accepts invitation
async function setInvitationAccepted(username) {
  console.log("SETTING INVITATION AS ACCEPTED", username);
  let orderRef = db.doc(`order/${username}`);
  let orderDoc = await orderRef.get();
  if (!orderDoc.exists) throw new Error(`order/${username} does not exist`);
  await orderRef.update({
    acceptedInvitation: true,
  });
}

exports.createNewAccount = createNewAccount;
exports.setInvitationAccepted = setInvitationAccepted;
exports.createCheckout = createCheckout;
exports.completeOrder = completeOrder;
exports.createNewAccout = createNewAccount;
