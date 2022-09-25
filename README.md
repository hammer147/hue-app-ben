# How to run Scheduled tasks in Windows to control Hue lights via Node.js scripts on a LAN

## Stuff needed

- a Philips Hue Bridge
- some compatible Philips Hue lights

## Standard setup

- Install your lights and make sure you can control them via the official [Philips Hue mobile app](https://play.google.com/store/apps/details?id=com.philips.lighting.hue2&hl=en).

## Find your Bridge IP address

1. In the mobile app, go to settings > My Hue system > HUE BRIDGES > Philips hue > IP-address (e.g. 192.168.x.xxx).
2. In the root of the project, create a .env file and add: BRIDGE_IP_ADDRESS='192.168.x.xxx'

## Generate a hue-application-key

1. In your .env file, add: APP_NAME='app_name#instance_name' (change to your actual app name, any string is fine).
2. Press the link button on your Hue Bridge
3. Open a terminal and run the following command:

    ```console
    node generate-key.mjs
    ```

4. The response should contain 2 keys: a username and a clientkey. If not, make sure not to wait too long between step 2 and 3.
5. In your .env file, add: HUE_APPLICATION_KEY='xxx' (change xxx to the username, NOT the clientkey).

## Find the id's of your lights

1. Run the following command:

    ```console
    node get-info.mjs
    ```

2. The response is an array of lights. Each light has an id. (it might also have a legacy id_v1 that we will not use)
3. In your .env file, add: LIGHT_1_ID='xxx', LIGHT_2_ID='xxx', etc. (change xxx to the id, NOT the id_v1).

## Change the state of the lights

At this point, we are ready to change the state of the lights.
Let's have a look at the code in **change-state.mjs**. We send a put request to one of our lights (the id of the light is in the url).
The state we are sending is defined in the body of the put request, e.g.

```js
const body = {
  on: { on: true },
  dimming: { brightness: 100 },
  color: { xy: { x: 0.20, y: 0.50 } },
}
```

### on

The on field speaks for itself, it can be true or false.
Note however, that it is *only* needed if you actually want to turn the light on or off (i.e. *change* the on/off state).
If a light is *already on* and you just want to change the color, it is recommended to omit the on field as unnecessary info slows down the bridge.

### dimming

The brightness can be any number between 0 and 100.

### color

The color is defined by x and y coordinates on the [CIE 1931 color space](https://sites.ecse.rpi.edu/~schubert/Light-Emitting-Diodes-dot-org/chap17/F17-04%20Chromaticity%20diagram.jpg).

Try and change some values and run the script.

```console
node change-state.mjs
```

## Run scripts as scheduled tasks (Windows 10)

It can be very useful to run scripts on a schedule. On Windows, this is very easy. Just open Task Scheduler, create a new task and fill in the options, [here is an example](task-scheduler-example.png).
