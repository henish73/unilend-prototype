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
      img: "reward-priority",
      name: "Priority access for 24 hours",
      detail: "See newly listed scarce items before anyone else for one day.",
      cost: 60,
      icon: "clock",
      effect: "For the next 24 hours, newly listed scarce items show to you first. You'll see a note on your home screen."
    },
    {
      id: "badge",
      img: "reward-badge",
      name: "Featured Helper badge",
      detail: "Shows beside your name on the leaderboard and the Kindness Wall.",
      cost: 40,
      icon: "star",
      showsBadge: true,
      effect: "Your Featured Helper badge now shows beside your name on the leaderboard and the Kindness Wall.",
      wall: "You became a Featured Helper."
    },
    {
      id: "donate",
      img: "reward-donate",
      name: "Donate points to a campus cause",
      detail: "Give 25 points to the student food bank's helper total.",
      cost: 25,
      icon: "heart",
      effect: "Your donation now appears on the Kindness Wall.",
      wall: "You gave 25 points to the student food bank's helper total."
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
          img: "reward-coffee",
          name: "Campus coffee voucher",
          detail: "One free coffee at the campus cafe.",
          cost: 50,
          icon: "cup",
          effect: "Show this at the campus cafe. Code: UL-CAFE-21 (fictional)."
        },
        {
          id: "bookstore",
          img: "reward-bookstore",
          name: "Bookstore discount",
          detail: "10% off one bookstore purchase.",
          cost: 75,
          icon: "tag",
          effect: "Show this at the bookstore. Code: UL-BOOK-10 (fictional)."
        }
      ])
    }
  };
})();
