const { config } = require("../utils/firebase");

module.exports = () => {
  let firebaseConfigProduction = {
    apiKey: "AIzaSyC2gSRi56WPco1HkjkycB4_8pXX2k6_zBg",
    authDomain: "remix-run.firebaseapp.com",
    databaseURL: "https://remix-run.firebaseio.com",
    projectId: "remix-run",
    storageBucket: "remix-run.appspot.com",
    messagingSenderId: "699838971986",
    appId: "1:699838971986:web:54f24ac69da76d82349f8b",
    measurementId: "G-WVPGQTDNK2",
  };

  let firebaseConfigStaging = {
    apiKey: "AIzaSyBbeX1z4Z645pzqqTx5k2PVLPI4oGa8GA4",
    authDomain: "playground-a6490.firebaseapp.com",
    databaseURL: "https://playground-a6490.firebaseio.com",
    projectId: "playground-a6490",
    storageBucket: "playground-a6490.appspot.com",
    messagingSenderId: "570373624547",
    appId: "1:570373624547:web:e99465a877aa47e90dabd6",
  };

  return {
    env: {
      firebase:
        config.app.env === "production"
          ? firebaseConfigProduction
          : firebaseConfigStaging,
      stripe: config.stripe.public_key,
    },
  };
};
