// @flow

import React, { Component } from 'react';

import { Dialog } from '../../../base/dialog';
import { connect } from '../../../base/redux';
import { muteAllParticipants } from '../../actions';


declare var APP: Object;



/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting a remote participant.
 *
 * @extends Component
 */
class HangupDialog extends Component<Props>{


    render() {

        return (
            <Dialog
                okKey = 'Leave'
                onSubmit = { this._onSubmit }
                titleString = 'Leave Meeting'
                width = 'small'>
                <div>
                    Would you really like to leave this session?<br/>
                    By clicking Hang Up, you will be exiting from the meeting room.<br />
                    Are you sure?
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;

    /**
     * Callback to be invoked when the value of this dialog is submitted.
     *
     * @returns {boolean}
     */
    _onSubmit() {
        console.log("leave clicked");
        APP.conference.hangup(false);
    }


}

export default (connect()(HangupDialog));
