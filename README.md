# Statis Clinical Stats Navigator

A guided decision aid that helps doctors with little background in medical statistics choose the right statistical test, check its assumptions, avoid common pitfalls, and interpret and report the results.

**Live site:** https://rasan17.github.io/clinical-stats-navigator/

## What it does

- **Find a test.** A short series of plain-language questions leads to the recommended test.
- **Assumptions checklist.** Each assumption comes with how to check it and what to do if it is not met, with a link to the alternative test. Marks are saved in the browser, and a summary can be copied.
- **Calculate it.** Each test links to the app that runs it (Statis, Statis Gravity or Bayesian Estimation), with the tab to open and what to choose. Tests not yet available in the apps point to R, jamovi/JASP, SPSS, Stata or Python instead.
- **Guidance.** Why the test was chosen, pitfalls to avoid, how to interpret the results, an example results sentence, and commands for R, SPSS and jamovi/JASP.

It covers 39 tests: comparing means (t-tests, one-, two- and three-way ANOVA, repeated measures, MANOVA, ANCOVA and non-parametric alternatives); comparing groups (chi-squared for 2×2 and larger tables, Fisher’s exact, McNemar, trend test and post-hoc analysis); correlation, linear regression and Bland–Altman; survival analysis (Kaplan–Meier, log-rank, Cox); logistic and Poisson regression; diagnostic accuracy (sensitivity and specificity, ROC curves, post-test probability); PCA, MCA and FAMD; and Bayesian, bootstrap and estimation-statistics methods.

You can perform these statistical analyses using [Statis](https://rasan17.github.io/Statis/), [Statis Gravity](https://rasan17.github.io/statis-gravity/) and [Bayesian Estimation](https://rasan17.github.io/Bayes-Estimation/), web applications conceived, directed and rigorously tested by Dr G Narenthiran, before undertaking the tests in professional statistical software.

## Disclaimer

Clinical Stats Navigator is a general guide; please double check the advice with statistical texts.

## Running locally

No build step or install is needed. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Project structure

- `index.html` – page layout, attribution and disclaimer
- `css/styles.css` – styles (light and dark themes)
- `js/tree.js` – the “Find a test” questions
- `js/tests.js` – content for every test (assumptions, pitfalls, interpretation, reporting)
- `js/apps.js` – which web app (and tab) calculates each test
- `js/app.js` – the app logic

## Attribution and copyright

Conceived, Directed and Tested: Dr G Narenthiran BSc(MedSci) MB ChB MRCS(Ed.) FEBNS FRCS(SN)

Copyright © G Narenthiran (g_narenthiran@hotmail.com). All rights reserved.
