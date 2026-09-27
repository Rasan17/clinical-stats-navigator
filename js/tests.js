// Knowledge base: one entry per test.
// Assumption fields: t = what must hold, how = how to check it,
// fail = what to do if it is not met, alt = id of an alternative test.

window.FAMILIES = [
  { id: "means", label: "Comparing means" },
  { id: "groups", label: "Comparing groups (categorical)" },
  { id: "corr", label: "Correlation and linear regression" },
  { id: "surv", label: "Survival analysis" },
  { id: "binary", label: "Logistic and Poisson regression" },
  { id: "explore", label: "Data exploration" },
  { id: "bayes", label: "Bayesian methods" },
  { id: "estimation", label: "Estimation statistics" },
  { id: "resampling", label: "Resampling" }
];

window.UNIVERSAL = [
  { t: "The research question and primary outcome were set before looking at the data", how: "Check your protocol or analysis plan. Choosing the test after seeing the results inflates false positives." },
  { t: "The unit of analysis is correct", how: "Count patients, not eyes, teeth, lesions or visits, unless you use a method that handles clustering (mixed models, GEE)." },
  { t: "The sample size was justified", how: "A power calculation or precision target should exist. A small study that finds “no difference” is usually inconclusive, not negative." },
  { t: "Missing data have been described and handled", how: "Report how much is missing per variable and why. Complete-case analysis can bias results; consider multiple imputation." },
  { t: "The data have been cleaned", how: "Check ranges (e.g. a haemoglobin of 140 g/dL is a unit error), duplicates and impossible dates before any test." },
  { t: "The number of tests is controlled", how: "Many outcomes, subgroups or time points increase false positives. Pre-specify one primary analysis and label the rest exploratory, or correct for multiplicity." }
];

