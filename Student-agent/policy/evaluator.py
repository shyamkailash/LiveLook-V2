"""
Policy evaluator for LiveLook Student Agent.
Checks whether the currently active application is allowed.
"""


def evaluate_activity(activity, allowed_apps):
    """
    Evaluate the currently active application.

    Args:
        activity (dict):
            {
                "process_name": "...",
                "window_title": "..."
            }

        allowed_apps (list[str]):
            Example:
            [
                "Code",
                "Visual Studio Code",
                "python.exe"
            ]

    Returns:
        dict
    """

    process_name = activity.get("process_name", "").lower()
    window_title = activity.get("window_title", "").lower()

    allowed = {app.lower() for app in allowed_apps}

    # Check process name
    if process_name in allowed:
        return {
            "status": "allowed",
            "reason": f"Allowed application: {process_name}"
        }

    # Check window title
    for app in allowed:
        if app in window_title:
            return {
                "status": "allowed",
                "reason": f"Allowed window: {window_title}"
            }

    # Otherwise block
    return {
        "status": "blocked",
        "reason": f"Unauthorized application detected: {process_name}"
    }