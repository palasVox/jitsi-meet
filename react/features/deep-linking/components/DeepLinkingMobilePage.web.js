// @flow

import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import { createDeepLinkingPageEvent, sendAnalytics } from '../../analytics';
import { isSupportedMobileBrowser } from '../../base/environment';
import { translate } from '../../base/i18n';
import { Platform } from '../../base/react';
import { connect } from '../../base/redux';
import { DialInSummary } from '../../invite';
import { openWebApp } from '../actions';
import { _TNS } from '../constants';
import { generateDeepLinkingURL } from '../functions';
import { renderPromotionalFooter } from '../renderPromotionalFooter';

declare var interfaceConfig: Object;

/**
 * The namespace of the CSS styles of DeepLinkingMobilePage.
 *
 * @private
 * @type {string}
 */
const _SNS = 'deep-linking-mobile';

/**
 * The type of the React {@code Component} props of
 * {@link DeepLinkingMobilePage}.
 */
type Props = {

    /**
     * Application download URL.
     */
    _downloadUrl: ?string,

    /**
     * The name of the conference attempting to being joined.
     */
    _room: string,

    /**
     * Used to dispatch actions from the buttons.
     */
    dispatch: Dispatch<any>,

    /**
     * The function to translate human-readable text.
     */
    t: Function
};

/**
 * React component representing mobile browser page.
 *
 * @class DeepLinkingMobilePage
 */
class DeepLinkingMobilePage extends Component<Props> {
    /**
     * Initializes a new {@code DeepLinkingMobilePage} instance.
     *
     * @param {Object} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onDownloadApp = this._onDownloadApp.bind(this);
        this._onLaunchWeb = this._onLaunchWeb.bind(this);
        this._onOpenApp = this._onOpenApp.bind(this);
    }

    /**
     * Implements the Component's componentDidMount method.
     *
     * @inheritdoc
     */
    componentDidMount() {
        sendAnalytics(
            createDeepLinkingPageEvent(
                'displayed', 'DeepLinkingMobile', { isMobileBrowser: true }));
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _downloadUrl, _room, t } = this.props;
        const { HIDE_DEEP_LINKING_LOGO, NATIVE_APP_NAME, SHOW_DEEP_LINKING_IMAGE } = interfaceConfig;
        const downloadButtonClassName
            = `${_SNS}__button ${_SNS}__button_primary`;


        const onOpenLinkProperties = _downloadUrl
            ? {
                // When opening a link to the download page, we want to let the
                // OS itself handle intercepting and opening the appropriate
                // app store. This avoids potential issues with browsers, such
                // as iOS Chrome, not opening the store properly.
            }
            : {
                // When falling back to another URL (Firebase) let the page be
                // opened in a new window. This helps prevent the user getting
                // trapped in an app-open-cycle where going back to the mobile
                // browser re-triggers the app-open behavior.
                target: '_blank',
                rel: 'noopener noreferrer'
            };

