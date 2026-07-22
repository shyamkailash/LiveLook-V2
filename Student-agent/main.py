import time

from collectors.active_window import get_active_window


def main():
    print("LiveLook Student Agent started")
    previous_activity = None

    try:
        while True:
            activity = get_active_window()

            activity_key = (
                activity["process_name"],
                activity["window_title"],
            )

            if activity_key != previous_activity:
                print(activity)
                previous_activity = activity_key

            time.sleep(2)

    except KeyboardInterrupt:
        print("\nLiveLook Student Agent stopped")


if __name__ == "__main__":
    main()