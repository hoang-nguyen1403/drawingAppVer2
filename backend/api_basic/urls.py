from django.urls import path
from .controllers.article import ArticleAPIView
from .controllers.picture import PictureAPIView

urlpatterns = [
    # path('article/', article_list),
    path('detectArea/', ArticleAPIView.as_view()),
    path('picture/', PictureAPIView.as_view()),
    # path('', PictureAPIView.index, name='index'),
]