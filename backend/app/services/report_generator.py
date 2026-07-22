from __future__ import annotations

import csv
import io
import textwrap
from typing import Any


def generate_csv(incidents: list[dict[str, Any]]) -> bytes:
    output = io.StringIO(newline="")
    fields = [
        "incident_id", "detected_at", "session_id", "student_id", "student_name",
        "pc", "incident_type", "severity", "description", "resolved",
        "evidence_available", "source",
    ]
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(incidents)
    return output.getvalue().encode("utf-8-sig")


def generate_pdf(incidents: list[dict[str, Any]]) -> bytes:
    lines = [
        "LiveLook Monitoring Incident Report",
        f"Total incidents: {len(incidents)}",
        "",
    ]
    for incident in incidents:
        summary = (
            f"{incident.get('detected_at', '')} | {incident.get('student_id', '')} | "
            f"{incident.get('incident_type', '')} | {incident.get('severity', '')} | "
            f"{'Resolved' if incident.get('resolved') else 'Open'}"
        )
        lines.extend(textwrap.wrap(summary, width=95) or [""])
        lines.extend(textwrap.wrap(str(incident.get("description", "")), width=95))
        lines.append("")
    lines.append("Privacy: continuous monitoring frames are not persisted; only incident evidence is retained.")
    return _simple_pdf(lines)


def _simple_pdf(lines: list[str]) -> bytes:
    escaped = []
    for line in lines[:55]:
        safe = line.encode("latin-1", "replace").decode("latin-1")
        safe = safe.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        escaped.append(safe)
    commands = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"]
    for index, line in enumerate(escaped):
        if index:
            commands.append("T*")
        commands.append(f"({line}) Tj")
    commands.append("ET")
    stream = "\n".join(commands).encode("latin-1")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{number} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()
    )
    return bytes(pdf)
