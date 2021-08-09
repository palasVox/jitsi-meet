// @flow

import React from 'react';

import { Dialog } from '../../base/dialog';
import { MEDIA_TYPE } from '../../base/media';
import { getLocalParticipant, getParticipantDisplayName } from '../../base/participants';
import { unmuteAllParticipants } from '../actions';

import AbstractUnMuteRemoteParticipantDialog, {
    type Props as AbstractProps
} from './AbstractUnMuteRemoteParticipantDialog';

/**
 * The type of the React {@code Component} props of
 * {@link AbstractMuteEveryoneDialog}.
 */
export type Props = AbstractProps & {

    content: string,
    exclude: Array<string>,
    title: string
};

/**
 *
 * An abstract Component with the contents for a dialog that asks for confirmation
 * from the user before muting all remote participants.
 *
 * @extends AbstractMuteRemoteParticipantDialog
 */
export default class AbstractUnMuteEveryoneDialog<P: Props> extends AbstractUnMuteRemoteParticipantDialog<P> {
    static defaultProps = {
        exclude: [],
        muteLocal: false
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { content, title } = this.props;

        return (
            <Dialog
                okKey = 'dialog.unmuteParticipantButton'
                onSubmit = { this._onSubmit }
                titleString = { title }
                width = 'small'>
                <div>
                    { content }
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
        const {
            dispatch,
            exclude
        } = this.props;

        dispatch(unmuteAllParticipants(exclude, MEDIA_TYPE.AUDIO));

        return true;
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code AbstractMuteEveryoneDialog}'s props.
 *
 * @param {Object} state - The redux state.
 * @param {Object} ownProps - The properties explicitly passed to the component.
 * @returns {Props}
 */
export function abstractMapStateToProps(state: Object, ownProps: Props) {
    const { exclude = [], t } = ownProps;

    const whom = exclude
        // eslint-disable-next-line no-confusing-arrow
        .map(id => id === getLocalParticipant(state).id
            ? t('dialog.unmuteEveryoneSelf')
            : getParticipantDisplayName(state, id))
        .join(', ');

    return whom.length ? {
        content: t('dialog.unmuteEveryoneElseDialog'),
        title: t('dialog.unmuteEveryoneElseTitle', { whom })
    } : {
        content: t('dialog.unmuteEveryoneDialog'),
        title: t('dialog.unmuteEveryoneTitle')
    };
}
