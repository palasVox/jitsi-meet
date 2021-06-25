// @flow

import { ReducerRegistry, set } from '../redux';

import {
    DOMINANT_SPEAKER_CHANGED,
    PARTICIPANT_ID_CHANGED,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    PARTICIPANT_UPDATED,
    PIN_PARTICIPANT,
    SET_LOADABLE_AVATAR_URL
} from './actionTypes';
import { LOCAL_PARTICIPANT_DEFAULT_ID, PARTICIPANT_ROLE } from './constants';

/**
 * Participant object.
 * @typedef {Object} Participant
 * @property {string} id - Participant ID.
 * @property {string} name - Participant name.
 * @property {string} avatar - Path to participant avatar if any.
 * @property {string} role - Participant role.
 * @property {boolean} local - If true, participant is local.
 * @property {boolean} pinned - If true, participant is currently a
 * "PINNED_ENDPOINT".
 * @property {boolean} dominantSpeaker - If this participant is the dominant
 * speaker in the (associated) conference, {@code true}; otherwise,
 * {@code false}.
 * @property {string} email - Participant email.
 */

declare var APP: Object;

/**
 * The participant properties which cannot be updated through
 * {@link PARTICIPANT_UPDATED}. They either identify the participant or can only
 * be modified through property-dedicated actions.
 *
 * @type {string[]}
 */
const PARTICIPANT_PROPS_TO_OMIT_WHEN_UPDATE = [

    // The following properties identify the participant:
    'conference',
    'id',
    'local',

    // The following properties can only be modified through property-dedicated
    // actions:
    'dominantSpeaker',
    'pinned'
];

const DEFAULT_STATE = {
    dominantSpeaker: undefined,
    pinnedParticipant: undefined,
    local: undefined,
    remote: new Map(),
    fakeParticipants: new Map()
};

/**
 * Listen for actions which add, remove, or update the set of participants in
 * the conference.
 *
 * @param {Participant[]} state - List of participants to be modified.
 * @param {Object} action - Action object.
 * @param {string} action.type - Type of action.
 * @param {Participant} action.participant - Information about participant to be
 * added/removed/modified.
 * @returns {Participant[]}
 */
ReducerRegistry.register('features/base/participants', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case PARTICIPANT_ID_CHANGED: {
        // A participant is identified by an id-conference pair. Only the local
        // participant is with an undefined conference.
        const { conference } = action;
        const { local } = state;

        if (local && local.id === action.oldValue && local.conference === conference) {
            state.local = {
                ...local,
                id: action.newValue
            };
        }

        return state;
    }
    case DOMINANT_SPEAKER_CHANGED: {
        const { participant } = action;
        const { id } = participant;
        const { dominantSpeaker } = state;

        // Only one dominant speaker is allowed.
        if (dominantSpeaker) {
            _updateParticipantProperty(state, dominantSpeaker, 'dominantSpeaker', false);
        }

        if (_updateParticipantProperty(state, id, 'dominantSpeaker', true)) {
            return {
                ...state,
                dominantSpeaker: id
            };
        }


        return state;
    }
    case PIN_PARTICIPANT: {
        const { participant } = action;
        const { id } = participant;
        const { pinnedParticipant } = state;

        // Only one dominant speaker is allowed.
        if (pinnedParticipant) {
            _updateParticipantProperty(state, pinnedParticipant, 'pinned', false);
        }

        if (_updateParticipantProperty(state, id, 'pinned', true)) {
            return {
                ...state,
                pinnedParticipant: id
            };
        }


        return state;
    }
    case SET_LOADABLE_AVATAR_URL:
    case PARTICIPANT_UPDATED: {
        const { participant } = action;
        let { id } = participant;
        const { local } = participant;

        if (!id && local) {
            id = LOCAL_PARTICIPANT_DEFAULT_ID;
        }

        if (state.remote.has(id)) {
            state.remote.set(id, _participant(state.remote.get(id), action));
        } else if (id === state.local?.id) {
            state.local = _participant(state.local, action);
        }

        return state;
    }
    case PARTICIPANT_JOINED: {
        const participant = _participantJoined(action);

        if (participant.pinned) {
            state.pinnedParticipant = participant.id;
        }

        if (participant.dominantSpeaker) {
            state.dominantSpeaker = participant.id;
        }

        if (participant.local) {
            return {
                ...state,
                local: participant
            };
        }

        state.remote.set(participant.id, participant);

        if (participant.isFakeParticipant) {
            state.fakeParticipants.set(participant.id, participant);
        }

        return { ...state };

    }
    case PARTICIPANT_LEFT: {
        // XXX A remote participant is uniquely identified by their id in a
        // specific JitsiConference instance. The local participant is uniquely
        // identified by the very fact that there is only one local participant
        // (and the fact that the local participant "joins" at the beginning of
        // the app and "leaves" at the end of the app).
        const { id } = action.participant;
        const { fakeParticipants, remote, local, dominantSpeaker, pinnedParticipant } = state;

        if (dominantSpeaker === id) {
            state.dominantSpeaker = undefined;
        }

        if (pinnedParticipant === id) {
            state.pinnedParticipant = undefined;
        }

        if (remote.has(id)) {
            remote.delete(id);
        } else if (local?.id === id) {
            delete state.local;
        }

        if (fakeParticipants.has(id)) {
            fakeParticipants.delete(id);
        }

        return { ...state };
    }
    }

    return state;
});


