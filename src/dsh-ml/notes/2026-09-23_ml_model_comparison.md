# PCPT Notes — Linear Models, Boosting Trees, and Neural Networks

Date: 2026-09-23
Domain: PCPT / dsh-ml

## Core comparison

### Logistic Regression
- Baseline model that should almost always be run for a classification problem.
- Strong interpretability: coefficient sign and magnitude provide a direct first-pass view of feature direction and relative importance.
- Fast to train, cheap to iterate, useful for sanity checks, feature screening, and data understanding.
- Decision boundary is linear unless nonlinear / interaction terms are manually engineered.
- In PCPT, treat Logistic Regression as a mandatory interpretable benchmark before moving to higher-capacity models.

### XGBoost / Gradient-Boosted Trees
- Nonlinear ensemble model built by adding trees sequentially to reduce residual error / loss.
- Naturally captures thresholds and feature interactions without manually creating every interaction term.
- Usually stronger than linear models on structured / tabular data.
- Interpretability is weaker than Logistic Regression but still workable through feature importance, split statistics, SHAP, PDP, etc.
- More accurate description: XGBoost is a gradient-boosted decision-tree algorithm, not merely a "statistical result."

### Neural Networks
- Build nonlinear functions through repeated composition:
  linear transform -> nonlinear activation -> linear transform -> nonlinear activation -> ...
- Nonlinearity comes primarily from activation functions such as ReLU, GELU, sigmoid, tanh; it is not simply "automatically adding x^2 or x^3."
- Hidden layers learn latent representations / interactions that can approximate complicated nonlinear functions.
- Higher model capacity means higher overfitting risk when data, regularization, architecture, and validation are insufficient.
- Interpretability is generally weaker, especially as depth / width increase.
- Compute and memory cost generally rise with model size, input dimensionality, training iterations, and architecture complexity.

## PCPT model ladder

For a new structured-data problem:

1. Logistic Regression / linear baseline
2. Tree baseline
3. XGBoost / CatBoost / LightGBM
4. Neural Network / Deep Learning
5. RL only when the problem is genuinely sequential decision-making

Do not jump directly to complexity. Every higher-capacity model should prove incremental OOS value over simpler baselines.

## Research principle

Model capacity should increase only when supported by:
- OOS / walk-forward improvement
- stable feature / signal behaviour
- sufficient data volume
- regularization and early stopping
- robustness under regime changes
- transaction-cost-aware economic value

The baseline itself is part of the research output: Logistic Regression is not only a predictor; it is a diagnostic tool for understanding the data-generating structure.
