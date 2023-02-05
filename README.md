# Instant-Slideshow
Small web-based slideshow tool that allows attendants of an event to upload images to the slideshow while it is running.

I coded this about a week before my brothers wedding so we could use it there. Providing the guests with an option to easily add images they take with their smartphones to the slideshow has the added bonus effect that you have all these photos after the event stored in a single location for easy download.

This is definitely not the most secure application ever and I highly discourage the use on public events. Only set this up to use with your friends.

Another possible use-case for this is to open the slideshow on a tablet or TV in your home, hide all controls and the qr code and run it as a digital picture frame.

## Setup
Just upload the whole project to a folder on your webserver. PHP is required.

To add a new slideshow just create a folder under uploads/. After that you can run your new slideshow by opening `show.html#SLIDESHOWNAME` in a browser, where SLIDESHOWNAME is the name of your newly created folder. The QR code provided your guests will point to `index.php#SLIDESHOWNAME`.

## Usage
### Slideshow Monitor
Open `show.html#SLIDESHOWNAME` in a browser and set it to fullscreen on the monitor where the slideshow shall be run. To control the slideshow you can use the following keyboard-controls:
- Left / Down: next image
- Right / Up: previous image
- Space: Play / Pause
- W: Toggles display of the control buttons
- Q: Toggles display of the QR Code
- Escape: Toggles display of the menu

In the menu you can control the following options:
- Blending Animation On / Off
- Shuffle On / Off
- Display Duration for each image in seconds

### Clients
Open `index.php#SLIDESHOWNAME` on a client or scan the provided QR code on the slideshow to open the uploader. Your guests can upload new images here, upload of multiple images at the same time is supported. Once the images have been uploaded they will be shown to the users under the upload form.

Users can click an image to show a dialog which asks them if they want to delete the image.

## Limitations
The applications UI is in german.

## Credits
- [QRious](https://github.com/neocotic/qrious)
- Theme: [Start Bootstrap - Freelancer v7.0.6](https://startbootstrap.com/theme/freelancer)
  - [Bootstrap](https://getbootstrap.com/docs/4.3/getting-started/introduction/) 5.1.3
  - [fontawesome](https://fontawesome.com/) 6.1.0

In the source code these resources are loaded from my own server on https://res.merlindenker.de to avoid content-delivery-networks collecting data. I recommend to host these yourself and embed them from your server.

## License
This code is freely distributable under the terms of the [MIT license](LICENSE).