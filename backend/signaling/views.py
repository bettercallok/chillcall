from django.http import JsonResponse

import time
start_time = time.time()
def health_check(request):
    uptime_seconds = int(time.time() - start_time)
    return JsonResponse({
        "status": "UP",
        "service": "ChillCall Signaling Server",
        "version": "1.0.0",
        "uptime_seconds": uptime_seconds
    })