        /*return (
            <div className = { _SNS }>
                <div className = 'header'>
                    {
                        HIDE_DEEP_LINKING_LOGO
                            ? null
                            : <img
                                alt = { t('welcomepage.logo.logoDeepLinking') }
                                className = 'logo'
                                src = 'images/logo-deep-linking.png' />
                    }
                </div>
                <div className = { `${_SNS}__body` }>
                    {
                        SHOW_DEEP_LINKING_IMAGE
                            ? <img
                                alt = { t('welcomepage.logo.logoDeepLinking') }
                                className = 'image'
                                src = 'images/deep-linking-image.png' />
                            : null
                    }
                    <p className = { `${_SNS}__text` }>
                        { t(`${_TNS}.appNotInstalled`, { app: NATIVE_APP_NAME }) }
                    </p>
                    <p className = { `${_SNS}__text` }>
                        { t(`${_TNS}.ifHaveApp`) }
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        className = { `${_SNS}__href` }
                        href = { generateDeepLinkingURL() }
                        onClick = { this._onOpenApp }
                        target = '_top'>
                        <button className = { `${_SNS}__button ${_SNS}__button_primary` }>
                            { t(`${_TNS}.joinInApp`) }
                        </button>
                    </a>
                    <p className = { `${_SNS}__text` }>
                        { t(`${_TNS}.ifDoNotHaveApp`) }
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        href = { this._generateDownloadURL() }
                        onClick = { this._onDownloadApp }
                        target = '_top'>
                        <button className = { downloadButtonClassName }>
                            { t(`${_TNS}.downloadApp`) }
                        </button>
                    </a>
                    {
                        isSupportedMobileBrowser()
                            && <a
                                onClick = { this._onLaunchWeb }
                                target = '_top'>
                                <button className = { downloadButtonClassName }>
                                    { t(`${_TNS}.launchWebButton`) }
                                </button>
                            </a>
                    }
                    { renderPromotionalFooter() }
                    <DialInSummary
                        className = 'deep-linking-dial-in'
                        clickableNumbers = { true }
                        room = { _room } />
                </div>
            </div>
        );*/

