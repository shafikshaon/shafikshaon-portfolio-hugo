---
title: "User Registration With Email Verification"
description: ""
date: 2019-05-28T23:09:09+06:00
author: "Shafikur Rahman"
tags: [
    "Django",
]
draft: false
---
Assume that I have a project named **user_registration** and it contains an app named **accounts**.

At first, we need to configure our email server. So, got to `user_registration/setting.py` and write the follwoing lines:

    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  
    MAILER_EMAIL_BACKEND = EMAIL_BACKEND  
    EMAIL_HOST = 'your_mail_server'  
    EMAIL_HOST_PASSWORD = 'your_password'  
    EMAIL_HOST_USER = 'your_email'  
    EMAIL_PORT = 465  
    EMAIL_USE_SSL = True  
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

To test above configuration work, open up the terminal and navigate to `user_registration` project and run following command:

    $ python manage.py shell
    >>> from django.core.mail import send_mail
    >>> send_mail( 'Subject here', 'Here is the message.', 'me@shafikshaon.com', ['shafikshaon@gmail.com'], fail_silently=False, )
It will return 1 as status code.
Then check your mail, a mail will arrive.

Now create a form in `accounts/templates/accounts/signup.html` and write the following code:

    <!DOCTYPE html>  
    <html lang="en">  
    <head>  
        <title>Signup</title>  
        <meta charset="utf-8">  
        <meta name="viewport" content="width=device-width, initial-scale=1">  
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">  
    </head>  
    <body>  

    <div class="container" style="margin-top: 50px;">  
        <div class="row justify-content-center">  
            <div class="col-md-5 shadow-sm p-3 mb-5 bg-white rounded">  
                <h2>Signup</h2>  
                <form method="post">  
                    {% csrf_token %}  
                    <div class="form-group">  
                        <label for="first_name">First Name:</label>  
                        <input type="text" class="form-control" id="first_name" placeholder="Enter first name"  
      name="first_name">  
                    </div>  
                    <div class="form-group">  
                        <label for="last_name">Last Name:</label>  
                        <input type="text" class="form-control" id="last_name" placeholder="Enter last name"  
      name="last_name">  
                    </div>  
                    <div class="form-group">  
                        <label for="username">Username:</label>  
                        <input type="text" class="form-control" id="username" placeholder="Enter username" name="username">  
                    </div>  
                    <div class="form-group">  
                        <label for="email">Email:</label>  
                        <input type="email" class="form-control" id="email" placeholder="Enter email" name="email">  
                    </div>  
                    <div class="form-group">  
                        <label for="pwd1">Password:</label>  
                        <input type="password" class="form-control" id="pwd1" placeholder="Enter password" name="password1">  
                    </div>  
                    <div class="form-group">  
                        <label for="pwd2">Confirm Password:</label>  
                        <input type="password" class="form-control" id="pwd2" placeholder="Reenter password"  
      name="password2">  
                    </div>  
                    <button type="submit" class="btn btn-primary">Submit</button>  
                </form>  
            </div>  
        </div>  
    </div>  

    </body>  
    </html>

Now create a form in `accounts/templates/accounts/acc_active_email.html` and write the following code:

    {% autoescape off %}  
    Hi {{ user.username }},  
    Please click on the link to confirm your registration,  

    http://{{ domain }}{% url 'activate' uidb64=uid token=token %}  
    If you think, it's not you, then just ignore this email.  
    {% endautoescape %}

Now open up `accounts/urls.py` and write the following path:

    from django.urls import path  
    from accounts import views  

    urlpatterns = [  
        path('signup/', views.signup, name="signup"),  
        path('activate/<uidb64>/<token>/',views.activate, name='activate'),  
    ]
Now open up `accounts/tokens.py` and write the following code:

    from django.contrib.auth.tokens import PasswordResetTokenGenerator  
    from django.utils import six  


    class AccountActivationTokenGenerator(PasswordResetTokenGenerator):  
        def _make_hash_value(self, user, timestamp):  
            return (  
                six.text_type(user.pk) + six.text_type(timestamp) +  
                six.text_type(user.is_active)  
            )  

    account_activation_token = AccountActivationTokenGenerator()
Now open up `accounts/forms.py` and write the following code:

    from django.contrib.auth.forms import UserCreationForm  
    from django.contrib.auth.models import User  


    class SignUpForm(UserCreationForm):  
        class Meta:  
            model = User  
            fields = ('email', 'first_name', 'last_name', 'username')

Now open up `accounts/views.py` and write the following code:

    from django.http import HttpResponse  
    from django.shortcuts import render  
    from django.contrib.sites.shortcuts import get_current_site  
    from django.utils.encoding import force_bytes, force_text  
    from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode  
    from django.template.loader import render_to_string  

    from .forms import SignUpForm  
    from .tokens import account_activation_token  
    from django.contrib.auth.models import User  
    from django.core.mail import EmailMessage  


    def signup(request):  
        if request.method == 'GET':  
            return render(request, 'accounts/signup.html')  
        if request.method == 'POST':  
            form = SignUpForm(request.POST)  
            # print(form.errors.as_data())  
            if form.is_valid():  
                user = form.save(commit=False)  
                user.is_active = False  
                user.save()  
                current_site = get_current_site(request)  
                mail_subject = 'Activate your account.'  
                message = render_to_string('accounts/acc_active_email.html', {  
                    'user': user,  
                    'domain': current_site.domain,  
                    'uid': urlsafe_base64_encode(force_bytes(user.id)).decode(),  
                    'token': account_activation_token.make_token(user),  
                })  
                to_email = form.cleaned_data.get('email')  
                email = EmailMessage(  
                    mail_subject, message, to=[to_email]  
                )  
                email.send()  
                return HttpResponse('Please confirm your email address to complete the registration')  
         else:  
            form = SignUpForm()  
         return render(request, 'accounts/signup.html', {'form': form})  


    def activate(request, uidb64, token):  
        try:  
            uid = force_text(urlsafe_base64_decode(uidb64))  
            user = User.objects.get(id=uid)  
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):  
            user = None  
        if user is not None and account_activation_token.check_token(user, token):  
            user.is_active = True  
            user.save()  
            return HttpResponse('Thank you for your email confirmation. Now you can login your account.')  
        else:  
            return HttpResponse('Activation link is invalid!')

When user signup, `is_active` set to `False` that means user set to inactive during signup process.
By `render_to_string()` method which data/ value send over conext. Here, data/ value send over`accounts/acc_active_email.html` and `user`, `domain`, `uid`, and `token` data as context data.

Convert `uid` into text. Then, find user object by `uid`.
Now check `account_activation_token.check_token(user, token)` to check is this match with previously creaed token. If match the `user.is_active` set to `True`.
