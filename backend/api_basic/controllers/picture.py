from urllib import response
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
import json
from django.http import HttpResponse
from django.core.files.storage import default_storage
class PictureAPIView(APIView):

    def get(self, request):
         if request.method == 'GET':
            obj = json.load(open('UIp_FE.json'))
            return JsonResponse(obj, safe=False)

    def post(self, request):
         if request.method == 'POST':
            file = request.FILES['file']
            file_name = default_storage.save(file.name,file)
            return JsonResponse(file_name,safe=False)
            

            

    
    
        
