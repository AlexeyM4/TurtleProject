from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.main_page, name='main'),
    path('lessons', views.lessons, name='lessons'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
