// Where each test can be calculated in Dr G Narenthiran's web apps.
// The apps have no links to individual tabs, so each entry says which tab to open and what to choose.
// Tests with no entry (or an empty list) are not yet available in any of the apps.

window.APPS = {
  statis: { name: "Statis", url: "https://rasan17.github.io/Statis/" },
  gravity: { name: "Statis Gravity", url: "https://rasan17.github.io/statis-gravity/" },
  bayes: { name: "Bayesian Estimation", url: "https://rasan17.github.io/Bayes-Estimation/" }
};

window.APP_LINKS = {
  "independent-t": [
    { app: "statis", where: "T-test tab", how: "Paste the two groups and leave “Paired samples” unticked. Auto chooses Welch’s or Student’s t-test from the normality and variance checks and explains why." },
    { app: "gravity", where: "Hypothesis Testing", how: "Leave “Paired Samples” unticked and choose Welch’s t-test, or Automatic Recommendation." }
  ],
  "paired-t": [
    { app: "statis", where: "T-test tab", how: "Tick “Paired samples (same subjects, before/after)” and paste the before and after values in the same patient order." },
    { app: "gravity", where: "Hypothesis Testing", how: "Tick “Paired Samples” and choose Paired Samples t-test." }
  ],
  "mann-whitney": [
    { app: "statis", where: "T-test tab", how: "Leave “Paired samples” unticked and choose Mann–Whitney U (Auto selects it when Shapiro–Wilk flags non-normal data). Exact p-values for small samples." },
    { app: "gravity", where: "Hypothesis Testing", how: "Leave “Paired Samples” unticked and choose Mann–Whitney U Test." }
  ],
  "wilcoxon-signed": [
    { app: "statis", where: "T-test tab", how: "Tick “Paired samples” and choose Wilcoxon signed-rank (Auto selects it when the differences are non-normal)." },
    { app: "gravity", where: "Hypothesis Testing", how: "Tick “Paired Samples” and choose Wilcoxon Signed-Rank Test." }
  ],
  "one-way-anova": [
    { app: "gravity", where: "Multi-Group ANOVA", how: "Choose One-Way ANOVA (with Tukey HSD post-hoc) or Welch’s ANOVA (with Games–Howell post-hoc) for unequal variances." },
    { app: "statis", where: "ANOVA tab", how: "Choose Auto, One-way ANOVA or Welch’s ANOVA. Post-hoc comparisons are not yet available here, so use Statis Gravity for them." }
  ],
  "kruskal-wallis": [
    { app: "gravity", where: "Multi-Group ANOVA", how: "Choose Kruskal–Wallis H Test; Dunn’s pairwise comparisons (Bonferroni-adjusted) are included." },
    { app: "statis", where: "ANOVA tab", how: "Choose Kruskal–Wallis as the method. No post-hoc comparisons yet." }
  ],
  "rm-anova": [
    { app: "gravity", where: "Multi-Group ANOVA", how: "Tick “Paired / Repeated Measures Design” and choose One-Way Repeated Measures ANOVA (sphericity is assessed), or the Friedman test for skewed data. Every patient needs a value at every time point; for missing visits use a mixed model in R or SPSS." }
  ],
  "manova": [
    { app: "statis", where: "MANOVA/ANCOVA tab", how: "Choose MANOVA, enter the group labels and add two or more dependent variables. Gives Wilks’ Λ with follow-up univariate ANOVAs. It does not report Pillai’s trace, which is preferred when group sizes or covariance matrices differ; check that in R or SPSS if this applies." }
  ],
  "ancova": [
    { app: "statis", where: "MANOVA/ANCOVA tab", how: "Choose ANCOVA, enter the outcome and group labels and add one or more covariates (e.g. the baseline value). Gives adjusted group means with 95% CIs, partial η² and a homogeneity-of-slopes check." }
  ],
  "diag-accuracy": [
    { app: "gravity", where: "2x2 Risk & Contingency", how: "Choose “Diagnostic Test vs Gold Standard” and enter the four counts. Gives sensitivity, specificity, PPV, NPV and overall accuracy." },
    { app: "bayes", where: "Diagnostic Bayes & Nomogram tab", how: "Enter sensitivity, specificity and prevalence to get likelihood ratios, the diagnostic odds ratio and post-test probabilities." }
  ],
  "roc": [
    { app: "gravity", where: "Diagnostic & ROC", how: "Paste the marker values with each patient’s outcome and choose “Generate ROC & Cutoff”. Gives the ROC curve, AUC and the Youden-optimal cut-off." }
  ],
  "post-test": [
    { app: "bayes", where: "Diagnostic Bayes & Nomogram tab", how: "Enter the pre-test probability, sensitivity and specificity. Gives LR+, LR−, post-test probabilities after a positive and a negative result (with 95% HDI) and a Fagan nomogram." }
  ],
  "chi-2x2": [
    { app: "statis", where: "Contingency table tab", how: "Enter the four counts. Gives χ² (with optional Yates’ correction), Fisher’s exact test, odds ratio and relative risk with 95% CIs." },
    { app: "gravity", where: "2x2 Risk & Contingency", how: "Choose “Clinical Study / Trial”. Gives χ², Fisher’s exact test, relative risk, odds ratio, risk reduction and NNT." }
  ],
  "fisher": [
    { app: "statis", where: "Contingency table tab", how: "Enter the four counts; Fisher’s exact p-value is shown alongside χ²." },
    { app: "gravity", where: "2x2 Risk & Contingency", how: "Choose “Clinical Study / Trial”; Fisher’s exact test is reported with the risk measures." }
  ],
  "chi-rxc": [
    { app: "statis", where: "Descriptive/Pivot tab", how: "Upload or paste patient-level data (one row per patient), then choose the row and column variables. Gives χ² and Cramér’s V, and switches automatically to the Fisher–Freeman–Halton exact test when expected counts are too small." }
  ],
  "pearson": [
    { app: "statis", where: "Correlation tab", how: "Paste X and Y in matching order. Includes normality and curvature checks; choose Pearson or leave on Auto." },
    { app: "gravity", where: "Correlation & Regression", how: "Paste the paired values; Pearson r is reported with assumption diagnostics." }
  ],
  "spearman": [
    { app: "statis", where: "Correlation tab", how: "Choose Spearman (or Kendall’s tau, which handles many tied values better)." },
    { app: "gravity", where: "Correlation & Regression", how: "Spearman ρ is reported alongside Pearson r." }
  ],
  "linear-regression": [
    { app: "statis", where: "Correlation tab", how: "Gives simple linear regression (one predictor) with residual normality and Breusch–Pagan checks. For several predictors or confounder adjustment, use R, SPSS or jamovi." },
    { app: "gravity", where: "Correlation & Regression", how: "Simple (one-predictor) OLS regression with the fitted equation and diagnostics." }
  ],
  "km-one": [
    { app: "statis", where: "Survival tab", how: "Choose “One-group Kaplan–Meier”, then load your time and event (1 = event, 0 = censored) columns. Gives median survival with 95% CI, the curve and a life table." }
  ],
  "logrank-two": [
    { app: "statis", where: "Survival tab", how: "Choose “Two-group comparison” and add the group column. Gives both Kaplan–Meier curves, medians and the log-rank test. For the hazard ratio, use a Cox model in R or SPSS." }
  ],
  "logistic": [
    { app: "statis", where: "GLM tab", how: "Choose Logistic regression (logit link), enter the 0/1 outcome and add one or more predictors (continuous, ordinal or nominal). Gives odds ratios with 95% CIs, pseudo-R² and a classification table; Firth’s correction switches on automatically when there are fewer than 10 events per predictor." }
  ],
  "poisson-binary": [
    { app: "statis", where: "GLM tab", how: "Choose “Relative risk regression for binary outcomes”. It fits log-binomial regression first and falls back to modified Poisson with robust standard errors if that does not converge; a percentile bootstrap is offered for small samples." }
  ],
  "poisson-count": [
    { app: "statis", where: "GLM tab", how: "Choose Poisson regression. It has no follow-up-time offset or negative binomial model, so if follow-up varies between patients or the data are overdispersed, use R or SPSS." }
  ],
  "pca": [
    { app: "gravity", where: "Multivariate EDA (PCA / MCA / FAMD)", how: "Choose option 1, Principal Component Analysis (continuous variables only)." }
  ],
  "mca": [
    { app: "gravity", where: "Multivariate EDA (PCA / MCA / FAMD)", how: "Choose option 2, Multiple Correspondence Analysis (categorical variables only)." }
  ],
  "famd": [
    { app: "gravity", where: "Multivariate EDA (PCA / MCA / FAMD)", how: "Choose option 3, Factor Analysis of Mixed Data." }
  ],
  "bayes-means": [
    { app: "bayes", where: "Two Means (BEST t-Test) tab", how: "Enter each group’s mean, SD and n (or paste raw values) and set the ROPE. Gives the probability of superiority, 95% HDI and a JZS Bayes factor. Two independent groups only." }
  ],
  "bayes-groups": [
    { app: "bayes", where: "Two Proportions (A/B Testing) tab", how: "Enter events and sample size for each group, the Beta priors and the ROPE. Gives the probability of superiority, 95% HDI for the risk difference, RR, OR, NNT and a Bayes factor. Yes/no outcomes only; ordinal scales are not yet supported." }
  ],
  "estimation-means": [
    { app: "bayes", where: "Two Means (BEST t-Test) tab", how: "The green panels give the mean difference, Cohen’s d, Hedges’ g and the common-language effect size with 95% CIs. The bootstrap here resamples from a normal distribution with your groups’ mean and SD, so for clearly skewed data treat the interval with caution." }
  ],
  "estimation-groups": [
    { app: "bayes", where: "Two Proportions (A/B Testing) tab", how: "The green panels give the risk difference, relative risk, odds ratio, NNT and Cohen’s h with 95% bootstrap CIs." },
    { app: "gravity", where: "2x2 Risk & Contingency", how: "Choose “Clinical Study / Trial” for relative risk, odds ratio, risk reduction and NNT." }
  ]
};
