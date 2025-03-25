from django.contrib import admin
from .models import News, Lessons, LessonProgress

admin.site.register(News)
admin.site.register(Lessons)
admin.site.register(LessonProgress)