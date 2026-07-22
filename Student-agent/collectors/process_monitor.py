import psutil


def get_running_processes():
    processes = []

    for process in psutil.process_iter(["pid", "name"]):
        try:
            processes.append({
                "pid": process.info["pid"],
                "name": process.info["name"] or "unknown",
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    return processes