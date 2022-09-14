from django.urls import path
from .controllers.article import ArticleAPIView

urlpatterns = [
    # path('article/', article_list),
    path('article/',ArticleAPIView.as_view()),
]

