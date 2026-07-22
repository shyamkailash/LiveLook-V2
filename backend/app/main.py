from fastapi import FastAPI
from app.websocket.student_ws import router as student_router
from app.websocket.teacher_ws import router as teacher_router
from fastapi.responses import HTMLResponse

app = FastAPI(
    title="LiveLook Backend",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "LiveLook Backend Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
@app.get("/test")
def websocket_test():
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <body>
        <button onclick="connectStudent()">Connect Student</button>
        <button onclick="connectTeacher()">Connect Teacher</button>

        <script>
            function connectStudent() {
                const ws = new WebSocket("ws://localhost:8000/ws/student");

                ws.onopen = () => {
                    console.log("Student Connected");

                    ws.send(JSON.stringify({
                        type: "register",
                        studentId: "22CS101",
                        name: "Rahul",
                        pc: "PC-07"
                    }));
                };

                ws.onmessage = (event) => {
                    console.log(event.data);
                };
            }

            function connectTeacher() {
                const ws = new WebSocket("ws://localhost:8000/ws/teacher");

                ws.onopen = () => {
                    console.log("Teacher Connected");

                    ws.send(JSON.stringify({
                        type: "register",
                        teacherId: "faculty01"
                    }));

                    setTimeout(() => {
                        ws.send(JSON.stringify({
                            type: "getStudents"
                        }));
                    }, 1000);
                };

                ws.onmessage = (event) => {
                    console.log(event.data);
                };
            }
        </script>
    </body>
    </html>
    """)

app.include_router(student_router)
app.include_router(teacher_router)
