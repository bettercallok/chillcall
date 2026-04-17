from django.apps import AppConfig
import threading
import asyncio
from signaling.consumers import cleanup_stale_rooms

class SignalingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'signaling'

    def ready(self):
        # Create a new thread to run the asyncio event loop for the background task
        def run_background_task():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(cleanup_stale_rooms())

        thread = threading.Thread(target=run_background_task, daemon=True)
        thread.start()
