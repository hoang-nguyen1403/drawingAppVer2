from django.urls import path
from django.conf.urls.static import static
from django.conf import settings

from .controllers.article import ArticleAPIView
from .controllers.image import saveFile


urlpatterns = [
    # path('article/', article_list),
    path('detectArea/',ArticleAPIView.as_view()),
    path('upload/',saveFile),
] + static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)