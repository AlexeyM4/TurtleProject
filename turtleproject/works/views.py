from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from .models import Works, Comments
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.core.files.base import ContentFile
import base64
import json
from django.utils import timezone
from .forms import CommentForm
from django.urls import reverse
from django.db.models import Count


def works(request):
    works = Works.objects.annotate(num_comments=Count('work_comments'))  # Изменили имя на num_comments

    # Фильтрация остается без изменений
    author = request.GET.get('author')
    if author:
        works = works.filter(author__username__icontains=author)

    title = request.GET.get('title')
    if title:
        works = works.filter(title__icontains=title)

    # Сортировка
    sort_by = request.GET.get('sort_by')
    sort_order = request.GET.get('sort_order', 'desc')

    if sort_by == 'likes':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)
    elif sort_by == 'comments':
        works = works.order_by(f'-num_comments' if sort_order == 'desc' else 'num_comments')  # Используем num_comments
    elif sort_by == 'datetime':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)

    # Количество работ на странице
    per_page = request.GET.get('per_page', 10)

    paginator = Paginator(works, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Добавляем информацию о лайках пользователя
    for work in page_obj:
        work.user_has_liked = request.user.is_authenticated and work.liked_by.filter(id=request.user.id).exists()

    context = {
        'page_obj': page_obj,
        'per_page': per_page,
    }
    return render(request, 'works/works.html', context)


@login_required
@require_POST
def like_work(request, work_id):
    try:
        work = Works.objects.get(id=work_id)
        user = request.user

        if user in work.liked_by.all():
            # Если пользователь уже лайкнул работу, убираем лайк
            work.liked_by.remove(user)
            work.likes -= 1
            liked = False
        else:
            # Если пользователь ещё не лайкнул работу, добавляем лайк
            work.liked_by.add(user)
            work.likes += 1
            liked = True

        work.save()
        return JsonResponse({'success': True, 'likes': work.likes, 'liked': liked})
    except Works.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Работа не найдена'})


def get_likes_list(request, work_id):
    work = get_object_or_404(Works, id=work_id)
    liked_users = work.liked_by.all().values('id', 'username')
    return JsonResponse({'users': list(liked_users)})


def work_detail(request, work_id):
    work = get_object_or_404(Works, id=work_id)
    comments = work.work_comments.all().order_by('created_at')

    if request.method == 'POST' and request.user.is_authenticated:
        form = CommentForm(request.POST)
        if form.is_valid():
            new_comment = form.save(commit=False)
            new_comment.work = work
            new_comment.author = request.user
            new_comment.save()
            # Перенаправляем на ту же страницу с якорем к комментариям
            return redirect(f"{reverse('work_detail', args=[work.id])}#comments-section")
    else:
        form = CommentForm()

    work.user_has_liked = request.user.is_authenticated and work.liked_by.filter(id=request.user.id).exists()

    context = {
        'work': work,
        'comments': comments,
        'form': form if request.user.is_authenticated else None,
    }
    return render(request, 'works/work_detail.html', context)

@login_required
def delete_work(request, work_id):
    work = get_object_or_404(Works, id=work_id)

    # Проверяем, что пользователь - автор работы
    if request.user != work.author:
        return JsonResponse({'success': False, 'error': 'Недостаточно прав'}, status=403)

    work.delete()
    return JsonResponse({'success': True})


def save_work(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title', '').strip()

        if not title:
            return JsonResponse({'success': False, 'error': 'Название работы обязательно'})

        code = data.get('code')
        image_data = data.get('image')

        # Преобразуем base64 в изображение
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]
        image = ContentFile(base64.b64decode(imgstr), name=f'{title}.{ext}')

        # Сохраняем работу
        work = Works(
            title=title,
            author=request.user,
            code=code,
            image=image,
            datetime=timezone.now()
        )
        work.save()

        return JsonResponse({'success': True})
    return JsonResponse({'success': False})


@require_POST
@login_required
def delete_comment(request, work_id, comment_id):
    # Получаем конкретный комментарий, связанный с работой
    comment = get_object_or_404(Comments, id=comment_id, work__id=work_id)

    # Проверяем, что пользователь - автор комментария
    if comment.author != request.user:
        return JsonResponse({'success': False, 'error': 'Недостаточно прав'}, status=403)

    comment.delete()

    return JsonResponse({
        'success': True,
        'message': 'Комментарий успешно удален',
        'comments_count': Comments.objects.filter(work__id=work_id).count()
    })



