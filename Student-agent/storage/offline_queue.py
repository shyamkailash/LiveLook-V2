import json
from pathlib import Path


QUEUE_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "offline_events.jsonl"
)


def save_event(event):
    QUEUE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with QUEUE_PATH.open("a", encoding="utf-8") as file:
        file.write(json.dumps(event, ensure_ascii=False) + "\n")


def load_pending_events():
    if not QUEUE_PATH.exists():
        return []

    events = []

    with QUEUE_PATH.open("r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                print("[QUEUE] Skipped corrupted event")

    return events


def get_pending_event_count():
    return len(load_pending_events())