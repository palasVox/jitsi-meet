// @flow

import { PersistenceRegistry, ReducerRegistry } from '../base/redux';

import { BACKGROUND_ENABLED, SET_VIRTUAL_BACKGROUND } from './actionTypes';

const STORE_NAME = 'features/virtual-background';

/**
 * Sets up the persistence of the feature {@code virtual-background}.
 */
PersistenceRegistry.register(STORE_NAME, true);

/**
 * Reduces redux actions which activate/deactivate virtual background image, or
 * indicate if the virtual image background is activated/deactivated. The
 * backgroundEffectEnabled flag indicate if virtual background effect is activated.
 *
 * @param {State} state - The current redux state.
 * @param {Action} action - The redux action to reduce.
 * @param {string} action.type - The type of the redux action to reduce..
 * @returns {State} The next redux state that is the result of reducing the
 * specified action.
 */
ReducerRegistry.register(STORE_NAME, (state = {}, action) => {
    const { virtualSource, isVirtualBackground, backgroundEffectEnabled } = action;

    switch (action.type) {
    case SET_VIRTUAL_BACKGROUND: {
        return {
            ...state,
            virtualSource,
            isVirtualBackground
        };
    }
    case BACKGROUND_ENABLED: {
        return {
            ...state,
            backgroundEffectEnabled
        };
    }
    }

    return state;
});