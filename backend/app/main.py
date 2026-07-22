import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.websocket.student_ws import router as student_router
from app.websocket.teacher_ws import router as teacher_router
from app.routes.incidents import router as incidents_router
from app.routes.reports import router as reports_router


app = FastAPI(
    title="LiveLook Backend",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/")
def root():
    return {"message": "LiveLook Backend Running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/test", response_class=HTMLResponse)
def websocket_test():
    return HTMLResponse("""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LiveLook Teacher Monitor</title>
    <style>
        :root { color-scheme: dark; font-family: Inter, Arial, sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #0f172a; color: #f8fafc; }
        main { width: min(1600px, 100%); margin: auto; padding: 24px; }
        header, .connection { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        header { justify-content: space-between; margin-bottom: 22px; }
        h1 { margin: 0; font-size: clamp(1.5rem, 3vw, 2.25rem); }
        button { border: 0; border-radius: 8px; padding: 10px 14px; background: #22c55e;
            color: #052e16; font-weight: 700; cursor: pointer; }
        button:disabled { background: #64748b; color: #e2e8f0; cursor: not-allowed; }
        #connectionStatus { padding: 9px 13px; border-radius: 999px; background: #334155; }
        #studentGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(360px, 100%), 1fr)); gap: 18px; }
        .empty { grid-column: 1 / -1; padding: 80px 20px; border: 1px dashed #475569;
            border-radius: 14px; color: #94a3b8; text-align: center; }
        .student-card { min-width: 0; overflow: hidden; border: 1px solid #334155;
            border-radius: 14px; background: #1e293b; box-shadow: 0 8px 24px #02061755; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 14px; }
        .student-name { margin: 0 0 5px; font-size: 1.05rem; overflow-wrap: anywhere; }
        .student-meta { color: #cbd5e1; font-size: .88rem; overflow-wrap: anywhere; }
        .status { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-size: .85rem; }
        .status::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: #ef4444; }
        .status.online::before { background: #22c55e; box-shadow: 0 0 8px #22c55e; }
        .fullscreen { flex: none; padding: 8px 10px; background: #475569; color: #f8fafc; }
        .screen { aspect-ratio: 16 / 9; display: grid; place-items: center; overflow: hidden; background: #020617; }
        .screen img { display: none; width: 100%; height: 100%; object-fit: contain; }
        .placeholder { padding: 20px; color: #64748b; text-align: center; }
        .updated { padding: 10px 14px; color: #94a3b8; font-size: .8rem; }
        .student-card:fullscreen { display: flex; flex-direction: column; width: 100vw; height: 100vh; border: 0; border-radius: 0; }
        .student-card:fullscreen .screen { flex: 1; aspect-ratio: auto; }
        @media (max-width: 520px) { main { padding: 15px; } #studentGrid { gap: 12px; } }
    </style>
</head>
<body>
<main>
    <header>
        <div><h1>LiveLook Teacher Monitor</h1><div id="summary">No students discovered</div></div>
        <div class="connection">
            <button id="connectButton" type="button">Connect teacher</button>
            <span id="connectionStatus" role="status">Disconnected</span>
        </div>
    </header>
    <section id="studentGrid" aria-live="polite">
        <div class="empty" id="emptyState">Connect to discover student screens.</div>
    </section>
</main>
<script>
    const OFFLINE_AFTER_MS = 15000;
    const LIST_POLL_MS = 5000;
    const students = new Map();
    let teacherSocket = null;
    let reconnectTimer = null;
    let pollTimer = null;
    let reconnectAttempts = 0;
    let reconnectEnabled = true;

    const grid = document.getElementById("studentGrid");
    const summary = document.getElementById("summary");
    const connectionStatus = document.getElementById("connectionStatus");
    const connectButton = document.getElementById("connectButton");
    const pick = (object, camel, snake, fallback = "") =>
        object?.[camel] ?? object?.[snake] ?? fallback;

    function setConnection(text) { connectionStatus.textContent = text; }
    function send(message) {
        if (teacherSocket?.readyState === WebSocket.OPEN) {
            teacherSocket.send(JSON.stringify(message));
        }
    }

    function createCard(studentId) {
        document.getElementById("emptyState")?.remove();
        const card = document.createElement("article");
        card.className = "student-card";

        const header = document.createElement("div");
        header.className = "card-header";
        const details = document.createElement("div");
        const name = document.createElement("h2");
        name.className = "student-name";
        const meta = document.createElement("div");
        meta.className = "student-meta";
        const status = document.createElement("div");
        status.className = "status";
        details.append(name, meta, status);
        const fullscreen = document.createElement("button");
        fullscreen.className = "fullscreen";
        fullscreen.type = "button";
        fullscreen.textContent = "Fullscreen";
        fullscreen.addEventListener("click", () => {
            if (document.fullscreenElement === card) document.exitFullscreen();
            else card.requestFullscreen().catch(() => {});
        });
        header.append(details, fullscreen);

        const screen = document.createElement("div");
        screen.className = "screen";
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = "Waiting for the first frame";
        const image = document.createElement("img");
        image.alt = "Live student screen";
        screen.append(placeholder, image);
        const updated = document.createElement("div");
        updated.className = "updated";
        card.append(header, screen, updated);
        grid.append(card);

        const record = { studentId, name, pc: "Unknown PC", lastSeen: 0,
            serverStatus: "online", card, nameNode: name, meta, status, image, placeholder, updated };
        students.set(studentId, record);
        return record;
    }

    function updateStudent(data, hasFrame = false) {
        const rawId = pick(data, "studentId", "student_id", null);
        if (rawId === null || rawId === undefined || String(rawId).trim() === "") return;
        const studentId = String(rawId);
        const student = students.get(studentId) || createCard(studentId);
        const suppliedName = pick(data, "studentName", "student_name", data.name);
        const suppliedPc = pick(data, "pcName", "pc_name", data.pc);
        if (suppliedName !== undefined && suppliedName !== null && String(suppliedName)) student.name = String(suppliedName);
        if (suppliedPc !== undefined && suppliedPc !== null && String(suppliedPc)) student.pc = String(suppliedPc);
        student.serverStatus = String(data.status ?? "online").toLowerCase();
        student.lastSeen = Date.now();

        const frame = data.frame ?? data.image ?? data.imageData ?? data.image_data ??
            (hasFrame ? data.data : null);
        if (typeof frame === "string" && frame.length) {
            student.image.src = frame.startsWith("data:image/") ? frame : `data:image/jpeg;base64,${frame}`;
            student.image.style.display = "block";
            student.placeholder.style.display = "none";
        }
        renderStudent(student);
    }

    function renderStudent(student) {
        const online = student.serverStatus !== "offline" && Date.now() - student.lastSeen <= OFFLINE_AFTER_MS;
        student.nameNode.textContent = student.name || "Unknown student";
        student.meta.textContent = `ID: ${student.studentId} · PC: ${student.pc}`;
        student.status.textContent = online ? "Online" : "Offline";
        student.status.classList.toggle("online", online);
        student.updated.textContent = student.lastSeen
            ? `Last updated: ${new Date(student.lastSeen).toLocaleTimeString()}`
            : "Last updated: never";
    }

    function renderSummary() {
        let online = 0;
        students.forEach((student) => {
            renderStudent(student);
            if (student.serverStatus !== "offline" && Date.now() - student.lastSeen <= OFFLINE_AFTER_MS) online++;
        });
        summary.textContent = students.size
            ? `${students.size} student${students.size === 1 ? "" : "s"} · ${online} online`
            : "No students discovered";
    }

    function handleTeacherMessage(message) {
        const type = message.type ?? message.messageType ?? message.message_type ?? "";
        if (type === "studentList" || type === "student_list" || type === "students") {
            const list = message.students ?? message.data ?? [];
            if (Array.isArray(list)) list.forEach((student) => updateStudent(student));
        } else if (type === "frames") {
            const frames = message.frames ?? message.data ?? [];
            if (Array.isArray(frames)) frames.forEach((frame) => updateStudent(frame, true));
        } else if (type === "frame") {
            updateStudent(message, true);
        }
        renderSummary();
    }

    function scheduleReconnect() {
        if (!reconnectEnabled || reconnectTimer) return;
        const delay = Math.min(30000, 1000 * (2 ** reconnectAttempts++));
        setConnection(`Disconnected · reconnecting in ${Math.ceil(delay / 1000)}s`);
        reconnectTimer = window.setTimeout(() => { reconnectTimer = null; connectTeacher(); }, delay);
    }

    function connectTeacher() {
        if (teacherSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(teacherSocket.readyState)) return;
        reconnectEnabled = true;
        connectButton.disabled = true;
        setConnection("Connecting…");
        const protocol = location.protocol === "https:" ? "wss:" : "ws:";
        teacherSocket = new WebSocket(`${protocol}//${location.host}/ws/teacher`);
        teacherSocket.addEventListener("open", () => {
            reconnectAttempts = 0;
            setConnection("Connected");
            send({type: "register", teacherId: "faculty01"});
            send({type: "getStudents"});
            send({type: "getFrames"});
            window.clearInterval(pollTimer);
            pollTimer = window.setInterval(() => send({type: "getStudents"}), LIST_POLL_MS);
        });
        teacherSocket.addEventListener("message", (event) => {
            try { handleTeacherMessage(JSON.parse(event.data)); }
            catch (error) { console.error("Invalid teacher WebSocket message", error); }
        });
        teacherSocket.addEventListener("error", () => setConnection("Connection error"));
        teacherSocket.addEventListener("close", () => {
            teacherSocket = null;
            window.clearInterval(pollTimer);
            pollTimer = null;
            connectButton.disabled = false;
            scheduleReconnect();
        });
    }

    connectButton.addEventListener("click", connectTeacher);
    window.setInterval(renderSummary, 1000);
    connectTeacher();
</script>
</body>
</html>
    """)


app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(incidents_router)
app.include_router(reports_router)
