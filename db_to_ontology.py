"""
Standalone Python module extracted from db_to_ontology.ipynb for use by the matcher.
Loads breed data from Google Sheets, builds pyDatalog ontology, and exports B, Breed, query_to_originals, and term lists.
"""
from pyDatalog import pyDatalog, Logic

# Initialize pyDatalog engine for this thread (avoids '_thread._local' object has no attribute 'variables'
# when the module is loaded or used from a different thread or subprocess).
Logic()

import re
import pandas as pd

# --- Load data ---
SHEET_ID = "1nZUKlY0F9DvsKG5au21Lsp2FMojRoVOW9luWJQkrdHM"
GID = "756887908"
csv_url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
df = pd.read_csv(csv_url)

for col in df.columns:
    if df[col].dtype == "object":
        df[col] = df[col].astype(str).str.strip()
df = df.replace(r"^\s*$", pd.NA, regex=True).dropna(how="any").reset_index(drop=True)

# Normalize column names (strip)
df.columns = [str(c).strip() for c in df.columns]

# Ensure required _category columns exist (sheet may use different names)
def ensure_category(df, target_col, source_candidates, default_value):
    if target_col in df.columns:
        return
    for src in source_candidates:
        if src in df.columns:
            df[target_col] = df[src].astype(str).str.strip()
            return
    df[target_col] = default_value

# Map numeric or text columns to category columns expected by the notebook
energy_cats = ["Calm", "Couch_Potato", "Energetic", "Needs_Lots_of_Activity", "Regular_Exercise"]
train_cats = ["Agreeable", "Eager_to_Please", "Easy_Training", "Independent", "May_be_Stubborn"]
demeanor_cats = ["Alert_Responsive", "Aloof_Wary", "Friendly", "Outgoing", "Reserved_with_Strangers"]
shedding_cats = ["Sheds_Frequent", "Sheds_Infrequent", "Sheds_Occasional", "Sheds_Regularly", "Sheds_Seasonal"]
grooming_cats = [
    "Requires_2_3_Times_a_Week_Brushing", "Requires_Daily_Brushing", "Requires_Occasional_Bath_Brush",
    "Requires_Specialty_Professional", "Requires_Weekly_Brushing",
]

def quintile_column(series, labels):
    if len(labels) == 0:
        return series
    q = series.rank(pct=True)
    out = pd.Series(index=series.index, dtype=object)
    n = len(labels)
    for i, label in enumerate(labels):
        lo, hi = i / n, (i + 1) / n
        out[(q >= lo) & (q < hi)] = label
    out[q >= 1.0] = labels[-1]
    return out

if "energy_level_category" not in df.columns and "Energy Level" in df.columns:
    df["energy_level_category"] = quintile_column(pd.to_numeric(df["Energy Level"], errors="coerce").fillna(3), energy_cats)
ensure_category(df, "energy_level_category", ["Energy Level", "energy_level_category"], "Energetic")

if "trainability_category" not in df.columns and "Trainability Level" in df.columns:
    df["trainability_category"] = quintile_column(pd.to_numeric(df["Trainability Level"], errors="coerce").fillna(3), train_cats)
ensure_category(df, "trainability_category", ["Trainability Level", "trainability_category"], "Easy_Training")

if "demeanor_category" not in df.columns and "Openness To Strangers" in df.columns:
    df["demeanor_category"] = quintile_column(pd.to_numeric(df["Openness To Strangers"], errors="coerce").fillna(3), demeanor_cats)
ensure_category(df, "demeanor_category", ["Demeanor", "Openness To Strangers", "demeanor_category"], "Friendly")

ensure_category(df, "shedding_category", ["Shedding", "shedding_category"], "Sheds_Occasional")
# Normalize shedding values to Sheds_X form if needed
if "shedding_category" in df.columns and df["shedding_category"].dtype == object:
    def norm_shed(s):
        s = str(s).strip()
        if s.startswith("Sheds_"):
            return s
        return "Sheds_" + re.sub(r"[^0-9a-zA-Z_]+", "_", s).strip("_")
    df["shedding_category"] = df["shedding_category"].map(norm_shed)

