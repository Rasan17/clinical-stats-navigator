// Decision tree for the "Find a test" wizard.
// An option leads either to another question (next) or to a test (result).
// Options with fw ask a final "which framework?" question before showing the test.

window.TREE = {
  start: {
    q: "What is the main question of your analysis?",
    help: "Think about your primary outcome, the one your study was designed to answer.",
    options: [
      { label: "Compare an average measurement between groups or time points", sub: "e.g. mean systolic BP on drug vs placebo; pain score before and after surgery", next: "means_outcomes" },
      { label: "Compare proportions or categories between groups", sub: "e.g. % with wound infection by dressing type; disease stage by smoking status", next: "cat_paired" },
      { label: "See how two measurements relate, or predict a measurement", sub: "e.g. BMI and HbA1c; predicting eGFR from age and diabetes", next: "corr_goal" },
      { label: "Analyse the time until an event", sub: "e.g. death, relapse, readmission, time to discharge", next: "surv_groups" },
      { label: "Explain or predict a yes/no outcome from several factors", sub: "e.g. risk factors for post-operative delirium", next: "bin_measure" },
      { label: "Model counts or rates", sub: "e.g. asthma attacks per patient-year; number of falls", result: "poisson-count" },
      { label: "Explore many variables to find patterns", sub: "e.g. which lab values cluster together in sepsis", next: "explore_types" }
    ]
  },

  // ---------- Comparing means ----------
  means_outcomes: {
    q: "How many outcome measurements do you want to compare at once?",
    help: "Choose “two or more” only if the outcomes are related and you want to test them together as one set.",
    options: [
      { label: "One outcome", sub: "e.g. HbA1c", next: "means_paired" },
      { label: "Two or more related outcomes together", sub: "e.g. grip strength, walking speed and balance score", result: "manova" }
    ]
  },
  means_paired: {
    q: "Was each patient measured more than once?",
    help: "Paired or repeated data: the same patients before and after, left vs right eye, or matched case–control pairs.",
    options: [
      { label: "No, each group contains different patients", next: "means_covariate" },
      { label: "Yes, at two time points (or matched pairs)", next: "means_normal_paired" },
      { label: "Yes, at three or more time points", result: "rm-anova" }
    ]
  },
  means_normal_paired: {
    q: "Are the within-patient differences roughly normally distributed?",
    help: "Calculate after − before for each patient and draw a histogram or Q–Q plot. With 30 or more pairs and no extreme outliers, mild skew is acceptable.",
    options: [
      { label: "Yes, or I have 30+ pairs without extreme outliers", result: "paired-t", fw: "means" },
      { label: "No, the differences are skewed, ordinal, or have outliers", result: "wilcoxon-signed" }
    ]
  },
  means_covariate: {
    q: "Do you need to adjust for a continuous variable measured at baseline?",
    help: "For example, the baseline value of the outcome, or age. In randomised trials, adjusting for the baseline value usually increases power.",
    options: [
      { label: "Yes, adjust for a baseline covariate", result: "ancova", fw: "means" },
      { label: "No", next: "means_factors" }
    ]
  },
  means_factors: {
    q: "How many grouping factors define your groups?",
    help: "A factor is a categorical variable that splits patients into groups, such as treatment arm, sex, or disease stage.",
    options: [
      { label: "One factor", sub: "e.g. treatment arm", next: "means_groups" },
      { label: "Two factors", sub: "e.g. treatment arm × sex", result: "two-way-anova", fw: "means" },
      { label: "Three factors", sub: "e.g. treatment × sex × age band", result: "three-way-anova", fw: "means" }
    ]
  },
  means_groups: {
    q: "How many groups does that factor have?",
    options: [
      { label: "Two groups", next: "means_normal2" },
      { label: "Three or more groups", next: "means_normalk" }
    ]
  },
  means_normal2: {
    q: "Is the outcome roughly normal within each group?",
    help: "Look at a histogram or Q–Q plot for each group. With 30 or more patients per group and no extreme outliers, the t-test is robust to mild skew.",
    options: [
      { label: "Yes, or 30+ per group without extreme outliers", result: "independent-t", fw: "means" },
      { label: "No, it is skewed, ordinal, or has outliers", result: "mann-whitney" }
    ]
  },
  means_normalk: {
    q: "Is the outcome roughly normal within each group?",
    help: "Look at a histogram or Q–Q plot for each group, or at the residuals of the model. Unequal spreads can be handled by Welch’s ANOVA.",
    options: [
      { label: "Yes, or large groups without extreme outliers", result: "one-way-anova", fw: "means" },
      { label: "No, it is skewed, ordinal, or has outliers", result: "kruskal-wallis" }
    ]
  },

  // ---------- Categorical ----------
  cat_paired: {
    q: "Are the observations paired?",
    help: "Paired means the same patients classified twice (e.g. test positive before and after treatment), or matched pairs.",
    options: [
      { label: "No, independent groups", next: "cat_ordinal" },
      { label: "Yes, paired yes/no data", result: "mcnemar" }
    ]
  },
  cat_ordinal: {
    q: "Does one of the variables have a natural order?",
    help: "Ordinal examples: disease stage I–IV, pain none/mild/moderate/severe, dose low/medium/high.",
    options: [
      { label: "No, the categories are unordered", sub: "e.g. blood group, treatment arm", next: "cat_table" },
      { label: "Yes, one variable is ordered and the other is yes/no", result: "chi-trend", fw: "groups" }
    ]
  },
  cat_table: {
    q: "What size is your table?",
    help: "Count the categories of each variable. Two treatments × infection yes/no is a 2×2 table.",
    options: [
      { label: "2×2", next: "cat_expected" },
      { label: "Larger than 2×2", sub: "e.g. 3 treatments × 3 outcomes", result: "chi-rxc", fw: "groups" }
    ]
  },
  cat_expected: {
    q: "Are all expected counts 5 or more?",
    help: "Expected count for a cell = row total × column total ÷ grand total. This is not the count you observed. Most software prints expected counts on request.",
    options: [
      { label: "Yes, all expected counts are 5 or more", result: "chi-2x2", fw: "groups" },
      { label: "No, at least one is below 5", result: "fisher", fw: "groups" }
    ]
  },

  // ---------- Correlation / regression ----------
  corr_goal: {
    q: "What do you want to find out?",
    options: [
      { label: "How strongly two measurements are associated", next: "corr_type" },
      { label: "Predict or explain a measurement from one or more variables", sub: "including adjusting for confounders", result: "linear-regression" },
      { label: "Whether two methods or devices agree", sub: "e.g. new point-of-care device vs lab analyser", result: "bland-altman" }
    ]
  },
  corr_type: {
    q: "Are both variables continuous, roughly normal and related in a straight line?",
    help: "Draw a scatterplot first. A curved but consistently rising (or falling) pattern, ordinal data or outliers point to Spearman.",
    options: [
      { label: "Yes", result: "pearson" },
      { label: "No: ordinal, skewed, outliers, or curved", result: "spearman" }
    ]
  },

  // ---------- Survival ----------
  surv_groups: {
    q: "How many groups are you describing or comparing?",
    options: [
      { label: "One group: describe survival", result: "km-one" },
      { label: "Two groups", next: "surv_adjust2" },
      { label: "More than two groups", next: "surv_adjustk" }
    ]
  },
  surv_adjust2: {
    q: "Do you need to adjust for other variables such as age or stage?",
    options: [
      { label: "No, a straight comparison", result: "logrank-two" },
      { label: "Yes, adjust for covariates", result: "cox" }
    ]
  },
  surv_adjustk: {
    q: "Do you need to adjust for other variables such as age or stage?",
    options: [
      { label: "No, a straight comparison", result: "logrank-multi" },
      { label: "Yes, adjust for covariates", result: "cox" }
    ]
  },

  // ---------- Binary outcomes ----------
  bin_measure: {
    q: "Which effect measure do you want to report?",
    help: "When the outcome is common (more than about 10%), odds ratios exaggerate the risk ratio and readers often misread them as risks.",
    options: [
      { label: "Odds ratio", sub: "standard choice; required for case–control studies", result: "logistic" },
      { label: "Risk ratio", sub: "cohort studies and trials, especially with a common outcome", result: "poisson-binary" }
    ]
  },

  // ---------- Exploration ----------
  explore_types: {
    q: "What kinds of variables are you exploring?",
    options: [
      { label: "All numeric", sub: "e.g. lab values", result: "pca" },
      { label: "All categorical", sub: "e.g. symptoms present/absent, comorbidities", result: "mca" },
      { label: "A mix of numeric and categorical", result: "famd" }
    ]
  },

  // ---------- Framework (last step for means and groups) ----------
  fw_means: {
    q: "How do you want to analyse and present the result?",
    help: "All four are valid. The standard test is what most journals expect; the others add information or suit particular data.",
    options: [
      { label: "Standard hypothesis test (p-value and confidence interval)", sub: "most common in medical journals", result: "$classic" },
      { label: "Estimation statistics", sub: "focus on the size of the difference and its uncertainty, with all data shown", result: "estimation-means" },
      { label: "Bayesian", sub: "probability that the treatment is better; can include prior evidence", result: "bayes-means" },
      { label: "Bootstrap", sub: "confidence interval for the mean without assuming normality", result: "bootstrap-mean" }
    ]
  },
  fw_groups: {
    q: "How do you want to analyse and present the result?",
    help: "All three are valid. The standard test is what most journals expect; the others add information.",
    options: [
      { label: "Standard hypothesis test (p-value and confidence interval)", sub: "most common in medical journals", result: "$classic" },
      { label: "Estimation statistics", sub: "risk difference, risk ratio or odds ratio with confidence intervals", result: "estimation-groups" },
      { label: "Bayesian", sub: "probability that one group truly has a higher risk", result: "bayes-groups" }
    ]
  }
};
