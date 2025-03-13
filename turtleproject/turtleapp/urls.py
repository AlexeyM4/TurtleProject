from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_page, name='main'),
    path('lessons', views.lessons, name='lessons'),
    path('playground', views.playground, name='playground'),
    path('entrance', views.entrance, name='entrance'),
    path('works', views.works, name='works'),

    path('register', views.register, name='register'),
    path('user_login', views.user_login, name='user_login'),

    path('password_reset', views.password_reset, name='password_reset'),
]
