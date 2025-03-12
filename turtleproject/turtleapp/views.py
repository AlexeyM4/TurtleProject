from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse


def main_page(request):
    return render(request, 'turtleapp/main.html')

def lessons(request):
    return render(request, 'turtleapp/lessons.html')

def playground(request):
    return render(request, 'turtleapp/playground.html')

def entrance(request):
    return render(request, 'turtleapp/entrance.html')

def register(request):
    # Логика регистрации
    return HttpResponse('<h1>Регистрация</h1>')

def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        return render(request, 'turtleapp/main.html')

        # user = authenticate(request, username=email, password=password)
        # if user:
        #     login(request, user)
        #     return redirect('main')
    return render(request, 'turtleapp/main.html')

def password_reset(request):
    return HttpResponse('<h1>Восстановление пароля</h1>')