ensure_category(df, "grooming_frequency_category", ["Grooming", "Grooming Frequency", "grooming_frequency_category"], "Requires_Weekly_Brushing")
if "grooming_frequency_category" in df.columns and df["grooming_frequency_category"].dtype == object:
    def norm_groom(s):
        s = str(s).strip()
        if s.startswith("Requires_"):
            return s
        return "Requires_" + re.sub(r"[^0-9a-zA-Z_]+", "_", s).strip("_")
    df["grooming_frequency_category"] = df["grooming_frequency_category"].map(norm_groom)

# --- Threshold helpers ---
def calculate_threshold_values(min_val, max_val):
    span = max_val - min_val
    t1 = min_val + span / 3.0
    t2 = min_val + 2.0 * span / 3.0
    return t1, t2

def categorize_numeric_value(value, t1, t2, cat1, cat2, cat3):
    if value <= t1:
        return cat1
    elif value <= t2:
        return cat2
    return cat3

# --- Size, children, other dogs, protectiveness, barking ---
df = df[(df["min_weight"] > 0) & (df["max_weight"] > 0)].reset_index(drop=True)
df["avg_weight"] = (df["min_weight"] + df["max_weight"]) / 2.0
min_avg = df["avg_weight"].min()
max_avg = df["avg_weight"].max()
t1, t2 = calculate_threshold_values(min_avg, max_avg)
df["size_class"] = df["avg_weight"].apply(lambda w: categorize_numeric_value(w, t1, t2, "Small", "Medium", "Large"))

t1, t2 = calculate_threshold_values(df["Good With Young Children"].min(), df["Good With Young Children"].max())
df["good_with_children_class"] = df["Good With Young Children"].apply(
    lambda v: categorize_numeric_value(v, t1, t2, "Bad_With_Children", "Ok_With_Children", "Good_With_Children")
)

t1, t2 = calculate_threshold_values(df["Good With Other Dogs"].min(), df["Good With Other Dogs"].max())
df["good_with_other_dogs_class"] = df["Good With Other Dogs"].apply(
    lambda v: categorize_numeric_value(v, t1, t2, "Bad_With_Other_Dogs", "Ok_With_Other_Dogs", "Good_With_Other_Dogs")
)

t1, t2 = calculate_threshold_values(df["Watchdog/Protective Nature"].min(), df["Watchdog/Protective Nature"].max())
df["protectiveness_class"] = df["Watchdog/Protective Nature"].apply(
    lambda v: categorize_numeric_value(v, t1, t2, "Not_Protective", "Somewhat_Protective", "Very_Protective")
)

t1, t2 = calculate_threshold_values(df["Barking Level"].min(), df["Barking Level"].max())
df["barking_level_class"] = df["Barking Level"].apply(
    lambda v: categorize_numeric_value(v, t1, t2, "Barks_Rarely", "Barks_Occasionally", "Barks_Often")
)

# --- pyDatalog terms and facts ---
pyDatalog.clear()

def to_term_name(breed):
    return re.sub(r"[^0-9a-zA-Z_]+", "_", breed).strip("_")

breed_to_term = {breed: to_term_name(breed) for breed in df["breed"].unique()}
shedding_to_term = {s: (to_term_name(s)) for s in df["shedding_category"].unique()}
grooming_to_term = {g: (to_term_name(g)) for g in df["grooming_frequency_category"].unique()}
energy_to_term = {e: to_term_name(e) for e in df["energy_level_category"].unique()}
trainability_to_term = {t: to_term_name(t) for t in df["trainability_category"].unique()}
demeanor_to_term = {d: to_term_name(d) for d in df["demeanor_category"].unique()}
coat_type_to_term = {c: (to_term_name(c) + "_Coat") for c in df["Coat Type"].unique()}
coat_length_to_term = {c: (to_term_name(c) + "_Coat") for c in df["Coat Length"].unique()}

all_breed_terms = sorted(set(breed_to_term.values()))
all_shedding_terms = sorted(set(shedding_to_term.values()))
all_grooming_terms = sorted(set(grooming_to_term.values()))
all_energy_terms = sorted(set(energy_to_term.values()))
all_trainability_terms = sorted(set(trainability_to_term.values()))
all_demeanor_terms = sorted(set(demeanor_to_term.values()))
all_coat_type_terms = sorted(set(coat_type_to_term.values()))
all_coat_length_terms = sorted(set(coat_length_to_term.values()))

