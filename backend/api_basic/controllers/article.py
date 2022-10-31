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

from ..algorithms.detectAreaFunction import detectArea


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
        data = detectArea(data)
        return JsonResponse(data, safe = False)