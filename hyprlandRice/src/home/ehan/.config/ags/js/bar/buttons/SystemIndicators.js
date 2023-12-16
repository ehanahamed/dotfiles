import HoverRevealer from '../../misc/HoverRevealer.js';
import PanelButton from '../PanelButton.js';
import Asusctl from '../../services/asusctl.js';
import Indicator from '../../services/onScreenIndicator.js';
import icons from '../../icons.js';
import { App, Widget } from '../../imports.js';
import { Bluetooth, Audio, Notifications, Network } from '../../imports.js';
import Brightness from '../../services/brightness.js';

const ProfileIndicator = () => Widget.Icon({
    connections: [[Asusctl, icon => {
        icon.visible = Asusctl.profile !== 'Balanced';
        icon.icon = icons.asusctl.profile[Asusctl.profile];
    }]],
});

const ModeIndicator = () => Widget.Icon({
    connections: [[Asusctl, icon => {
        icon.visible = Asusctl.mode !== 'Hybrid';
        icon.icon = icons.asusctl.mode[Asusctl.mode];
    }]],
});

const MicrophoneIndicator = () => Widget.Icon({
    connections: [[Audio, icon => {
        if (!Audio.microphone)
            return;

        const { muted, low, medium, high } = icons.audio.mic;
        if (Audio.microphone.isMuted)
            return icon.icon = muted;

        icon.icon = [[67, high], [34, medium], [1, low], [0, muted]]
            .find(([threshold]) => threshold <= Audio.microphone.volume * 100)[1];

        icon.visible = Audio.recorders.length > 0 || Audio.microphone.isMuted;
    }]],
});

const MicrophoneLabel = () => Widget.Label({
    connections: [[Audio, self => {
        self.label = `${Math.round(Audio.microphone.volume * 100)}%`
    }]],
});

const DNDIndicator = () => Widget.Icon({
    icon: icons.notifications.silent,
    binds: [['visible', Notifications, 'dnd']],
});

const BluetoothDevicesIndicator = () => Widget.Box({
    connections: [[Bluetooth, box => {
        box.children = Bluetooth.connectedDevices
            .map(({ iconName, name }) => HoverRevealer({
                indicator: Widget.Icon(iconName + '-symbolic'),
                child: Widget.Label(name),
            }));

        box.visible = Bluetooth.connectedDevices.length > 0;
    }, 'notify::connected-devices']],
});

const BluetoothIndicator = () => Widget.Icon({
    className: 'bluetooth',
    icon: icons.bluetooth.enabled,
    binds: [['visible', Bluetooth, 'enabled']],
});

const NetworkIndicator = () => Widget.Stack({
    items: [
        ['wifi', Widget.Icon({
            connections: [[Network, icon => {
                icon.icon = Network.wifi?.iconName;
            }]],
        })],
        ['wired', Widget.Icon({
            connections: [[Network, icon => {
                icon.icon = Network.wired?.iconName;
            }]],
        })],
    ],
    binds: [['shown', Network, 'primary']],
});

const AudioIndicator = () => Widget.Icon({
    connections: [[Audio, icon => {
        if (!Audio.speaker)
            return;

        const { muted, low, medium, high, overamplified } = icons.audio.volume;
        if (Audio.speaker.isMuted)
            return icon.icon = muted;

        icon.icon = [[101, overamplified], [67, high], [34, medium], [1, low], [0, muted]]
            .find(([threshold]) => threshold <= Audio.speaker.volume * 100)[1];
    }, 'speaker-changed']],
});

const AudioLabel = () => Widget.Label({
    className: "audio-label",
    connections: [[Audio, self => {
        // Audio.speaker and Audio.microphone can be undefined
        // to workaround this use the ? chain operator
        self.label = `${Math.round(Audio.speaker.volume * 100)}%`
    }, 'speaker-changed']],
});

const BrightnessIndicator = () => Widget.Icon({
    icon: icons.brightness.screen
})

const BrightnessLabel = () => Widget.Label({
    connections: [[Brightness, self => {
        self.label = `${Math.round(Brightness.screen * 100)}%`
    }]]
})

export default () => PanelButton({
    className: 'quicksettings panel-button',
    onClicked: () => App.toggleWindow('quicksettings'),
    onScrollUp: () => {
        Audio.speaker.volume += 0.02;
        Indicator.speaker();
    },
    onScrollDown: () => {
        Audio.speaker.volume -= 0.02;
        Indicator.speaker();
    },
    connections: [[App, (btn, win, visible) => {
        btn.toggleClassName('active', win === 'quicksettings' && visible);
    }]],
    child: Widget.Box({
        children: [
            Asusctl?.available && ProfileIndicator(),
            Asusctl?.available && ModeIndicator(),
            BrightnessIndicator(),
            BrightnessLabel(),
            AudioIndicator(),
            AudioLabel(),
            MicrophoneIndicator(),
            MicrophoneLabel(),
            BluetoothIndicator(),
            NetworkIndicator(),
        ],
    }),
});