#!/usr/bin/env python3

import os
import glob
#pip install glob2==0.4.1
import zipfile
import shutil

#Descompactar arquivo
def unzipefile_raiz():
    dir_name_base = os.path.dirname(os.path.realpath(__file__))
    
    for arc_name in glob.iglob(os.path.join(dir_name_base, "*.zip")):
        try:
            arc_dir_name = os.path.splitext(os.path.basename(arc_name))[0]
            zf = zipfile.ZipFile(arc_name)
            #descompactando arquivo e inserindo na pasta raiz
            zf.extractall(path=os.path.join(dir_name_base, dir_name_base))
            zf.close() # close file after extraction is completed'''
            #Dando permissão ao arquivo descompactado
            arquivo=str(arc_dir_name)
            permissao = 755
            os.chmod(arquivo,permissao)
            #Removendo arquivo zip
            os.remove(os.path.join(dir_name_base, arc_name))
            #Removendo pasta
            shutil.rmtree(arquivo)
        except:
            os.remove(os.path.join(dir_name_base, arc_name))
            continue

unzipefile_raiz()