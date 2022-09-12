from django.urls import path
from .controllers.article import article_list
from .controllers.car import car_controller

urlpatterns = [
    path('article/', article_list),
    path('cars/',car_controller),
]

