from rest_framework import serializers
from .models.Article import Article

class ArticleSerializer(serializers.Serializer):
    class Meta:
        model = Article
        fields = '__all__'