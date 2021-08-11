/* @flow */

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractMuteRemoteParticipantDialogSoft
    from '../AbstractMuteRemoteParticipantDialogSoft';

/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting a remote participant.
 *
 * @extends Component
 */
class MuteRemoteParticipantDialogSoft extends AbstractMuteRemoteParticipantDialogSoft {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.muteParticipantButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.muteParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.muteParticipantBody') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(MuteRemoteParticipantDialogSoft));