window.TESTS = {
  // =================== COMPARING MEANS ===================
  "independent-t": {
    name: "Independent-samples t-test (Welch)",
    family: "means",
    short: "Compares the mean of a continuous outcome between two separate groups of patients.",
    useWhen: "One continuous outcome, two independent groups, roughly normal data or at least 30 patients per group.",
    example: "Mean HbA1c at 6 months in patients randomised to drug A vs drug B.",
    why: "The t-test measures how big the difference between the two means is relative to the noise in the data. Welch’s version does not assume the two groups have equal spread, so it is safe to use by default. It gives you what clinicians need most: the mean difference with a confidence interval.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient appears once and in one group only. Check the study design, not the data.", fail: "If the same patients are measured twice, use a paired test. If patients are clustered (wards, practices), use a mixed model.", alt: "paired-t" },
      { t: "The outcome is continuous", how: "Measured on a numeric scale (mmHg, mmol/L, kg). Short ordinal scales (e.g. 1–5) are not truly continuous.", fail: "For ordinal outcomes use the Mann–Whitney U test.", alt: "mann-whitney" },
      { t: "The outcome is roughly normal within each group", how: "Draw a histogram and a Q–Q plot for each group. Do not rely on the Shapiro–Wilk test alone: it flags trivial deviations in large samples and misses real ones in small samples. With 30+ per group, mild skew is acceptable.", fail: "Use the Mann–Whitney U test, a bootstrap confidence interval, or analyse log-transformed data (and report the ratio of geometric means).", alt: "mann-whitney" },
      { t: "No extreme outliers", how: "Boxplot per group. Check each outlier against the source record for data-entry errors.", fail: "Correct genuine errors. Never delete real values just because they are extreme; run a sensitivity analysis with and without them, or use a rank-based test.", alt: "mann-whitney" },
      { t: "Equal variances (only for Student’s version)", how: "Compare the standard deviations. A ratio above 2 between groups is a warning sign.", fail: "Use Welch’s t-test, which is the default recommended here and in R." }
    ],
    pitfalls: [
      "Running several t-tests to compare three or more groups inflates the false-positive rate. Use ANOVA instead.",
      "“p > 0.05” does not show the groups are the same. Look at the confidence interval: if it includes clinically important differences, the study is inconclusive.",
      "Testing baseline characteristics for significance in a randomised trial is meaningless; any imbalance is by chance.",
      "A statistically significant difference may be clinically trivial. Compare the difference with the minimal clinically important difference (MCID).",
      "Reporting mean ± SD for clearly skewed data (e.g. length of stay) misleads. Use median and IQR there."
    ],
    interpret: [
      "Start with the mean difference and its 95% confidence interval. This is your main result, in clinical units.",
      "If the 95% CI excludes 0, p < 0.05. Its width shows how precise the estimate is.",
      "Compare the whole CI with the MCID: is even the smallest plausible effect clinically useful?",
      "Optionally add a standardised effect size (Cohen’s d or Hedges’ g) for meta-analyses; 0.2 small, 0.5 medium, 0.8 large."
    ],
    report: "Mean HbA1c was 7.1% (SD 0.9) with drug A and 7.6% (SD 1.1) with drug B; mean difference −0.5 percentage points (95% CI −0.8 to −0.2); Welch t(96.4) = −3.10, p = 0.003.",
    software: [
      ["R", "t.test(hba1c ~ group, data = d)   # Welch by default"],
      ["SPSS", "Analyze › Compare Means › Independent-Samples T Test; read the “Equal variances not assumed” row"],
      ["jamovi", "T-Tests › Independent Samples T-Test; tick Welch’s, Mean difference and Confidence interval"]
    ],
    related: ["mann-whitney", "bootstrap-mean", "estimation-means", "bayes-means", "one-way-anova"]
  },

  "paired-t": {
    name: "Paired t-test",
    family: "means",
    short: "Compares two measurements taken on the same patients (before/after, or matched pairs).",
    useWhen: "One continuous outcome measured twice on each patient, or in matched pairs.",
    example: "Pain score before and 6 weeks after knee replacement in the same 40 patients.",
    why: "Each patient acts as their own control, so the test works on the change within each patient. This removes the variation between patients and gives much more power than treating the two sets of measurements as separate groups.",
    assumptions: [
      { t: "Measurements are genuinely paired", how: "Each value in the first set belongs to exactly one value in the second (same patient or matched partner).", fail: "If the groups are different patients, use the independent-samples t-test.", alt: "independent-t" },
      { t: "Pairs are independent of each other", how: "Each patient contributes one pair. Two eyes of the same patient are not independent pairs.", fail: "Use a mixed model to account for clustering." },
      { t: "The differences are roughly normal", how: "Calculate after − before for each patient, then draw a histogram or Q–Q plot of these differences. The raw values do not need to be normal.", fail: "Use the Wilcoxon signed-rank test or a bootstrap CI of the mean difference.", alt: "wilcoxon-signed" },
      { t: "No extreme outliers among the differences", how: "Boxplot of the differences.", fail: "Check for data-entry errors; run a sensitivity analysis or use the Wilcoxon signed-rank test.", alt: "wilcoxon-signed" }
    ],
    pitfalls: [
      "Analysing paired data with an independent-samples test throws away the pairing and loses power.",
      "A before–after change without a control group cannot separate treatment effect from regression to the mean, placebo effect and natural recovery.",
      "In a trial, showing “significant improvement in arm A but not in arm B” is not a comparison between arms. Compare the arms directly (ANCOVA).",
      "Patients who drop out between measurements are silently excluded; report how many and whether they differ."
    ],
    interpret: [
      "Report the mean of the within-patient differences with its 95% CI.",
      "If the CI excludes 0, p < 0.05.",
      "Judge the size of the change against the MCID for the scale."
    ],
    report: "Mean pain score fell from 6.2 (SD 1.8) to 4.1 (SD 1.9); mean change −2.1 points (95% CI −2.7 to −1.5); paired t(39) = −7.2, p < 0.001.",
    software: [
      ["R", "t.test(d$after, d$before, paired = TRUE)"],
      ["SPSS", "Analyze › Compare Means › Paired-Samples T Test"],
      ["jamovi", "T-Tests › Paired Samples T-Test"]
    ],
    related: ["wilcoxon-signed", "rm-anova", "estimation-means", "bayes-means"]
  },

  "mann-whitney": {
    name: "Mann–Whitney U test",
    family: "means",
    short: "Rank-based comparison of two independent groups when data are skewed or ordinal.",
    useWhen: "Two independent groups; outcome is ordinal, clearly skewed, or has outliers, and samples are small.",
    example: "Length of hospital stay (days, right-skewed) after laparoscopic vs open appendicectomy.",
    why: "The test uses the ranks of the values rather than the values themselves, so extreme values and skew have little influence. It asks whether patients in one group tend to have higher values than patients in the other.",
    assumptions: [
      { t: "Observations are independent, in two separate groups", how: "Each patient appears once, in one group only.", fail: "For paired data use the Wilcoxon signed-rank test.", alt: "wilcoxon-signed" },
      { t: "The outcome is at least ordinal", how: "Values can be ranked from lowest to highest.", fail: "For unordered categories use a chi-squared test.", alt: "chi-rxc" },
      { t: "Similar distribution shape in both groups (only to interpret as a difference in medians)", how: "Compare histograms. If one group is skewed and the other is not, the test still works but tests “tends to be higher”, not medians.", fail: "Describe the result as a difference in distributions, not medians, and report the probability of superiority." }
    ],
    pitfalls: [
      "It is not a “test of medians” unless the two distributions have the same shape.",
      "Reporting only a p-value. Add the Hodges–Lehmann median difference with its CI, or the probability of superiority.",
      "Switching to a non-parametric test after the t-test was “not significant” is data dredging.",
      "Many tied values (e.g. short ordinal scales) reduce accuracy; most software applies a tie correction."
    ],
    interpret: [
      "Report medians and IQRs for each group.",
      "Report the Hodges–Lehmann estimate of the shift between groups with its 95% CI.",
      "The p-value tells you whether one group tends to have higher values. A probability of superiority of 0.70 means a random patient from group B has a 70% chance of a higher value than a random patient from group A."
    ],
    report: "Length of stay was longer after open surgery (median 6 days, IQR 4–9) than laparoscopic surgery (median 4, IQR 3–6); Hodges–Lehmann difference 2 days (95% CI 1 to 3); Mann–Whitney U = 812, p = 0.004.",
    software: [
      ["R", "wilcox.test(los ~ group, data = d, conf.int = TRUE)"],
      ["SPSS", "Analyze › Nonparametric Tests › Independent Samples › Mann–Whitney U"],
      ["jamovi", "T-Tests › Independent Samples; tick Mann–Whitney U and Effect size"]
    ],
    related: ["independent-t", "bootstrap-mean", "estimation-means"]
  },

  "wilcoxon-signed": {
    name: "Wilcoxon signed-rank test",
    family: "means",
    short: "Rank-based comparison of paired measurements when the differences are skewed or ordinal.",
    useWhen: "Same patients measured twice (or matched pairs); differences are not normal and the sample is small.",
    example: "Number of migraine days per month before and after starting a new preventive drug in 25 patients.",
    why: "It ranks the size of each patient’s change and checks whether increases and decreases balance out. It is the non-parametric partner of the paired t-test.",
    assumptions: [
      { t: "Measurements are paired", how: "Each before value has exactly one matching after value.", fail: "For separate groups use the Mann–Whitney U test.", alt: "mann-whitney" },
      { t: "Pairs are independent of each other", how: "One pair per patient.", fail: "Use a mixed model for clustered data." },
      { t: "Differences are roughly symmetric around their median", how: "Histogram of the differences. Symmetry is needed; normality is not.", fail: "If the differences are very asymmetric, use the sign test, which only counts increases and decreases." }
    ],
    pitfalls: [
      "Zero differences (no change) are dropped by the classic test; report how many there were.",
      "A before–after design without a control group cannot prove the treatment caused the change.",
      "Report the median change with a CI, not only the p-value."
    ],
    interpret: [
      "Report the median of the within-patient differences (or Hodges–Lehmann estimate) with its 95% CI.",
      "The p-value tests whether changes are systematically in one direction."
    ],
    report: "Monthly migraine days fell from a median of 8 (IQR 6–12) to 5 (IQR 3–8); median change −3 days (95% CI −4 to −1); Wilcoxon signed-rank V = 41, p = 0.002.",
    software: [
      ["R", "wilcox.test(d$after, d$before, paired = TRUE, conf.int = TRUE)"],
      ["SPSS", "Analyze › Nonparametric Tests › Related Samples › Wilcoxon"],
      ["jamovi", "T-Tests › Paired Samples; tick Wilcoxon rank"]
    ],
    related: ["paired-t", "bootstrap-mean"]
  },

  "one-way-anova": {
    name: "One-way ANOVA",
    family: "means",
    short: "Compares the means of three or more independent groups defined by one factor.",
    useWhen: "One continuous outcome; one categorical factor with three or more independent groups.",
    example: "Mean eGFR at 12 months across three immunosuppression regimens after kidney transplant.",
    why: "ANOVA tests all groups at once with a single test, keeping the false-positive rate at 5%. Running every pairwise t-test instead would push it well above 5%. If the overall test is significant, post-hoc comparisons show which groups differ.",
    assumptions: [
      { t: "Observations are independent", how: "Different patients in each group; each patient measured once.", fail: "For repeated measurements on the same patients use repeated-measures ANOVA or a mixed model.", alt: "rm-anova" },
      { t: "Residuals are roughly normal", how: "Fit the model and look at a Q–Q plot of the residuals (or histograms per group). Large, balanced groups tolerate mild departures.", fail: "Use the Kruskal–Wallis test, or transform the outcome (e.g. log).", alt: "kruskal-wallis" },
      { t: "Groups have similar variances", how: "Compare the SDs: largest ÷ smallest under 2 is reassuring. Levene’s test can help but is sensitive in large samples.", fail: "Use Welch’s ANOVA with Games–Howell post-hoc tests. This matters most when group sizes are unequal." },
      { t: "No extreme outliers", how: "Boxplot per group.", fail: "Check for entry errors; run a sensitivity analysis or use Kruskal–Wallis.", alt: "kruskal-wallis" },
      { t: "A post-hoc plan was chosen in advance", how: "Decide before analysis: all pairwise (Tukey), each vs control (Dunnett), or specific planned contrasts.", fail: "Choosing the comparison after seeing the means is a hidden multiple test. State that the comparisons are exploratory." }
    ],
    pitfalls: [
      "A significant F only tells you that at least one group differs. It does not say which.",
      "Running uncorrected pairwise t-tests after ANOVA defeats its purpose. Use Tukey, Dunnett, Games–Howell or Holm correction.",
      "If the groups have a natural order (e.g. dose levels), test for a linear trend; it is more powerful and more informative.",
      "Unequal group sizes make ANOVA sensitive to unequal variances.",
      "Report effect sizes in clinical units (differences between means with CIs), not just F and p."
    ],
    interpret: [
      "Look at the overall F-test: F(between df, within df), p-value.",
      "If significant, read the post-hoc comparisons: each mean difference with its adjusted 95% CI.",
      "Report an effect size: η² or, less biased, ω² (0.01 small, 0.06 medium, 0.14 large).",
      "Show a plot of group means with 95% CIs, ideally with the individual data points."
    ],
    report: "Mean eGFR differed between regimens, F(2, 117) = 5.4, p = 0.006, ω² = 0.07. Tukey post-hoc comparison: regimen C was higher than A by 6.1 mL/min/1.73 m² (95% CI 1.8 to 10.4).",
    software: [
      ["R", "m <- aov(egfr ~ regimen, data = d); summary(m); TukeyHSD(m)\noneway.test(egfr ~ regimen, data = d)   # Welch ANOVA"],
      ["SPSS", "Analyze › Compare Means › One-Way ANOVA; Post Hoc: Tukey or Games–Howell; Options: Welch"],
      ["jamovi", "ANOVA › One-Way ANOVA; choose Welch’s or Fisher’s, then Post-Hoc Tests"]
    ],
    related: ["kruskal-wallis", "two-way-anova", "ancova", "estimation-means", "bayes-means"]
  },

  "kruskal-wallis": {
    name: "Kruskal–Wallis test",
    family: "means",
    short: "Rank-based comparison of three or more independent groups.",
    useWhen: "Three or more independent groups; outcome is ordinal, skewed, or has outliers.",
    example: "Pain scores (0–10) across three types of post-operative analgesia.",
    why: "The rank-based extension of the Mann–Whitney test to more than two groups. It does not require normality and resists outliers.",
    assumptions: [
      { t: "Observations are independent", how: "Different patients in each group.", fail: "For repeated measurements use the Friedman test or a mixed model.", alt: "rm-anova" },
      { t: "The outcome is at least ordinal", how: "Values can be ranked.", fail: "For unordered categories use a chi-squared test.", alt: "chi-rxc" },
      { t: "Similar distribution shapes (only to interpret as differences in medians)", how: "Compare histograms or boxplots.", fail: "Describe the result as “values tend to differ” rather than medians differ." }
    ],
    pitfalls: [
      "A significant result does not say which groups differ. Use Dunn’s test with Holm or Bonferroni correction.",
      "Using pairwise Mann–Whitney tests without correction inflates false positives.",
      "Report medians and IQRs, not means."
    ],
    interpret: [
      "Report H (chi-squared distributed with k − 1 df) and p.",
      "Follow with Dunn’s pairwise comparisons, adjusted for multiplicity.",
      "Effect size: ε² (epsilon-squared) or pairwise probabilities of superiority."
    ],
    report: "Pain scores differed between analgesia types (Kruskal–Wallis H(2) = 11.3, p = 0.004). Dunn’s test with Holm correction showed lower scores with nerve block than with oral opioids (adjusted p = 0.003).",
    software: [
      ["R", "kruskal.test(pain ~ analgesia, data = d)\nFSA::dunnTest(pain ~ analgesia, data = d, method = \"holm\")"],
      ["SPSS", "Analyze › Nonparametric Tests › Independent Samples › Kruskal–Wallis; pairwise comparisons shown in model viewer"],
      ["jamovi", "ANOVA › One-Way ANOVA (Non-parametric); tick DSCF pairwise comparisons"]
    ],
    related: ["one-way-anova", "mann-whitney"]
  },

  "two-way-anova": {
    name: "Two-way ANOVA",
    family: "means",
    short: "Tests the effects of two factors on a continuous outcome, and whether they interact.",
    useWhen: "One continuous outcome; two categorical factors; independent patients.",
    example: "LDL reduction by drug (placebo vs statin) and sex (male vs female).",
    why: "It estimates the effect of each factor while accounting for the other, and tests the interaction: whether the effect of one factor depends on the level of the other (e.g. does the drug work differently in women?). This is the correct way to test effect modification, instead of comparing p-values between subgroups.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient is in exactly one combination of the two factors, measured once.", fail: "Use a mixed model for repeated or clustered data.", alt: "rm-anova" },
      { t: "Residuals are roughly normal", how: "Q–Q plot of model residuals.", fail: "Transform the outcome, use robust methods, or bootstrap the effects." },
      { t: "Similar variances in every cell", how: "Compare SDs across all factor combinations (cells).", fail: "Use heteroscedasticity-robust standard errors (regression with HC3) or transform the outcome." },
      { t: "Enough patients in each cell", how: "Tabulate counts per cell. Aim for at least 10–15 per cell; balanced designs are best.", fail: "Merge sparse levels or treat the analysis as exploratory. Very unbalanced designs change the results depending on sums-of-squares type." },
      { t: "No extreme outliers", how: "Boxplots per cell; check residuals.", fail: "Check for errors; sensitivity analysis." }
    ],
    pitfalls: [
      "Interpreting main effects when there is an important interaction. If the interaction is present, describe the effect of each factor separately at each level of the other (simple effects).",
      "Detecting an interaction needs roughly four times the sample size of a main effect. A non-significant interaction is weak evidence that none exists.",
      "With unbalanced data, Type I, II and III sums of squares give different answers. Use Type II if there is no interaction and Type III (with sum-to-zero contrasts) if there is.",
      "Comparing “significant in men, not significant in women” is not a test of interaction."
    ],
    interpret: [
      "Look at the interaction term first.",
      "If the interaction is meaningful: plot the cell means with CIs (interaction plot) and report simple effects.",
      "If not: report each main effect as an adjusted mean difference with 95% CI.",
      "Effect size: partial η² for each term."
    ],
    report: "There was a drug × sex interaction, F(1, 156) = 4.8, p = 0.03, partial η² = 0.03. The statin lowered LDL by 1.2 mmol/L in men (95% CI 0.9 to 1.5) and by 0.7 mmol/L in women (95% CI 0.4 to 1.0).",
    software: [
      ["R", "options(contrasts = c(\"contr.sum\", \"contr.poly\"))\nm <- lm(ldl ~ drug * sex, data = d); car::Anova(m, type = 3)\nemmeans::emmeans(m, pairwise ~ drug | sex)"],
      ["SPSS", "Analyze › General Linear Model › Univariate; add both factors; EM Means › Compare simple main effects"],
      ["jamovi", "ANOVA › ANOVA; add both factors; Estimated Marginal Means"]
    ],
    related: ["one-way-anova", "three-way-anova", "ancova", "linear-regression"]
  },

  "three-way-anova": {
    name: "Three-way ANOVA",
    family: "means",
    short: "Tests the effects of three factors on a continuous outcome, including their interactions.",
    useWhen: "One continuous outcome; three categorical factors; a large sample with adequate numbers in every cell.",
    example: "Systolic BP by antihypertensive (A vs B) × sex × age band (<50, 50–69, ≥70).",
    why: "It extends two-way ANOVA to three factors and can test whether a two-way interaction itself changes across the third factor. It is only justified when these interactions were hypothesised in advance.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient measured once, in one cell.", fail: "Use a mixed model for repeated or clustered data.", alt: "rm-anova" },
      { t: "Residuals are roughly normal", how: "Q–Q plot of model residuals.", fail: "Transform the outcome or use robust/bootstrap methods." },
      { t: "Similar variances in every cell", how: "Compare SDs across all cells (2 × 2 × 3 = 12 cells here).", fail: "Use robust standard errors in a regression framework." },
      { t: "Enough patients in every cell", how: "Tabulate counts per cell. Cells multiply quickly; aim for 10–15+ per cell.", fail: "Drop the three-way interaction, merge levels, or fit a regression model with only pre-specified interactions.", alt: "linear-regression" },
      { t: "The interactions tested were pre-specified", how: "Check the protocol. A three-way model tests 7 effects at once.", fail: "Label unplanned interactions as exploratory." }
    ],
    pitfalls: [
      "Seven effects (3 main, 3 two-way, 1 three-way) mean seven chances of a false positive.",
      "A three-way interaction is very hard to explain to readers; always show it as a plot.",
      "Sparse cells produce unstable estimates. A regression with continuous age (instead of age bands) is often better.",
      "Interpret from the highest-order significant interaction downwards."
    ],
    interpret: [
      "Check the three-way interaction first. If present, show the two-way interaction plot separately for each level of the third factor.",
      "If absent, drop it and interpret the two-way interactions, then main effects.",
      "Report adjusted mean differences with 95% CIs and partial η²."
    ],
    report: "The three-way interaction was not significant (F(2, 276) = 0.6, p = 0.55) and was removed. There was a drug × age band interaction (F(2, 278) = 3.9, p = 0.02): drug B lowered SBP more than drug A in patients ≥70 (difference 7 mmHg, 95% CI 2 to 12) but not in those <50.",
    software: [
      ["R", "m <- lm(sbp ~ drug * sex * ageband, data = d); car::Anova(m, type = 3)"],
      ["SPSS", "Analyze › General Linear Model › Univariate; add three fixed factors"],
      ["jamovi", "ANOVA › ANOVA; add three factors"]
    ],
    related: ["two-way-anova", "linear-regression"]
  },

  "rm-anova": {
    name: "Repeated-measures ANOVA / mixed model",
    family: "means",
    short: "Compares a continuous outcome measured on the same patients at three or more time points.",
    useWhen: "Same patients measured repeatedly (e.g. baseline, 3, 6 and 12 months), optionally in several groups.",
    example: "FEV₁ at baseline, 3, 6 and 12 months after starting inhaled therapy.",
    why: "It accounts for the fact that measurements from the same patient are correlated. A linear mixed model does the same job and also keeps patients with some missing visits, so it is usually preferred.",
    assumptions: [
      { t: "Patients are independent of each other", how: "Measurements are correlated within a patient but not between patients.", fail: "Add a further random effect for clusters (e.g. hospital)." },
      { t: "Residuals are roughly normal", how: "Q–Q plot of residuals.", fail: "Transform the outcome or use the Friedman test (no missing data allowed).", alt: "kruskal-wallis" },
      { t: "Sphericity (classic RM-ANOVA only)", how: "The variances of the differences between all pairs of time points should be similar. Mauchly’s test.", fail: "Apply the Greenhouse–Geisser correction, or use a mixed model with an appropriate covariance structure." },
      { t: "Missing visits are handled appropriately", how: "Classic RM-ANOVA drops any patient with one missing visit.", fail: "Use a linear mixed model, which uses all available data under the missing-at-random assumption." }
    ],
    pitfalls: [
      "Running a separate test at each time point multiplies tests and ignores the correlation over time.",
      "Losing patients who missed a single visit (classic RM-ANOVA) can bias results and waste data.",
      "In trials, the key question is usually the group × time interaction: do trajectories differ between arms?"
    ],
    interpret: [
      "Report the effect of time (and group × time interaction if comparing groups).",
      "Show mean trajectories with 95% CIs at each time point.",
      "Report estimated differences at the pre-specified primary time point."
    ],
    report: "In a linear mixed model with a random intercept for patient, FEV₁ increased over time (p < 0.001); the mean increase from baseline to 12 months was 180 mL (95% CI 110 to 250).",
    software: [
      ["R", "lme4::lmer(fev1 ~ time * group + (1 | id), data = long)\n# or afex::aov_ez() for classic RM-ANOVA with GG correction"],
      ["SPSS", "Analyze › Mixed Models › Linear (or GLM › Repeated Measures)"],
      ["jamovi", "Linear Models › Mixed Model (GAMLj module), or ANOVA › Repeated Measures ANOVA"]
    ],
    related: ["paired-t", "one-way-anova"]
  },

  "manova": {
    name: "MANOVA",
    family: "means",
    short: "Compares groups on two or more related continuous outcomes analysed together.",
    useWhen: "Several related continuous outcomes that together describe one concept; one or more grouping factors.",
    example: "Effect of three rehabilitation programmes on grip strength, walking speed and balance score together.",
    why: "MANOVA tests whether the groups differ on the combination of outcomes, taking into account how the outcomes are correlated. It can detect a difference that no single outcome shows on its own.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient measured once, in one group.", fail: "Use a multivariate mixed model for repeated data." },
      { t: "Each group has more patients than outcomes", how: "Count patients per group; the smallest group must exceed the number of outcomes, and ideally be much larger.", fail: "Reduce the number of outcomes or increase the sample." },
      { t: "Multivariate normality", how: "Check that each outcome is roughly normal within groups (Q–Q plots). Mardia’s test is available but strict.", fail: "Transform skewed outcomes or use a permutation MANOVA (PERMANOVA)." },
      { t: "Similar covariance matrices across groups", how: "Box’s M test; use p < 0.001 as the threshold because it is very sensitive.", fail: "Report Pillai’s trace, which is the most robust statistic, especially with unequal group sizes." },
      { t: "Outcomes are moderately correlated", how: "Correlation matrix of the outcomes: ideally r between about 0.3 and 0.8.", fail: "If uncorrelated, analyse outcomes separately with ANOVA. If r > 0.9, drop or combine redundant outcomes.", alt: "one-way-anova" },
      { t: "Linear relationships between outcomes", how: "Scatterplot matrix of outcomes within each group.", fail: "Transform variables showing curved relationships." },
      { t: "No multivariate outliers", how: "Mahalanobis distance for each patient.", fail: "Check for errors; sensitivity analysis." }
    ],
    pitfalls: [
      "A significant MANOVA does not protect follow-up ANOVAs from multiple testing; still correct them or use discriminant analysis.",
      "Throwing unrelated outcomes into one MANOVA makes the result uninterpretable. Choose outcomes that belong together clinically.",
      "Using Wilks’ lambda when covariance matrices differ. Use Pillai’s trace instead."
    ],
    interpret: [
      "Report the multivariate statistic (Pillai’s trace), its approximate F, df and p.",
      "If significant, examine which outcomes drive the difference: follow-up ANOVAs with correction, or discriminant function analysis.",
      "Report group differences for each outcome with 95% CIs."
    ],
    report: "Programmes differed on the combined outcomes, Pillai’s trace = 0.18, F(6, 232) = 3.8, p = 0.001. Follow-up ANOVAs (Holm-corrected) showed the difference was driven mainly by walking speed.",
    software: [
      ["R", "m <- manova(cbind(grip, speed, balance) ~ programme, data = d)\nsummary(m, test = \"Pillai\"); summary.aov(m)"],
      ["SPSS", "Analyze › General Linear Model › Multivariate"],
      ["jamovi", "ANOVA › MANCOVA"]
    ],
    related: ["one-way-anova", "ancova"]
  },

  "ancova": {
    name: "ANCOVA",
    family: "means",
    short: "Compares group means while adjusting for a continuous baseline variable.",
    useWhen: "One continuous outcome; one or more groups; a continuous covariate measured before treatment (often the baseline value of the outcome).",
    example: "RCT comparing systolic BP at 12 weeks between two drugs, adjusting for baseline SBP.",
    why: "Adjusting for the baseline value removes variation that has nothing to do with treatment, so the comparison is more precise than comparing final values or change scores. In randomised trials it is the recommended analysis for continuous outcomes measured at baseline and follow-up.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient measured once at follow-up, one group only.", fail: "Use a mixed model for clustered or repeated data.", alt: "rm-anova" },
      { t: "The covariate was measured before treatment and is not affected by it", how: "Check timing. Adjusting for something the treatment changes removes part of the treatment effect.", fail: "Remove post-randomisation covariates from the model." },
      { t: "Linear relationship between covariate and outcome", how: "Scatterplot of outcome vs covariate in each group.", fail: "Add a spline or transformation of the covariate." },
      { t: "Homogeneity of regression slopes", how: "Add a group × covariate interaction; its slopes should be similar (interaction not important).", fail: "If the treatment effect depends on the covariate, report the interaction and effects at chosen covariate values." },
      { t: "Residuals are roughly normal with similar variance across groups", how: "Q–Q plot of residuals; residuals vs fitted plot.", fail: "Transform the outcome or use robust standard errors." },
      { t: "The covariate is measured reliably", how: "Consider measurement error (e.g. single BP reading).", fail: "Use an average of several baseline measurements where possible." }
    ],
    pitfalls: [
      "Using ANCOVA to “correct” pre-existing differences between non-randomised groups can give misleading answers (Lord’s paradox).",
      "Adjusting for variables measured after randomisation.",
      "Choosing covariates after looking at the data. Pre-specify them in the protocol.",
      "Analysing change scores instead: less efficient than ANCOVA in trials."
    ],
    interpret: [
      "Report adjusted (estimated marginal) means for each group.",
      "The key result is the adjusted mean difference with its 95% CI.",
      "Report the covariate’s coefficient only as supporting information."
    ],
    report: "Adjusted for baseline SBP, mean SBP at 12 weeks was 6.3 mmHg lower with drug A than drug B (95% CI 2.9 to 9.7; p < 0.001).",
    software: [
      ["R", "m <- lm(sbp12 ~ group + sbp0, data = d); summary(m); confint(m)\nemmeans::emmeans(m, pairwise ~ group)"],
      ["SPSS", "Analyze › General Linear Model › Univariate; outcome, factor, covariate; EM Means"],
      ["jamovi", "ANOVA › ANCOVA; add covariate; Estimated Marginal Means"]
    ],
    related: ["one-way-anova", "linear-regression", "estimation-means"]
  },

  // =================== COMPARING GROUPS ===================
  "chi-2x2": {
    name: "Pearson’s chi-squared test (2×2)",
    family: "groups",
    short: "Compares a proportion between two independent groups.",
    useWhen: "Two independent groups; a yes/no outcome; all expected counts are 5 or more.",
    example: "Wound infection (yes/no) with dressing A vs dressing B.",
    why: "The test compares the counts you observed with the counts you would expect if the outcome were unrelated to group. With enough patients per cell, it is accurate and widely understood. Pair it with a risk difference or risk ratio so readers see the size of the effect.",
    assumptions: [
      { t: "Observations are independent; each patient is counted once", how: "Every patient falls in exactly one cell of the table.", fail: "For paired yes/no data (same patients twice) use McNemar’s test.", alt: "mcnemar" },
      { t: "The table contains counts, not percentages or means", how: "Cells hold numbers of patients.", fail: "Convert back to counts." },
      { t: "All expected counts are 5 or more", how: "Expected = row total × column total ÷ grand total. Ask your software to show expected counts.", fail: "Use Fisher’s exact test.", alt: "fisher" },
      { t: "Categories are mutually exclusive", how: "Each patient can only be in one outcome category and one group.", fail: "Redefine categories." }
    ],
    pitfalls: [
      "Reporting only χ² and p. Always give the effect size: risk difference, risk ratio or odds ratio with 95% CI.",
      "Yates’ continuity correction is overly conservative; many statisticians prefer the uncorrected test, or Fisher’s test for small counts. State which you used.",
      "Using it on paired data (before/after in the same patients) gives wrong answers.",
      "Percentages without denominators hide small numbers. Always show n/N."
    ],
    interpret: [
      "Report n/N (%) for each group.",
      "Give the risk difference and risk ratio (or odds ratio) with 95% CIs. For a beneficial treatment, number needed to treat = 1 ÷ risk difference.",
      "χ² with 1 df and the p-value tell you whether the difference is larger than chance would explain."
    ],
    report: "Infection occurred in 12/100 (12%) with dressing A and 25/100 (25%) with dressing B; risk difference −13 percentage points (95% CI −24 to −2), risk ratio 0.48 (95% CI 0.26 to 0.90); χ²(1) = 5.6, p = 0.018. Number needed to treat ≈ 8.",
    software: [
      ["R", "tab <- table(d$dressing, d$infection)\nchisq.test(tab, correct = FALSE); epitools::riskratio(tab)"],
      ["SPSS", "Analyze › Descriptive Statistics › Crosstabs; Statistics: Chi-square, Risk; Cells: Expected"],
      ["jamovi", "Frequencies › Independent Samples (χ² test of association); tick Expected counts and Comparative measures"]
    ],
    related: ["fisher", "estimation-groups", "bayes-groups", "logistic"]
  },

  "fisher": {
    name: "Fisher’s exact test",
    family: "groups",
    short: "Compares proportions in a small 2×2 table where expected counts are below 5.",
    useWhen: "Two independent groups, a yes/no outcome, and small numbers (any expected count below 5).",
    example: "Serious adverse events: 1/20 with a new drug vs 5/20 with standard care.",
    why: "The chi-squared test relies on an approximation that fails with small counts. Fisher’s test calculates the probability exactly, so it stays valid however small the numbers are.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient in one cell only.", fail: "For paired data use McNemar’s test.", alt: "mcnemar" },
      { t: "The data are counts in a 2×2 table", how: "Two groups × two outcomes. Larger tables need the Fisher–Freeman–Halton extension.", fail: "Use the exact test for larger tables (fisher.test handles r×c in R)." },
      { t: "Row or column totals are fixed by design (technical)", how: "The test assumes the margins are fixed; in practice it is used widely and is somewhat conservative otherwise.", fail: "Consider Barnard’s or the mid-p version for more power." }
    ],
    pitfalls: [
      "Small studies have very little power: a non-significant result with 20 patients per arm rarely rules out an important difference.",
      "Report the effect size with an exact CI, not just the p-value.",
      "Use the two-sided p-value unless a one-sided test was pre-specified."
    ],
    interpret: [
      "Report n/N (%) per group, the odds ratio or risk difference with 95% CI, and the exact p-value.",
      "Wide confidence intervals are expected; say so."
    ],
    report: "Serious adverse events occurred in 1/20 (5%) patients on the new drug and 5/20 (25%) on standard care; odds ratio 0.16 (95% CI 0.003 to 1.66); Fisher’s exact p = 0.18.",
    software: [
      ["R", "fisher.test(table(d$group, d$event))"],
      ["SPSS", "Analyze › Descriptive Statistics › Crosstabs; Exact… › Exact"],
      ["jamovi", "Frequencies › Independent Samples; tick Fisher’s exact test"]
    ],
    related: ["chi-2x2", "estimation-groups", "bayes-groups"]
  },

  "chi-rxc": {
    name: "Chi-squared test for tables larger than 2×2",
    family: "groups",
    short: "Tests the association between two categorical variables when either has more than two categories.",
    useWhen: "Two independent categorical variables, at least one with three or more unordered categories.",
    example: "Blood group (A, B, AB, O) vs severe COVID-19 (yes/no), or treatment (3 arms) × response (complete/partial/none).",
    why: "It tests all categories together in one test. If significant, post-hoc analysis identifies which cells drive the association.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient is counted once.", fail: "Paired data need McNemar–Bowker or a mixed model.", alt: "mcnemar" },
      { t: "Expected counts are adequate", how: "No more than 20% of cells with expected count below 5, and none below 1 (Cochran’s rule).", fail: "Merge clinically sensible categories before testing, or use an exact (Fisher–Freeman–Halton) test.", alt: "fisher" },
      { t: "Categories are unordered", how: "If a variable has a natural order (stage, severity), a trend test uses that information.", fail: "Use the chi-squared test for trend.", alt: "chi-trend" },
      { t: "Categories are mutually exclusive", how: "Each patient fits one category only.", fail: "Redefine categories." }
    ],
    pitfalls: [
      "A significant result does not say which categories differ. Plan a post-hoc analysis.",
      "Merging categories after seeing the results to achieve significance.",
      "With ordered categories, the ordinary chi-squared test wastes information."
    ],
    interpret: [
      "Report χ² with (rows − 1) × (columns − 1) degrees of freedom and p.",
      "Effect size: Cramér’s V (0.1 small, 0.3 medium, 0.5 large for 2 df; thresholds depend on table size).",
      "Show the full table with row percentages, then run post-hoc analysis."
    ],
    report: "Response differed by treatment arm, χ²(4) = 14.2, p = 0.007, Cramér’s V = 0.17. Post-hoc adjusted residuals showed more complete responses in arm C than expected (z = 3.1).",
    software: [
      ["R", "tab <- table(d$arm, d$response); r <- chisq.test(tab); r; r$expected; r$stdres"],
      ["SPSS", "Crosstabs; Statistics: Chi-square, Phi and Cramér’s V; Cells: Expected, Adjusted standardized residuals"],
      ["jamovi", "Frequencies › Independent Samples; tick Expected counts and Cramér’s V"]
    ],
    related: ["chi-posthoc", "chi-trend", "estimation-groups", "bayes-groups"]
  },

  "chi-posthoc": {
    name: "Post-hoc analysis after a chi-squared test",
    family: "groups",
    short: "Finds which cells or pairs of groups drive a significant chi-squared result.",
    useWhen: "A table larger than 2×2 where the overall chi-squared test is significant (or planned comparisons were pre-specified).",
    example: "After finding that response differs across three treatment arms, identify which arms differ from each other.",
    why: "The overall test only says an association exists. Post-hoc methods locate it, while correcting for the extra tests so the false-positive rate stays controlled.",
    assumptions: [
      { t: "The overall test was significant, or the comparisons were planned", how: "Check the omnibus χ² result and the protocol.", fail: "Without a significant omnibus test, label any post-hoc finding exploratory." },
      { t: "A correction for multiple comparisons is applied", how: "Choose Holm (recommended) or Bonferroni before looking at the results.", fail: "Uncorrected pairwise tests inflate false positives; apply the correction." },
      { t: "Each pairwise comparison meets its own sample-size rules", how: "Check expected counts in each 2×2 sub-table.", fail: "Use Fisher’s exact test for sparse pairwise tables.", alt: "fisher" }
    ],
    pitfalls: [
      "Comparing every cell or every pair without correction.",
      "Interpreting adjusted residuals as effect sizes. Report risk differences or ratios with CIs for the pairs that matter.",
      "Using a fixed ±1.96 cut-off for residuals across many cells without adjustment."
    ],
    interpret: [
      "Adjusted standardised residuals: values above about +2 (or below −2) mean more (or fewer) patients than expected in that cell. With many cells, use a Bonferroni-adjusted threshold.",
      "Pairwise 2×2 comparisons: report each with its effect size, 95% CI and adjusted p-value.",
      "Explain the pattern in clinical language: which group did better, and by how much."
    ],
    report: "Pairwise comparisons with Holm correction: complete response was more frequent in arm C than arm A (42% vs 21%; risk difference 21 percentage points, 95% CI 7 to 35; adjusted p = 0.01); other comparisons were not significant.",
    software: [
      ["R", "chisq.test(tab)$stdres   # adjusted residuals\nrcompanion::pairwiseNominalIndependence(tab, method = \"holm\")"],
      ["SPSS", "Crosstabs › Cells: Adjusted standardized; Column proportions z-test with Bonferroni"],
      ["jamovi", "Frequencies › Independent Samples; Cells: adjusted residuals"]
    ],
    related: ["chi-rxc", "estimation-groups"]
  },

  "chi-trend": {
    name: "Chi-squared test for trend (Cochran–Armitage)",
    family: "groups",
    short: "Tests whether a proportion rises or falls steadily across ordered categories.",
    useWhen: "A yes/no outcome across three or more ordered groups (dose, stage, age band).",
    example: "Proportion with post-operative delirium across ASA grades I–IV.",
    why: "Using the order of the categories gives one focused test of a steady trend, which is more powerful than the general chi-squared test when the relationship is monotonic.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient counted once.", fail: "Use a mixed or GEE logistic model for clustered data." },
      { t: "One variable is binary and the other is ordered", how: "Check categories have a natural order.", fail: "For unordered categories use the ordinary chi-squared test.", alt: "chi-rxc" },
      { t: "Scores reflect the spacing between categories", how: "By default categories are scored 1, 2, 3…; if categories are unevenly spaced (e.g. doses 10, 20, 80 mg), use the actual values.", fail: "Assign meaningful scores or use logistic regression with the ordinal variable.", alt: "logistic" },
      { t: "The trend is roughly linear across categories", how: "Plot the proportion in each category.", fail: "If the pattern is U-shaped, the trend test can miss it; use the ordinary chi-squared test." }
    ],
    pitfalls: [
      "A significant trend does not mean every step is significant.",
      "Assuming equal spacing between categories that are clinically unequal.",
      "Not showing the proportions per category."
    ],
    interpret: [
      "Report the proportion in each category and the trend χ² (1 df) with p.",
      "For an effect size, fit a logistic regression with the ordinal score and report the odds ratio per category step."
    ],
    report: "Delirium increased with ASA grade (I: 3%, II: 8%, III: 15%, IV: 27%; χ² for trend = 21.4, p < 0.001); odds ratio per grade 1.9 (95% CI 1.4 to 2.5).",
    software: [
      ["R", "prop.trend.test(events, totals)   # or DescTools::CochranArmitageTest(tab)"],
      ["SPSS", "Crosstabs; Chi-square output includes “Linear-by-Linear Association”"],
      ["jamovi", "Frequencies › Independent Samples; the “Linear-by-linear” row (jamovi 2.4+) or logistic regression"]
    ],
    related: ["chi-rxc", "logistic", "bayes-groups"]
  },

  "mcnemar": {
    name: "McNemar’s test",
    family: "groups",
    short: "Compares paired yes/no outcomes in the same patients or matched pairs.",
    useWhen: "The same patients classified twice (before/after, two diagnostic tests), or matched case–control pairs.",
    example: "Proportion of patients with a positive result on a rapid test vs PCR, both done on the same patients.",
    why: "Paired data only carry information in the discordant pairs (positive on one, negative on the other). McNemar’s test compares these two discordant counts and ignores pairs that agree.",
    assumptions: [
      { t: "Data are genuinely paired", how: "Each patient (or matched pair) contributes one observation to each condition.", fail: "For independent groups use the chi-squared or Fisher’s test.", alt: "chi-2x2" },
      { t: "Pairs are independent of each other", how: "One pair per patient.", fail: "Use a mixed or GEE model for clustered pairs." },
      { t: "Enough discordant pairs", how: "Count pairs that disagree. With fewer than about 25, use the exact binomial version.", fail: "Use the exact McNemar test." }
    ],
    pitfalls: [
      "Using a chi-squared test on paired data ignores the pairing.",
      "Reporting agreement (e.g. kappa) and McNemar interchangeably: McNemar tests whether proportions differ, not how well the tests agree.",
      "Report the difference in paired proportions with its CI."
    ],
    interpret: [
      "Show the 2×2 table of pairs.",
      "Report the two proportions, their difference with a 95% CI, and the McNemar p-value."
    ],
    report: "Of 200 patients, 38 were positive on PCR only and 12 on the rapid test only; the rapid test detected 13 percentage points fewer positives (95% CI 6 to 20); McNemar χ²(1) = 13.5, p < 0.001.",
    software: [
      ["R", "mcnemar.test(table(d$rapid, d$pcr))   # exact: exact2x2::mcnemar.exact()"],
      ["SPSS", "Crosstabs; Statistics: McNemar"],
      ["jamovi", "Frequencies › Paired Samples (McNemar test)"]
    ],
    related: ["chi-2x2", "paired-t"]
  },

  // =================== CORRELATION & REGRESSION ===================
  "pearson": {
    name: "Pearson correlation",
    family: "corr",
    short: "Measures the strength of a straight-line relationship between two continuous variables.",
    useWhen: "Two continuous, roughly normal variables with a linear relationship; one pair of values per patient.",
    example: "Correlation between BMI and fasting insulin in 150 adults.",
    why: "Pearson’s r summarises how closely the points on a scatterplot fall along a straight line, from −1 to +1. It is the natural choice when both variables are continuous and the relationship is linear.",
    assumptions: [
      { t: "Both variables are continuous", how: "Measured on numeric scales.", fail: "For ordinal data use Spearman’s rank correlation.", alt: "spearman" },
      { t: "The relationship is linear", how: "Always draw the scatterplot first.", fail: "For curved but consistently rising or falling patterns use Spearman.", alt: "spearman" },
      { t: "Roughly bivariate normal (for the p-value and CI)", how: "Histograms of each variable; the scatterplot should look like an ellipse.", fail: "Use Spearman or a bootstrap CI for r.", alt: "spearman" },
      { t: "No influential outliers", how: "A single extreme point can create or destroy a correlation. Look at the scatterplot.", fail: "Check for errors; report r with and without the point, or use Spearman.", alt: "spearman" },
      { t: "One pair per patient", how: "Repeated measurements from the same patient are not independent.", fail: "Use repeated-measures correlation (rmcorr) or a mixed model." }
    ],
    pitfalls: [
      "Correlation does not prove causation.",
      "Correlation is not agreement: two methods can correlate perfectly and still disagree by 20%. Use Bland–Altman analysis for agreement.",
      "r depends on the range of values sampled; a restricted range weakens it.",
      "With large samples, tiny correlations become “significant”. Judge the size of r, not only p.",
      "r² is the proportion of variance shared; r = 0.3 means only 9% shared."
    ],
    interpret: [
      "Report r with its 95% CI and p.",
      "Rough guide: |r| < 0.3 weak, 0.3–0.7 moderate, > 0.7 strong, but clinical context matters.",
      "Always show the scatterplot."
    ],
    report: "BMI correlated moderately with fasting insulin (r = 0.46, 95% CI 0.32 to 0.58, p < 0.001; n = 150).",
    software: [
      ["R", "cor.test(d$bmi, d$insulin)"],
      ["SPSS", "Analyze › Correlate › Bivariate; Pearson"],
      ["jamovi", "Regression › Correlation Matrix; tick Pearson, Confidence intervals"]
    ],
    related: ["spearman", "linear-regression", "bland-altman"]
  },

  "spearman": {
    name: "Spearman rank correlation",
    family: "corr",
    short: "Measures a consistently increasing or decreasing relationship using ranks.",
    useWhen: "Ordinal variables, skewed data, outliers, or a curved but consistently rising or falling relationship.",
    example: "Correlation between NYHA class (I–IV) and NT-proBNP (highly skewed).",
    why: "Spearman’s ρ is Pearson’s r calculated on ranks. It captures any relationship that keeps rising (or falling) and is not distorted by outliers or skew.",
    assumptions: [
      { t: "Variables are at least ordinal", how: "Values can be ranked.", fail: "For nominal categories use a chi-squared test.", alt: "chi-rxc" },
      { t: "The relationship is monotonic", how: "Scatterplot: one variable should keep rising (or falling) as the other rises.", fail: "U-shaped relationships give ρ near zero despite a strong link; model them with regression and a curve term.", alt: "linear-regression" },
      { t: "One pair per patient", how: "Independent pairs.", fail: "Use methods for repeated measures." }
    ],
    pitfalls: [
      "Many tied values (short ordinal scales) reduce precision; Kendall’s τ-b handles ties better.",
      "Correlation is not causation, and not agreement.",
      "Report the CI, not just p."
    ],
    interpret: [
      "Report ρ with 95% CI and p. Same rough strength guide as Pearson.",
      "Describe the relationship: higher NYHA class, higher NT-proBNP."
    ],
    report: "NYHA class correlated with NT-proBNP (Spearman ρ = 0.58, 95% CI 0.45 to 0.69, p < 0.001; n = 120).",
    software: [
      ["R", "cor.test(d$nyha, d$ntprobnp, method = \"spearman\")"],
      ["SPSS", "Analyze › Correlate › Bivariate; Spearman"],
      ["jamovi", "Regression › Correlation Matrix; tick Spearman"]
    ],
    related: ["pearson", "linear-regression"]
  },

  "linear-regression": {
    name: "Linear regression",
    family: "corr",
    short: "Predicts or explains a continuous outcome from one or more variables, adjusting for confounders.",
    useWhen: "One continuous outcome; one or more predictors (continuous or categorical).",
    example: "Effect of diabetes on eGFR, adjusted for age, sex and hypertension.",
    why: "Regression estimates how much the outcome changes for each unit change in a predictor while holding the other variables constant. It is the standard tool for adjusting for confounding with a continuous outcome.",
    assumptions: [
      { t: "Linearity: each continuous predictor relates linearly to the outcome", how: "Plot residuals against each predictor and against fitted values; look for curves.", fail: "Add restricted cubic splines or a transformation. Avoid cutting the predictor into categories." },
      { t: "Independence of residuals", how: "One observation per patient, no clustering.", fail: "Use a mixed model or cluster-robust standard errors." },
      { t: "Residuals are roughly normal", how: "Q–Q plot of residuals. The outcome itself does not have to be normal.", fail: "With large samples this matters little. Otherwise transform the outcome or use bootstrap CIs.", alt: "bootstrap-mean" },
      { t: "Constant variance of residuals (homoscedasticity)", how: "Residuals vs fitted plot should show an even band, not a funnel.", fail: "Use robust (HC3) standard errors or transform the outcome (e.g. log)." },
      { t: "No harmful multicollinearity", how: "Variance inflation factor (VIF) under about 5 for each predictor.", fail: "Remove or combine strongly correlated predictors." },
      { t: "No overly influential observations", how: "Cook’s distance; leverage plots.", fail: "Check for errors; report results with and without them." },
      { t: "Enough patients for the number of predictors", how: "At least 10–20 patients per predictor (count each category level after the first).", fail: "Reduce predictors using clinical knowledge; use penalised regression for prediction models." }
    ],
    pitfalls: [
      "Stepwise selection of variables produces biased, over-optimistic models. Choose confounders in advance using clinical knowledge or a causal diagram (DAG).",
      "Dichotomising continuous predictors (e.g. age ≥ 65) throws away information.",
      "Adjusting for mediators (variables on the causal path) removes part of the effect you want to measure.",
      "Extrapolating outside the range of the data.",
      "Treating an association from observational data as a causal effect."
    ],
    interpret: [
      "Each coefficient: the average change in outcome per one-unit increase in the predictor, other variables held constant. Report it with its 95% CI.",
      "For categorical predictors, the coefficient is the difference from the reference category.",
      "R² shows how much variation the model explains; a low R² does not invalidate an important effect estimate.",
      "For prediction models, report calibration and validation, not only R²."
    ],
    report: "After adjusting for age, sex and hypertension, diabetes was associated with 7.4 mL/min/1.73 m² lower eGFR (95% CI 4.1 to 10.7; p < 0.001). Adjusted R² = 0.31.",
    software: [
      ["R", "m <- lm(egfr ~ diabetes + age + sex + htn, data = d)\nsummary(m); confint(m); plot(m); car::vif(m)"],
      ["SPSS", "Analyze › Regression › Linear; Statistics: Confidence intervals, Collinearity; Plots: ZRESID vs ZPRED"],
      ["jamovi", "Regression › Linear Regression; Assumption Checks: all"]
    ],
    related: ["pearson", "ancova", "logistic", "poisson-count"]
  },

  "bland-altman": {
    name: "Bland–Altman agreement analysis",
    family: "corr",
    short: "Assesses whether two measurement methods agree well enough to be used interchangeably.",
    useWhen: "The same quantity measured by two methods (or observers) on the same patients.",
    example: "Point-of-care haemoglobin vs laboratory analyser in 120 patients.",
    why: "Correlation only shows that two methods move together, not that they give the same value. Bland–Altman estimates the average difference (bias) and the range within which 95% of differences fall (limits of agreement), which you then judge against what is clinically acceptable.",
    assumptions: [
      { t: "Both methods measure the same quantity in the same units", how: "Check units and calibration.", fail: "Convert units; if they measure different things, agreement analysis is not meaningful." },
      { t: "Differences are roughly normal", how: "Histogram of the differences.", fail: "Use non-parametric limits (2.5th and 97.5th percentiles of the differences) or log-transform." },
      { t: "The difference does not change with the size of the measurement", how: "On the Bland–Altman plot, the spread and average of differences should be flat across the range.", fail: "Use percentage differences, log-transform, or regression-based limits of agreement." },
      { t: "One pair per patient", how: "Independent pairs.", fail: "Use the Bland–Altman method for repeated measurements." },
      { t: "Acceptable limits were defined in advance", how: "Decide what difference is clinically acceptable before analysis.", fail: "Without a pre-set threshold, conclusions about agreement are subjective." }
    ],
    pitfalls: [
      "Using correlation or a paired t-test to claim agreement.",
      "Reporting limits of agreement without their confidence intervals when the sample is small.",
      "Deciding what is “acceptable” after seeing the results."
    ],
    interpret: [
      "Bias: the mean difference (with 95% CI). A CI excluding 0 means systematic over- or under-reading.",
      "Limits of agreement: bias ± 1.96 SD of the differences. Are these within the clinically acceptable range?",
      "Show the plot: difference (y) vs mean of the two methods (x)."
    ],
    report: "The point-of-care device read on average 0.3 g/dL higher than the laboratory (95% CI 0.2 to 0.4); 95% limits of agreement −0.9 to 1.5 g/dL, wider than the pre-specified acceptable limit of ±1.0 g/dL.",
    software: [
      ["R", "BlandAltmanLeh::bland.altman.plot(d$poc, d$lab)   # or blandr package"],
      ["SPSS", "Compute difference and mean, then Graphs › Scatter; no built-in module"],
      ["jamovi", "SimplyAgree module › Method comparison"]
    ],
    related: ["pearson", "paired-t"]
  },

  // =================== SURVIVAL ===================
  "km-one": {
    name: "Kaplan–Meier estimate (one group)",
    family: "surv",
    short: "Describes survival over time in one group of patients, allowing for incomplete follow-up.",
    useWhen: "Time from a defined start point to an event, with some patients still event-free at their last follow-up (censored).",
    example: "Overall survival after diagnosis in 210 patients with pancreatic cancer.",
    why: "Some patients have not had the event by the end of follow-up. Kaplan–Meier uses the time they were observed without assuming anything about the shape of the survival curve, so it gives unbiased survival estimates when censoring is non-informative.",
    assumptions: [
      { t: "Censoring is non-informative", how: "Patients lost to follow-up should have the same prognosis as those who remain. Ask why patients were censored.", fail: "Discuss the possible bias; sensitivity analyses (e.g. treat lost patients as events) help." },
      { t: "Clear, common time origin", how: "Everyone starts the clock at the same kind of event (diagnosis, surgery, randomisation).", fail: "Redefine the start point; beware immortal time bias." },
      { t: "Event times are known precisely enough", how: "Events detected only at scheduled visits have interval-censored times.", fail: "Use interval-censored methods if visits are widely spaced." },
      { t: "Survival does not change with calendar time of recruitment", how: "Compare early and late recruits.", fail: "Stratify by recruitment period." },
      { t: "No competing events that prevent the event of interest", how: "E.g. death from other causes prevents cancer relapse.", fail: "Use the cumulative incidence function (Aalen–Johansen) instead of 1 − KM." }
    ],
    pitfalls: [
      "Reporting mean survival: it is biased by censoring. Report median survival with 95% CI.",
      "Over-interpreting the right-hand tail where few patients remain. Always show a number-at-risk table.",
      "1 − KM overestimates risk when competing events exist.",
      "Excluding patients with short follow-up."
    ],
    interpret: [
      "Report median survival with its 95% CI (if reached).",
      "Report survival probabilities at clinically relevant times (e.g. 1-year and 5-year) with 95% CIs.",
      "Report median follow-up (reverse Kaplan–Meier method)."
    ],
    report: "Median overall survival was 11.2 months (95% CI 9.6 to 13.1); 1-year survival was 46% (95% CI 39% to 53%). Median follow-up was 24 months.",
    software: [
      ["R", "library(survival); fit <- survfit(Surv(time, status) ~ 1, data = d)\nsummary(fit, times = 12); survminer::ggsurvplot(fit, risk.table = TRUE)"],
      ["SPSS", "Analyze › Survival › Kaplan–Meier"],
      ["jamovi", "Survival module (jsurvival) › Single Arm Survival"]
    ],
    related: ["logrank-two", "cox"]
  },

  "logrank-two": {
    name: "Kaplan–Meier with log-rank test (two groups)",
    family: "surv",
    short: "Compares survival curves between two groups.",
    useWhen: "Time-to-event outcome; two independent groups; no adjustment needed (e.g. a randomised trial).",
    example: "Progression-free survival with drug vs placebo in a randomised trial.",
    why: "The log-rank test compares the observed and expected number of events in each group at every event time across the whole follow-up. It is the standard unadjusted comparison of survival curves.",
    assumptions: [
      { t: "Censoring is non-informative and similar in both groups", how: "Compare reasons and rates of censoring between groups.", fail: "Discuss possible bias; sensitivity analyses." },
      { t: "Proportional hazards (the curves do not cross)", how: "Look at the KM curves and a log(−log survival) plot; the lines should be roughly parallel.", fail: "If curves cross, the log-rank test loses power. Report restricted mean survival time (RMST) or use a weighted test." },
      { t: "Groups are independent", how: "Different patients in each group.", fail: "For matched designs use a stratified log-rank test." },
      { t: "Clear, common time origin", how: "E.g. date of randomisation for both groups.", fail: "Redefine start; avoid immortal time bias (e.g. “responders vs non-responders”)." }
    ],
    pitfalls: [
      "The log-rank test gives only a p-value. Add the hazard ratio from a Cox model with its CI.",
      "Comparing survival at a single time point chosen after seeing the curves.",
      "Defining groups by something that happens after time zero (e.g. “patients who completed chemotherapy”) creates immortal time bias.",
      "Omitting the number-at-risk table."
    ],
    interpret: [
      "Show KM curves with a number-at-risk table and 95% CI bands.",
      "Report median survival per group with CIs, the hazard ratio with 95% CI (from Cox), and the log-rank p-value.",
      "A hazard ratio of 0.70 means a 30% lower rate of the event at any given time, assuming proportional hazards."
    ],
    report: "Median progression-free survival was 9.8 months with the drug vs 6.1 months with placebo; hazard ratio 0.64 (95% CI 0.49 to 0.83); log-rank p < 0.001.",
    software: [
      ["R", "survdiff(Surv(time, status) ~ arm, data = d)\ncoxph(Surv(time, status) ~ arm, data = d)   # hazard ratio"],
      ["SPSS", "Analyze › Survival › Kaplan–Meier; Compare Factor: Log rank"],
      ["jamovi", "Survival module (jsurvival) › Survival Analysis"]
    ],
    related: ["km-one", "logrank-multi", "cox"]
  },

  "logrank-multi": {
    name: "Log-rank test for more than two groups",
    family: "surv",
    short: "Compares survival curves across three or more groups.",
    useWhen: "Time-to-event outcome; three or more independent groups; no adjustment needed.",
    example: "Overall survival by tumour stage (I, II, III).",
    why: "It tests whether any of the curves differ in one overall test. When the groups are ordered (stages, doses), the log-rank test for trend is more powerful.",
    assumptions: [
      { t: "Censoring is non-informative and similar across groups", how: "Compare censoring patterns.", fail: "Discuss bias; sensitivity analyses." },
      { t: "Proportional hazards between groups", how: "KM and log(−log) plots: curves should not cross.", fail: "Use RMST or weighted tests." },
      { t: "Groups are independent", how: "Different patients per group.", fail: "Use stratified methods for matched designs." },
      { t: "Adequate events in each group", how: "Count events per group; very few events make comparisons unstable.", fail: "Merge sparse groups if clinically sensible." }
    ],
    pitfalls: [
      "A significant overall test does not say which groups differ. Use pairwise log-rank tests with Holm correction.",
      "Ignoring the natural order of groups; use the trend test.",
      "Too many groups with few events each."
    ],
    interpret: [
      "Report the overall log-rank χ² (groups − 1 df) and p.",
      "Report hazard ratios for each group against a reference from a Cox model.",
      "Report pairwise comparisons with adjusted p-values if needed."
    ],
    report: "Survival differed by stage (log-rank χ²(2) = 38.6, p < 0.001; test for trend p < 0.001). Compared with stage I, the hazard ratio was 1.9 (95% CI 1.2 to 3.0) for stage II and 4.2 (95% CI 2.7 to 6.5) for stage III.",
    software: [
      ["R", "survdiff(Surv(time, status) ~ stage, data = d)\nsurvminer::pairwise_survdiff(Surv(time, status) ~ stage, data = d, p.adjust.method = \"holm\")"],
      ["SPSS", "Kaplan–Meier; Compare Factor: Log rank, Linear trend; Pairwise over strata"],
      ["jamovi", "Survival module (jsurvival) › Survival Analysis; pairwise comparisons"]
    ],
    related: ["logrank-two", "cox"]
  },

  "cox": {
    name: "Cox proportional hazards regression",
    family: "surv",
    short: "Estimates hazard ratios for time-to-event outcomes, adjusting for several variables.",
    useWhen: "Time-to-event outcome; comparing groups while adjusting for confounders, or studying several prognostic factors.",
    example: "Effect of statin use on time to cardiovascular event, adjusted for age, sex, diabetes and smoking.",
    why: "The Cox model gives the hazard ratio, the standard effect size in survival analysis, and adjusts for several variables at once without assuming a particular shape for the baseline survival curve.",
    assumptions: [
      { t: "Proportional hazards: each hazard ratio is constant over time", how: "Test Schoenfeld residuals (cox.zph) and look at their plots; check log(−log) curves.", fail: "Stratify by the offending variable, add a time interaction, or report RMST." },
      { t: "Censoring is non-informative", how: "Assess reasons for loss to follow-up.", fail: "Sensitivity analyses; discuss bias." },
      { t: "Continuous predictors relate linearly to the log hazard", how: "Plot martingale residuals against each continuous variable.", fail: "Use splines or transformations; avoid arbitrary categories." },
      { t: "Enough events for the number of predictors", how: "Roughly 10 events per predictor (count events, not patients).", fail: "Reduce predictors using clinical knowledge, or use penalised methods." },
      { t: "Observations are independent", how: "One record per patient, no clustering.", fail: "Use robust (cluster) standard errors or frailty models." },
      { t: "Covariates measured at baseline, or modelled as time-varying", how: "Variables that change during follow-up (e.g. starting a drug later) need special handling.", fail: "Use time-varying covariates (counting-process data format) to avoid immortal time bias." }
    ],
    pitfalls: [
      "Ignoring violated proportional hazards; the single HR then averages a changing effect.",
      "Immortal time bias from defining exposure using information after time zero.",
      "Too many variables for too few events (overfitting).",
      "Competing risks: when another event prevents the outcome, consider Fine–Gray or cause-specific models.",
      "A hazard ratio is not a risk ratio; do not describe HR 0.7 as “30% fewer patients die”."
    ],
    interpret: [
      "Hazard ratio (with 95% CI): HR < 1 lower event rate, HR > 1 higher, adjusted for the other variables.",
      "Report the number of events and patients analysed.",
      "Show the proportional hazards check in a supplement."
    ],
    report: "In a Cox model adjusted for age, sex, diabetes and smoking (412 events in 3,120 patients), statin use was associated with a lower hazard of cardiovascular events (HR 0.76, 95% CI 0.62 to 0.93, p = 0.008). The proportional hazards assumption held (global Schoenfeld test p = 0.41).",
    software: [
      ["R", "m <- coxph(Surv(time, event) ~ statin + age + sex + diabetes + smoking, data = d)\nsummary(m); cox.zph(m)"],
      ["SPSS", "Analyze › Survival › Cox Regression; Plots: log minus log"],
      ["jamovi", "Survival module (jsurvival) › Multivariable Survival"]
    ],
    related: ["logrank-two", "logrank-multi", "logistic"]
  },

  // =================== LOGISTIC / POISSON ===================
  "logistic": {
    name: "Logistic regression",
    family: "binary",
    short: "Estimates odds ratios for a yes/no outcome, adjusting for several variables.",
    useWhen: "Binary outcome (yes/no); one or more predictors; case–control or cross-sectional studies, or when odds ratios are required.",
    example: "Risk factors for post-operative delirium: age, pre-operative cognitive score, type of anaesthesia.",
    why: "Logistic regression models the log-odds of the outcome, so predicted probabilities always stay between 0 and 1. It adjusts for confounders and gives adjusted odds ratios, and it is the only valid choice for case–control studies.",
    assumptions: [
      { t: "The outcome is binary", how: "Two mutually exclusive outcomes.", fail: "Ordered outcomes need ordinal logistic regression; counts need Poisson.", alt: "poisson-count" },
      { t: "Observations are independent", how: "One record per patient, no clustering.", fail: "Use GEE or mixed-effects logistic regression." },
      { t: "Continuous predictors relate linearly to the log-odds", how: "Fit splines and compare, or use the Box–Tidwell test.", fail: "Use restricted cubic splines; avoid cutting into categories." },
      { t: "Enough events for the number of predictors", how: "Count the less common outcome; aim for at least 10 events per predictor.", fail: "Reduce predictors or use penalised (Firth) regression." },
      { t: "No complete separation", how: "Warnings about fitted probabilities 0 or 1, or huge coefficients and standard errors.", fail: "Use Firth’s penalised logistic regression." },
      { t: "No harmful multicollinearity", how: "VIF under about 5.", fail: "Remove or combine correlated predictors." },
      { t: "No overly influential observations", how: "Cook’s distance, dfbeta.", fail: "Check for errors; sensitivity analysis." }
    ],
    pitfalls: [
      "Interpreting an odds ratio as a risk ratio. When the outcome is common (> 10%), OR exaggerates the RR. Consider modified Poisson regression for risk ratios.",
      "Stepwise variable selection and univariable screening (“p < 0.2 to enter”) give biased models.",
      "Judging a prediction model only by significance. Report discrimination (C-statistic/AUC) and calibration (calibration plot).",
      "The Hosmer–Lemeshow test has low power and depends on grouping; prefer calibration plots.",
      "Overfitting in small datasets; validate internally with bootstrapping."
    ],
    interpret: [
      "Adjusted odds ratio (95% CI) for each predictor: OR > 1 higher odds, OR < 1 lower odds, other variables held constant.",
      "For continuous predictors, choose a meaningful unit (e.g. per 10 years of age).",
      "For prediction: C-statistic (0.5 no better than chance; > 0.8 good) and calibration."
    ],
    report: "Post-operative delirium occurred in 64 of 480 patients (13%). In multivariable logistic regression, each 10-year increase in age was associated with higher odds of delirium (adjusted OR 1.8, 95% CI 1.4 to 2.4), as was general anaesthesia vs regional (OR 2.1, 95% CI 1.1 to 4.0). C-statistic 0.78.",
    software: [
      ["R", "m <- glm(delirium ~ age10 + cog + anaesthesia, family = binomial, data = d)\nexp(cbind(OR = coef(m), confint(m)))"],
      ["SPSS", "Analyze › Regression › Binary Logistic; Options: CI for exp(B)"],
      ["jamovi", "Regression › 2 Outcomes (Binomial); tick Odds ratio and AUC"]
    ],
    related: ["poisson-binary", "chi-2x2", "cox"]
  },

  "poisson-binary": {
    name: "Modified Poisson regression (binary outcome)",
    family: "binary",
    short: "Estimates adjusted risk ratios for a yes/no outcome using Poisson regression with robust errors.",
    useWhen: "Binary outcome in a cohort study or trial, especially a common outcome (> 10%), when you want risk ratios instead of odds ratios.",
    example: "Adjusted risk of 30-day readmission (outcome in 22% of patients) for discharge on weekend vs weekday.",
    why: "Clinicians and patients understand risk ratios better than odds ratios, and for common outcomes the two differ a lot. Poisson regression with robust (sandwich) standard errors estimates adjusted risk ratios reliably and converges more easily than log-binomial regression.",
    assumptions: [
      { t: "Robust (sandwich) standard errors are used", how: "Check the output states robust or HC standard errors. Ordinary Poisson standard errors are too wide for binary data.", fail: "Refit with robust errors (sandwich package or GEE)." },
      { t: "Observations are independent", how: "One record per patient.", fail: "Use GEE with an exchangeable correlation for clustered data." },
      { t: "Continuous predictors relate linearly to the log risk", how: "Splines or residual plots.", fail: "Use splines or transformations." },
      { t: "Predicted risks stay below 1", how: "Check the maximum fitted value.", fail: "Usually minor; if many exceed 1, consider log-binomial or logistic regression with marginal effects.", alt: "logistic" },
      { t: "Enough events for the number of predictors", how: "About 10 events per predictor.", fail: "Reduce predictors." }
    ],
    pitfalls: [
      "Forgetting robust standard errors: the confidence intervals will be wrong.",
      "Using it in case–control studies, where risks cannot be estimated. Use logistic regression there.",
      "Describing the coefficient as an incidence rate ratio; for binary outcomes it is a risk ratio."
    ],
    interpret: [
      "Adjusted risk ratio (95% CI): RR 1.3 means a 30% higher risk, other variables held constant.",
      "You can also present adjusted risk differences for absolute effects."
    ],
    report: "Weekend discharge was associated with a higher risk of 30-day readmission (adjusted RR 1.21, 95% CI 1.05 to 1.40), estimated by modified Poisson regression with robust standard errors, adjusted for age, comorbidity index and length of stay.",
    software: [
      ["R", "m <- glm(readmit ~ weekend + age + cci + los, family = poisson, data = d)\nlmtest::coeftest(m, vcov = sandwich::vcovHC(m, type = \"HC0\"))"],
      ["SPSS", "Analyze › Generalized Linear Models › Poisson loglinear; Estimation: Robust estimator"],
      ["Stata", "poisson readmit weekend age cci los, vce(robust) irr"]
    ],
    related: ["logistic", "poisson-count", "estimation-groups"]
  },

  "poisson-count": {
    name: "Poisson regression (counts and rates)",
    family: "binary",
    short: "Models counts of events, or event rates per unit of time, and gives rate ratios.",
    useWhen: "Outcome is a count (number of attacks, admissions, falls), possibly over different follow-up times.",
    example: "Number of COPD exacerbations per year with a new inhaler vs usual care, allowing for different follow-up lengths.",
    why: "Counts cannot be negative and are usually skewed, so linear regression fits badly. Poisson regression models the log of the event rate, handles different follow-up times through an offset, and gives incidence rate ratios.",
    assumptions: [
      { t: "The outcome is a count of events", how: "Non-negative whole numbers.", fail: "For yes/no outcomes see logistic or modified Poisson regression.", alt: "poisson-binary" },
      { t: "Mean equals variance (no overdispersion)", how: "Residual deviance ÷ residual df should be close to 1; values above ~1.5 indicate overdispersion, which is common in clinical counts.", fail: "Use negative binomial regression (or quasi-Poisson / robust errors)." },
      { t: "Follow-up time is accounted for", how: "If patients were followed for different lengths of time, include log(follow-up time) as an offset.", fail: "Add the offset; otherwise you model counts, not rates." },
      { t: "Observations are independent", how: "Events in one patient do not cause events in another; one record per patient.", fail: "Use GEE or mixed models for clustering." },
      { t: "Not too many zeros", how: "Compare the observed number of zeros with the number the model predicts.", fail: "Consider zero-inflated or hurdle models." },
      { t: "Continuous predictors relate linearly to the log rate", how: "Residual plots or splines.", fail: "Use splines or transformations." }
    ],
    pitfalls: [
      "Ignoring overdispersion makes confidence intervals far too narrow and p-values too small.",
      "Forgetting the offset for varying follow-up.",
      "Analysing counts with a t-test or linear regression."
    ],
    interpret: [
      "Incidence rate ratio (IRR) with 95% CI: IRR 0.75 means a 25% lower event rate.",
      "Report crude event rates per group (e.g. per patient-year)."
    ],
    report: "Exacerbation rates were 1.2 vs 1.6 per patient-year; in negative binomial regression with log follow-up time as offset, the new inhaler reduced the exacerbation rate (IRR 0.75, 95% CI 0.63 to 0.89, p = 0.001).",
    software: [
      ["R", "m <- glm(n_exac ~ arm + offset(log(fu_years)), family = poisson, data = d)\ndeviance(m) / df.residual(m)   # overdispersion check\nMASS::glm.nb(n_exac ~ arm + offset(log(fu_years)), data = d)"],
      ["SPSS", "Analyze › Generalized Linear Models; Poisson loglinear or Negative binomial; Offset variable"],
      ["jamovi", "Linear Models › Generalized Linear Models (GAMLj); Poisson or Negative binomial"]
    ],
    related: ["poisson-binary", "linear-regression"]
  },

  // =================== EXPLORATION ===================
  "pca": {
    name: "Principal component analysis (PCA)",
    family: "explore",
    short: "Summarises many correlated numeric variables into a few components.",
    useWhen: "Many continuous variables; you want to see patterns, reduce dimensions, or spot groups of patients.",
    example: "Twelve admission lab values in sepsis: which ones vary together, and do patients form visible clusters?",
    why: "PCA builds new variables (components) that capture as much of the variation as possible. The first two or three often reveal the main structure in the data, which can then guide hypotheses.",
    assumptions: [
      { t: "Variables are continuous", how: "Numeric measurements.", fail: "Categorical variables need MCA; mixed variables need FAMD.", alt: "famd" },
      { t: "Variables are standardised if units differ", how: "Different units (mmol/L vs g/L) must be scaled to mean 0, SD 1, or large-unit variables dominate.", fail: "Run PCA on the correlation matrix (scale = TRUE)." },
      { t: "Variables are sufficiently correlated", how: "KMO measure > 0.6 and a significant Bartlett’s test suggest PCA is worthwhile.", fail: "If variables are nearly uncorrelated, PCA will not simplify the data." },
      { t: "Relationships are roughly linear", how: "Scatterplot matrix.", fail: "Transform skewed variables (e.g. log CRP) first." },
      { t: "Adequate sample size", how: "At least 5–10 patients per variable and ideally more than 100 overall.", fail: "Treat results as descriptive only." },
      { t: "Outliers and missing values handled", how: "PCA is sensitive to outliers and needs complete data.", fail: "Check outliers; impute missing values (e.g. missMDA::imputePCA)." }
    ],
    pitfalls: [
      "Treating components as real biological constructs. PCA describes variation; latent constructs need factor analysis.",
      "Forgetting to scale variables measured in different units.",
      "Keeping too many or too few components; use the scree plot and cumulative variance.",
      "Using PCA results as confirmatory evidence. It is exploratory."
    ],
    interpret: [
      "Scree plot and % variance explained by each component.",
      "Loadings: which variables contribute most to each component (large absolute values).",
      "Biplot: patients close together have similar profiles; arrows pointing the same way are positively correlated variables."
    ],
    report: "PCA on 12 standardised admission lab values: the first two components explained 48% of total variance. PC1 (29%) loaded on lactate, creatinine and bilirubin (organ dysfunction); PC2 (19%) on WBC and CRP (inflammation).",
    software: [
      ["R", "p <- prcomp(labs, scale. = TRUE); summary(p)\nfactoextra::fviz_pca_biplot(p)   # or FactoMineR::PCA(labs)"],
      ["SPSS", "Analyze › Dimension Reduction › Factor; Extraction: Principal components"],
      ["jamovi", "Factor › Principal Component Analysis"]
    ],
    related: ["mca", "famd"]
  },

  "mca": {
    name: "Multiple correspondence analysis (MCA)",
    family: "explore",
    short: "Finds patterns among many categorical variables.",
    useWhen: "Many categorical variables (symptoms, comorbidities, yes/no items); exploring which categories occur together.",
    example: "Patterns of 10 presenting symptoms (present/absent) in long COVID clinic patients.",
    why: "MCA is the categorical equivalent of PCA. It places categories and patients on a map where categories that often occur together sit close to each other.",
    assumptions: [
      { t: "Variables are categorical", how: "Nominal or ordinal categories.", fail: "Numeric variables need PCA; mixed data need FAMD.", alt: "famd" },
      { t: "No very rare categories", how: "Categories with under about 5% of patients distort the map.", fail: "Merge rare categories with a clinically similar one." },
      { t: "Adequate sample size", how: "Enough patients relative to the number of categories.", fail: "Treat as descriptive only." },
      { t: "Missing values handled", how: "Decide whether missing is its own category or should be imputed.", fail: "Use missMDA::imputeMCA or treat as a category." }
    ],
    pitfalls: [
      "Raw inertia percentages look small and are pessimistic; use Benzécri or Greenacre adjusted inertia.",
      "Interpreting distances between individual categories without checking their quality of representation (cos²).",
      "Treating clusters seen on the map as confirmed patient subtypes."
    ],
    interpret: [
      "Adjusted inertia explained by each dimension.",
      "Category contributions and cos² for each dimension.",
      "Categories plotted close together tend to occur in the same patients."
    ],
    report: "MCA of 10 symptoms: dimension 1 (adjusted inertia 41%) separated fatigue, brain fog and post-exertional malaise from cough and dyspnoea (dimension 2, 22%), suggesting neurocognitive and respiratory symptom clusters.",
    software: [
      ["R", "m <- FactoMineR::MCA(symptoms); factoextra::fviz_mca_var(m)"],
      ["SPSS", "Analyze › Dimension Reduction › Optimal Scaling › Multiple Correspondence"],
      ["jamovi", "snowCluster or R via Rj module"]
    ],
    related: ["pca", "famd"]
  },

  "famd": {
    name: "Factor analysis of mixed data (FAMD)",
    family: "explore",
    short: "Explores patterns in datasets with both numeric and categorical variables.",
    useWhen: "A mix of continuous variables (age, lab values) and categorical ones (sex, comorbidities).",
    example: "Profiling ICU patients using age, SOFA score, lactate, sex, admission type and ventilation status.",
    why: "FAMD combines PCA for numeric variables and MCA for categorical ones, weighting them so neither type dominates. It lets you look at all patient characteristics on one map.",
    assumptions: [
      { t: "A genuine mix of variable types", how: "Both numeric and categorical variables are present.", fail: "Use PCA (all numeric) or MCA (all categorical).", alt: "pca" },
      { t: "Numeric variables are reasonably distributed", how: "Check skewness; extreme skew lets a few patients dominate.", fail: "Transform skewed variables first." },
      { t: "No very rare categories", how: "Categories with under about 5% of patients distort results.", fail: "Merge rare categories." },
      { t: "Adequate sample size and missing data handled", how: "Complete data are required.", fail: "Impute with missMDA::imputeFAMD." }
    ],
    pitfalls: [
      "Including many variables of one type that measure the same thing overweights that concept.",
      "Treating the dimensions as validated clinical phenotypes without external validation.",
      "Clustering on FAMD coordinates without testing cluster stability."
    ],
    interpret: [
      "Variance explained per dimension.",
      "Contribution of each variable (numeric and categorical) to the dimensions.",
      "Patient map: nearby patients have similar overall profiles."
    ],
    report: "FAMD on 6 variables: dimension 1 (27% of variance) was driven by SOFA score, lactate and mechanical ventilation, separating severely ill patients; dimension 2 (18%) reflected age and elective vs emergency admission.",
    software: [
      ["R", "f <- FactoMineR::FAMD(icu); factoextra::fviz_famd_var(f)"],
      ["SPSS", "Not available directly; use CATPCA (Optimal Scaling) as an approximation"],
      ["Python", "prince.FAMD(n_components = 5).fit(df)"]
    ],
    related: ["pca", "mca"]
  },

  // =================== BAYESIAN ===================
  "bayes-means": {
    name: "Bayesian comparison of means",
    family: "bayes",
    short: "Estimates the probability that one group’s mean is higher, using prior knowledge and the data.",
    useWhen: "Any comparison of means (two groups, several groups, paired or adjusted designs) when you want probability statements or to include prior evidence.",
    example: "Probability that a new analgesic lowers mean pain by at least 1 point (the MCID) compared with standard care.",
    why: "A Bayesian analysis answers the question clinicians usually ask: “how likely is it that the treatment works, and by how much?” It combines a prior (what was known before) with the data to give a posterior distribution for the difference. It can also quantify evidence for no difference, which a p-value cannot.",
    assumptions: [
      { t: "The data model fits the data (same checks as the frequentist test)", how: "Independence, roughly normal residuals, similar variances; check with posterior predictive plots.", fail: "Use a robust likelihood (Student-t) or a model that allows unequal variances." },
      { t: "The prior is stated and justified before seeing the data", how: "Write down the prior (e.g. weakly informative, or based on a previous trial) in the protocol.", fail: "Report the analysis as exploratory and show several priors." },
      { t: "A sensitivity analysis with other priors was done", how: "Re-run with sceptical, weakly informative and enthusiastic priors.", fail: "If conclusions change with the prior, the data alone are not decisive; say so." },
      { t: "The computation converged (MCMC methods)", how: "R-hat below 1.01, effective sample size above ~400, trace plots look like “hairy caterpillars”.", fail: "Run longer chains, reparameterise, or simplify the model." },
      { t: "Decision thresholds were pre-specified", how: "E.g. “effective if P(difference > MCID) > 0.9”, or a region of practical equivalence (ROPE).", fail: "State that the thresholds were chosen post hoc." }
    ],
    pitfalls: [
      "Using software default priors without checking they are sensible for your scale.",
      "Bayes factors depend heavily on the prior width; always report the prior with the BF.",
      "Confusing the Bayes factor (strength of evidence) with the posterior probability of an effect.",
      "Presenting a credible interval as if it were a confidence interval, or vice versa."
    ],
    interpret: [
      "Posterior mean (or median) difference with 95% credible interval: given the model and prior, there is a 95% probability the true difference lies in this range.",
      "Probability of benefit, e.g. P(difference < 0), and probability of a clinically important benefit, e.g. P(difference < −MCID).",
      "Bayes factor BF₁₀: 1–3 anecdotal, 3–10 moderate, 10–30 strong, > 30 very strong evidence for a difference; values below 1 favour no difference."
    ],
    report: "With a weakly informative prior (normal, mean 0, SD 2 points), the posterior mean difference in pain was −1.3 points (95% credible interval −2.1 to −0.5). The probability of any benefit was 99.8% and of a benefit exceeding the MCID of 1 point was 77%. Results were similar with a sceptical prior.",
    software: [
      ["R", "brms::brm(pain ~ group, data = d, prior = prior(normal(0, 2), class = b))\n# Bayes factor: BayesFactor::ttestBF(formula = pain ~ group, data = d)"],
      ["JASP", "T-Tests › Bayesian Independent Samples T-Test (also Bayesian ANOVA, ANCOVA)"],
      ["jamovi", "jsq module › Bayesian T-Tests / ANOVA"]
    ],
    related: ["independent-t", "one-way-anova", "estimation-means", "bayes-groups"]
  },

  "bayes-groups": {
    name: "Bayesian comparison of groups (categorical and ordinal)",
    family: "bayes",
    short: "Estimates the probability that a risk or category distribution differs between groups.",
    useWhen: "Comparing proportions, categorical outcomes, or ordinal outcomes (e.g. modified Rankin Scale) between groups, with probability statements.",
    example: "Probability that a stroke treatment shifts the modified Rankin Scale (0–6) towards better outcomes.",
    why: "Bayesian models for counts and ordinal scales give a full posterior distribution for the risk difference, risk ratio or odds ratio, so you can state the probability of benefit. Ordinal models use every level of the scale instead of collapsing it to good/bad.",
    assumptions: [
      { t: "The likelihood matches the outcome type", how: "Binomial for yes/no, multinomial for unordered categories, cumulative (ordinal) model for ordered categories.", fail: "Choose the correct likelihood; do not treat ordinal scores as continuous without justification." },
      { t: "Observations are independent", how: "One outcome per patient, no clustering.", fail: "Add random effects for clusters." },
      { t: "Priors are stated and justified", how: "E.g. Beta(1,1) for proportions, Normal(0, 1.5) on the log-odds scale.", fail: "Report the prior and a sensitivity analysis." },
      { t: "Proportional odds (for cumulative ordinal models)", how: "Check whether the treatment effect is similar across the cut-points of the scale (compare with a category-specific model).", fail: "Use a partial proportional odds or category-specific effects model." },
      { t: "The computation converged", how: "R-hat below 1.01, adequate effective sample size.", fail: "Run longer chains or simplify." }
    ],
    pitfalls: [
      "Dichotomising an ordinal outcome loses information and power.",
      "Choosing priors after seeing the data.",
      "Reporting only posterior probabilities without effect sizes and credible intervals."
    ],
    interpret: [
      "Posterior risk difference, risk ratio or odds ratio with 95% credible interval.",
      "P(benefit), e.g. P(OR > 1) for a favourable shift on the ordinal scale.",
      "For ordinal outcomes, show the distribution of categories per group (stacked bar chart, “Grotta bars”)."
    ],
    report: "In a Bayesian cumulative logistic model with a Normal(0, 1.5) prior on the log-odds, the common odds ratio for a better mRS was 1.42 (95% credible interval 1.08 to 1.87); the posterior probability of benefit (OR > 1) was 99.4%.",
    software: [
      ["R", "brms::brm(mrs ~ arm, family = cumulative(\"logit\"), data = d)\n# two proportions: bayesAB or a Beta-binomial model"],
      ["JASP", "Frequencies › Bayesian Contingency Tables; Bayesian Binomial Test"],
      ["Online", "Beta-binomial calculators for two proportions"]
    ],
    related: ["chi-2x2", "chi-rxc", "estimation-groups", "bayes-means"]
  },

  // =================== ESTIMATION ===================
  "estimation-means": {
    name: "Estimation statistics for comparing means",
    family: "estimation",
    short: "Presents the size of the difference and its uncertainty, with all data shown.",
    useWhen: "Any comparison of means where you want the effect size and its precision to be the focus, rather than a yes/no significance verdict.",
    example: "Difference in 6-minute walk distance between two rehabilitation programmes, shown as a Gardner–Altman plot.",
    why: "Clinicians need to know how big an effect is and how precisely it is estimated. Estimation statistics report the effect size with a confidence interval (often bootstrapped) and plot every data point alongside it, so readers can judge clinical importance directly.",
    assumptions: [
      { t: "Observations are independent (or paired, and analysed as paired)", how: "Match the effect size to the design: mean difference for independent groups, paired mean difference for paired data.", fail: "Choose the paired effect size for repeated measures." },
      { t: "The effect size suits the data", how: "Mean difference for roughly symmetric data; median difference or Cliff’s delta for skewed or ordinal data; Hedges’ g for standardised comparisons across scales.", fail: "Switch to a median difference or Cliff’s delta for skewed data." },
      { t: "The confidence interval method is appropriate", how: "Bias-corrected and accelerated (BCa) bootstrap intervals (e.g. 5,000 resamples) are robust to non-normality.", fail: "With fewer than about 10 patients per group, bootstrap CIs are unreliable; use exact or t-based intervals." },
      { t: "A clinically meaningful difference was defined in advance", how: "State the MCID so the CI can be judged against it.", fail: "Without it, interpretation is subjective; cite published MCIDs." }
    ],
    pitfalls: [
      "Using the CI only to check whether it crosses zero. That turns it back into a significance test.",
      "Ignoring the width of the interval: a wide CI means the study is imprecise.",
      "Reporting only standardised effects (Cohen’s d) and hiding clinical units."
    ],
    interpret: [
      "The point estimate is the best guess of the true difference.",
      "The 95% CI shows the range of effects compatible with the data. Compare both ends with the MCID.",
      "If the whole CI lies beyond the MCID, the effect is likely clinically important; if it straddles the MCID, the result is uncertain."
    ],
    report: "Programme B increased 6-minute walk distance by 38 m more than programme A (95% bootstrap CI 12 to 63 m; 5,000 resamples, BCa). The interval includes the MCID of 30 m, so the benefit may or may not be clinically important.",
    software: [
      ["R", "library(dabestr)\nd %>% load(x = programme, y = walk, idx = c(\"A\", \"B\")) %>% mean_diff() %>% dabest_plot()"],
      ["Python", "dabest.load(df, x = \"programme\", y = \"walk\", idx = (\"A\", \"B\")).mean_diff.plot()"],
      ["jamovi", "esci module › Compare two means; or estimationstats.com (web)"]
    ],
    related: ["bootstrap-mean", "independent-t", "bayes-means", "estimation-groups"]
  },

  "estimation-groups": {
    name: "Estimation statistics for comparing groups (categorical and ordinal)",
    family: "estimation",
    short: "Reports risk differences, ratios and ordinal effect sizes with confidence intervals.",
    useWhen: "Comparing proportions or ordinal outcomes between groups, with the focus on effect size and precision.",
    example: "Absolute risk reduction in surgical site infection with antibiotic prophylaxis, with number needed to treat.",
    why: "Proportions are best understood as absolute and relative differences. Estimation statistics present the risk difference, risk ratio or odds ratio (and NNT) with confidence intervals; for ordinal data, effect sizes such as Cliff’s delta describe how much one group tends to score higher.",
    assumptions: [
      { t: "Observations are independent", how: "Each patient counted once.", fail: "Use paired effect sizes (difference in paired proportions) for paired data.", alt: "mcnemar" },
      { t: "The effect size matches the question", how: "Risk difference and NNT for absolute benefit; risk ratio for relative effect; odds ratio for case–control; Cliff’s delta or probability of superiority for ordinal; Cramér’s V for larger tables.", fail: "Choose the measure suitable for your design." },
      { t: "The CI method suits the sample size", how: "Wilson or Newcombe intervals for proportions; exact or bootstrap for small samples.", fail: "Avoid simple Wald intervals when counts are small or proportions are near 0% or 100%." },
      { t: "A clinically important difference was defined", how: "E.g. an absolute risk reduction of 5 percentage points.", fail: "Cite published thresholds or justify one." }
    ],
    pitfalls: [
      "Reporting only relative risks: a 50% reduction can mean 2% to 1%.",
      "Presenting NNT without its CI; when the risk-difference CI crosses zero, the NNT CI runs through infinity.",
      "Dichotomising ordinal scales."
    ],
    interpret: [
      "Risk difference (95% CI) gives the absolute effect; NNT = 1 ÷ risk difference.",
      "Risk ratio or odds ratio (95% CI) gives the relative effect.",
      "Cliff’s delta ranges from −1 to +1: 0.15 small, 0.33 medium, 0.47 large."
    ],
    report: "Surgical site infection occurred in 4.1% with prophylaxis vs 9.3% without; risk difference −5.2 percentage points (95% CI −8.3 to −2.1); risk ratio 0.44 (95% CI 0.27 to 0.72); NNT 19 (95% CI 12 to 48).",
    software: [
      ["R", "epitools::riskratio(tab); PropCIs::diffscoreci(x1, n1, x2, n2, conf.level = 0.95)\neffsize::cliff.delta(score ~ group, data = d)"],
      ["Python", "dabest proportion plots: dabest.load(..., proportional = True).mean_diff.plot()"],
      ["jamovi", "esci module › Compare two proportions"]
    ],
    related: ["chi-2x2", "chi-rxc", "bayes-groups", "estimation-means"]
  },

  // =================== RESAMPLING ===================
  "bootstrap-mean": {
    name: "Bootstrap confidence interval for a mean",
    family: "resampling",
    short: "Builds a confidence interval by resampling your own data thousands of times.",
    useWhen: "Estimating a mean or a difference in means when data are skewed and you prefer not to assume normality.",
    example: "95% CI for the mean hospital cost per patient (strongly right-skewed) in two care pathways.",
    why: "Some quantities, like mean cost, matter even when the data are skewed; switching to medians would answer a different question. The bootstrap resamples patients with replacement many times and uses the spread of the resampled means to build a confidence interval, without assuming a normal distribution.",
    assumptions: [
      { t: "The sample is representative and observations are independent", how: "Random or consecutive sampling; one value per patient.", fail: "The bootstrap cannot fix a biased sample. For clustered data, resample whole clusters (cluster bootstrap)." },
      { t: "Resampling happens at the unit of independence", how: "Resample patients, not individual measurements; resample within each group for group comparisons.", fail: "Change the resampling unit." },
      { t: "The sample is not too small", how: "Roughly 20 or more per group; with very small samples the bootstrap underestimates uncertainty.", fail: "Use exact methods or collect more data." },
      { t: "Enough resamples and a good interval method", how: "At least 2,000 resamples (10,000 is common); use BCa or percentile intervals.", fail: "Increase the number of resamples; prefer BCa." },
      { t: "Very heavy tails are considered", how: "A few extreme values (e.g. one patient costing 50× the median) still make the mean unstable.", fail: "Report a sensitivity analysis, or a trimmed mean." }
    ],
    pitfalls: [
      "The bootstrap does not create new information; small samples stay imprecise.",
      "Not setting and reporting the random seed, so results cannot be reproduced.",
      "Resampling measurements instead of patients when patients have several measurements."
    ],
    interpret: [
      "Report the observed mean (or mean difference) and its bootstrap 95% CI, stating the method (BCa) and number of resamples.",
      "Interpret the CI as usual: the range of values compatible with the data."
    ],
    report: "Mean cost per patient was £4,820 in pathway A and £5,910 in pathway B; mean difference −£1,090 (95% BCa bootstrap CI −£1,980 to −£260; 10,000 resamples).",
    software: [
      ["R", "set.seed(1); b <- boot::boot(d, function(x, i) with(x[i, ], mean(cost[grp == \"A\"]) - mean(cost[grp == \"B\"])), R = 10000, strata = d$grp)\nboot::boot.ci(b, type = \"bca\")"],
      ["SPSS", "Most procedures have a Bootstrap… button (e.g. Independent-Samples T Test); choose BCa"],
      ["jamovi", "esci module or R via Rj; JASP offers bootstrapping in many analyses"]
    ],
    related: ["estimation-means", "independent-t", "mann-whitney"]
  }
};
