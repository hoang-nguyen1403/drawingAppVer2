from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from .controllers.picture import PictureAPIView
from .controllers.article import ArticleAPIView


urlpatterns = [
    # path('article/', article_list),
    path('detectArea/',ArticleAPIView.as_view()),
    path('picture/',PictureAPIView.as_view()),
] + static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)