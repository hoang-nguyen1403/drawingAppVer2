# from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
# from ..models.Article import Article
# from ..serializers import ArticleSerializer
# from django.views.decorators.csrf import csrf_exempt
# from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework import status
import json
import re
import base64


# Create your views here.
# @csrf_exempt
# @api_view(['GET', 'POST'])
# def article_list(request):
#     if request.method == 'GET':
#         # articles = Article.objects.all()
#         # serializer = ArticleSerializer(articles, many=True)
#         # return JsonResponse(serializer.data, safe = False)
#         obj = json.load(open('UIp_FE.json'))
#         return JsonResponse(obj, safe = False)

#     elif request.method == 'POST':
#         data = JSONParser().parse(request)
#         with open("data.json", "w") as inputFile:
#             inputFile.write(str(data))
#         return JsonResponse(data, status=status.HTTP_201_CREATED)

class ArticleAPIView(APIView):
    
    def get(self, request):
        obj = json.load(open('UIp_FE.json'))
        return JsonResponse(obj, safe = False)
    
    def post(self, request):

        data = JSONParser().parse(request)
        with open("data.json", "w") as inputFile:
            inputFile.write(str(data))
        # return JsonResponse(data, status=status.HTTP_201_CREATED)
        obj = json.load(open('UIp_FE.json'))
        return JsonResponse(obj, safe = False)

        # dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
        # ImageData = request.POST.get('hidden_image_field')
        # ImageData = dataUrlPattern.match(ImageData).group(2)

        # # If none or len 0, means illegal image data
        # if ImageData == None or len(ImageData) == 0:
        #     # PRINT ERROR MESSAGE HERE
        #     pass

        # # Decode the 64 bit string into 32 bit
        # ImageData = base64.b64decode(ImageData)
