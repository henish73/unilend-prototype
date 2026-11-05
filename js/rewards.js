/* ------------------------------------------------------------------
   UniLend swap list: the ONLY file with reward-type content.

   rewards = "recognition"  Variant A, the base build and the default
   rewards = "perks"        Variant B, Variant A plus monetary add-ons

   To exclude monetary rewards for good, delete the `perks` block and
   nothing else in the app has to change. The consent-form and report
   wording that also changes with the variant is listed in the report.
------------------------------------------------------------------- */
(function () {
  var recognitionCatalogue = [
    {
      id: "priority",
      name: "Priority access for 24 hours",
      detail: "See newly listed scarce items before anyone else for one day.",
      cost: 60,
      icon: "clock"
    },
    {
      id: "badge",
      name: "Featured Helper badge",
      detail: "Shows beside your name on the feed and the Kindness Wall.",
      cost: 40,
      icon: "star"
    },
    {
      id: "donate",
      name: "Donate points to a campus cause",
      detail: "Give 25 points to the student food bank's helper total.",
      cost: 25,
      icon: "heart"
    }
  ];

  window.UNILEND_REWARDS = {
    /* Variant A: recognition only */
    recognition: {
      code: "A",
      label: "Variant A: recognition only",
      welcomeLine: "Help a classmate, earn recognition",
      leaderboardBanner: "Top helpers are recognised on the Kindness Wall",
      catalogue: recognitionCatalogue
    },

    /* Variant B: everything in A, plus monetary add-ons */
    perks: {
      code: "B",
      label: "Variant B: adds monetary perks",
      welcomeLine: "Help a classmate, earn rewards",
      leaderboardBanner: "Top 3 yearly lenders win gift cards",
      catalogue: recognitionCatalogue.concat([
        {
          id: "coffee",
          name: "Campus coffee voucher",
          detail: "One free coffee at the campus cafe.",
          cost: 50,
          icon: "cup"
        },
        {
          id: "bookstore",
          name: "Bookstore discount",
          detail: "10% off one bookstore purchase.",
          cost: 75,
          icon: "tag"
        }
      ])
    }
  };
})();
