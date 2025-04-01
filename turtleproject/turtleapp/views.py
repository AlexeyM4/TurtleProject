from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from main.models import Lessons, LessonProgress

@csrf_exempt
def lesson_detail(request, lesson_order):
    lesson = get_object_or_404(Lessons, order=lesson_order)

    # Получаем соседние уроки
    previous_lesson = Lessons.objects.filter(order__lt=lesson.order).order_by('-order').first()
    next_lesson = Lessons.objects.filter(order__gt=lesson.order).order_by('order').first()

    if request.method == 'POST':
        if request.user.is_authenticated:
            # Создаем или обновляем запись о прогрессе
            progress, created = LessonProgress.objects.update_or_create(
                user=request.user,
                lesson=lesson,
                defaults={'completed': True, 'completed_at': timezone.now()}
            )
            return JsonResponse({'status': 'success', 'completed': True})
        else:
            return JsonResponse({'status': 'auth_required'}, status=403)

    # Проверяем статус прохождения для авторизованных
    is_completed = False
    if request.user.is_authenticated:
        is_completed = LessonProgress.objects.filter(
            user=request.user,
            lesson=lesson,
            completed=True
        ).exists()

    data = {
        'lesson': lesson,
        'previous_lesson': previous_lesson,
        'next_lesson': next_lesson,
        'is_completed': is_completed,
    }
    return render(request, 'turtleapp/lesson_detail.html', data)


def playground(request):
    return render(request, 'turtleapp/playground.html')


