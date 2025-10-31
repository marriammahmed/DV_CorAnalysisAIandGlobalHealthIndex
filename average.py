import pandas as pd

file_path = "ai_ml_cybersecurity_dataset.csv"
df = pd.read_csv(file_path)

severity_mapping = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
df["Severity Score"] = df["Attack Severity"].map(severity_mapping)

attack_severity_avg = df.groupby("Attack Type")["Severity Score"].mean().reset_index()

print(attack_severity_avg)
