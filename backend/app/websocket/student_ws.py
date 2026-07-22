from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.connection_manager import manager
import json


router = APIRouter()


@router.websocket("/ws/student")
async def student_websocket(websocket: WebSocket):

    await websocket.accept()

    print("✅ Student WebSocket Accepted")

    student_id = None


    try:

        while True:

            data = await websocket.receive_text()

            message = json.loads(data)

            msg_type = message.get("type")


            # =========================
            # STUDENT REGISTER
            # =========================

            if msg_type == "register":

                student_id = message["studentId"]


                await manager.connect_student(
                    websocket=websocket,
                    student_id=student_id,
                    name=message["name"],
                    pc=message["pc"]
                )


                await websocket.send_json({

                    "type": "registered",

                    "message": "Registration Successful"

                })


            # =========================
            # HEARTBEAT
            # =========================

            elif msg_type == "heartbeat":

                manager.update_heartbeat(
                    student_id
                )


            # =========================
            # ACTIVE WINDOW TRACKING
            # =========================

            elif msg_type == "activity":

                manager.update_activity(

                    student_id=student_id,

                    active_window=message["window"]

                )


            # =========================
            # SCREEN FRAME
            # =========================

            elif msg_type == "frame":


                manager.update_frame(

                    student_id=student_id,

                    frame=message["frame"]

                )


                await manager.broadcast_frame(

                    student_id

                )


            # =========================
            # VIOLATION EVENT
            # =========================

            elif msg_type == "violation":


                await manager.add_violation(

                    student_id=student_id,

                    violation_type=message["event"]

                )


    except WebSocketDisconnect:


        if student_id:

            await manager.disconnect_student(student_id)