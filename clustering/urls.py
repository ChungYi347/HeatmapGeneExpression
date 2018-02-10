from django.conf.urls import url
from django.contrib import admin

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^(?P<filename>\w+.*)$', views.file_name_download, name='file_name_download'),
]
