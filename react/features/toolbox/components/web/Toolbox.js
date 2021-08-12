// @flow

import React, { Component } from 'react';

import keyboardShortcut from '../../../../../modules/keyboardshortcut/keyboardshortcut';
import {
    ACTION_SHORTCUT_TRIGGERED,
    createShortcutEvent,
    createToolbarEvent,
    sendAnalytics
} from '../../../analytics';
import { getToolbarButtons } from '../../../base/config';
import { isToolbarButtonEnabled } from '../../../base/config/functions.web';
import { openDialog, toggleDialog } from '../../../base/dialog';
import { isMobileBrowser } from '../../../base/environment/utils';
import { translate } from '../../../base/i18n';
import JitsiMeetJS from '../../../base/lib-jitsi-meet';
import {
    getLocalParticipant,
    haveParticipantWithScreenSharingFeature,
    raiseHand
} from '../../../base/participants';
import { connect } from '../../../base/redux';
import { getLocalVideoTrack } from '../../../base/tracks';
import { toggleChat } from '../../../chat';
import { ChatButton } from '../../../chat/components';
import { DominantSpeakerName } from '../../../display-name';
import { EmbedMeetingButton } from '../../../embed-meeting';
import { SharedDocumentButton } from '../../../etherpad';
import { FeedbackButton } from '../../../feedback';
import { isVpaasMeeting } from '../../../jaas/functions';
import { KeyboardShortcutsButton } from '../../../keyboard-shortcuts';
import { LocalRecordingButton } from '../../../local-recording';
import {
    close as closeParticipantsPane,
    open as openParticipantsPane
} from '../../../participants-pane/actions';
import ParticipantsPaneButton from '../../../participants-pane/components/ParticipantsPaneButton';
import { getParticipantsPaneOpen } from '../../../participants-pane/functions';
import { addReactionToBuffer } from '../../../reactions/actions.any';
import { ReactionsMenuButton } from '../../../reactions/components';
import { REACTIONS } from '../../../reactions/constants';
import {
    LiveStreamButton,
    RecordButton
} from '../../../recording';
import {
    isScreenAudioSupported,
    isScreenVideoShared,
    ShareAudioButton,
    startScreenShareFlow
} from '../../../screen-share/';
import SecurityDialogButton from '../../../security/components/security-dialog/SecurityDialogButton';
import { SettingsButton } from '../../../settings';
import { SharedVideoButton } from '../../../shared-video/components';
import { SpeakerStatsButton } from '../../../speaker-stats';
import {
    ClosedCaptionButton
} from '../../../subtitles';
import {
    TileViewButton,
    shouldDisplayTileView,
    toggleTileView
} from '../../../video-layout';
import { VideoQualityDialog, VideoQualityButton } from '../../../video-quality/components';
import { VideoBackgroundButton } from '../../../virtual-background';
import { toggleBackgroundEffect } from '../../../virtual-background/actions';
import { VIRTUAL_BACKGROUND_TYPE } from '../../../virtual-background/constants';
import { checkBlurSupport } from '../../../virtual-background/functions';
import {
    setFullScreen,
    setOverflowMenuVisible,
    setToolbarHovered,
    showToolbox
} from '../../actions';
import { THRESHOLDS, NOT_APPLICABLE } from '../../constants';
import { isToolboxVisible } from '../../functions';
import DownloadButton from '../DownloadButton';
import HangupButton from '../HangupButton';
import HelpButton from '../HelpButton';
import MuteEveryoneButton from '../MuteEveryoneButton';
import MuteEveryonesVideoButton from '../MuteEveryonesVideoButton';
import KickEveryoneButton from './KickEveryoneButton';
import AudioSettingsButton from './AudioSettingsButton';
import FullscreenButton from './FullscreenButton';
import OverflowMenuButton from './OverflowMenuButton';
import ProfileButton from './ProfileButton';
import RaiseHandButton from './RaiseHandButton';
import Separator from './Separator';
import ShareDesktopButton from './ShareDesktopButton';
import ToggleCameraButton from './ToggleCameraButton';
import VideoSettingsButton from './VideoSettingsButton';

/**
 * The type of the React {@code Component} props of {@link Toolbox}.
 */
