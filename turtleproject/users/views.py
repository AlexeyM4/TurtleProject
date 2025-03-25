from django.contrib.auth.models import User
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth import logout

from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.decorators import login_required
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import authenticate, login, update_session_auth_hash
from django.contrib import messages

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from django.core.mail import send_mail
from django.core.paginator import Paginator
from django.template.loader import render_to_string
from django.http import JsonResponse

from .forms import RegistrationForm, PasswordResetForm
from django.shortcuts import render, redirect
from works.models import Works
from django.db.models import Count


def registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False  # Пользователь не активен до подтверждения email
            user.save()

            # Отправка email с подтверждением
            current_site = get_current_site(request)
            mail_subject = 'Активируйте ваш аккаунт'
            message = render_to_string('users/emails/acc_active_email.html', {
                'user': user,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': default_token_generator.make_token(user),
            })
            to_email = form.cleaned_data.get('email')
            send_mail(mail_subject, message, 'alex.mamaev2003@yandex.ru', [to_email])

            return render(request, 'users/sending_email.html', {'aim': 'регистрацию'})
    else:
        form = RegistrationForm()
    return render(request, 'users/registration.html', {'form': form})


def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        login(request, user)
        return redirect('profile')
    else:
        return render(request, 'users/activation_invalid.html')


@login_required
def profile(request):
    user = request.user
    works = Works.objects.filter(author=user).annotate(num_comments=Count('work_comments'))  # Изменили имя на num_comments

    # Фильтрация по названию работы
    title = request.GET.get('title')
    if title:
        works = works.filter(title__icontains=title)

    # Сортировка
    sort_by = request.GET.get('sort_by')
    sort_order = request.GET.get('sort_order', 'desc')  # По умолчанию сортировка по убыванию

    if sort_by == 'likes':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)
    elif sort_by == 'comments':
        works = works.order_by(f'-num_comments' if sort_order == 'desc' else 'num_comments')
    elif sort_by == 'datetime':
        works = works.order_by(f'-{sort_by}' if sort_order == 'desc' else sort_by)

    # Количество работ на странице
    per_page = request.GET.get('per_page', 8)  # По умолчанию 8 работ на странице

    # Пагинация
    paginator = Paginator(works, per_page)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Добавляем информацию о лайках пользователя
    for work in page_obj:
        work.user_has_liked = request.user.is_authenticated and work.liked_by.filter(id=request.user.id).exists()

    context = {
        'user': user,
        'page_obj': page_obj,
        'title': title,
        'sort_by': sort_by,
        'sort_order': sort_order,
        'per_page': per_page,
    }
    return render(request, 'users/profile.html', context)


def entrance(request):
    return render(request, 'users/entrance.html')


def password_reset(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']

            # Получаем пользователя
            user = User.objects.get(username=username, email=email)

            # Генерация токена и ссылки для сброса пароля
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{request.scheme}://{request.get_host()}/users/password_reset_confirm/{uid}/{token}"

            # Отправка письма
            mail_subject = 'Восстановление пароля'
            message = render_to_string('users/emails/password_reset_email.html', {
                'user': user,
                'reset_url': reset_url,
            })
            send_mail(mail_subject, message, 'alex.mamaev2003@yandex.ru', [email])

            return render(request, 'users/sending_email.html',{'aim': 'сброс пароля'})
        else:
            messages.error(request, 'Пользователь не найден.')
    else:
        form = PasswordResetForm()

    return render(request, 'users/password_reset.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        # Проверяем, существует ли пользователь с таким username
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            user = None

        if user is not None:
            # Если пользователь существует, проверяем его активность
            if not user.is_active:
                messages.error(request, 'Ваш аккаунт не активирован. Проверьте почту для активации.')
                return redirect('entrance')

            # Если пользователь активен, пытаемся аутентифицировать
            authenticated_user = authenticate(request, username=username, password=password)
            if authenticated_user is not None:
                login(request, authenticated_user)
                return redirect('profile')  # Перенаправление на страницу профиля
            else:
                messages.error(request, 'Неверный пароль.')
        else:
            messages.error(request, 'Пользователь с таким именем не найден.')

        return redirect('entrance')  # Перенаправление обратно на страницу входа

    return render(request, 'users/entrance.html')


def user_logout(request):
    logout(request)
    return redirect('entrance')


def password_reset_confirm(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                update_session_auth_hash(request, user)
                messages.success(request, 'Пароль успешно изменен.')
                return redirect('entrance')
        else:
            form = SetPasswordForm(user)
        return render(request, 'users/password_reset_confirm.html', {'form': form})
    else:
        messages.error(request, 'Ссылка для сброса пароля недействительна.')
        return redirect('entrance')

def check_auth(request):
    return JsonResponse({'authenticated': request.user.is_authenticated})