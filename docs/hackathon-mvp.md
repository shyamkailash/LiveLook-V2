# LiveLook hackathon MVP

## Storage mode

This checkout has no Firebase Admin credentials, so the backend clearly reports
`storage_backend: local_json_development_fallback` on incidents. Metadata is
stored under ignored `backend/data/incidents.json`; at most one JPEG is stored
under ignored `backend/data/evidence/` for each incident. Continuous monitoring
frames remain memory-only.

The existing Firebase frontend authentication is unchanged. Backend token
verification and Firestore/Storage persistence remain production work and are
not represented as complete in this fallback mode.

## Demo incident

The Student Agent evaluates the existing `mock_policy.json`. A configured
blocked process or blocked window produces one `unauthorized_application`
incident per continuous occurrence. The event includes one current JPEG when
capture is available and never logs the image payload.

## API

- `GET /api/incidents`
- `POST /api/incidents`
- `PATCH /api/incidents/{incident_id}`
- `POST /api/reports/generate` with `{ "format": "pdf" }` or `csv`

For LAN frontend development, set `CORS_ORIGINS` to the Vite origin, for example
`http://192.168.77.208:5173`. Generated report bytes are returned directly and
are not retained on disk.
