import time

from collectors.active_window import get_active_window
from events.builder import build_activity_event
from policy.evaluator import evaluate_activity, load_policy
from storage.offline_queue import (
    get_pending_event_count,
    save_event,
)


def main():
    print("LiveLook Student Agent started")

    policy = load_policy()
    previous_activity = None

    print(
        f"[QUEUE] Pending offline events: "
        f"{get_pending_event_count()}"
    )

    try:
        while True:
            activity = get_active_window()

            activity_key = (
                activity.get("process_name"),
                activity.get("window_title"),
            )

            if activity_key != previous_activity:
                decision = evaluate_activity(activity, policy)

                print(
                    f"[{decision['status'].upper()}] "
                    f"{decision['reason']}"
                )

                if decision["status"] in {"blocked", "warning"}:
                    event = build_activity_event(
                        activity,
                        decision,
                    )

                    save_event(event)

                    print(
                        f"[QUEUE] Event saved: "
                        f"{event['event_id']}"
                    )

                previous_activity = activity_key

            time.sleep(2)

    except KeyboardInterrupt:
        print("\nLiveLook Student Agent stopped")


if __name__ == "__main__":
    main()