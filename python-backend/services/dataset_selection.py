import json
from typing import List, Dict, Any
from pathlib import Path

DATASETS_PATH = Path(__file__).parent.parent.parent / "src" / "data" / "datasets.json"

class DatasetSelection:
    @staticmethod
    def load_datasets() -> List[Dict[str, Any]]:
        if DATASETS_PATH.exists():
            with open(DATASETS_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    @staticmethod
    def get_dataset_by_uid(uid: str) -> Dict[str, Any]:
        datasets = DatasetSelection.load_datasets()
        for ds in datasets:
            if ds.get("uid") == uid or ds.get("id") == uid:
                return ds
        return {}

    @staticmethod
    def add_dataset(dataset: Dict[str, Any]) -> bool:
        datasets = DatasetSelection.load_datasets()
        datasets.append(dataset)
        with open(DATASETS_PATH, "w", encoding="utf-8") as f:
            json.dump(datasets, f, indent=2, ensure_ascii=False)
        return True

    @staticmethod
    def update_dataset(uid: str, updates: Dict[str, Any]) -> bool:
        datasets = DatasetSelection.load_datasets()
        updated = False
        for i, ds in enumerate(datasets):
            if ds.get("uid") == uid or ds.get("id") == uid:
                datasets[i].update(updates)
                updated = True
                break
        if updated:
            with open(DATASETS_PATH, "w", encoding="utf-8") as f:
                json.dump(datasets, f, indent=2, ensure_ascii=False)
        return updated

    @staticmethod
    def delete_dataset(uid: str) -> bool:
        datasets = DatasetSelection.load_datasets()
        new_datasets = [ds for ds in datasets if ds.get("uid") != uid and ds.get("id") != uid]
        if len(new_datasets) != len(datasets):
            with open(DATASETS_PATH, "w", encoding="utf-8") as f:
                json.dump(new_datasets, f, indent=2, ensure_ascii=False)
            return True
        return False
