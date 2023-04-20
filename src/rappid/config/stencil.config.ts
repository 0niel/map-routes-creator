import {
    CONFIRMATION_ICON,
    ENTITY_ICON,
    MESSAGE_ICON,
    USER_INPUT_ICON
} from 'src/theme';

export const stencilConfig = {
    shapes: [{
        name: 'FlowchartStart'
    }, {
        name: 'FlowchartEnd'
    }, {
        name: 'Message',
        attrs: {
            label: { text: 'User action' },
            icon: { xlinkHref: USER_INPUT_ICON }
        }
    }, {
        name: 'Message',
        attrs: {
            label: { text: 'Entity' },
            icon: { xlinkHref: ENTITY_ICON }
        }
    }, {
        name: 'Message',
        attrs: {
            label: { text: 'Message' },
            icon: { xlinkHref: MESSAGE_ICON }
        }
    }, {
        name: 'Message',
        attrs: {
            label: { text: 'Confirmation' },
            icon: { xlinkHref: CONFIRMATION_ICON }
        }
    }]
};