        const { userAgent } = navigator;
        if (userAgent.match(/iP(ad|hone|od)/i)){
         
        return (
            <div className = { _SNS }>
                <div className = 'header'>
                    <img
                        className = 'logo'
                        src = 'images/logo-deep-linking.png' />
                </div>
                <div className = { `${_SNS}__body` }>
                    {
                        SHOW_DEEP_LINKING_IMAGE
                            ? <img
                                className = 'image'
                                src = 'images/deep-linking-image.png' />
                            : null
                    }
                    <p className = { `${_SNS}__text` }>
                        <b>To Join the Meeting</b><br /><br />
			Download the VoxMeet app <br />
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        href = { this._generateDownloadURL() }
                        onClick = { this._onDownloadApp }>
			<img className = { `${_SNS}__img` } src="images/welcome-page/appStore.png" />
                    </a><br /><br /><br />
                    <p className = { `${_SNS}__text` }>
                        Already have the VoxMeet app? <br />
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        className = { `${_SNS}__href` }
                        href = { generateDeepLinkingURL() }
                        onClick = { this._onOpenApp }>
                        <button className = { downloadButtonClassName }> 
                        Join from App
                        </button>
                    </a>
                    { isSupportedMobileBrowser()
 			&& <p className = { `${_SNS}__text` }>
			───────────or───────────<br /><br />
                        Use Web Broswer instead <br />
                    </p>
 		    }
                    {
                        isSupportedMobileBrowser()
                            && <a
                                onClick = { this._onLaunchWeb }
                                target = '_top'>
                                <button className = { downloadButtonClassName }>
                                    Join from Browser
                                </button>
                            </a>
                    }<br /><br /><br /><br />
                    <p>
                       Note: If 'Join from App' doesn't work, please consider updating the app from your app store. Else open your VoxMeet app and enter <br /> { window.location.href } <br /> below 'Enter Room Name'.
                    </p>

                    { renderPromotionalFooter() }
                    <DialInSummary
                        className = 'deep-linking-dial-in'
                        clickableNumbers = { true }
                        room = { _room } />
                </div>
            </div>
        );
        } else return (
            <div className = { _SNS }>
                <div className = 'header'>
                    <img
                        className = 'logo'
                        src = 'images/logo-deep-linking.png' />
                </div>
                <div className = { `${_SNS}__body` }>
                    {
                        SHOW_DEEP_LINKING_IMAGE
                            ? <img
                                className = 'image'
                                src = 'images/deep-linking-image.png' />
                            : null
                    }
                    <p className = { `${_SNS}__text` }>
                        <b>To Join the Meeting</b><br /><br />
			Download the VoxMeet app <br />
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        href = { this._generateDownloadURL() }
                        onClick = { this._onDownloadApp }>
			<img className = { `${_SNS}__img` } src="images/welcome-page/googleplay.png" />
                    </a><br /><br /><br />
                    <p className = { `${_SNS}__text` }>
                        Already have the VoxMeet app? <br />
                    </p>
                    <a
                        { ...onOpenLinkProperties }
                        className = { `${_SNS}__href` }
                        href = { generateDeepLinkingURL() }
                        onClick = { this._onOpenApp }>
                        <button className = { downloadButtonClassName }> 
                        Join From App
                        </button>
                    </a>
                    { isSupportedMobileBrowser()
 			&& <p className = { `${_SNS}__text` }>
			───────────or───────────<br /><br />
                        Use Web Broswer instead <br />
                    </p>
 		    }
                    {
                        isSupportedMobileBrowser()
                            && <a
                                onClick = { this._onLaunchWeb }
                                target = '_top'>
                                <button className = { downloadButtonClassName }>
                                    Join from Browser
                                </button>
                            </a>
                    }<br /><br /><br /><br />
                    <p>
                       Note: If 'Join from App' doesn't work, please consider updating the app from your app store. Else open your VoxMeet app and enter <br /> { window.location.href } <br /> below 'Enter Room Name'.
                    </p>

                    { renderPromotionalFooter() }
                    <DialInSummary
                        className = 'deep-linking-dial-in'
                        clickableNumbers = { true }
                        room = { _room } />
                </div>
            </div>
        ); 
    }

    /**
     * Generates the URL for downloading the app.
     *
     * @private
     * @returns {string} - The URL for downloading the app.
     */
    _generateDownloadURL() {
        const { _downloadUrl: url } = this.props;

        if (url && typeof interfaceConfig.MOBILE_DYNAMIC_LINK === 'undefined') {
            return url;
        }

        // For information about the properties of
        // interfaceConfig.MOBILE_DYNAMIC_LINK check:
        // https://firebase.google.com/docs/dynamic-links/create-manually
        const {
            APN = 'org.jitsi.meet',
            APP_CODE = 'w2atb',
            CUSTOM_DOMAIN = undefined,
            IBI = 'com.atlassian.JitsiMeet.ios',
            ISI = '1165103905'
        } = interfaceConfig.MOBILE_DYNAMIC_LINK || {};

        const domain = CUSTOM_DOMAIN ?? `https://${APP_CODE}.app.goo.gl`;
        const IUS = interfaceConfig.APP_SCHEME || 'org.jitsi.meet';

        return `${domain}/?link=${
            encodeURIComponent(window.location.href)}&apn=${
            APN}&ibi=${
            IBI}&isi=${
            ISI}&ius=${
            IUS}&efr=1`;
    }

    _onDownloadApp: () => void;

    /**
     * Handles download app button clicks.
     *
     * @private
     * @returns {void}
     */
    _onDownloadApp() {
        sendAnalytics(
            createDeepLinkingPageEvent(
                'clicked', 'downloadAppButton', { isMobileBrowser: true }));
    }

    _onLaunchWeb: () => void;

    /**
     * Handles launch web button clicks.
     *
     * @returns {void}
     */
    _onLaunchWeb() {
        sendAnalytics(
            createDeepLinkingPageEvent(
                'clicked', 'launchWebButton', { isMobileBrowser: true }));
        this.props.dispatch(openWebApp());
    }

    _onOpenApp: () => void;

    /**
     * Handles open app button clicks.
     *
     * @private
     * @returns {void}
     */
    _onOpenApp() {
        sendAnalytics(
            createDeepLinkingPageEvent(
                'clicked', 'openAppButton', { isMobileBrowser: true }));
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code DeepLinkingMobilePage} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    return {
        _downloadUrl: interfaceConfig[`MOBILE_DOWNLOAD_LINK_${Platform.OS.toUpperCase()}`],
        _room: decodeURIComponent(state['features/base/conference'].room)
    };
}

export default translate(connect(_mapStateToProps)(DeepLinkingMobilePage));
