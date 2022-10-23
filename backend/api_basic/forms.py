from dataclasses import fields
from django import forms

from .models.Article import Article

class UploadFrom(forms.ModelForm):
    class Meta:
        model = Article
        # fields= ["name", "imagefile"]
        fields = '__all__'

