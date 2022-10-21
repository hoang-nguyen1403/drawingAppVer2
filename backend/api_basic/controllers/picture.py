from urllib import response
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
# from ..models.Article import Article
# from ..serializers import ArticleSerializer
# from django.views.decorators.csrf import csrf_exempt
# from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
import json
import numpy as np
import cv2
from ..forms import UploadFrom
from ..models.Article import Article
from django.core.files.uploadedfile import SimpleUploadedFile
from django.http import HttpResponse
from rest_framework.response import Response


class PictureAPIView(APIView):

    # def index(self, request):
    #     form = UploadFrom()
    #     return render(request, 'article/index.html', {'form': form})

    def get(self, request):
         if request.method == 'GET':
            picture = Article.objects.all()
            obj = json.load(open('UIp_FE.json'))
            return JsonResponse(obj, safe=False)

    def post(self, request):
         if request.method == 'POST':
            img = request.data
            # with open('data.txt', 'w') as f:
            #    f.write(str(img))
            # form= UploadFrom(request.POST.get('pic1'))
            # if form.is_valid():
            #    form.save()
            # name = request.POST.get("name")
            # url = request.POST.get("imgURL")
            # caption = request.POST.get("caption")
            # if form.is_valid():
            #    form.save()
            #    return HttpResponse('success')
            # else:
            #    form = UploadFrom()
            #    return HttpResponse('no')
         return HttpResponse('success')
            

            

    
    
        