type Props = {

    /**
     * String showing if the virtual background type is desktop-share.
     */
    _backgroundType: String,

    /**
     * Whether or not the chat feature is currently displayed.
     */
    _chatOpen: boolean,

    /**
     * The width of the client.
     */
    _clientWidth: number,

    /**
     * The {@code JitsiConference} for the current conference.
     */
    _conference: Object,

    /**
     * The tooltip key to use when screensharing is disabled. Or undefined
     * if non to be shown and the button to be hidden.
     */
    _desktopSharingDisabledTooltipKey: boolean,

    /**
     * Whether or not screensharing is initialized.
     */
    _desktopSharingEnabled: boolean,

    /**
     * Whether or not a dialog is displayed.
     */
    _dialog: boolean,

    /**
     * Whether or not call feedback can be sent.
     */
    _feedbackConfigured: boolean,

    /**
     * Whether or not the app is currently in full screen.
     */
    _fullScreen: boolean,

    /**
     * Whether or not the app is running in mobile browser.
     */
    _isMobile: boolean,

    /**
     * Whether or not the profile is disabled.
     */
    _isProfileDisabled: boolean,

    /**
     * Whether or not the tile view is enabled.
     */
    _tileViewEnabled: boolean,

    /**
     * Whether or not the current meeting belongs to a JaaS user.
     */
    _isVpaasMeeting: boolean,

    /**
     * The ID of the local participant.
     */
    _localParticipantID: String,

    /**
     * The JitsiLocalTrack to display.
     */
    _localVideo: Object,

    /**
     * Whether or not the overflow menu is visible.
     */
    _overflowMenuVisible: boolean,

    /**
     * Whether or not the participants pane is open.
     */
    _participantsPaneOpen: boolean,

    /**
     * Whether or not the local participant's hand is raised.
     */
    _raisedHand: boolean,

    /**
     * Whether or not the local participant is screenSharing.
     */
    _screenSharing: boolean,

    /**
     * Whether or not the local participant is sharing a YouTube video.
     */
    _sharingVideo: boolean,

    /**
     * The enabled buttons.
     */
    _toolbarButtons: Array<string>,

    /**
     * Flag showing whether toolbar is visible.
     */
    _visible: boolean,

    /**
     * Array with the buttons which this Toolbox should display.
     */
    _visibleButtons: Array<string>,

    /**
     * Returns the selected virtual source object.
     */
    _virtualSource: Object,

    /**
     * Whether or not reactions feature is enabled.
     */
    _reactionsEnabled: boolean,

    /**
     * Invoked to active other features of the app.
     */
    dispatch: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

declare var APP: Object;

/**
 * Implements the conference toolbox on React/Web.
 *
 * @extends Component
 */
class Toolbox extends Component<Props> {
    /**
     * Initializes a new {@code Toolbox} instance.
     *
     * @param {Props} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onMouseOut = this._onMouseOut.bind(this);
        this._onMouseOver = this._onMouseOver.bind(this);
        this._onSetOverflowVisible = this._onSetOverflowVisible.bind(this);
        this._onTabIn = this._onTabIn.bind(this);

        this._onShortcutToggleChat = this._onShortcutToggleChat.bind(this);
        this._onShortcutToggleFullScreen = this._onShortcutToggleFullScreen.bind(this);
        this._onShortcutToggleParticipantsPane = this._onShortcutToggleParticipantsPane.bind(this);
        this._onShortcutToggleRaiseHand = this._onShortcutToggleRaiseHand.bind(this);
        this._onShortcutToggleScreenshare = this._onShortcutToggleScreenshare.bind(this);
        this._onShortcutToggleVideoQuality = this._onShortcutToggleVideoQuality.bind(this);
        this._onToolbarToggleParticipantsPane = this._onToolbarToggleParticipantsPane.bind(this);
        this._onToolbarOpenVideoQuality = this._onToolbarOpenVideoQuality.bind(this);
        this._onToolbarToggleChat = this._onToolbarToggleChat.bind(this);
        this._onToolbarToggleFullScreen = this._onToolbarToggleFullScreen.bind(this);
        this._onToolbarToggleRaiseHand = this._onToolbarToggleRaiseHand.bind(this);
        this._onToolbarToggleScreenshare = this._onToolbarToggleScreenshare.bind(this);
        this._onShortcutToggleTileView = this._onShortcutToggleTileView.bind(this);
        this._onEscKey = this._onEscKey.bind(this);
    }

    /**
     * Sets keyboard shortcuts for to trigger ToolbarButtons actions.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        const { _toolbarButtons, t, dispatch, _reactionsEnabled } = this.props;
        const KEYBOARD_SHORTCUTS = [
            isToolbarButtonEnabled('videoquality', _toolbarButtons) && {
                character: 'A',
                exec: this._onShortcutToggleVideoQuality,
                helpDescription: 'toolbar.callQuality'
            },
            isToolbarButtonEnabled('chat', _toolbarButtons) && {
                character: 'C',
                exec: this._onShortcutToggleChat,
                helpDescription: 'keyboardShortcuts.toggleChat'
            },
            isToolbarButtonEnabled('desktop', _toolbarButtons) && {
                character: 'D',
                exec: this._onShortcutToggleScreenshare,
                helpDescription: 'keyboardShortcuts.toggleScreensharing'
            },
            isToolbarButtonEnabled('participants-pane', _toolbarButtons) && {
                character: 'P',
                exec: this._onShortcutToggleParticipantsPane,
                helpDescription: 'keyboardShortcuts.toggleParticipantsPane'
            },
            isToolbarButtonEnabled('raisehand', _toolbarButtons) && {
                character: 'R',
                exec: this._onShortcutToggleRaiseHand,
                helpDescription: 'keyboardShortcuts.raiseHand'
            },
            isToolbarButtonEnabled('fullscreen', _toolbarButtons) && {
                character: 'S',
                exec: this._onShortcutToggleFullScreen,
                helpDescription: 'keyboardShortcuts.fullScreen'
            },
            isToolbarButtonEnabled('tileview', _toolbarButtons) && {
                character: 'W',
                exec: this._onShortcutToggleTileView,
                helpDescription: 'toolbar.tileViewToggle'
            }
        ];

        KEYBOARD_SHORTCUTS.forEach(shortcut => {
            if (typeof shortcut === 'object') {
                APP.keyboardshortcut.registerShortcut(
                    shortcut.character,
                    null,
                    shortcut.exec,
                    shortcut.helpDescription);
            }
        });

        if (_reactionsEnabled) {
            const REACTION_SHORTCUTS = Object.keys(REACTIONS).map(key => {
                const onShortcutSendReaction = () => {
                    dispatch(addReactionToBuffer(key));
                    sendAnalytics(createShortcutEvent(
                        `reaction.${key}`
                    ));
                };

                return {
                    character: REACTIONS[key].shortcutChar,
                    exec: onShortcutSendReaction,
                    helpDescription: t(`toolbar.reaction${key.charAt(0).toUpperCase()}${key.slice(1)}`),
                    altKey: true
                };
            });

            REACTION_SHORTCUTS.forEach(shortcut => {
                APP.keyboardshortcut.registerShortcut(
                    shortcut.character,
                    null,
                    shortcut.exec,
                    shortcut.helpDescription,
                    shortcut.altKey);
            });
        }
    }

    /**
     * Update the visibility of the {@code OverflowMenuButton}.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        // Ensure the dialog is closed when the toolbox becomes hidden.
        if (prevProps._overflowMenuVisible && !this.props._visible) {
            this._onSetOverflowVisible(false);
        }

        if (prevProps._overflowMenuVisible
            && !prevProps._dialog
            && this.props._dialog) {
            this._onSetOverflowVisible(false);
            this.props.dispatch(setToolbarHovered(false));
        }
    }

    /**
     * Removes keyboard shortcuts registered by this component.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentWillUnmount() {
        [ 'A', 'C', 'D', 'R', 'S' ].forEach(letter =>
            APP.keyboardshortcut.unregisterShortcut(letter));

        if (this.props._reactionsEnabled) {
            Object.keys(REACTIONS).map(key => REACTIONS[key].shortcutChar)
                .forEach(letter =>
                    APP.keyboardshortcut.unregisterShortcut(letter, true));
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _chatOpen, _visible, _visibleButtons } = this.props;
        const rootClassNames = `new-toolbox ${_visible ? 'visible' : ''} ${
            _visibleButtons.length ? '' : 'no-buttons'} ${_chatOpen ? 'shift-right' : ''}`;

        return (
            <div
                className = { rootClassNames }
                id = 'new-toolbox'>
                { this._renderToolboxContent() }
            </div>
        );
    }

    _onEscKey: (KeyboardEvent) => void;

    /**
     * Key handler for overflow menu.
     *
     * @param {KeyboardEvent} e - Esc key click to close the popup.
     * @returns {void}
     */
    _onEscKey(e) {
        if (e.key === 'Escape') {
            e.stopPropagation();
            this._closeOverflowMenuIfOpen();
        }
    }

    /**
     * Closes the overflow menu if opened.
     *
     * @private
     * @returns {void}
     */
    _closeOverflowMenuIfOpen() {
        const { dispatch, _overflowMenuVisible } = this.props;

        _overflowMenuVisible && dispatch(setOverflowMenuVisible(false));
    }

    /**
     * Dispatches an action to open the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _doOpenVideoQuality() {
        this.props.dispatch(openDialog(VideoQualityDialog));
    }

    /**
     * Dispatches an action to toggle the display of chat.
     *
     * @private
     * @returns {void}
     */
    _doToggleChat() {
        this.props.dispatch(toggleChat());
    }

    /**
     * Dispatches an action to toggle screensharing.
     *
     * @private
     * @returns {void}
     */
    _doToggleFullScreen() {
        const fullScreen = !this.props._fullScreen;

        this.props.dispatch(setFullScreen(fullScreen));
    }

    /**
     * Dispatches an action to toggle the local participant's raised hand state.
     *
     * @private
     * @returns {void}
     */
    _doToggleRaiseHand() {
        const { _localParticipantID, _raisedHand } = this.props;
        const newRaisedStatus = !_raisedHand;

        this.props.dispatch(raiseHand(newRaisedStatus));

        APP.API.notifyRaiseHandUpdated(_localParticipantID, newRaisedStatus);
    }

    /**
     * Dispatches an action to toggle screensharing.
     *
     * @private
     * @param {boolean} enabled - The state to toggle screen sharing to.
     * @param {boolean} audioOnly - Only share system audio.
     * @returns {void}
     */
    _doToggleScreenshare() {
        const {
            _backgroundType,
            _desktopSharingEnabled,
            _localVideo,
            _virtualSource,
            dispatch
        } = this.props;

        if (_backgroundType === VIRTUAL_BACKGROUND_TYPE.DESKTOP_SHARE) {
            const noneOptions = {
                enabled: false,
                backgroundType: VIRTUAL_BACKGROUND_TYPE.NONE,
                selectedThumbnail: VIRTUAL_BACKGROUND_TYPE.NONE,
                backgroundEffectEnabled: false
            };

            _virtualSource.dispose();

            dispatch(toggleBackgroundEffect(noneOptions, _localVideo));

            return;
        }

        if (_desktopSharingEnabled) {
            dispatch(startScreenShareFlow());
        }
    }

    /**
     * Dispatches an action to toggle the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _doToggleVideoQuality() {
        this.props.dispatch(toggleDialog(VideoQualityDialog));
    }

    /**
     * Dispaches an action to toggle tile view.
     *
     * @private
     * @returns {void}
     */
    _doToggleTileView() {
        this.props.dispatch(toggleTileView());
    }

    /**
     * Returns all buttons that could be rendered.
     *
     * @param {Object} state - The redux state.
     * @returns {Object} The button maps mainMenuButtons and overflowMenuButtons.
     */
    _getAllButtons() {
        const {
            _feedbackConfigured,
            _isMobile,
            _screenSharing,
            _reactionsEnabled
        } = this.props;

        const microphone = {
            key: 'microphone',
            Content: AudioSettingsButton,
            group: 0
        };

        const camera = {
            key: 'camera',
            Content: VideoSettingsButton,
            group: 0
        };

        const profile = this._isProfileVisible() && {
            key: 'profile',
            Content: ProfileButton,
            group: 1
        };

        const chat = {
            key: 'chat',
            Content: ChatButton,
            handleClick: this._onToolbarToggleChat,
            group: 2
        };

        const desktop = this._showDesktopSharingButton() && {
            key: 'desktop',
            Content: ShareDesktopButton,
            handleClick: this._onToolbarToggleScreenshare,
            group: 2
        };

        const raisehand = {
            key: 'raisehand',
            Content: _reactionsEnabled ? ReactionsMenuButton : RaiseHandButton,
            handleClick: _reactionsEnabled ? null : this._onToolbarToggleRaiseHand,
            group: 2
        };

        const participants = {
            key: 'participants-pane',
            alias: 'invite',
            Content: ParticipantsPaneButton,
            handleClick: this._onToolbarToggleParticipantsPane,
            group: 2
        };

        const tileview = {
            key: 'tileview',
            Content: TileViewButton,
            group: 2
        };

        const toggleCamera = {
            key: 'toggle-camera',
            Content: ToggleCameraButton,
            group: 2
        };

        const videoQuality = {
            key: 'videoquality',
            Content: VideoQualityButton,
            handleClick: this._onToolbarOpenVideoQuality,
            group: 2
        };

        const fullscreen = !_isMobile && {
            key: 'fullscreen',
            Content: FullscreenButton,
            handleClick: this._onToolbarToggleFullScreen,
            group: 2
        };

        const security = {
            key: 'security',
            alias: 'info',
            Content: SecurityDialogButton,
            group: 2
        };

        const cc = {
            key: 'closedcaptions',
            Content: ClosedCaptionButton,
            group: 2
        };

        const recording = {
            key: 'recording',
            Content: RecordButton,
            group: 2
        };

        const localRecording = {
            key: 'localrecording',
            Content: LocalRecordingButton,
            group: 2
        };

        const livestreaming = {
            key: 'livestreaming',
            Content: LiveStreamButton,
            group: 2
        };

        const muteEveryone = {
            key: 'mute-everyone',
            Content: MuteEveryoneButton,
            group: 2
        };

        const muteVideoEveryone = {
            key: 'mute-video-everyone',
            Content: MuteEveryonesVideoButton,
            group: 2
        };

        const shareVideo = {
            key: 'sharedvideo',
            Content: SharedVideoButton,
            group: 3
        };

        const shareAudio = this._showAudioSharingButton() && {
            key: 'shareaudio',
            Content: ShareAudioButton,
            group: 3
        };

        const etherpad = {
            key: 'etherpad',
            Content: SharedDocumentButton,
            group: 3
        };

        const virtualBackground = !_screenSharing && checkBlurSupport() && {
            key: 'select-background',
            Content: VideoBackgroundButton,
            group: 3
        };

        const speakerStats = {
            key: 'stats',
            Content: SpeakerStatsButton,
            group: 3
        };

        const settings = {
            key: 'settings',
            Content: SettingsButton,
            group: 4
        };

        const shortcuts = !_isMobile && keyboardShortcut.getEnabled() && {
            key: 'shortcuts',
            Content: KeyboardShortcutsButton,
            group: 4
        };

        const embed = this._isEmbedMeetingVisible() && {
            key: 'embedmeeting',
            Content: EmbedMeetingButton,
            group: 4
        };

        const feedback = _feedbackConfigured && {
            key: 'feedback',
            Content: FeedbackButton,
            group: 4
        };

        const download = {
            key: 'download',
            Content: DownloadButton,
            group: 4
        };

        const help = {
            key: 'help',
            Content: HelpButton,
            group: 4
        };

        return {
            microphone,
            camera,
            profile,
            desktop,
            chat,
            raisehand,
            participants,
            tileview,
            toggleCamera,
            videoQuality,
            fullscreen,
            security,
            cc,
            recording,
            localRecording,
            livestreaming,
            muteEveryone,
            muteVideoEveryone,
            shareVideo,
            shareAudio,
            etherpad,
            virtualBackground,
            speakerStats,
            settings,
            shortcuts,
            embed,
            feedback,
            download,
            help
        };
    }

    /**
     * Returns all buttons that need to be rendered.
     *
     * @param {Object} state - The redux state.
     * @returns {Object} The visible buttons arrays .
     */
    _getVisibleButtons() {
        const {
            _clientWidth,
            _toolbarButtons
        } = this.props;


        const buttons = this._getAllButtons();
        const isHangupVisible = isToolbarButtonEnabled('hangup', _toolbarButtons);
        const { order } = THRESHOLDS.find(({ width }) => _clientWidth > width)
            || THRESHOLDS[THRESHOLDS.length - 1];
        let sliceIndex = order.length + 2;

        const keys = Object.keys(buttons);

        const filtered = [
            ...order.map(key => buttons[key]),
            ...Object.values(buttons).filter((button, index) => !order.includes(keys[index]))
        ].filter(Boolean).filter(({ key, alias = NOT_APPLICABLE }) =>
            isToolbarButtonEnabled(key, _toolbarButtons) || isToolbarButtonEnabled(alias, _toolbarButtons));

        if (isHangupVisible) {
            sliceIndex -= 1;
        }

        // This implies that the overflow button will be displayed, so save some space for it.
        if (sliceIndex < filtered.length) {
            sliceIndex -= 1;
        }

        return {
            mainMenuButtons: filtered.slice(0, sliceIndex),
            overflowMenuButtons: filtered.slice(sliceIndex)
        };
    }

    _onMouseOut: () => void;

    /**
     * Dispatches an action signaling the toolbar is not being hovered.
     *
     * @private
     * @returns {void}
     */
    _onMouseOut() {
        this.props.dispatch(setToolbarHovered(false));
    }

    _onMouseOver: () => void;

    /**
     * Dispatches an action signaling the toolbar is being hovered.
     *
     * @private
     * @returns {void}
     */
    _onMouseOver() {
        this.props.dispatch(setToolbarHovered(true));
    }


    _onSetOverflowVisible: (boolean) => void;

    /**
     * Sets the visibility of the overflow menu.
     *
     * @param {boolean} visible - Whether or not the overflow menu should be
     * displayed.
     * @private
     * @returns {void}
     */
    _onSetOverflowVisible(visible) {
        this.props.dispatch(setOverflowMenuVisible(visible));
    }

    _onShortcutToggleChat: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling the display of chat.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleChat() {
        sendAnalytics(createShortcutEvent(
            'toggle.chat',
            {
                enable: !this.props._chatOpen
            }));

        // Checks if there was any text selected by the user.
        // Used for when we press simultaneously keys for copying
        // text messages from the chat board
        if (window.getSelection().toString() !== '') {
            return false;
        }

        this._doToggleChat();
    }

    _onShortcutToggleParticipantsPane: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling the display of the participants pane.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleParticipantsPane() {
        sendAnalytics(createShortcutEvent(
            'toggle.participants-pane',
            {
                enable: !this.props._participantsPaneOpen
            }));

        this._onToolbarToggleParticipantsPane();
    }

    _onShortcutToggleVideoQuality: () => void;

    /**
    * Creates an analytics keyboard shortcut event and dispatches an action for
    * toggling the display of Video Quality.
    *
    * @private
    * @returns {void}
    */
    _onShortcutToggleVideoQuality() {
        sendAnalytics(createShortcutEvent('video.quality'));

        this._doToggleVideoQuality();
    }

    _onShortcutToggleTileView: () => void;

    /**
     * Dispatches an action for toggling the tile view.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleTileView() {
        sendAnalytics(createShortcutEvent(
            'toggle.tileview',
            {
                enable: !this.props._tileViewEnabled
            }));

        this._doToggleTileView();
    }

    _onShortcutToggleFullScreen: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling full screen mode.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleFullScreen() {
        sendAnalytics(createShortcutEvent(
            'toggle.fullscreen',
            {
                enable: !this.props._fullScreen
            }));

        this._doToggleFullScreen();
    }

    _onShortcutToggleRaiseHand: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling raise hand.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleRaiseHand() {
        sendAnalytics(createShortcutEvent(
            'toggle.raise.hand',
            ACTION_SHORTCUT_TRIGGERED,
            { enable: !this.props._raisedHand }));

        this._doToggleRaiseHand();
    }

    _onShortcutToggleScreenshare: () => void;

    /**
     * Creates an analytics keyboard shortcut event and dispatches an action for
     * toggling screensharing.
     *
     * @private
     * @returns {void}
     */
    _onShortcutToggleScreenshare() {
        sendAnalytics(createShortcutEvent(
                'toggle.screen.sharing',
                ACTION_SHORTCUT_TRIGGERED,
                {
                    enable: !this.props._screenSharing
                }));

        this._doToggleScreenshare();
    }

    _onTabIn: () => void;

    /**
     * Toggle the toolbar visibility when tabbing into it.
     *
     * @returns {void}
     */
    _onTabIn() {
        if (!this.props._visible) {
            this.props.dispatch(showToolbox());
        }
    }
    _onToolbarToggleParticipantsPane: () => void;

    /**
     * Dispatches an action for toggling the participants pane.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleParticipantsPane() {
        const { dispatch, _participantsPaneOpen } = this.props;

        if (_participantsPaneOpen) {
            dispatch(closeParticipantsPane());
        } else {
            dispatch(openParticipantsPane());
        }
    }

    _onToolbarOpenVideoQuality: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * open the video quality dialog.
     *
     * @private
     * @returns {void}
     */
    _onToolbarOpenVideoQuality() {
        sendAnalytics(createToolbarEvent('video.quality'));

        this._doOpenVideoQuality();
    }

    _onToolbarToggleChat: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * the display of chat.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleChat() {
        sendAnalytics(createToolbarEvent(
            'toggle.chat',
            {
                enable: !this.props._chatOpen
            }));
        this._closeOverflowMenuIfOpen();
        this._doToggleChat();
    }

    _onToolbarToggleFullScreen: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * full screen mode.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleFullScreen() {
        sendAnalytics(createToolbarEvent(
            'toggle.fullscreen',
                {
                    enable: !this.props._fullScreen
                }));
        this._closeOverflowMenuIfOpen();
        this._doToggleFullScreen();
    }

    _onToolbarToggleRaiseHand: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * raise hand.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleRaiseHand() {
        sendAnalytics(createToolbarEvent(
            'raise.hand',
            { enable: !this.props._raisedHand }));

        this._doToggleRaiseHand();
    }

    _onToolbarToggleScreenshare: () => void;

    /**
     * Creates an analytics toolbar event and dispatches an action for toggling
     * screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToolbarToggleScreenshare() {
        sendAnalytics(createToolbarEvent(
            'toggle.screen.sharing',
            ACTION_SHORTCUT_TRIGGERED,
            { enable: !this.props._screenSharing }));

        this._closeOverflowMenuIfOpen();
        this._doToggleScreenshare();
    }

    /**
     * Returns true if the audio sharing button should be visible and
     * false otherwise.
     *
     * @returns {boolean}
     */
    _showAudioSharingButton() {
        const {
            _desktopSharingEnabled
        } = this.props;

        return _desktopSharingEnabled && isScreenAudioSupported();
    }

    /**
     * Returns true if the desktop sharing button should be visible and
     * false otherwise.
     *
     * @returns {boolean}
     */
    _showDesktopSharingButton() {
        const {
            _desktopSharingEnabled,
            _desktopSharingDisabledTooltipKey
        } = this.props;

        return _desktopSharingEnabled || _desktopSharingDisabledTooltipKey;
    }

    /**
     * Returns true if the embed meeting button is visible and false otherwise.
     *
     * @returns {boolean}
     */
    _isEmbedMeetingVisible() {
        return !this.props._isVpaasMeeting
            && !this.props._isMobile;
    }

    /**
     * Returns true if the profile button is visible and false otherwise.
     *
     * @returns {boolean}
     */
    _isProfileVisible() {
        return !this.props._isProfileDisabled;
    }

    /**
     * Renders the list elements of the overflow menu.
     *
     * @private
     * @param {Array<React$Element>} additionalButtons - Additional buttons to be displayed.
     * @returns {Array<React$Element>}
     */
    _renderOverflowMenuContent(additionalButtons: Array<React$Element<any>>) {
        const {
            _desktopSharingEnabled,
            _feedbackConfigured,
            _fullScreen,
            _isMobile,
            _screensharing,
            t
        } = this.props;

        const group1 = [
            ...additionalButtons,

            this.props._shouldShowButton('toggle-camera')
                && <ToggleCameraButton
                    key = 'toggle-camera'
                    showLabel = { true } />,
            this.props._shouldShowButton('videoquality')
                && <OverflowMenuVideoQualityItem
                    key = 'videoquality'
                    onClick = { this._onToolbarOpenVideoQuality } />,
            this.props._shouldShowButton('fullscreen')
                && !_isMobile
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.fullScreen') }
                    icon = { _fullScreen ? IconExitFullScreen : IconFullScreen }
                    key = 'fullscreen'
                    onClick = { this._onToolbarToggleFullScreen }
                    text = { _fullScreen ? t('toolbar.exitFullScreen') : t('toolbar.enterFullScreen') } />,
            (this.props._shouldShowButton('security') || this.props._shouldShowButton('info'))
            && <SecurityDialogButton
                key = 'security'
                showLabel = { true } />,
            this.props._shouldShowButton('closedcaptions')
            && <ClosedCaptionButton
                key = 'closed-captions'
                showLabel = { true } />,
            this.props._shouldShowButton('recording')
                && <RecordButton
                    key = 'record'
                    showLabel = { true } />,
            this.props._shouldShowButton('localrecording')
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.localRecording') }
                    icon = { IconRec }
                    key = 'localrecording'
                    onClick = { this._onToolbarOpenLocalRecordingInfoDialog }
                    text = { t('localRecording.dialogTitle') } />,
            this.props._shouldShowButton('mute-everyone')
                && <MuteEveryoneButton
                    key = 'mute-everyone'
                    showLabel = { true } />,
            this.props._shouldShowButton('kick-everyone')
                && <KickEveryoneButton
                    key = 'kick-everyone'
                    showLabel = { true } />,
            this.props._shouldShowButton('mute-video-everyone')
                && <MuteEveryonesVideoButton
                    key = 'mute-video-everyone'
                    showLabel = { true } />,
            this.props._shouldShowButton('livestreaming')
                && <LiveStreamButton
                    key = 'livestreaming'
                    showLabel = { true } />
        ];

        const group2 = [
            this.props._shouldShowButton('sharedvideo')
                && <SharedVideoButton
                    key = 'sharedvideo'
                    showLabel = { true } />,
            this.props._shouldShowButton('shareaudio')
                && _desktopSharingEnabled
                && isScreenAudioSupported()
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.shareaudio') }
                    icon = { IconShareAudio }
                    key = 'shareaudio'
                    onClick = { this._onToolbarToggleShareAudio }
                    text = { t('toolbar.shareaudio') } />,
            this.props._shouldShowButton('etherpad')
                && <SharedDocumentButton
                    key = 'etherpad'
                    showLabel = { true } />,
            (this.props._shouldShowButton('select-background') || this.props._shouldShowButton('videobackgroundblur'))
                && <VideoBackgroundButton
                    key = { 'select-background' }
                    showLabel = { true }
                    visible = { !_screensharing && checkBlurSupport() } />,
            this.props._shouldShowButton('stats')
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.speakerStats') }
                    icon = { IconPresentation }
                    key = 'stats'
                    onClick = { this._onToolbarOpenSpeakerStats }
                    text = { t('toolbar.speakerStats') } />
        ];


        return [
            this._isProfileVisible()
                && <OverflowMenuProfileItem
                    key = 'profile'
                    onClick = { this._onToolbarToggleProfile } />,
            this._isProfileVisible()
                && <hr
                    className = 'overflow-menu-hr'
                    key = 'hr1' />,

            ...group1,
            group1.some(Boolean)
            && <hr
                className = 'overflow-menu-hr'
                key = 'hr2' />,

            ...group2,
            group2.some(Boolean)
            && <hr
                className = 'overflow-menu-hr'
                key = 'hr3' />,

            this.props._shouldShowButton('settings')
                && <SettingsButton
                    key = 'settings'
                    showLabel = { true } />,
            this.props._shouldShowButton('shortcuts')
                && !_isMobile
                && keyboardShortcut.getEnabled()
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.shortcuts') }
                    icon = { IconDeviceDocument }
                    key = 'shortcuts'
                    onClick = { this._onToolbarOpenKeyboardShortcuts }
                    text = { t('toolbar.shortcuts') } />,
            this._isEmbedMeetingVisible()
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.embedMeeting') }
                    icon = { IconCodeBlock }
                    key = 'embed'
                    onClick = { this._onToolbarOpenEmbedMeeting }
                    text = { t('toolbar.embedMeeting') } />,
            this.props._shouldShowButton('feedback')
                && _feedbackConfigured
                && <OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.feedback') }
                    icon = { IconFeedback }
                    key = 'feedback'
                    onClick = { this._onToolbarOpenFeedback }
                    text = { t('toolbar.feedback') } />,
            this.props._shouldShowButton('download')
                && <DownloadButton
                    key = 'download'
                    showLabel = { true } />,
            this.props._shouldShowButton('help')
                && <HelpButton
                    key = 'help'
                    showLabel = { true } />
        ];
    }

    /**
     * Returns the buttons to be displayed in main or the overflow menu.
     *
     * @param {Set} buttons - A set containing the buttons to be displayed
     * in the toolbar beside the main audio/video & hanugup.
     * @returns {Object}
     */
    _getAdditionalButtons(buttons) {
        const {
            _chatOpen,
            _desktopSharingEnabled,
            _desktopSharingDisabledTooltipKey,
            _screensharing,
            t
        } = this.props;

        const overflowMenuAdditionalButtons = [];
        const mainMenuAdditionalButtons = [];

        if (this._showDesktopSharingButton()) {
            buttons.has('desktop')
                ? mainMenuAdditionalButtons.push(<ToolbarButton
                    accessibilityLabel = { t('toolbar.accessibilityLabel.shareYourScreen') }
                    disabled = { !_desktopSharingEnabled }
                    icon = { IconShareDesktop }
                    key = 'desktop'
                    onClick = { this._onToolbarToggleScreenshare }
                    toggled = { _screensharing }
                    tooltip = { t(_desktopSharingEnabled
                        ? 'dialog.shareYourScreen' : _desktopSharingDisabledTooltipKey) } />)
                : overflowMenuAdditionalButtons.push(<OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.shareYourScreen') }
                    icon = { IconShareDesktop }
                    iconId = 'share-desktop'
                    key = 'desktop'
                    onClick = { this._onToolbarToggleScreenshare }
                    text = { t(`toolbar.${_screensharing ? 'stopScreenSharing' : 'startScreenSharing'}`) } />);
        }

        if (this.props._shouldShowButton('chat')) {
            buttons.has('chat')
                ? mainMenuAdditionalButtons.push(<div
                    className = 'toolbar-button-with-badge'
                    key = 'chatcontainer'>
                    <ToolbarButton
                        accessibilityLabel = { t('toolbar.accessibilityLabel.chat') }
                        icon = { IconChat }
                        key = 'chat'
                        onClick = { this._onToolbarToggleChat }
                        toggled = { _chatOpen }
                        tooltip = { t(`toolbar.${_chatOpen ? 'closeChat' : 'openChat'}`  ) } />
                    <ChatCounter />
                </div>) : overflowMenuAdditionalButtons.push(<OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.chat') }
                    icon = { IconChat }
                    key = 'chat'
                    onClick = { this._onToolbarToggleChat }
                    text = { t(`toolbar.${_chatOpen ? 'closeChat' : 'openChat'}`) } />);
        }

        if (this.props._shouldShowButton('raisehand')) {
            const raisedHand = this.props._raisedHand || false;

            buttons.has('raisehand')
                ? mainMenuAdditionalButtons.push(<ToolbarButton
                    accessibilityLabel = { t('toolbar.accessibilityLabel.raiseHand') }
                    icon = { IconRaisedHand }
                    key = 'raisehand'
                    onClick = { this._onToolbarToggleRaiseHand }
                    toggled = { raisedHand }
                    tooltip = { t(`toolbar.${raisedHand ? 'lowerYourHand' : 'raiseYourHand'}`) } />)
                : overflowMenuAdditionalButtons.push(<OverflowMenuItem
                    accessibilityLabel = { t('toolbar.accessibilityLabel.raiseHand') }
                    icon = { IconRaisedHand }
                    key = 'raisehand'
                    onClick = { this._onToolbarToggleRaiseHand }
                    text = { t(`toolbar.${raisedHand ? 'lowerYourHand' : 'raiseYourHand'}`) } />);
        }

        if (this.props._shouldShowButton('participants-pane') || this.props._shouldShowButton('invite')) {
            buttons.has('participants-pane')
                ? mainMenuAdditionalButtons.push(
                    <ToolbarButton
                        accessibilityLabel = { t('toolbar.accessibilityLabel.participants') }
                        icon = { IconParticipants }
                        key = 'participants'
                        onClick = { this._onToolbarToggleParticipantsPane }
                        toggled = { this.props._participantsPaneOpen }
                        tooltip = { t('toolbar.participants') } />)
                : overflowMenuAdditionalButtons.push(
                    <OverflowMenuItem
                        accessibilityLabel = { t('toolbar.accessibilityLabel.participants') }
                        icon = { IconParticipants }
                        key = 'participants-pane'
                        onClick = { this._onToolbarToggleParticipantsPane }
                        text = { t('toolbar.participants') } />
                );
        }

        if (this.props._shouldShowButton('tileview')) {
            buttons.has('tileview')
                ? mainMenuAdditionalButtons.push(
                    <TileViewButton
                        key = 'tileview'
                        showLabel = { false } />)
                : overflowMenuAdditionalButtons.push(
                    <TileViewButton
                        key = 'tileview'
                        showLabel = { true } />);
        }

        return {
            mainMenuAdditionalButtons,
            overflowMenuAdditionalButtons
        };
    }

    /**
     * Renders the Audio controlling button.
     *
     * @returns {ReactElement}
     */
    _renderAudioButton() {
        return this.props._shouldShowButton('microphone')
            ? <AudioSettingsButton
                key = 'asb'
                visible = { true } />
            : null;
    }

    /**
     * Renders the Video controlling button.
     *
     * @returns {ReactElement}
     */
    _renderVideoButton() {
        return this.props._shouldShowButton('camera')
            ? <VideoSettingsButton
                key = 'vsb'
                visible = { true } />
            : null;
    }

    /**
     * Renders the toolbox content.
     *
     * @returns {ReactElement}
     */
    _renderToolboxContent() {
        const {
            _isMobile,
            _overflowMenuVisible,
            _toolbarButtons,
            t,
            _reactionsEnabled
        } = this.props;

        const toolbarAccLabel = 'toolbar.accessibilityLabel.moreActionsMenu';
        const containerClassName = `toolbox-content${_isMobile ? ' toolbox-content-mobile' : ''}`;

        const { mainMenuButtons, overflowMenuButtons } = this._getVisibleButtons();

        return (
            <div className = { containerClassName }>
                <div
                    className = 'toolbox-content-wrapper'
                    onFocus = { this._onTabIn }
                    { ...(_isMobile ? {} : {
                        onMouseOut: this._onMouseOut,
                        onMouseOver: this._onMouseOver
                    }) }>
                    <DominantSpeakerName />
                    <div className = 'toolbox-content-items'>
                        {mainMenuButtons.map(({ Content, key, ...rest }) => Content !== Separator && (
                            <Content
                                { ...rest }
                                key = { key } />))}

                        {Boolean(overflowMenuButtons.length) && (
                            <OverflowMenuButton
                                ariaControls = 'overflow-menu'
                                isOpen = { _overflowMenuVisible }
                                key = 'overflow-menu'
                                onVisibilityChange = { this._onSetOverflowVisible }
                                showMobileReactions = {
                                    _reactionsEnabled && overflowMenuButtons.find(({ key }) => key === 'raisehand')
                                }>
                                <ul
                                    aria-label = { t(toolbarAccLabel) }
                                    className = 'overflow-menu'
                                    id = 'overflow-menu'
                                    onKeyDown = { this._onEscKey }
                                    role = 'menu'>
                                    {overflowMenuButtons.map(({ group, key, Content, ...rest }, index, arr) => {
                                        const showSeparator = index > 0 && arr[index - 1].group !== group;

                                        return (key !== 'raisehand' || !_reactionsEnabled)
                                            && <>
                                                {showSeparator && <Separator key = { `hr${group}` } />}
                                                <Content
                                                    { ...rest }
                                                    key = { key }
                                                    showLabel = { true } />
                                            </>
                                        ;
                                    })}
                                </ul>
                            </OverflowMenuButton>
                        )}

                        <HangupButton
                            customClass = 'hangup-button'
                            key = 'hangup-button'
                            visible = { isToolbarButtonEnabled('hangup', _toolbarButtons) } />
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to {@link Toolbox}'s React {@code Component}
 * props.
 *
 * @param {Object} state - The redux store/state.
 * @private
 * @returns {{}}
 */
function _mapStateToProps(state) {
    const { conference } = state['features/base/conference'];
    let desktopSharingEnabled = JitsiMeetJS.isDesktopSharingEnabled();
    const {
        callStatsID,
        enableFeaturesBasedOnToken
    } = state['features/base/config'];
    const {
        fullScreen,
        overflowMenuVisible
    } = state['features/toolbox'];
    const localParticipant = getLocalParticipant(state);
    const localVideo = getLocalVideoTrack(state['features/base/tracks']);
    const { clientWidth } = state['features/base/responsive-ui'];
    const { enableReactions } = state['features/base/config'];

    let desktopSharingDisabledTooltipKey;

    if (enableFeaturesBasedOnToken) {
        if (desktopSharingEnabled) {
            // we enable desktop sharing if any participant already have this
            // feature enabled and if the user supports it.
            desktopSharingEnabled = haveParticipantWithScreenSharingFeature(state);
            desktopSharingDisabledTooltipKey = 'dialog.shareYourScreenDisabled';
        }
    }

    return {
        _chatOpen: state['features/chat'].isOpen,
        _clientWidth: clientWidth,
        _conference: conference,
        _desktopSharingEnabled: desktopSharingEnabled,
        _backgroundType: state['features/virtual-background'].backgroundType,
        _virtualSource: state['features/virtual-background'].virtualSource,
        _desktopSharingDisabledTooltipKey: desktopSharingDisabledTooltipKey,
        _dialog: Boolean(state['features/base/dialog'].component),
        _feedbackConfigured: Boolean(callStatsID),
        _isProfileDisabled: Boolean(state['features/base/config'].disableProfile),
        _isMobile: isMobileBrowser(),
        _isVpaasMeeting: isVpaasMeeting(state),
        _fullScreen: fullScreen,
        _tileViewEnabled: shouldDisplayTileView(state),
        _localParticipantID: localParticipant?.id,
        _localVideo: localVideo,
        _overflowMenuVisible: overflowMenuVisible,
        _participantsPaneOpen: getParticipantsPaneOpen(state),
        _raisedHand: localParticipant?.raisedHand,
        _screenSharing: isScreenVideoShared(state),
        _toolbarButtons: getToolbarButtons(state),
        _visible: isToolboxVisible(state),
        _visibleButtons: getToolbarButtons(state),
        _reactionsEnabled: enableReactions
    };
}

export default translate(connect(_mapStateToProps)(Toolbox));
