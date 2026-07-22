from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.connection_manager import manager
import json


router = APIRouter()


@router.websocket("/ws/teacher")
async def teacher_websocket(websocket: WebSocket):

    await websocket.accept()

    print("✅ Teacher WebSocket Accepted")


    teacher_id = None


    try:

        while True:


            data = await websocket.receive_text()

            message = json.loads(data)

            msg_type = message.get("type")



            # =========================
            # TEACHER REGISTER
            # =========================

            if msg_type == "register":


                teacher_id = message["teacherId"]


                await manager.connect_teacher(

                    websocket=websocket,

                    teacher_id=teacher_id

                )


                await websocket.send_json({

                    "type":"registered",

                    "message":"Teacher Connected"

                })



            # =========================
            # GET STUDENT LIST
            # =========================

            elif msg_type == "getStudents":


                await websocket.send_json({

                    "type":"studentList",

                    "students": manager.get_students()

                })



            # =========================
            # GET LIVE FRAMES
            # =========================

            elif msg_type == "getFrames":


                frames = []


                for student in manager.students.values():


                    frames.append({

                        "student_id":
                            student["student_id"],

                        "name":
                            student["name"],

                        "pc":
                            student["pc"],

                        "frame":
                            student["frame"]

                    })



                await websocket.send_json({

                    "type":"frames",

                    "data":frames

                })



            # =========================
            # GET VIOLATION HISTORY
            # =========================

            elif msg_type == "getViolations":


                await websocket.send_json({

                    "type":"violations",

                    "data":manager.violations

                })



            # =========================
            # GET CURRENT STATUS
            # =========================

            elif msg_type == "getStatus":


                await websocket.send_json({

                    "type":"status",

                    "students":
                        manager.get_students()

                })



    except WebSocketDisconnect:


        if teacher_id:

            manager.disconnect_teacher(

                teacher_id

            )