size_terms = ["Small", "Medium", "Large"]
good_with_children_terms = ["Bad_With_Children", "Ok_With_Children", "Good_With_Children"]
good_with_other_dogs_terms = ["Bad_With_Other_Dogs", "Ok_With_Other_Dogs", "Good_With_Other_Dogs"]
protectivity_terms = ["Not_Protective", "Somewhat_Protective", "Very_Protective"]
barking_level_terms = ["Barks_Rarely", "Barks_Occasionally", "Barks_Often"]
higher_level_terms = [
    "Good_For_Apartment", "Property_Watchdog", "Thrives_On_Ranch", "Good_For_Small_Homes",
    "Good_For_Low_Free_Time", "High_Time_Commitment_Dog", "Needs_Daily_Training_And_Exercise", "Good_For_Beginners", "Calm_And_Obedient",
]

terms_str = ", ".join(
    all_breed_terms + all_shedding_terms + all_grooming_terms + all_energy_terms
    + all_trainability_terms + all_demeanor_terms + all_coat_type_terms + all_coat_length_terms
    + ["B", "Breed"] + size_terms + good_with_children_terms + good_with_other_dogs_terms
    + protectivity_terms + barking_level_terms + higher_level_terms
)
pyDatalog.create_terms(terms_str)

# Assert facts
for _, row in df.iterrows():
    breed = row["breed"]
    +Breed(breed)
    size = globals()[row["size_class"]]
    +size(breed)
    pred_name = shedding_to_term[row["shedding_category"]]
    +globals()[pred_name](breed)
    pred_name = grooming_to_term[row["grooming_frequency_category"]]
    +globals()[pred_name](breed)
    pred_name = energy_to_term[row["energy_level_category"]]
    +globals()[pred_name](breed)
    pred_name = trainability_to_term[row["trainability_category"]]
    +globals()[pred_name](breed)
    pred_name = demeanor_to_term[row["demeanor_category"]]
    +globals()[pred_name](breed)
    +globals()[row["good_with_children_class"]](breed)
    +globals()[row["good_with_other_dogs_class"]](breed)
    pred_name = coat_type_to_term[row["Coat Type"]]
    +globals()[pred_name](breed)
    pred_name = coat_length_to_term[row["Coat Length"]]
    +globals()[pred_name](breed)
    +globals()[row["protectiveness_class"]](breed)
    +globals()[row["barking_level_class"]](breed)

# Higher-level rules (only those that use defined predicates)
Good_For_Apartment(B) <= Breed(B) & ~Large(B) & Barks_Rarely(B)
Good_For_Small_Homes(B) <= Breed(B) & ~Large(B) & ~Barks_Often(B)
Thrives_On_Ranch(B) <= Breed(B) & Large(B) & Very_Protective(B)
Good_For_Low_Free_Time(B) <= Breed(B) & ~Needs_Lots_of_Activity(B) & Requires_Weekly_Brushing(B) & Easy_Training(B)
Calm_And_Obedient(B) <= Breed(B) & ~Needs_Lots_of_Activity(B) & Easy_Training(B)
Good_For_Beginners(B) <= Breed(B) & Easy_Training(B) & ~Needs_Lots_of_Activity(B) & Requires_Weekly_Brushing(B)
High_Time_Commitment_Dog(B) <= Breed(B) & Needs_Lots_of_Activity(B) & Requires_Daily_Brushing(B) & May_be_Stubborn(B)
Needs_Daily_Training_And_Exercise(B) <= Breed(B) & Needs_Lots_of_Activity(B) & May_be_Stubborn(B)

term_to_breed = {v: k for k, v in breed_to_term.items()}

# Breed name -> short description (from the dataset) for use by the matcher/API
breed_descriptions = (
    dict(zip(df["breed"], df["description"].astype(str)))
    if "description" in df.columns
    else {}
)

def query_to_originals(query_result):
    originals = []
    for (term_obj,) in query_result:
        originals.append(term_to_breed.get(str(term_obj), str(term_obj)))
    return originals
