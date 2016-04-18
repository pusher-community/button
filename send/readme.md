# Actual Buttons

This is the source for the actual physical buttons.  There might be a few ways to do this

### Python + usb gamepad

Using the first button on a usb gamepad. Might be good for raspberry pi scripts.

* [pygame](https://bitbucket.org/pygame/pygame/issues/82/homebrew-on-leopard-fails-to-install#comment-627494)
* pip install -U python-dotenv
* pip install pusher

```bash
python button.py
```


### Node/browser + usb gamepad

(todo)

Probably a good fallback if network is hard to set up on the pi. Use webGamepads because it seems more stable than other node libraries
