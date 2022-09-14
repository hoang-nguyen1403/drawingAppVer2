from django.db import models

# Create your models here.
class Article(models.Model):
    num_nodes = models.CharField(max_length=100)
    num_segments = models.CharField(max_length=100)
    num_coords = models.CharField(max_length=100)
    segments = models.CharField(max_length=100)
    segment_names = models.CharField(max_length=100)
    
    
    
    def __str__(self):
        return self.title