// @flow

import React from 'react';

import { Dialog } from '../../../base/dialog';
import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';
import AbstractUnMuteEveryoneDialog, { abstractMapStateToProps, type Props } from '../AbstractUnMuteEveryoneDialog';

/**
 * A React Component with the contents for a dialog that asks for confirmation
 * from the user before muting all remote participants.
 *
 * @extends AbstractMuteEveryoneDialog
 */
class UnMuteEveryoneDialog extends AbstractUnMuteEveryoneDialog<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                okKey = 'dialog.unmuteParticipantButton'
                onSubmit = { this._onSubmit }
                titleString = { this.props.title }
                width = 'small'>
                <div>
                    { this.props.content }
                </div>
            </Dialog>
        );
    }

    _onSubmit: () => boolean;
}

export default translate(connect(abstractMapStateToProps)(UnMuteEveryoneDialog));
