import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio

logger = logging.getLogger(__name__)

rooms = {}

class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = str(uuid.uuid4())
        self.room_id = None
        self.user_id = None
        await self.accept()
        logger.info(f"New WebSocket connection: {self.session_id}")

    async def disconnect(self, close_code):
        logger.info(f"Connection closed: {self.session_id}")
        await self.cleanup_session()

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            msg_type = data.get("type")

            if not msg_type:
                return

            if msg_type == "create_room":
                await self.handle_create_room(data)
            elif msg_type == "join_room":
                await self.handle_join_room(data)
            elif msg_type in ["offer", "answer", "ice_candidate"]:
                await self.relay_signaling(data)
            elif msg_type == "leave_room":
                await self.cleanup_session()
        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def handle_create_room(self, data):
        room_id = str(uuid.uuid4())
        user_id = data.get("userId", f"User-{self.session_id[:8]}")

        self.room_id = room_id
        self.user_id = user_id

        rooms[room_id] = {
            "created_at": datetime.now(timezone.utc),
            "participants": {self.session_id: self.channel_name},
            "users": {self.session_id: user_id}
        }

        await self.channel_layer.group_add(room_id, self.channel_name)

        await self.send(text_data=json.dumps({
            "type": "room_created",
            "roomId": room_id,
            "userId": user_id
        }))

    async def handle_join_room(self, data):
        room_id = data.get("roomId")
        user_id = data.get("userId", f"User-{self.session_id[:8]}")

        if room_id not in rooms:
            await self.send_error("Room not found")
            return

        room = rooms[room_id]
        if len(room["participants"]) >= 4:
            await self.send_error("Room is full")
            return

        self.room_id = room_id
        self.user_id = user_id

        room["participants"][self.session_id] = self.channel_name
        room["users"][self.session_id] = user_id

        await self.channel_layer.group_add(room_id, self.channel_name)

        existing_participants = [
            {"sessionId": sid, "userId": uid}
            for sid, uid in room["users"].items()
            if sid != self.session_id
        ]

        await self.channel_layer.group_send(
            room_id,
            {
                "type": "broadcast_message",
                "message": {
                    "type": "participant_joined",
                    "sessionId": self.session_id,
                    "userId": user_id
                },
                "exclude": self.session_id
            }
        )

        await self.send(text_data=json.dumps({
            "type": "room_joined",
            "roomId": room_id,
            "userId": user_id,
            "participants": existing_participants
        }))

    async def relay_signaling(self, data):
        if not self.room_id or self.room_id not in rooms:
            return

        target_session_id = data.get("target")
        room = rooms[self.room_id]

        target_channel = room["participants"].get(target_session_id)
        if target_channel:
            relay_message = data.copy()
            relay_message["from"] = self.session_id

            await self.channel_layer.send(
                target_channel,
                {
                    "type": "direct_message",
                    "message": relay_message
                }
            )

    async def cleanup_session(self):
        if self.room_id and self.room_id in rooms:
            room = rooms[self.room_id]

            if self.session_id in room["participants"]:
                del room["participants"][self.session_id]
            if self.session_id in room["users"]:
                del room["users"][self.session_id]

            await self.channel_layer.group_discard(self.room_id, self.channel_name)

            await self.channel_layer.group_send(
                self.room_id,
                {
                    "type": "broadcast_message",
                    "message": {
                        "type": "participant_left",
                        "sessionId": self.session_id,
                        "userId": self.user_id
                    },
                    "exclude": self.session_id
                }
            )

            if len(room["participants"]) == 0:
                del rooms[self.room_id]

        self.room_id = None
        self.user_id = None

    async def broadcast_message(self, event):
        message = event["message"]
        exclude = event.get("exclude")

        if exclude != self.session_id:
            await self.send(text_data=json.dumps(message))

    async def direct_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))

    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            "type": "error",
            "message": message
        }))

async def cleanup_stale_rooms():
    while True:
        try:
            await asyncio.sleep(300)
            cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
            removed = 0

            stale_rooms = []
            # Use list() to avoid RuntimeError if dictionary size changes during iteration
            for room_id, room in list(rooms.items()):
                if room["created_at"] < cutoff and len(room["participants"]) == 0:
                    stale_rooms.append(room_id)

            for room_id in stale_rooms:
                del rooms[room_id]
                removed += 1

        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")
