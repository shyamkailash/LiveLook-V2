import base64
import tempfile
from pathlib import Path
from unittest import TestCase

from app.schemas.incident import IncidentCreate
from app.services.incident_store import IncidentStore
from app.services.report_generator import generate_csv, generate_pdf


class TestIncidentMvp(TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.store = IncidentStore(Path(self.temporary.name))

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def payload(self, evidence_frame=None) -> IncidentCreate:
        return IncidentCreate(
            student_id="S-1",
            session_id="EXAM",
            student_name="Student One",
            pc="PC-1",
            incident_type="unauthorized_application",
            severity="high",
            description="Blocked application detected: discord.exe",
            evidence_frame=evidence_frame,
        )

    def test_incident_persists_with_one_jpeg(self) -> None:
        jpeg = base64.b64encode(b"\xff\xd8\xff\xd9").decode("ascii")
        incident = self.store.create(self.payload(jpeg))

        self.assertTrue(incident["evidence_available"])
        self.assertEqual(len(self.store.list()), 1)
        self.assertEqual(len(list((Path(self.temporary.name) / "evidence").glob("*.jpg"))), 1)
        self.assertNotIn("evidence_path", incident)

    def test_invalid_evidence_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "JPEG"):
            self.store.create(self.payload(base64.b64encode(b"not jpeg").decode()))

    def test_resolve_and_reports_use_persisted_incident(self) -> None:
        created = self.store.create(self.payload())
        updated = self.store.update(created["incident_id"], True)
        incidents = self.store.list()

        self.assertTrue(updated["resolved"])
        csv_report = generate_csv(incidents)
        pdf_report = generate_pdf(incidents)
        self.assertIn(b"unauthorized_application", csv_report)
        self.assertTrue(pdf_report.startswith(b"%PDF-1.4"))
        self.assertIn(b"LiveLook Monitoring Incident Report", pdf_report)
