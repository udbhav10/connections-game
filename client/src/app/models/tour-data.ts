export const tourSteps: any = 
    [
        {
            id: 'hints',
            text: 'Click here for hints',
            title: 'Hints',
            attachTo: {
              element: '#iconBulb',
              on: 'bottom'
            },
            classes: 'mt-3',
            buttons: [
                {
                    classes: 'shepherd-button-primary',
                    text: 'Next',
                    type: 'next'
                }
            ]
        },
        {
            id: 'settings',
            text: 'Click here for settings (New - Dark Mode!)',
            title: 'Settings',
            attachTo: {
              element: '#iconSettings',
              on: 'bottom'
            },
            classes: 'mt-3',
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Back',
                    type: 'back'
                },
                {
                    classes: 'shepherd-button-primary',
                    text: 'Next',
                    type: 'next'
                }
            ]
        }
    ]

export const loginStep = 
    {
        id: 'login',
        text: 'Click here to login',
        title: 'Login',
        attachTo: {
            element: '#iconLogin',
            on: 'bottom'
        },
        classes: 'mt-3',
        buttons: [
            {
                classes: 'shepherd-button-secondary',
                text: 'Back',
                type: 'back'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'End',
                type: 'next'
            }
        ]
    }

export const accountStep = 
    {
        id: 'account',
        text: 'Click here to logout / view stats',
        title: 'Your Account',
        attachTo: {
            element: '#barChartDropdown',
            on: 'bottom'
        },
        classes: 'mt-3',
        buttons: [
            {
                classes: 'shepherd-button-secondary',
                text: 'Back',
                type: 'back'
            },
            {
                classes: 'shepherd-button-primary',
                text: 'End',
                type: 'next'
            }
        ]
    }

export const defaultStepOptions = {
    classes: 'custom-shepherd-class', // Custom styling for all steps
    scrollTo: false, // Automatically scroll to the element
    arrow: true, // Show the arrow,
    cancelIcon: {
        enabled: true, // Enable a default close (X) icon for the popup
    },
    popperOptions: {
        modifiers: [
        {
            name: 'arrow',
            options: { element: '.shepherd-arrow' }, // Ensure the arrow renders properly
        },
        ],
    },
};