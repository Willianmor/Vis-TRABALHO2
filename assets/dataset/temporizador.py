import time
from threading import Thread
from time import sleep

#Definindo a classe time
class IntervalRunner(Thread):
    def __init__(self, interval, function, *args, **kwargs):
        super(IntervalRunner,self).__init__()
    
        self.interval = interval
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.executing = False

    def run(self):
        self.executing = True
        while self.executing:
            self.function(*self.args, **self.kwargs)
            time.sleep(self.interval)

    def stop(self):
        self.executing = False

