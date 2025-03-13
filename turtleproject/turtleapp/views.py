from django.shortcuts import render, redirect
from django.core.paginator import Paginator
from django.http import HttpResponse
from .models import News, Works


def main_page(request):
    data = {
        'news': News.objects.order_by('-date'),
        'works': Works.objects.order_by('-likes')[:10],
    }
    return render(request, 'turtleapp/main.html', data)

def works(request):
    works = Works.objects.all()

    # Фильтрация
    author = request.GET.get('author')
    if author:
        works = works.filter(author__icontains=author)

    title = request.GET.get('title')
    if title:
        works = works.filter(title__icontains=title)

    # Сортировка
    sort_by = request.GET.get('sort_by')
    sort_order = request.GET.get('sort_order', 'desc')  # По умолчанию сортировка по убыванию

    if sort_by == 'likes':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)
    elif sort_by == 'comments':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)
    elif sort_by == 'datetime':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)

    # Количество работ на странице
    per_page = request.GET.get('per_page', '10')
    if not per_page:
        per_page = 10
    else:
        per_page = int(per_page)

    paginator = Paginator(works, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'page_obj': page_obj,
        'per_page': per_page,
    }
    return render(request, 'turtleapp/works.html', context)

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




