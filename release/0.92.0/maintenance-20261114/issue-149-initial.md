Hi @lomig-qwen, thanks for the detailed report, and sorry this was left unanswered.

I have checked the actual npm package: `dsh-quant@0.90.0` still declares `^0.1.0-rc.5` for `dsh-tools` and `dsh-system-prompt`, so it does not cover your `0.2.1-rc.5` host. npm `latest` is still `0.90.0`; merged source compatibility work is not the same as a published, installable update.

I am now reproducing the `0.2.1-rc.5` case, validating a packed candidate with a real Loader, and repairing the npm delivery path. I will post an exact version and installation command only after the registry package itself has passed clean-install checks. Please do not bypass the host's compatibility protection to force the old package to load.

Keeping this open until actual registry delivery and installation are verified. No passwords or tokens are needed in this Issue. Thanks again for reporting the real installation path and helping us improve it; please keep the feedback coming.
