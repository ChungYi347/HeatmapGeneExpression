from django.shortcuts import render
from django.conf import settings
from HeatmapGeneExpression import *

# Create your views here.
def index(request):
    """
    index html
    :param request:
    :return:
    """
    return render(request, 'index.html')

def file_name_download(request, filename):
    """
    download file (all path)
    :param request:
    :param filename:
    :return:
    """

    # Split filename from request
    parse = filename.split("/")
    # set file path to static root
    filepath = settings.STATIC_ROOT

    # parse and get the path
    for i in parse:
        filepath = os.path.join(filepath, i)
    return_value = sendfile(request, filepath)

    # set content-type json
    if filepath[-4:] == "json":
        return_value['Content-Type'] = 'application/json'
    return return_value

