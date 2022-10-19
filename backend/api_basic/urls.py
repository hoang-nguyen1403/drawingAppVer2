from django.urls import path
from .controllers.article import ArticleAPIView

urlpatterns = [
    # path('article/', article_list),
    path('detectArea/',ArticleAPIView.as_view()),
]

