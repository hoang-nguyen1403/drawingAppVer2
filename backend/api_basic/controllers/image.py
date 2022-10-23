from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.http.response import JsonResponse


@csrf_exempt
def saveFile(request):
    file = request.FILES['file']
    file_name = default_storage.save(file.name,file)
    return JsonResponse(file_name,safe=False)