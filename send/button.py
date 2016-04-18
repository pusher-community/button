import os
from dotenv import load_dotenv
from os.path import *
dotenv_path = join(dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

import pygame
from time import sleep

import pusher

pusher_client = pusher.Pusher(
  app_id=os.environ['PUSHER_APP_ID'],
  key=os.environ['PUSHER_APP_KEY'],
  secret=os.environ['PUSHER_SECRET_KEY'],
  cluster=os.environ['PUSHER_CLUSTER'],
  ssl=True
)


class Button:

    def __init__(self, name):
        self.name = name
        self.last = False
        self.count = 0

    def update(self, state):

        state = bool(state)

        if self.last != state:
            print ">>", self.name, state

            if state:
                self.count = self.count + 1
                pusher_client.trigger(self.name, 'press', {'ref': self.count})
            else:
                pusher_client.trigger(self.name, 'release', {'ref': self.count})

            self.last = state



button = Button('button')


pygame.init()
pygame.joystick.init()

# joysticks = [pygame.joystick.Joystick(x) for x in range(pygame.joystick.get_count())]
# print joysticks

gamepad=pygame.joystick.Joystick(0)
gamepad.init()


try:
    while True:
        sleep(0.05)
        pygame.event.pump()
        button.update(gamepad.get_button(0))


except KeyboardInterrupt:
    pygame.quit()
