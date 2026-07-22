# LiveLook WebSocket contract

All timestamps emitted by the backend are ISO-8601 UTC values. Continuous JPEG
frames are held only in backend memory and are never written to Firestore.

## Student Agent to backend (`/ws/student`)

- `register`: `studentId`, `name`, `pc`, and optional `sessionId`. Snake-case
  aliases (`student_id`, `student_name`, `pc_name`, `session_id`) are accepted.
- `heartbeat`: no additional fields. Refreshes `last_seen`.
- `frame`: `frame` contains a Base64 JPEG without a data-URL prefix. Receiving a
  frame refreshes both `last_seen` and `last_frame_at`.
- `activity`: `activeWindow` (or `active_window`) updates the current window.
- `ping`: receives `{ "type": "pong" }`.

The backend responds to registration with `registered`, and returns an `error`
message for malformed or unsupported input without closing the connection.

## Teacher dashboard to backend (`/ws/teacher`)

- `register`: `teacherId` (or `teacher_id`).
- `getStudents` / `get_students`: receives `studentList`.
- `getFrames` / `get_frames`: receives the latest memory-only frames batch.
- `ping`: receives `{ "type": "pong" }`.

The React dashboard uses the authenticated Firebase user's UID as `teacherId`.
When Firebase is not configured during local development, it uses the stable
`development-teacher` fallback. This fallback is not an authentication mechanism.

The teacher endpoint is configured with `VITE_WS_TEACHER_URL` and defaults to
`ws://localhost:8000/ws/teacher`. A LAN deployment should override it in the
ignored `frontend/.env`; HTTPS deployments must use a `wss://` value.

## Backend to teachers

- `student_joined`: a `student` object containing `student_id`, `name`, `pc`,
  `session_id`, `status`, `last_seen`, `last_frame_at`, and `active_window`.
- `studentList`: `students` contains the same student objects.
- `frame`: `student_id`, `session_id`, `name`, `pc`, `status`, `timestamp`, and
  the Base64 JPEG `frame`.
- `frames`: `data` contains the latest frame object for each student.
- `student_disconnected`: `student_id`, `session_id`, and `timestamp`.
- `incident` carries a validated `unauthorized_application` incident object.
  Student Agents may attach one Base64 JPEG as `evidence_frame`; continuous
  frames are never persisted. The Student Agent receives `incident_ack` after
  successful persistence, and teachers receive `{ "type": "incident",
  "incident": { ... } }`.

Students are considered offline after 15 seconds without a heartbeat or frame.
Explicit disconnects are broadcast immediately. Existing camel-case request
names and the legacy `studentList`/`frames` responses remain supported.
