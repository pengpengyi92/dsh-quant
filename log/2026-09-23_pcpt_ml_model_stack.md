# PCPT Log — ML model stack clarified

Date: 2026-09-23

Today PCPT formalized the working distinction among Logistic Regression, XGBoost-style boosting trees, and Neural Networks.

Key decisions:
- Logistic Regression becomes a default baseline for classification because it is fast, highly interpretable, and useful for feature-direction / weight diagnostics.
- Boosted trees are the next structured-data nonlinear benchmark because they capture threshold effects and interactions naturally.
- Neural Networks are treated as higher-capacity nonlinear representation learners. Their nonlinearity comes from activation functions between affine layers, not from merely adding polynomial terms.
- Neural Networks usually have higher overfitting risk and weaker interpretability than Logistic Regression; deeper / wider architectures also increase compute and memory demand.
- PCPT model development should follow a simple-to-complex ladder and require walk-forward / OOS evidence before accepting additional complexity.

Future PCPT scope now explicitly includes:
- classical ML
- boosted trees
- neural networks / deep learning
- reinforcement learning
- validation, regularization, attribution, and model-comparison tooling
