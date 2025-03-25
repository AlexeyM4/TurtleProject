from django.urls import path
from . import views

urlpatterns = [
    path('entrance', views.entrance, name='entrance'),
    path('registration', views.registration, name='registration'),

    path('register', views.registration, name='register'),
    path('activate/<uidb64>/<token>', views.activate, name='activate'),
    path('profile', views.profile, name='profile'),

    path('logout', views.user_logout, name='logout'),
    path('user_login', views.user_login, name='user_login'),

    path('password_reset', views.password_reset, name='password_reset'),
    path('password_reset_confirm/<uidb64>/<token>', views.password_reset_confirm, name='password_reset_confirm'),

    path('check_auth/', views.check_auth, name='check_auth'),
]

