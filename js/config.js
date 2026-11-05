/* Build settings. Before the freeze, set `rewards` to the final variant and
   `lockVariant` to true so a stray link cannot show the other variant. */
window.UNILEND_CONFIG = {
  rewards: "recognition", // "recognition" (Variant A) or "perks" (Variant B)
  lockVariant: false,
  simDelayMs: 3000, // how long simulated Sam takes to respond
  scanReadMs: 500, // feedback delay on a simulated scan (under the 1-second rule)
  demoCode: "4821"
};
