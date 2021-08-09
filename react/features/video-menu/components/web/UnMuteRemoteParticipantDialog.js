// mute-unmute-XX - created UnMuteRemoteParticipantDialog component

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractUnMuteRemoteParticipantDialog
    from '../AbstractUnMuteRemoteParticipantDialog';

/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting a remote participant.
 *
 * @extends Component
 */
class UnMuteRemoteParticipantDialog extends AbstractUnMuteRemoteParticipantDialog {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.unMuteParticipantButton'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.unMuteParticipantTitle'
                width = 'small'>
                <div>
                    { this.props.t('dialog.unMuteParticipantBody') }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect()(UnMuteRemoteParticipantDialog));
