// @flow

import React, { Component } from 'react';

import { Watermarks } from '../../base/react';
import { connect } from '../../base/redux';
import { setColorAlpha } from '../../base/util';
import { fetchCustomBrandingData } from '../../dynamic-branding';
import { SharedVideo } from '../../shared-video/components/web';
import { Captions } from '../../subtitles/';
import { toggleScreensharing } from '../../base/tracks';
import { getLocalParticipant } from '../../base/participants';

declare var interfaceConfig: Object;

type Props = {
    /**
     * The redux representation of the local participant.
     */
    _localParticipant: Object,

    /**
     * The alpha(opacity) of the background
     */
    _backgroundAlpha: number,

    /**
     * The user selected background color.
     */
     _customBackgroundColor: string,

    /**
     * The user selected background image url.
     */
     _customBackgroundImageUrl: string,

    /**
     * Fetches the branding data.
     */
    _fetchCustomBrandingData: Function,

    /**
     * Prop that indicates whether the chat is open.
     */
    _isChatOpen: boolean,

    /**
     * Used to determine the value of the autoplay attribute of the underlying
     * video element.
     */
    _noAutoPlayVideo: boolean,

    dispatch: Function,
}

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on Web/React.
 *
 * @extends Component
 */
class LargeVideo extends Component<Props> {
    /**
     * Implements React's {@link Component#componentDidMount}.
     *
     * @inheritdoc
     */

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.props._fetchCustomBrandingData();
    }

    _doToggleScreenshare = () => {
        this.props.dispatch(toggleScreensharing());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        const {
            _isChatOpen,
            _noAutoPlayVideo
        } = this.props;
        const style = this._getCustomSyles();
        const className = `videocontainer${_isChatOpen ? ' shift-right' : ''}`;
        const { _localParticipant } = this.props;
	let displayName;

	if (_localParticipant && _localParticipant.name) {
		displayName = _localParticipant.name;
	} else {
	        displayName = interfaceConfig.DEFAULT_LOCAL_DISPLAY_NAME;
	}

        return (
            <div
                className = { className }
                id = 'largeVideoContainer'
                style = { style }>
                <SharedVideo />
                <div id = 'etherpad' />

                <Watermarks />

                <div id = 'dominantSpeaker'>
                    <div className = 'dynamic-shadow' />
                    <div id = 'dominantSpeakerAvatarContainer' />
                </div>
                <div id = 'remotePresenceMessage' />
                <span id = 'remoteConnectionMessage' />
                <div id = 'largeVideoElementsContainer'>
                    <div id = 'largeVideoBackgroundContainer' />

                    {/*
                      * FIXME: the architecture of elements related to the large
                      * video and the naming. The background is not part of
                      * largeVideoWrapper because we are controlling the size of
                      * the video through largeVideoWrapper. That's why we need
                      * another container for the background and the
                      * largeVideoWrapper in order to hide/show them.
                      */}
                    <div
                        id = 'largeVideoWrapper'
                        role = 'figure' >
		        <div id = 'largeVideoWrapperBackground'>
				<div className = 'largeVideoWrapperBackgroundBox'>
				<img src='../../../images/presenting_logo.png' />
				<p>{ displayName } is  currently presenting</p>
				<button
				id = 'stopPresentingButton'
				onClick = { this._doToggleScreenshare }>
				Stop Presenting
				</button>
				</div>
			</div>
                        <video
                            autoPlay = { !_noAutoPlayVideo }
                            id = 'largeVideo'
                            muted = { true }
                            playsInline = { true } /* for Safari on iOS to work */ />
                    </div>
                </div>
                { interfaceConfig.DISABLE_TRANSCRIPTION_SUBTITLES
                    || <Captions /> }
            </div>
        );
    }

    /**
     * Creates the custom styles object.
     *
     * @private
     * @returns {Object}
     */
    _getCustomSyles() {
        const styles = {};
        const { _customBackgroundColor, _customBackgroundImageUrl } = this.props;

        /*styles.backgroundColor = _customBackgroundColor || interfaceConfig.DEFAULT_BACKGROUND;

        if (this.props._backgroundAlpha !== undefined) {
            const alphaColor = setColorAlpha(styles.backgroundColor, this.props._backgroundAlpha);

            styles.backgroundColor = alphaColor;
        }

        if (_customBackgroundImageUrl) {
            styles.backgroundImage = `url(${_customBackgroundImageUrl})`;
            styles.backgroundSize = 'cover';
        }*/
	
	styles.backgroundImage = 'radial-gradient(#004F7B, #141414, #000000)';

        return styles;
    }
}


/**
 * Maps (parts of) the Redux state to the associated LargeVideo props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const testingConfig = state['features/base/config'].testing;
    const { backgroundColor, backgroundImageUrl } = state['features/dynamic-branding'];
    const { isOpen: isChatOpen } = state['features/chat'];

    return {
        _backgroundAlpha: state['features/base/config'].backgroundAlpha,
        _customBackgroundColor: backgroundColor,
        _customBackgroundImageUrl: backgroundImageUrl,
        _isChatOpen: isChatOpen,
        _noAutoPlayVideo: testingConfig?.noAutoPlayVideo,
	_localParticipant: getLocalParticipant(state),
    };
}

const _mapDispatchToProps = dispatch => ({
    _fetchCustomBrandingData: fetchCustomBrandingData,
    dispatch
});

export default connect(_mapStateToProps, _mapDispatchToProps)(LargeVideo);
