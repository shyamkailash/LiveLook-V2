
from datetime import datetime
from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):

        self.students = {}
        self.teachers = {}
        self.violations = []


    # ==========================
    # STUDENT CONNECTION
    # ==========================

    async def connect_student(
        self,
        websocket: WebSocket,
        student_id: str,
        name: str,
        pc: str,
        allowed_apps: list[str]
   ):

        self.students[student_id] = {

            "websocket": websocket,
            "student_id": student_id,
            "name": name,
            "pc": pc,
            "allowed_apps": allowed_apps,
            "status": "online",
            "last_seen": datetime.now(),
            "active_window": None,
            "frame": None

        }


        print(
            f"Student connected: {name} ({student_id})"
        )


        await self.broadcast_student_status(
            student_id,
            "online"
        )



    # ==========================
    # FRAME HANDLING
    # ==========================

    def update_frame(
        self,
        student_id: str,
        frame: str
    ):

        if student_id in self.students:

            self.students[student_id]["frame"] = frame



    async def broadcast_frame(
        self,
        student_id: str
    ):

        if student_id not in self.students:

            return


        student = self.students[student_id]


        message = {

            "type": "frame",

            "student_id": student["student_id"],

            "name": student["name"],

            "pc": student["pc"],

            "frame": student["frame"]

        }


        disconnected = []


        for teacher_id, websocket in self.teachers.items():

            try:

                await websocket.send_json(message)


            except Exception:

                disconnected.append(teacher_id)



        for teacher_id in disconnected:

            self.disconnect_teacher(teacher_id)



    # ==========================
    # ACTIVITY TRACKING
    # ==========================

    def update_activity(
        self,
        student_id: str,
        active_window: str
    ):

        if student_id in self.students:

            self.students[student_id]["active_window"] = active_window

            allowed = self.students[student_id].get("allowed_apps", [])

            if allowed:

                window = active_window.lower()

                is_allowed = any(app.lower() in window for app in allowed)

                if not is_allowed:

                    print(f"Violation: {student_id} opened {active_window}")



    # ==========================
    # HEARTBEAT
    # ==========================

    def update_heartbeat(
        self,
        student_id: str
    ):

        if student_id in self.students:

            self.students[student_id]["last_seen"] = datetime.now()

            self.students[student_id]["status"] = "online"



    # ==========================
    # TEACHER CONNECTION
    # ==========================

    async def connect_teacher(
        self,
        websocket: WebSocket,
        teacher_id: str
    ):

        self.teachers[teacher_id] = websocket


        print(
            f"Teacher connected: {teacher_id}"
        )



    # ==========================
    # VIOLATION MANAGEMENT
    # ==========================

    async def add_violation(
        self,
        student_id: str,
        violation_type: str
    ):

        if student_id in self.students:


            violation = {

                "student_id": student_id,

                "name": self.students[student_id]["name"],

                "type": violation_type,

                "time": datetime.now().isoformat()

            }


            self.violations.append(
                violation
            )


            print(
                f"Violation: {student_id} - {violation_type}"
            )


            await self.broadcast_alert(
                violation
            )



    async def broadcast_alert(
        self,
        violation
    ):

        message = {

            "type": "alert",

            "data": violation

        }


        disconnected = []


        for teacher_id, websocket in self.teachers.items():

            try:

                await websocket.send_json(message)


            except Exception:

                disconnected.append(teacher_id)



        for teacher_id in disconnected:

            self.disconnect_teacher(teacher_id)



    # ==========================
    # STUDENT STATUS BROADCAST
    # ==========================

    async def broadcast_student_status(
        self,
        student_id: str,
        status: str
    ):

        message = {

            "type": "student_status",

            "data": {

                "student_id": student_id,

                "status": status

            }

        }


        disconnected = []


        for teacher_id, websocket in self.teachers.items():

            try:

                await websocket.send_json(message)


            except Exception:

                disconnected.append(teacher_id)



        for teacher_id in disconnected:

            self.disconnect_teacher(teacher_id)



    # ==========================
    # DISCONNECT HANDLING
    # ==========================

    async def disconnect_student(
        self,
        student_id: str
    ):

        if student_id in self.students:


            self.students[student_id]["status"] = "offline"


            await self.broadcast_student_status(
                student_id,
                "offline"
            )


            print(
                f"Student disconnected: {student_id}"
            )



    def disconnect_teacher(
        self,
        teacher_id: str
    ):

        if teacher_id in self.teachers:


            del self.teachers[teacher_id]


            print(
                f"Teacher disconnected: {teacher_id}"
            )



    # ==========================
    # GET STUDENT LIST
    # ==========================

    def get_students(self):

        return [

            {

                "student_id": student["student_id"],

                "name": student["name"],

                "pc": student["pc"],

                "status": student["status"],

                "active_window": student["active_window"],

                "last_seen": student["last_seen"].isoformat()

            }

            for student in self.students.values()

        ]



manager = ConnectionManager()