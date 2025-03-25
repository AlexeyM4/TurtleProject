from django.shortcuts import render, redirect
from django.http import HttpResponse

from .models import News, Lessons, LessonProgress
from works.models import Works


def main_page(request):
    works = Works.objects.order_by('-likes')[:10]

    # Добавляем информацию о лайках пользователя
    for work in works:
        work.user_has_liked = request.user.is_authenticated and work.liked_by.filter(id=request.user.id).exists()

    data = {
        'news': News.objects.order_by('-date'),
        'works': works,
    }
    return render(request, 'main/main.html', data)


def lessons(request):
    lessons_list = Lessons.objects.all().order_by('order')

    if request.user.is_authenticated:
        completed_lessons = set(LessonProgress.objects.filter(
            user=request.user,
            completed=True
        ).values_list('lesson_id', flat=True))

        for lesson in lessons_list:
            lesson.is_completed = lesson.id in completed_lessons

    return render(request, 'main/lessons.html', {
        'lessons_list': lessons_list,
        'auth_required_modal': True  # Флаг для включения модального окна
    })
