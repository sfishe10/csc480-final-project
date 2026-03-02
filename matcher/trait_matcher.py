import argparse
import ast
import inspect
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import db_to_ontology as rules


@dataclass(frozen=True)
class Preference:
    trait: str
    importance: int


@dataclass(frozen=True)
class ResolvedPreference:
    trait: str
    importance: int
    predicate_name: str
    predicate: Any


def _normalize_trait_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")


def _parse_json_or_python_object(text: str) -> Any:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return ast.literal_eval(text)


def load_preferences_from_file(json_path: str | Path) -> list[Preference]:
    raw_text = Path(json_path).read_text(encoding="utf-8")
    parsed = _parse_json_or_python_object(raw_text)

    if isinstance(parsed, dict):
        parsed = parsed.get("preferences", [])

    if not isinstance(parsed, list):
        raise ValueError("Preferences file must contain a list or {'preferences': [...]} object.")

    preferences: list[Preference] = []
    for idx, item in enumerate(parsed):
        if not isinstance(item, dict):
            raise ValueError(f"Preference at index {idx} must be an object.")

        trait = item.get("trait") or item.get("category") or item.get("name")
        if not trait or not isinstance(trait, str):
            raise ValueError(f"Preference at index {idx} is missing a string 'trait'.")

        importance_raw = item.get("importance", 3)
        try:
            importance = int(importance_raw)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Preference '{trait}' has invalid importance '{importance_raw}'.") from exc

        if not (1 <= importance <= 5):
            raise ValueError(f"Preference '{trait}' importance must be in [1, 5].")

        preferences.append(Preference(trait=trait, importance=importance))

    return preferences


def _known_trait_names_from_rules() -> set[str]:
    names: set[str] = set()
    list_attrs = [
        "all_shedding_terms",
        "all_grooming_terms",
        "all_energy_terms",
        "all_trainability_terms",
        "all_demeanor_terms",
        "all_coat_type_terms",
        "all_coat_length_terms",
        "size_terms",
        "good_with_children_terms",
        "good_with_other_dogs_terms",
        "protectivity_terms",
        "barking_level_terms",
    ]

    for attr in list_attrs:
        for value in getattr(rules, attr, []):
            names.add(str(value))

    for name, value in vars(rules).items():
        if name.startswith("_"):
            continue
        if name in {"B", "Breed"}:
            continue
        if inspect.isfunction(value) or inspect.ismethod(value):
            continue
        if callable(value):
            names.add(name)

    return names


def _build_trait_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for name in _known_trait_names_from_rules():
        key = _normalize_trait_name(name)
        if key and key not in lookup:
            lookup[key] = name
    return lookup


def _resolve_preference(pref: Preference, trait_lookup: dict[str, str]) -> ResolvedPreference:
    normalized = _normalize_trait_name(pref.trait)
    predicate_name = trait_lookup.get(normalized)
    if predicate_name is None:
        available = ", ".join(sorted(trait_lookup.keys()))
        raise ValueError(
            f"Unknown trait '{pref.trait}'. Normalized value '{normalized}' is not available. "
            f"Known traits: {available}"
        )

    predicate = getattr(rules, predicate_name, None)
    if predicate is None or not callable(predicate):
        raise ValueError(f"Trait '{pref.trait}' resolved to '{predicate_name}', but it is not callable.")

    return ResolvedPreference(
        trait=pref.trait,
        importance=pref.importance,
        predicate_name=predicate_name,
        predicate=predicate,
    )


def _query_breeds(active_preferences: list[ResolvedPreference]) -> list[str]:
    b_var = rules.B

    if not active_preferences:
        query = rules.Breed(b_var)
    else:
        query = active_preferences[0].predicate(b_var)
        for pref in active_preferences[1:]:
            query = query & pref.predicate(b_var)

    return list(dict.fromkeys(rules.query_to_originals(query)))


def _score_candidates(
    candidates: list[str], resolved_preferences: list[ResolvedPreference]
) -> list[dict[str, Any]]:
    b_var = rules.B
    trait_to_matching_breeds: dict[str, set[str]] = {}

    for pref in resolved_preferences:
        if pref.predicate_name not in trait_to_matching_breeds:
            trait_to_matching_breeds[pref.predicate_name] = set(
                rules.query_to_originals(pref.predicate(b_var))
            )

    scored: list[dict[str, Any]] = []
    for breed in candidates:
        score = 0
        matched_traits: list[str] = []
        for pref in resolved_preferences:
            if breed in trait_to_matching_breeds[pref.predicate_name]:
                score += pref.importance
                matched_traits.append(pref.trait)

        scored.append(
            {
                "breed": breed,
                "score": score,
                "matched_traits": matched_traits,
                "matched_count": len(matched_traits),
            }
        )

    scored.sort(key=lambda item: (-item["score"], -item["matched_count"], item["breed"]))
    return scored


def find_breed_matches(
    preferences: list[Preference], min_matches: int
) -> dict[str, Any]:
    if min_matches < 1:
        raise ValueError("min_matches must be >= 1.")

    trait_lookup = _build_trait_lookup()
    resolved = [_resolve_preference(pref, trait_lookup) for pref in preferences]

    active = list(resolved)
    dropped: list[ResolvedPreference] = []

    candidates = _query_breeds(active)
    while len(candidates) < min_matches and active:
        lowest_importance = min(pref.importance for pref in active)
        drop_index = next(i for i, pref in enumerate(active) if pref.importance == lowest_importance)
        dropped.append(active.pop(drop_index))
        candidates = _query_breeds(active)

    ranked = _score_candidates(candidates, resolved)
    ranked_breeds = [entry["breed"] for entry in ranked]

    return {
        "breeds": ranked_breeds,
        "ranked": ranked,
        "used_traits": [pref.trait for pref in active],
        "dropped_traits": [pref.trait for pref in dropped],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("preferences_file", help="Path to a JSON file with preferences.")
    args = parser.parse_args()
    preferences = load_preferences_from_file(args.preferences_file)
    result = find_breed_matches(preferences, 5)

    print(json.dumps(result["ranked"][:5], indent=2))


if __name__ == "__main__":
    main()
