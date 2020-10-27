 # -*- coding: utf-8 -*-
import datetime

def log():
    datainicio = datetime.datetime.now().strftime('%d-%m-%y %H:%M:%S')
    arquivo = open('logcoleta.txt','a')
    arquivo.write("Coleta de dado: \n")
    arquivo.write(str(datainicio) + "\n")
    arquivo.close()

def logerro():
    datainicio = datetime.datetime.now().strftime('%d-%m-%y %H:%M:%S')
    arquivo = open('logerro.txt','a')
    arquivo.write("Erro na coleta: \n")
    arquivo.write(str(datainicio) + "\n")
    arquivo.close()