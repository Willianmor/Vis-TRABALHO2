# coding: utf-8

#Importar dados do INPE disponibilizados pelo deter e disponibilizar para a plataforma Mapfire

"""
Download WFS
Download Shapefile DETER
Copyright 2020 TerraBrasilis
Usage:
  download-deter-data.py
Options:
  no have
Disclaimer.
This is an example, therefore, we do not implement all error handling or cover all
problems related to the download process.
It is highly recommended that you improve and adapt this code to your specifics.
If you run this script in the same directory on the same day, the output file will be replaced.
Before start, read the tecnical posts into our Blog.
http://terrabrasilis.dpi.inpe.br/categoria/conteudo-tecnico/
"""

#Import bibliotecas
import requests, os, io
from requests.auth import HTTPBasicAuth
from datetime import datetime
from xml.etree import ElementTree as xmlTree

#Import bibliotecas
import os
import ftplib
import zipfile
import glob
import time
import threading
from threading import Thread
from time import sleep

#Scripts criados
import descompactar
from descompactar import unzipefile_raiz

#import scripts auxiliares
import temporizador
from temporizador import IntervalRunner
from log import log,logerro

def import_deter():

  class DownloadWFS:
    """
      Define configurations on instantiate.
      First parameter: user, The user name used to authentication on the server.
      Second parameter: password, The password value used to authentication on the server.
      
      To change the predefined settings, inside the constructor, edit the
      parameter values ​​in accordance with the respective notes.
      """

    def __init__(self,user=None,password=None):
      """
      Constructor with predefined settings.
      The start date is set by manually changing the value of the START_DATE parameter, below.
      The end date is automatically detected in the machine's calendar.
      The next filter on the states, uses the UF parameter and the
      values ​​are the acronyms of the state names, like PA or AM.
      Important note: If the range used to filter is very wide, the number of resources
      returned may be greater than the maximum limit allowed by the server.
      In this case, this version has been prepared for pagination and the shapefile is
      downloaded in parts.
      """

      # warning: before change the time interval, pay attention into notes on constructor.
      self.START_DATE="2015-01-01"
      self.END_DATE=datetime.today().strftime('%Y-%m-%d')
      self.UF=None

      self.WORKSPACE_NAME="deter-amz"
      # To change the desired layer, change the following value.
      # The public layer "deter_amz" or the controled layer "deter_amz_auth"
      self.LAYER_NAME="deter_amz"

      # The output file name (layer_name_start_date_end_date)
      self.OUTPUT_FILENAME="{0}_{1}_{2}".format(self.LAYER_NAME,self.START_DATE,self.END_DATE)
      self.AUTH=None

      if user and password:
        self.AUTH=HTTPBasicAuth(user, password)


    def __buildBaseURL(self):
      host="terrabrasilis.dpi.inpe.br"
      url="http://{0}/geoserver/{1}/{2}/wfs".format(host,self.WORKSPACE_NAME,self.LAYER_NAME)
      return url

    def __buildQueryString(self, OUTPUTFORMAT=None):
      """
      Building the query string to call the WFS service.
      The parameter: OUTPUTFORMAT, the output format for the WFS GetFeature operation described
      in the AllowedValues ​​section in the capabilities document.
      
      <ows:Parameter name="outputFormat">
        <ows:AllowedValues>
        <ows:Value>application/gml+xml; version=3.2</ows:Value>
        <ows:Value>GML2</ows:Value>
        <ows:Value>KML</ows:Value>
        <ows:Value>SHAPE-ZIP</ows:Value>
        <ows:Value>application/json</ows:Value>
        <ows:Value>application/vnd.google-earth.kml xml</ows:Value>
        <ows:Value>application/vnd.google-earth.kml+xml</ows:Value>
        <ows:Value>csv</ows:Value>
        <ows:Value>gml3</ows:Value>
        <ows:Value>gml32</ows:Value>
        <ows:Value>json</ows:Value>
        <ows:Value>text/xml; subtype=gml/2.1.2</ows:Value>
        <ows:Value>text/xml; subtype=gml/3.1.1</ows:Value>
        <ows:Value>text/xml; subtype=gml/3.2</ows:Value>
        </ows:AllowedValues>
      </ows:Parameter>
      To change defined filters and discover more possibilities
      you should learn more about WFS standard and how to filter using CQL.
      https://www.ogc.org/standards/wfs
      """
      # Filters example (by date interval and uf)
      CQL_FILTER="date BETWEEN '{0}' AND '{1}'".format(self.START_DATE,self.END_DATE)
      if self.UF: CQL_FILTER="{0} AND uf='{1}'".format(CQL_FILTER,self.UF)
      # WFS parameters
      SERVICE="WFS"
      REQUEST="GetFeature"
      VERSION="2.0.0"
      # if OUTPUTFORMAT is changed, check the output file extension within the get method in this class.
      OUTPUTFORMAT= ("SHAPE-ZIP" if not OUTPUTFORMAT else OUTPUTFORMAT)
      exceptions="text/xml"
      # define the output projection. We use the layer default projection. (Geography/SIRGAS2000)
      srsName="EPSG:4674"
      # the layer definition
      TYPENAME="{0}:{1}".format(self.WORKSPACE_NAME,self.LAYER_NAME)
      
      allLocalParams=locals()
      allLocalParams.pop("self",None)
      PARAMS="&".join("{}={}".format(k,v) for k,v in allLocalParams.items())
      return PARAMS

    def __xmlRequest(self, url):
      root=None
      if self.AUTH:
        response=requests.get(url, auth=self.AUTH)
      else:
        response=requests.get(url)
      
      if response.ok:
        xmlInMemory = io.BytesIO(response.content)
        tree = xmlTree.parse(xmlInMemory)
        root = tree.getroot()
      
      return root

    def __getServerLimit(self):
      """
      Read the data download service limit via WFS
      """
      url="{0}?{1}".format(self.__buildBaseURL(),"service=wfs&version=2.0.0&request=GetCapabilities")
      # the default limit on our GeoServer
      serverLimit=100000

      XML=self.__xmlRequest(url)

      if '{http://www.opengis.net/wfs/2.0}WFS_Capabilities'==XML.tag:
        for p in XML.findall(".//{http://www.opengis.net/ows/1.1}Operation/[@name='GetFeature']"):
          dv=p.find(".//{http://www.opengis.net/ows/1.1}Constraint/[@name='CountDefault']")
          serverLimit=dv.find('.//{http://www.opengis.net/ows/1.1}DefaultValue').text

      return int(serverLimit)

    def __countMaxResult(self):
      """
      Read the number of lines of results expected in the download using the defined filters.
      """
      url="{0}?{1}".format(self.__buildBaseURL(), self.__buildQueryString())
      url="{0}&{1}".format(url,"resultType=hits")
      numberMatched=0

      XML=self.__xmlRequest(url)
      if '{http://www.opengis.net/wfs/2.0}FeatureCollection'==XML.tag:
        numberMatched=XML.find('[@numberMatched]').get('numberMatched')

      return int(numberMatched)

    def __pagination(self):
      # get server limit and count max number of results
      sl=self.__getServerLimit()
      rr=self.__countMaxResult()
      # define the start page number
      pagNumber=1
      # define the start index of data
      startIndex=0
      # define the attribute to sort data
      sortBy="gid"
      # using the server limit to each download
      count=sl
      # pagination iteraction
      while(startIndex<rr):
        paginationParams="&count={0}&sortBy={1}&startIndex={2}".format(count,sortBy,startIndex)
        self.__download(paginationParams,pagNumber)
        startIndex=startIndex+count
        pagNumber=pagNumber+1

    def __download(self, pagination="startIndex=0", pagNumber=1):
      url="{0}?{1}&{2}".format(self.__buildBaseURL(), self.__buildQueryString(), pagination)

      dir_name=os.path.realpath(os.path.dirname(__file__))
      # the extension of output file is ".zip" because the OUTPUTFORMAT is defined as "SHAPE-ZIP"
      output_file="{0}/{1}_part{2}.zip".format(dir_name, self.OUTPUT_FILENAME, pagNumber)
      if self.AUTH:
        response=requests.get(url, auth=self.AUTH)
      else:
        response=requests.get(url)
      if response.ok:
        with open(output_file, 'wb') as f:
          f.write(response.content)
      else:
        print("Download fail with HTTP Error: {0}".format(response.status_code))
    
    #Criar o log
    log()
    print("entrou")
    def get(self):
      self.__pagination()
    


  #Criar o log
  #log()
  # To call without credentials (uses the public layer name)
  down=DownloadWFS()

  # To call with credentials (needs change the layer name)
  # down=DownloadWFS("user","pass")

  # Call download
  down.get()

import_deter()
