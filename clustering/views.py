from django.shortcuts import render

# Create your views here.
class HierarchyCluster(object):
    def __init__(self, data, param, axis, delimiter):
        self.data = data
        self.param = param
        self.axis = axis

    def cluster(self):
