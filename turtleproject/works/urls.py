from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', views.works, name='works'),
    path('like_work/<int:work_id>/', views.like_work, name='like_work'),
    path('work/<int:work_id>/', views.work_detail, name='work_detail'),
    path('work/<int:work_id>/delete/', views.delete_work, name='delete_work'),
    path('work/<int:work_id>/likes/', views.get_likes_list, name='likes_list'),
    path('save_work/', views.save_work, name='save_work'),

    path('work/<int:work_id>/comments/<int:comment_id>/delete/', views.delete_comment, name='delete_comment'),


] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
