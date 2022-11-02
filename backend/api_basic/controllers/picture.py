from django.http import JsonResponse
from rest_framework.views import APIView
from django.core.files.storage import default_storage
import json

from ..algorithms.dectectPictureFunction import detectPicture


class PictureAPIView(APIView):

    def get(self, request):
            obj = json.load(open('UIp_FE.json'))
            return JsonResponse(obj, safe=False)

    def post(self, request):
            file = request.FILES['file']
        #     if default_storage.exists(str(file.name)):
        #        default_storage.delete(str(file.name))
            file_name = default_storage.save(file.name,file)
            result = detectPicture(file_name)
            default_storage.delete(file_name)
            return JsonResponse(result,safe=False)
            

            

    
    
        
