"""Public reference integrity only; no third-party runtime/performance validation."""
import json
from pathlib import Path
import re
import unittest
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
CAT = ROOT / "docs/data-visualization" if (ROOT / "docs/data-visualization").exists() else ROOT / "repo/data-visualization"


class VisualizationCatalogTests(unittest.TestCase):
    def setUp(self):
        self.source = json.loads((CAT / "sources-2026-11-14.json").read_text(encoding="utf-8"))
        self.manual = json.loads((CAT / "manual-review-2026-11-14.json").read_text(encoding="utf-8"))
        self.text = (CAT / "README.md").read_text(encoding="utf-8")

    def test_twelve_unique_pinned_entries_are_references_not_executed_integrations(self):
        entries = self.source["records"]
        self.assertEqual(len(entries), 12)
        self.assertEqual(len({x["repo"] for x in entries}), 12)
        for item in entries:
            self.assertRegex(item["commit"], r"^[a-f0-9]{40}$")
            self.assertRegex(item["entry"]["blob_sha"], r"^[a-f0-9]{40}$")
            self.assertIn("/blob/" + item["commit"] + "/", item["entry"]["url"])
            self.assertEqual(item["runtime"], "NOT_RUN")
            self.assertEqual(item["integration"], "REFERENCE_ONLY")
            self.assertEqual(item["data_redistribution"], "NOT_GRANTED_BY_CODE_LICENSE")
            self.assertIn(item["entry"]["url"], self.text)

    def test_unknown_license_manual_observation_and_restrictive_notices_are_distinct(self):
        entries = {x["repo"]: x for x in self.source["records"]}
        self.assertIsNone(entries["matplotlib/matplotlib"]["code_license"])
        self.assertIsNone(entries["matplotlib/mplfinance"]["code_license"])
        self.assertEqual(entries["kernc/backtesting.py"]["code_license"], "AGPL-3.0")
        self.assertTrue(entries["tradingview/lightweight-charts"]["notice"]["url"])
        self.assertFalse(self.manual["code_copied"])
        self.assertFalse(self.manual["market_or_private_data_copied"])
        self.assertEqual(entries["perspective-dev/perspective"]["requested_repo"], "finos/perspective")
        for token in ("NOTICE", "AGPL", "NOT_RUN", "UNMEASURED", "#166"):
            self.assertIn(token, self.text)

    def test_local_links_exist_without_escaping_the_public_tree(self):
        for target in re.findall(r"\]\(([^)]+)\)", self.text):
            if ":" in target or target.startswith("#"):
                continue
            path = (CAT / unquote(target.split("#")[0])).resolve()
            self.assertTrue(path.is_relative_to(ROOT.resolve()))
            self.assertTrue(path.exists(), target)

    def test_bounded_privacy_scan_and_public_sources_only(self):
        for path in CAT.iterdir():
            if path.suffix not in (".json", ".md"):
                continue
            text = path.read_text(encoding="utf-8")
            self.assertNotRegex(text, r"\b[A-Z]:[\\/]|github_pat_[A-Za-z0-9_]{30,}|ghp_[A-Za-z0-9]{30,}|file://")
        self.assertTrue(self.source["reviewed_at"].endswith("+08:00"))


if __name__ == "__main__":
    unittest.main()
