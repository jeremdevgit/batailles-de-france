# SPDX-License-Identifier: GPL-3.0-or-later — Copyright (C) 2026 jeremdevgit
"""Limiteur en mémoire, borné, pour les écritures du classement."""
from collections import OrderedDict


class LimiteurEcritures:
    def __init__(self, maximum: int = 5000, par_minute: int = 20):
        self.maximum = maximum
        self.par_minute = par_minute
        self._par_identite: OrderedDict[str, list[float]] = OrderedDict()

    def autoriser(self, identite: str, maintenant: float) -> bool:
        # L'ordre suit la dernière écriture acceptée : les entrées expirées sont en tête.
        while self._par_identite:
            _, dates = next(iter(self._par_identite.items()))
            if not dates or maintenant - dates[-1] >= 60:
                self._par_identite.popitem(last=False)
            else:
                break

        dates = self._par_identite.get(identite)
        if dates is None:
            # Refuser une nouvelle identité évite de faire sauter le quota d'une identité encore active.
            if len(self._par_identite) >= self.maximum:
                return False
            self._par_identite[identite] = [maintenant]
            return True

        dates[:] = [t for t in dates if maintenant - t < 60]
        if len(dates) >= self.par_minute:
            return False
        dates.append(maintenant)
        self._par_identite.move_to_end(identite)
        return True

    def __len__(self) -> int:
        return len(self._par_identite)

    def contient(self, identite: str) -> bool:
        return identite in self._par_identite
