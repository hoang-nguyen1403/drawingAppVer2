from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework.parsers import JSONParser
from ..models.Article import Article
from ..serializers import ArticleSerializer
from rest_framework import status
import json


# Create your views here.
def article_list(request):
    if request.method == 'GET':
        # articles = Article.objects.all()
        # serializer = ArticleSerializer(articles, many=True)
        # return JsonResponse(serializer.data, safe = False)
        obj = json.load(open('UIp_FE.json'))
        return JsonResponse(obj, safe = False)
    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = ArticleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @csrf_exempt
# def articles(request, pk):
#     try:
#         article = Article.objects.get(pk=pk)
#     except Article.DoesNotExist:
#         return HttpResponse(status=404)
    
#     if request.method == 'GET':
#         serializer = ArticleSerializer(articles)
#         return JsonResponse(serializer.data)
    
#     elif request.method == 'PUT':

# todo/todo_api/views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework import permissions
# from ..models.Article import Article
# # from ..serializers import TodoSerializer

# class article_list(APIView):
#     # add permission to check if user is authenticated
#     permission_classes = [permissions.IsAuthenticated]

#     # 1. List all
#     def get(self, request, *args, **kwargs):
#         # '''
#         # List all the todo items for given requested user
#         # '''
#         # todos = Todo.objects.filter(user = request.user.id)
#         # serializer = TodoSerializer(todos, many=True)
#         return Response('dcm', status=status.HTTP_200_OK)

#     # 2. Create
#     def post(self, request, *args, **kwargs):
#         '''
#         Create the Todo with given todo data
#         '''
#         data = {
#             'task': request.data.get('task'), 
#             'completed': request.data.get('completed'), 
#             'user': request.user.id
#         }
#         # serializer = TodoSerializer(data=data)
#         # if serializer.is_valid():
#         #     serializer.save()
#         #     return Response(serializer.data, status=status.HTTP_201_CREATED)

#         return Response('dcm lan nua', status=status.HTTP_400_BAD_REQUEST)
        