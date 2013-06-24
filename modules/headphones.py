import cherrypy
import htpc
from htpc.proxy import get_image
from json import loads
from urllib2 import urlopen
import logging

class Headphones:
    def __init__(self):
        self.logger = logging.getLogger('modules.headphones')
        htpc.MODULES.append({
            'name': 'Headphones',
            'id': 'headphones',
            'test': htpc.WEBDIR + 'headphones/ping',
            'fields': [
                {'type': 'bool', 'label': 'Enable', 'name': 'headphones_enable'},
                {'type': 'text', 'label': 'Menu name', 'name': 'headphones_name'},
                {'type': 'text', 'label': 'IP / Host *', 'name': 'headphones_host'},
                {'type': 'text', 'label': 'Port *', 'name': 'headphones_port'},
                {'type': 'text', 'label': 'API key', 'name': 'headphones_apikey'},
                {'type': 'text', 'label': 'Basepath (starts with a slash)', 'name': 'headphones_basepath'}
        ]})

    @cherrypy.expose()
    def index(self):
        return htpc.LOOKUP.get_template('headphones.html').render(scriptname='headphones')

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def ping(self, headphones_host, headphones_port, headphones_apikey, headphones_basepath, **kwargs):

        self.logger.debug("Testing connectitivity to headphones")
        if(headphones_basepath == ""):
            headphones_basepath = "/"
        if not(headphones_basepath.endswith('/')):
            headphones_basepath += "/"

        url = 'http://' + headphones_host + ':' + headphones_port + headphones_basepath + 'api?apikey=' + headphones_apikey + '&cmd='
        try:
            return loads(urlopen(url + '/app.available', timeout=10).read())
        except:
            self.logger.error("Unable to connect to headphones")
            self.logger.debug("connection-URL: " + url)
            return

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def GetHistory(self):
        self.logger.debug("Fetching Music History")
        return self.fetch('getHistory')

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def GetUpcoming(self):
        self.logger.debug("Fetching Upcoming Albums")
        return self.fetch('getUpcoming')

    @cherrypy.expose()
    @cherrypy.tools.json_out()
    def GetArtists(self):
        self.logger.debug("Fetching Artists")
        return self.fetch('getIndex')

    def fetch(self, path):
        try:
            settings = htpc.settings.Settings()
            host = settings.get('headphones_host', '')
            port = str(settings.get('headphones_port', ''))
            apikey = settings.get('headphones_apikey', '')

            headphones_basepath = settings.get('headphones_basepath', '/')
            if(headphones_basepath == ""):
              headphones_basepath = "/"
            if not(headphones_basepath.endswith('/')):
                headphones_basepath += "/"

            url = 'http://' + host + ':' + port + headphones_basepath + 'api?apikey=' + apikey + '&cmd=' + path
            
            self.logger.debug("Fetching information from : " + url)
            return loads(urlopen(url, timeout=10).read())
        except:
            self.logger.error("Unable to fetch information from " + url)
            return
