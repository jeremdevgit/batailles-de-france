# SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))
from limiteur_ecritures import LimiteurEcritures


class WriteRateLimit(unittest.TestCase):
    def test_distinct_identities_never_exceed_global_bound(self):
        limiteur = LimiteurEcritures(maximum=5000)
        for n in range(5001):
            accepted = limiteur.autoriser(f"{n:016x}", 10.0)
            self.assertEqual(accepted, n < 5000)

        self.assertEqual(len(limiteur), 5000)
        self.assertTrue(limiteur.contient("0000000000000000"))
        self.assertTrue(limiteur.autoriser("0000000000000000", 10.0))
        self.assertEqual(len(limiteur), 5000)
        self.assertTrue(limiteur.autoriser("0000000000001388", 70.0))
        self.assertEqual(len(limiteur), 1)

    def test_per_identity_window_still_rejects_twenty_first_write(self):
        limiteur = LimiteurEcritures()
        for n in range(20):
            self.assertTrue(limiteur.autoriser("a" * 16, 10.0 + n))

        self.assertFalse(limiteur.autoriser("a" * 16, 30.0))
        self.assertTrue(limiteur.autoriser("a" * 16, 70.0))

    def test_expired_entries_are_removed_without_dropping_recent_ones(self):
        limiteur = LimiteurEcritures()
        self.assertTrue(limiteur.autoriser("a" * 16, 0.0))
        self.assertTrue(limiteur.autoriser("b" * 16, 30.0))
        self.assertTrue(limiteur.autoriser("c" * 16, 61.0))

        self.assertFalse(limiteur.contient("a" * 16))
        self.assertTrue(limiteur.contient("b" * 16))
        self.assertTrue(limiteur.contient("c" * 16))


if __name__ == "__main__":
    unittest.main()
