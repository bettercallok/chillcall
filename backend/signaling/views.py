from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "UP",
        "service": "ChillCall Signaling Server",
        "version": "2.0.0"
    })