/**
 *
 * @param {*} state
 * @param {*} id
 * @param {*} property
 * @param {*} value
 */
function _updateParticipantProperty(state, id, property, value) {
    const { remote, local } = state;

    if (remote.has(id)) {
        remote.set(id, set(remote.get(id), property, value));

        return true;
    } else if (local?.id === id) {
        state.local = set(local, property, value);

        return false;
    }

    return false;
}

/**
 * Reducer function for a single participant.
 *
 * @param {Participant|undefined} state - Participant to be modified.
 * @param {Object} action - Action object.
 * @param {string} action.type - Type of action.
 * @param {Participant} action.participant - Information about participant to be
 * added/modified.
 * @param {JitsiConference} action.conference - Conference instance.
 * @private
 * @returns {Participant}
 */
function _participant(state: Object = {}, action) {
    switch (action.type) {
    case SET_LOADABLE_AVATAR_URL:
    case PARTICIPANT_UPDATED: {
        const { participant } = action; // eslint-disable-line no-shadow

        const newState = { ...state };

        for (const key in participant) {
            if (participant.hasOwnProperty(key)
                    && PARTICIPANT_PROPS_TO_OMIT_WHEN_UPDATE.indexOf(key)
                        === -1) {
                newState[key] = participant[key];
            }
        }

        return newState;
    }
    }

    return state;
}

/**
 * Reduces a specific redux action of type {@link PARTICIPANT_JOINED} in the
 * feature base/participants.
 *
 * @param {Action} action - The redux action of type {@code PARTICIPANT_JOINED}
 * to reduce.
 * @private
 * @returns {Object} The new participant derived from the payload of the
 * specified {@code action} to be added into the redux state of the feature
 * base/participants after the reduction of the specified
 * {@code action}.
 */
function _participantJoined({ participant }) {
    const {
        avatarURL,
        botType,
        connectionStatus,
        dominantSpeaker,
        email,
        isFakeParticipant,
        isReplacing,
        isJigasi,
        loadableAvatarUrl,
        local,
        name,
        pinned,
        presence,
        role
    } = participant;
    let { conference, id } = participant;

    if (local) {
        // conference
        //
        // XXX The local participant is not identified in association with a
        // JitsiConference because it is identified by the very fact that it is
        // the local participant.
        conference = undefined;

        // id
        id || (id = LOCAL_PARTICIPANT_DEFAULT_ID);
    }

    return {
        avatarURL,
        botType,
        conference,
        connectionStatus,
        dominantSpeaker: dominantSpeaker || false,
        email,
        id,
        isFakeParticipant,
        isReplacing,
        isJigasi,
        loadableAvatarUrl,
        local: local || false,
        name,
        pinned: pinned || false,
        presence,
        role: role || PARTICIPANT_ROLE.NONE
    };
}
