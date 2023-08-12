#!/usr/bin/python3
import datetime
import io
import os
import json
import logging
import socketserver
import time
from http import server
from threading import Condition

from picamera2 import Picamera2
from picamera2.encoders import MJPEGEncoder
from picamera2.outputs import FileOutput
from libcamera import Transform

PAGE=""
APP_PATH="/home/ubu/picamstudio"

ROOT_URL_FILES = [
    '/index.html',
    '/asset-manifest.json',
    '/logo192.png',
    '/logo512',
    '/manifest.json',
    '/robot.txt']

class StreamingOutput(io.BufferedIOBase):
    def __init__(self):
        self.frame = None
        self.condition = Condition()

    def write(self, buf):
        with self.condition:
            self.frame = buf
            self.condition.notify_all()

# "use_case", "buffer_count", "transform", "display", "encode",
# "colour_space", "controls", "main", "lores", "raw", "queue"

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/config':
            content_len = int(self.headers.get('Content-Length'))
            post_body = self.rfile.read(content_len)
            request_json = json.loads(post_body)

            picam2.stop_recording()
            time.sleep(1)
            picam2.configure(picam2.create_video_configuration(
                main={"size": (1920, 1080)},
                controls={
                  "Brightness": request_json['Brightness'],
                  "AwbEnable": request_json['AwbEnable'],
                  "AwbMode": request_json['AwbMode'],
                  "Saturation": request_json['Saturation'],
                  "Contrast": request_json['Contrast'],
                  "Sharpness": request_json['Sharpness']
                  },
                transform=Transform(hflip=int(request_json['HorizontalFlip']), vflip=int(request_json['VerticalFlip']))
                ))
            picam2.start_recording(MJPEGEncoder(), FileOutput(output))

            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_response(301)
            self.send_header('Location', '/index.html')
            self.end_headers()

        elif self.path in ROOT_URL_FILES:
            f = open(APP_PATH+"/www" + self.path, "r")
            PAGE = f.read()
            content = PAGE.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)

        elif self.path.startswith('/static/css/'):
            file_name = self.path.split('/')[-1]
            file_path = APP_PATH+'/www/static/css/' + file_name
            if os.path.exists(file_path) and os.path.isfile(file_path):
                with open(file_path, 'rb') as file:
                    content = file.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/css')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_response(404)
                self.end_headers()

        elif self.path.startswith('/static/js/'):
            file_name = self.path.split('/')[-1]
            file_path = APP_PATH+'/www/static/js/' + file_name
            if os.path.exists(file_path) and os.path.isfile(file_path):
                with open(file_path, 'rb') as file:
                    content = file.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/javascript')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_response(404)
                self.end_headers()

        elif self.path.startswith('/image/'):
            file_name = self.path.split('/')[-1]
            file_path = APP_PATH+'/captured_images/' + file_name
            if os.path.exists(file_path) and os.path.isfile(file_path):
                with open(file_path, 'rb') as file:
                    content = file.read()
                self.send_response(200)
                self.send_header('Content-type', 'image/jpeg')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_response(404)
                self.end_headers()

        elif self.path == '/images':
            image_folder = APP_PATH+'/captured_images/'
            image_list = sorted(os.listdir(image_folder))
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(image_list).encode())

        elif self.path == '/snap':
            picam2.stop_recording()
            time.sleep(1)
            capture_config = picam2.create_still_configuration(
                main={"size": (4056, 3040)},
                transform=Transform(hflip=1, vflip=1)
                )
            file_name = datetime.datetime.now().strftime("%Y%m%d%H%M%S") + '.jpg'
            file_path = APP_PATH+'/captured_images/' + file_name

            picam2.start(show_preview=False)
            time.sleep(1)
            picam2.switch_mode_and_capture_file(capture_config, file_path)

            time.sleep(1)
            picam2.switch_mode(picam2.create_video_configuration(
                                   main={"size": (1920, 1080)},
                                   transform=Transform(hflip=1, vflip=1)
                                   ))
            picam2.start_recording(MJPEGEncoder(), FileOutput(output))

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            response_data = {}
            response_data['imageURI'] = file_name
            self.wfile.write(json.dumps(response_data).encode())

        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning(
                    'Removed streaming client %s: %s',
                    self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()


class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


picam2 = Picamera2()
picam2.configure(picam2.create_video_configuration(
    main={"size": (1920, 1080)},
    transform=Transform(hflip=1, vflip=1)
    ))
output = StreamingOutput()
picam2.start_recording(MJPEGEncoder(), FileOutput(output))

try:
    address = ('', 8000)
    server = StreamingServer(address, StreamingHandler)
    server.serve_forever()
finally:
    picam2.stop_recording()

