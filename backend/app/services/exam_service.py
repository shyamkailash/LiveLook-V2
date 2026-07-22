from datetime import datetime
from uuid import uuid4

class ExamService:

    def __init__(self):

        self.exams = {}

    # ==========================
    # Create Exam
    # ==========================

    def create_exam(
    self,
    title: str,
    subject: str,
    teacher: str,
    duration: int,
    allowed_apps: list[str]
    ):

        exam_id = str(uuid4())[:8].upper()

        exam = {

            "exam_id": exam_id,
            "title": title,
            "subject": subject,
            "teacher": teacher,
            "duration": duration,
            "allowed_apps": allowed_apps,
            "status": "scheduled",
            "students": [],
            "created_at": datetime.now(),
            "started_at": None,
            "ended_at": None

        }

        self.exams[exam_id] = exam

        return exam

    # ==========================
    # Get All Exams
    # ==========================

    def get_all_exams(self):

        return list(self.exams.values())

    # ==========================
    # Get One Exam
    # ==========================

    def get_exam(self, exam_id: str):

        return self.exams.get(exam_id)

    # ==========================
    # Start Exam
    # ==========================

    def start_exam(self, exam_id: str):

        exam = self.get_exam(exam_id)

        if not exam:
            return None

        exam["status"] = "running"
        exam["started_at"] = datetime.now()

        return exam

    # ==========================
    # End Exam
    # ==========================

    def end_exam(self, exam_id: str):

        exam = self.get_exam(exam_id)

        if not exam:
            return None

        exam["status"] = "completed"
        exam["ended_at"] = datetime.now()

        return exam

    # ==========================
    # Join Exam
    # ==========================

    def join_exam(
        self,
        exam_id: str,
        student_id: str
    ):

        exam = self.get_exam(exam_id)

        if not exam:
            return None

        if student_id not in exam["students"]:

            exam["students"].append(student_id)

        return exam

    # ==========================
    # Leave Exam
    # ==========================

    def leave_exam(
        self,
        exam_id: str,
        student_id: str
    ):

        exam = self.get_exam(exam_id)

        if not exam:
            return None

        if student_id in exam["students"]:

            exam["students"].remove(student_id)

        return exam


exam_service = ExamService()