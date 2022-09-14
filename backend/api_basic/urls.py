from django.urls import path
from .controllers.article import ArticleAPIView
from .controllers.car import car_controller

urlpatterns = [
    # path('article/', article_list),
    path('article/',ArticleAPIView.as_view()),
    path('cars/',car_controller),
]

