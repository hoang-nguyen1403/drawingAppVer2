from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
from ..models.Article import Article
from ..serializers import ArticleSerializer


# Create your views here.
def car_controller(request):
    if request.method == 'GET':
        get()
    elif request.method == 'POST':
        post()
        
def get(request):
    data = JSONParser().parse(request)
    serializer = ArticleSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)

def post(request):
    data = JSONParser().parse(request)
    serializer = ArticleSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)