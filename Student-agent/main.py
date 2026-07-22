import time
from datetime import datetime, timezone

from collectors.active_window import get_active_window
from policy.evaluator import evaluate_activity, load_policy


def main():
    print("LiveLook Student Agent started")

    policy = load_policy()
    previous_activity = None

    try:
        while True:
            activity = get_active_window()

            activity_key = (
                activity.get("process_name"),
                activity.get("window_title"),
            )

            if activity_key != previous_activity:
                decision = evaluate_activity(activity, policy)

                event = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "activity": activity,
                    "status": decision["status"],
                    "reason": decision["reason"],
                }

                print(event)
                previous_activity = activity_key

            time.sleep(2)

    except KeyboardInterrupt:
        print("\nLiveLook Student Agent stopped")


if __name__ == "__main__":
    main()