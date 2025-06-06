from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('lessons/<int:lesson_order>/', views.lesson_detail, name='lesson_detail'),
    path('playground', views.playground, name='playground'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
