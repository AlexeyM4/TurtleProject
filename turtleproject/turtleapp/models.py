from django.db import models

class News(models.Model):
    title = models.CharField('Заголовок', max_length=150)
    text = models.TextField('Текст новости')
    date = models.DateField('Дата публикации')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'


class Works(models.Model):
    title = models.CharField('Название', max_length=150)
    author = models.CharField('Автор', max_length=150)
    datetime = models.DateTimeField('Дата публикации')
    likes = models.PositiveIntegerField('Лайки', default=0)
    comments = models.PositiveIntegerField('Комментарии', default=0)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Работа'
        verbose_name_plural = 'Работы'


class Lessons(models.Model):
    title = models.CharField('Название', max_length=150)
    description = models.TextField('Описание задания')
    task = models.TextField('Задание', default='<strong>Задание:</strong> ')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'