// Imports
import Konva from 'konva';
import Button from './Button';
import globals from './globals';
import * as hypothetical from './hypothetical';
import * as replay from './replay';
import Shuttle from './Shuttle';

export default (winW: number, winH: number) => {
    const replayAreaValues = {
        x: 0.15,
        y: 0.51,
        w: 0.5,
    };
    if (!globals.lobby.settings.get('keldonMode')) {
        replayAreaValues.x = 0.01;
        replayAreaValues.y = 0.49;
        replayAreaValues.w = 0.4;
    }

    globals.elements.replayArea = new Konva.Group({
        x: replayAreaValues.x * winW,
        y: replayAreaValues.y * winH,
        width: replayAreaValues.w * winW,
        height: 0.27 * winH,
    });

    // The thin black rectangle that the replay slider slides on
    const replayBarValues = {
        x: globals.lobby.settings.get('keldonMode') ? 0.01 : 0,
        y: 0.0425,
        w: globals.lobby.settings.get('keldonMode') ? 0.481 : replayAreaValues.w,
        h: 0.01,
    };
    globals.elements.replayBar = new Konva.Rect({
        x: replayBarValues.x * winW,
        y: replayBarValues.y * winH,
        width: replayBarValues.w * winW,
        height: replayBarValues.h * winH,
        fill: 'black',
        cornerRadius: 0.005 * winH,
    });
    globals.elements.replayArea.add(globals.elements.replayBar);

    // An invisible rectangle over the visible black rectangle above
    // (which is slightly bigger so that it is easier to click on)
    const replayBarClickRect = new Konva.Rect({
        x: replayBarValues.x * winW,
        y: 0,
        width: replayBarValues.w * winW,
        height: 0.05 * winH,
        opacity: 0,
        listening: true,
    });
    replayBarClickRect.on('click', replay.barClick as any);
    globals.elements.replayArea.add(replayBarClickRect);

    const shuttleValues = {
        w: 0.03,
        h: 0.03,
        cornerRadius: 0.01,
        stroke: 'black',
        scale: 0.75,
    };

    // The shared (white) replay shuttle
    // (we want it to be behind the normal replay shuttle, so we define it first)
    globals.elements.replayShuttleShared = new Shuttle({
        width: shuttleValues.w * winW,
        height: shuttleValues.h * winH,
        offset: {
            x: shuttleValues.w / 2 * winW,
            y: shuttleValues.h / 2 * winW,
        },
        cornerRadius: shuttleValues.cornerRadius * winW,
        fill: '#d1d1d1', // Gray
        stroke: shuttleValues.stroke,
        visible: !globals.useSharedTurns,
        listening: true,
    });
    globals.elements.replayShuttleShared.on('click tap', () => {
        // This is needed because the shared replay shuttle will block the replay bar
        replay.goto(globals.sharedReplayTurn, true);
    });
    globals.elements.replayArea.add(globals.elements.replayShuttleShared);

    // This is the normal (blue) replay shuttle
    globals.elements.replayShuttle = new Shuttle({
        width: shuttleValues.w * winW,
        height: shuttleValues.h * winH,
        offset: {
            x: shuttleValues.w / 2 * winW,
            y: shuttleValues.h / 2 * winW,
        },
        cornerRadius: shuttleValues.cornerRadius * winW,
        fill: '#0000cc', // Blue
        draggable: true,
        dragBoundFunc: replay.barDrag,
        stroke: shuttleValues.stroke,
        listening: true,
    });
    globals.elements.replayArea.add(globals.elements.replayShuttle);

    const replayButtonValues = {
        x: 0.05,
        y: 0.07,
        w: 0.06,
        h: 0.08,
        spacing: 0.02,
    };
    if (globals.lobby.settings.get('keldonMode')) {
        replayButtonValues.x = 0.1;
    }

    {
        let { x } = replayButtonValues;

        // Go back to the beginning (the left-most button)
        globals.elements.replayBackFullButton = new Button(
            {
                x: x * winW,
                y: 0.07 * winH,
                width: replayButtonValues.w * winW,
                height: replayButtonValues.h * winH,
            },
            [
                globals.ImageLoader!.get('replay-back-full')!,
                globals.ImageLoader!.get('replay-back-full-disabled')!,
            ],
        );
        globals.elements.replayBackFullButton!.on('click tap', replay.backFull);
        globals.elements.replayArea.add(globals.elements.replayBackFullButton as any);

        // Go back one turn (the second left-most button)
        x += replayButtonValues.w + replayButtonValues.spacing;
        globals.elements.replayBackButton = new Button(
            {
                x: x * winW,
                y: 0.07 * winH,
                width: replayButtonValues.w * winW,
                height: replayButtonValues.h * winH,
            },
            [
                globals.ImageLoader!.get('replay-back')!,
                globals.ImageLoader!.get('replay-back-disabled')!,
            ],
        );
        globals.elements.replayBackButton.on('click tap', () => {
            // Prevent accidental double clicks
            if (Date.now() - globals.UIClickTime < 50) {
                return;
            }
            globals.UIClickTime = Date.now();

            replay.back();
        });
        globals.elements.replayArea.add(globals.elements.replayBackButton as any);

        // Go forward one turn (the second right-most button)
        x += replayButtonValues.w + replayButtonValues.spacing;
        globals.elements.replayForwardButton = new Button(
            {
                x: x * winW,
                y: 0.07 * winH,
                width: replayButtonValues.w * winW,
                height: replayButtonValues.h * winH,
            },
            [
                globals.ImageLoader!.get('replay-forward')!,
                globals.ImageLoader!.get('replay-forward-disabled')!,
            ],
        );
        globals.elements.replayForwardButton.on('click tap', () => {
            // Prevent accidental double clicks
            if (Date.now() - globals.UIClickTime < 50) {
                return;
            }
            globals.UIClickTime = Date.now();

            replay.forward();
        });
        globals.elements.replayArea.add(globals.elements.replayForwardButton as any);

        // Go forward to the end (the right-most button)
        x += replayButtonValues.w + replayButtonValues.spacing;
        globals.elements.replayForwardFullButton = new Button(
            {
                x: x * winW,
                y: 0.07 * winH,
                width: replayButtonValues.w * winW,
                height: replayButtonValues.h * winH,
            },
            [
                globals.ImageLoader!.get('replay-forward-full')!,
                globals.ImageLoader!.get('replay-forward-full-disabled')!,
            ],
        );
        globals.elements.replayForwardFullButton.on('click tap', replay.forwardFull);
        globals.elements.replayArea.add(globals.elements.replayForwardFullButton as any);
    }

    // The "Exit Replay" button
    const bottomButtonValues = {
        y: 0.17,
    };
    globals.elements.replayExitButton = new Button({
        x: (replayButtonValues.x + replayButtonValues.w + (replayButtonValues.spacing / 2)) * winW,
        y: bottomButtonValues.y * winH,
        width: ((replayButtonValues.w * 2) + (replayButtonValues.spacing * 2)) * winW,
        height: replayButtonValues.w * winH,
        text: 'Exit Replay',
        visible: !globals.replay,
    }, []);
    globals.elements.replayExitButton.on('click tap', replay.exitButton);
    globals.elements.replayArea.add(globals.elements.replayExitButton as any);

    const extra = 0.05;
    const bottomLeftReplayButtonValues = {
        x: replayButtonValues.x - extra,
        y: bottomButtonValues.y,
        w: (replayButtonValues.w * 2) + replayButtonValues.spacing + extra,
        h: 0.06,
    };

    // The "Pause Shared Turns" button
    // (this will be shown when the client receives the "replayLeader" command)
    globals.elements.pauseSharedTurnsButton = new Button({
        width: bottomLeftReplayButtonValues.w * winW,
        height: bottomLeftReplayButtonValues.h * winH,
        text: 'Pause Shared Turns',
        visible: false,
    }, []);
    globals.elements.pauseSharedTurnsButton.on('click tap', replay.toggleSharedTurns);
    globals.elements.replayArea.add(globals.elements.pauseSharedTurnsButton as any);

    // The "Use Shared Turns" button
    // (this will be shown when the client receives the "replayLeader" command)
    globals.elements.useSharedTurnsButton = new Button({
        width: bottomLeftReplayButtonValues.w * winW,
        height: bottomLeftReplayButtonValues.h * winH,
        text: 'Use Shared Turns',
        visible: false,
    }, []);
    globals.elements.useSharedTurnsButton.on('click tap', replay.toggleSharedTurns);
    globals.elements.replayArea.add(globals.elements.useSharedTurnsButton as any);

    // The previous two buttons will be moved to the left for replay leaders and
    // centered for non-replay-leaders
    const totalWidth = (replayButtonValues.w * 4) + (replayButtonValues.spacing * 3);
    function setCenter(this: Button) {
        const x = replayButtonValues.x + ((totalWidth - bottomLeftReplayButtonValues.w) / 2);
        this.x(x * winW);
        this.y(bottomLeftReplayButtonValues.y * winH);
    }
    function setLeft(this: Button) {
        this.x(bottomLeftReplayButtonValues.x * winW);
        this.y(bottomLeftReplayButtonValues.y * winH);
    }
    (globals.elements.pauseSharedTurnsButton as any).setCenter = setCenter;
    (globals.elements.pauseSharedTurnsButton as any).setLeft = setLeft;
    (globals.elements.useSharedTurnsButton as any).setCenter = setCenter;
    (globals.elements.useSharedTurnsButton as any).setLeft = setLeft;

    const bottomRightReplayButtonValues = {
        x: replayButtonValues.x + (replayButtonValues.w * 2) + (replayButtonValues.spacing * 2),
        y: bottomLeftReplayButtonValues.y,
        w: bottomLeftReplayButtonValues.w,
        h: bottomLeftReplayButtonValues.h,
    };

    // The "Enter Hypothetical" button
    globals.elements.enterHypoButton = new Button({
        x: bottomRightReplayButtonValues.x * winW,
        y: bottomRightReplayButtonValues.y * winH,
        width: bottomRightReplayButtonValues.w * winW,
        height: bottomRightReplayButtonValues.h * winH,
        text: 'Enter Hypothetical',
        visible: globals.replay && globals.amSharedReplayLeader && !globals.hypothetical,
    }, []);
    globals.elements.enterHypoButton.on('click tap', hypothetical.start);
    globals.elements.replayArea.add(globals.elements.enterHypoButton as any);

    // Add the replay area to the UI
    globals.elements.replayArea.hide();
    globals.layers.get('UI')!.add(globals.elements.replayArea);
    replay.adjustShuttles(true);
};
