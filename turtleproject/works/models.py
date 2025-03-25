from django.db import models
from django.contrib.auth.models import User
import os
from django.conf import settings


class Works(models.Model):
    title = models.CharField('Название', max_length=150)
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Автор')
    image = models.ImageField(upload_to='works/', verbose_name='Изображение', default='default_image.png')
    code = models.TextField('Код', blank=True, null=True)
    datetime = models.DateTimeField('Дата публикации', auto_now_add=True)
    likes = models.PositiveIntegerField('Лайки', default=0)
    liked_by = models.ManyToManyField(User, related_name='liked_works', blank=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Работа'
        verbose_name_plural = 'Работы'
        ordering = ['-datetime']

    @property
    def comments_count(self):
        return self.work_comments.count()

    def delete(self, *args, **kwargs):
        # Удаляем файл изображения
        if self.image:
            image_path = os.path.join(settings.MEDIA_ROOT, str(self.image))
            if os.path.exists(image_path):
                os.remove(image_path)

        # Вызываем оригинальный метод delete()
        super().delete(*args, **kwargs)



class Comments(models.Model):
    work = models.ForeignKey(Works, on_delete=models.CASCADE, related_name='work_comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField('Текст комментария')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    def __str__(self):
        return f'Комментарий от {self.author.username} к работе {self.work.title}'

    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['created_at']