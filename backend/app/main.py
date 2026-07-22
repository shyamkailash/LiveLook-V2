from fastapi import FastAPI
from app.websocket.student_ws import router as student_router
from app.websocket.teacher_ws import router as teacher_router
from fastapi.responses import HTMLResponse
from app.routes.auth import router as auth_router
from app.routes.students import router as student_api_router
from app.routes.teachers import router as teacher_api_router
from app.routes.exam import router as exam_router
from app.routes.monitoring import router as monitoring_router

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


        <h2>LiveLook WebSocket Test</h2>


        <button onclick="connectStudent()">
            Connect Student
        </button>


        <button onclick="connectTeacher()">
            Connect Teacher
        </button>


        <button onclick="sendFrame()">
            Send Test Frame
        </button>


        <button onclick="sendViolation()">
            Send Violation
        </button>



        <script>


            let studentSocket = null;

            let teacherSocket = null;



            function connectStudent() {


                studentSocket = new WebSocket(
                    "ws://localhost:8000/ws/student"
                );



                studentSocket.onopen = () => {


                    console.log(
                        "Student Connected"
                    );



                    studentSocket.send(JSON.stringify({

                        type: "register",

                        studentId: "22CS101",

                        name: "Rahul",

                        pc: "PC-07"

                    }));


                };



                studentSocket.onmessage = (event) => {


                    console.log(
                        "Student:",
                        event.data
                    );


                };


            }





            function connectTeacher() {


                teacherSocket = new WebSocket(
                    "ws://localhost:8000/ws/teacher"
                );



                teacherSocket.onopen = () => {


                    console.log(
                        "Teacher Connected"
                    );



                    teacherSocket.send(JSON.stringify({

                        type:"register",

                        teacherId:"faculty01"

                    }));



                    setTimeout(() => {


                        teacherSocket.send(JSON.stringify({

                            type:"getStudents"

                        }));


                    },1000);



                };



                teacherSocket.onmessage = (event)=>{


                    console.log(

                        "Teacher:",

                        event.data

                    );


                };


            }





            function sendFrame(){


                if(studentSocket){


                    studentSocket.send(JSON.stringify({

                        type:"frame",

                        frame:"TEST_FRAME_IMAGE_DATA"


                    }));


                }


            }




            function sendViolation(){


                if(studentSocket){


                    studentSocket.send(JSON.stringify({

                        type:"violation",

                        event:"phone_detected"


                    }));


                }


            }



        </script>


    </body>

    </html>

    """)



app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(auth_router)
app.include_router(student_api_router)
app.include_router(teacher_api_router)
app.include_router(exam_router)
app.include_router(monitoring_router)