from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class RegistrationForm(UserCreationForm):
    username = forms.CharField(required=True, label="Имя пользователя", error_messages={
        'unique': 'Пользователь с таким именем уже существует.',
    })
    email = forms.EmailField(required=True, label="Почта")
    first_name = forms.CharField(required=True, label="Имя")
    last_name = forms.CharField(required=True, label="Фамилия")

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Пользователь с такой почтой уже зарегистрирован.')
        return email

class PasswordResetForm(forms.Form):
    username = forms.CharField(label="Имя пользователя", required=True)
    email = forms.EmailField(label="Почта", required=True)

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')

        # Проверяем, существует ли пользователь с таким именем и почтой
        try:
            user = User.objects.get(username=username, email=email)
        except User.DoesNotExist:
            raise forms.ValidationError("Пользователь не найден.")

        return cleaned_data