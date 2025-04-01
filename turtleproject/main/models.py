from django.db import models
from django.contrib.auth.models import User

class News(models.Model):
    title = models.CharField('Заголовок', max_length=150)
    preface = models.CharField('Предисловие', max_length=300, blank=True, help_text='Краткое описание новости (до 300 символов)')
    text = models.TextField('Текст новости')
    image = models.ImageField('Изображение', upload_to='news/', blank=True, null=True)
    date = models.DateField('Дата публикации', auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-date']


class Lessons(models.Model):
    title = models.CharField('Название', max_length=150)
    description = models.TextField('Описание задания', default='Описание задания')
    theory = models.TextField('Теория', default='<strong>Теория:</strong> ')
    task = models.TextField('Задание', default='<strong>Задание:</strong> ')
    order = models.IntegerField('Номер урока', default=0, unique=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'

class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lessons, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')
        verbose_name = 'Прогресс урока'
        verbose_name_plural = 'Прогресс уроков'
