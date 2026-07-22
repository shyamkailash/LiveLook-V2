import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeFrameDataUrl,
  parseTeacherEvent,
  reduceStudents,
  studentKey,
} from "../src/services/monitoring-events.ts";


test("maps student joined with snake-case identity", () => {
  const event = parseTeacherEvent({
    type: "student_joined",
    student: {
      student_id: "S-1",
      session_id: "EXAM-1",
      name: "Student One",
      pc: "PC-1",
      status: "online",
    },
  });
  assert.equal(event.type, "upsert");
  if (event.type === "upsert") {
    assert.equal(event.student.studentId, "S-1");
    assert.equal(event.student.sessionId, "EXAM-1");
  }
});

test("maps frame to a normalized JPEG data URL", () => {
  const event = parseTeacherEvent({
    type: "frame",
    student_id: "S-1",
    session_id: "EXAM-1",
    timestamp: "2026-07-23T10:00:00+00:00",
    frame: "QUJDRA==",
  });
  assert.equal(event.type, "frame");
  if (event.type === "frame") {
    assert.equal(event.frame, "data:image/jpeg;base64,QUJDRA==");
  }
});

test("marks a disconnected student offline without removing it", () => {
  const joined = parseTeacherEvent({
    type: "student_joined",
    student: { student_id: "S-1", session_id: "EXAM-1", name: "One" },
  });
  const populated = reduceStudents({}, joined);
  const disconnected = parseTeacherEvent({
    type: "student_disconnected",
    student_id: "S-1",
    session_id: "EXAM-1",
    timestamp: "2026-07-23T10:01:00+00:00",
  });
  const result = reduceStudents(populated, disconnected);
  assert.equal(Object.keys(result).length, 1);
  assert.equal(result[studentKey("S-1", "EXAM-1")].status, "offline");
});

test("repeated student events update one card", () => {
  const first = parseTeacherEvent({
    type: "student_joined",
    student: { student_id: "S-1", session_id: "EXAM-1", name: "One" },
  });
  const second = parseTeacherEvent({
    type: "student_updated",
    student: { studentId: "S-1", sessionId: "EXAM-1", name: "Updated" },
  });
  const result = reduceStudents(reduceStudents({}, first), second);
  assert.equal(Object.keys(result).length, 1);
  assert.equal(result[studentKey("S-1", "EXAM-1")].name, "Updated");
});

test("frames remain isolated by student and session", () => {
  const firstFrame = parseTeacherEvent({
    type: "frame", student_id: "S-1", session_id: "EXAM-1", frame: "QUFBQQ==",
  });
  const secondFrame = parseTeacherEvent({
    type: "frame", student_id: "S-2", session_id: "EXAM-1", frame: "QkJCQg==",
  });
  const otherSession = parseTeacherEvent({
    type: "frame", student_id: "S-1", session_id: "EXAM-2", frame: "Q0NDQw==",
  });
  const result = [firstFrame, secondFrame, otherSession].reduce(reduceStudents, {});
  assert.equal(Object.keys(result).length, 3);
  assert.match(result[studentKey("S-1", "EXAM-1")].frame ?? "", /QUFBQQ==$/);
  assert.match(result[studentKey("S-2", "EXAM-1")].frame ?? "", /QkJCQg==$/);
  assert.match(result[studentKey("S-1", "EXAM-2")].frame ?? "", /Q0NDQw==$/);
});

test("malformed and unsupported messages are ignored", () => {
  assert.deepEqual(parseTeacherEvent("{bad json"), { type: "noop" });
  assert.deepEqual(parseTeacherEvent({ type: "pong" }), { type: "noop" });
  assert.deepEqual(parseTeacherEvent({ type: "error", message: "bad" }), { type: "noop" });
});

test("data URL normalization avoids double prefixes and unsafe MIME types", () => {
  const jpeg = "data:image/jpeg;base64,QUJDRA==";
  assert.equal(normalizeFrameDataUrl(jpeg), jpeg);
  assert.equal(normalizeFrameDataUrl("QUJDRA=="), jpeg);
  assert.equal(normalizeFrameDataUrl("data:text/html;base64,PHNjcmlwdD4="), null);
});

test("initial frames batch applies only the latest frame per student", () => {
  const event = parseTeacherEvent({
    type: "frames",
    data: [
      { student_id: "S-1", session_id: "EXAM", frame: "QUFBQQ==" },
      { student_id: "S-1", session_id: "EXAM", frame: "QkJCQg==" },
    ],
  });
  const result = reduceStudents({}, event);
  assert.equal(Object.keys(result).length, 1);
  assert.match(result[studentKey("S-1", "EXAM")].frame ?? "", /QkJCQg==$/);
});
