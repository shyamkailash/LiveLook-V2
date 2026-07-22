import win32gui
import win32process
import psutil


def get_active_window():
    try:
        window_handle = win32gui.GetForegroundWindow()
        window_title = win32gui.GetWindowText(window_handle)

        _, process_id = win32process.GetWindowThreadProcessId(window_handle)
        process = psutil.Process(process_id)

        return {
            "process_name": process.name(),
            "process_id": process_id,
            "window_title": window_title or "Unknown",
        }

    except (psutil.NoSuchProcess, psutil.AccessDenied, OSError) as error:
        return {
            "process_name": "unknown",
            "process_id": None,
            "window_title": "Unknown",
            "error": str(error),
        }