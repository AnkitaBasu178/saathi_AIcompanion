const ACTION_TREES = {
    domestic_violence: {
        red: {
            steps: [
                'Ensure immediate physical safety — move to a safe room or leave the premises if possible',
                'Call Women Helpline 181 immediately',
                'Contact your most trusted person right now',
                'Do NOT confront the abuser — your safety comes first',
                'If possible, go to the nearest police station or safe space',
            ],
            buttons: [
                { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
                { label: 'Call Police (100)', action: 'call', phone: '100', number: '100' },
            ],
        },
        yellow: {
            steps: [
                'Document what is happening — write down dates, times, and details securely',
                'Identify a trusted person you can confide in',
                'Keep important documents (ID, bank details) in an accessible safe place',
                'Know your nearest shelter or safe space',
                'Contact an NGO specializing in domestic violence for guidance',
            ],
            buttons: [
                { label: 'Find Nearby NGO', action: 'search_support', type: 'ngo' },
                { label: 'Find Shelter', action: 'search_support', type: 'shelter' },
            ],
        },
        green: {
            steps: [
                'Learn about your legal rights under the Protection of Women from Domestic Violence Act, 2005',
                'Understand the signs and patterns of domestic violence',
                'Save emergency helpline numbers (181, 100) in your phone',
            ],
            buttons: [],
        },
    },

    harassment: {
        red: {
            steps: [
                'Move to a crowded, safe area immediately',
                'Call Police (100) or Women Helpline (181) right now',
                'Alert people around you — shout for help if needed',
                'Try to remember identifying details (appearance, vehicle, location)',
                'Do not engage with the harasser — focus on getting to safety',
            ],
            buttons: [
                { label: 'Call Police (100)', action: 'call', phone: '100', number: '100' },
                { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
            ],
        },
        yellow: {
            steps: [
                'Move to a safe, public area with other people around',
                'Document what is happening — note time, place, and details',
                'Inform a friend or family member about your situation and location',
                'If it is ongoing, consider filing a complaint at the nearest police station',
                'Contact NCW helpline for guidance: 7827170170',
            ],
            buttons: [
                { label: 'Call NCW (7827170170)', action: 'call', phone: '7827170170', number: '7827170170' },
                { label: 'Find Nearby Police Station', action: 'search_support', type: 'police_station' },
            ],
        },
        green: {
            steps: [
                'Know your rights — sexual harassment is a punishable offence under IPC sections 354 and 509',
                'Learn about the Vishakha Guidelines for workplace harassment',
                'Save emergency numbers in your phone for quick access',
            ],
            buttons: [],
        },
    },

    mental_distress: {
        red: {
            steps: [
                'You are not alone — please reach out to someone you trust right now',
                'Call iCall helpline: 9152987821 for immediate mental health support',
                'If you are having thoughts of self-harm, please call 112 (emergency)',
                'Move to a safe space and stay with someone you trust',
                'Remember: this moment will pass, and professional help is available',
            ],
            buttons: [
                { label: 'Call iCall (9152987821)', action: 'call', phone: '9152987821', number: '9152987821' },
                { label: 'Call Emergency (112)', action: 'call', phone: '112', number: '112' },
            ],
        },
        yellow: {
            steps: [
                'Take a moment to breathe deeply — it is okay to feel what you are feeling',
                'Talk to someone you trust about how you are feeling',
                'Consider reaching out to a professional counsellor',
                'Practice grounding: name 5 things you can see, 4 you can touch, 3 you can hear',
                'Take care of your basic needs today — eat, hydrate, rest',
            ],
            buttons: [
                { label: 'Find Counsellor', action: 'search_support', type: 'counsellor' },
            ],
        },
        green: {
            steps: [
                'Take care of your mental wellbeing with regular self-care activities',
                'Stay connected with people who make you feel supported',
                'Consider journaling or mindfulness exercises as daily practice',
            ],
            buttons: [],
        },
    },

    health: {
        red: {
            steps: [
                'If you are experiencing severe symptoms, call Ambulance (108) immediately',
                'Go to the nearest hospital emergency department',
                'Do not take any medication without medical advice',
                'If someone is with you, ask them to help coordinate',
                'Keep track of symptoms — timing, severity, and any changes',
            ],
            buttons: [
                { label: 'Call Ambulance (108)', action: 'call', phone: '108', number: '108' },
                { label: 'Find Nearest Hospital', action: 'search_support', type: 'hospital' },
            ],
        },
        yellow: {
            steps: [
                'Schedule an appointment with a doctor as soon as possible',
                'Keep a record of your symptoms — what, when, and how severe',
                'Do not self-medicate — wait for professional advice',
                'Rest and stay hydrated while you wait for your appointment',
                'If symptoms worsen, go to the nearest hospital',
            ],
            buttons: [
                { label: 'Find Nearest Hospital', action: 'search_support', type: 'hospital' },
            ],
        },
        green: {
            steps: [
                'Consult a qualified healthcare professional for personalized advice',
                'Maintain regular health check-ups',
                'Follow a balanced diet and stay physically active',
            ],
            buttons: [],
        },
    },

    relationship_issues: {
        red: {
            steps: [
                'If you feel physically threatened, prioritize your safety and move to a safe place',
                'Call Women Helpline (181) if the situation involves any form of abuse',
                'Reach out to a trusted friend or family member immediately',
                'Do not be alone with someone who makes you feel unsafe',
                'Consider speaking with a professional counsellor',
            ],
            buttons: [
                { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
                { label: 'Find Counsellor', action: 'search_support', type: 'counsellor' },
            ],
        },
        yellow: {
            steps: [
                'Talk to a trusted friend or family member about what you are going through',
                'Consider couple or individual counselling for professional guidance',
                'Set clear personal boundaries and communicate them',
                'Focus on your emotional and physical wellbeing',
                'Know that it is okay to prioritize yourself',
            ],
            buttons: [
                { label: 'Find Counsellor', action: 'search_support', type: 'counsellor' },
            ],
        },
        green: {
            steps: [
                'Healthy relationships are built on mutual respect, trust, and communication',
                'Consider reading about healthy relationship patterns',
                'Professional counselling can help with relationship growth',
            ],
            buttons: [],
        },
    },

    education: {
        red: { steps: ['Call Women Helpline 181 for immediate assistance'], buttons: [{ label: 'Call 181', action: 'call', phone: '181', number: '181' }] },
        yellow: { steps: ['Consider speaking with a professional for more guidance'], buttons: [] },
        green: { steps: ['Here is the information you requested. Feel free to ask more questions.'], buttons: [] },
    },

    general: {
        red: {
            steps: [
                'Your safety is the top priority right now',
                'Call Women Helpline (181) or Police (100) immediately',
                'Move to a safe location',
                'Alert someone you trust about your situation',
            ],
            buttons: [
                { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
                { label: 'Call Police (100)', action: 'call', phone: '100', number: '100' },
            ],
        },
        yellow: {
            steps: [
                'Talk to someone you trust about what you are experiencing',
                'Consider reaching out to a professional for help',
                'Know that support is available — you are not alone',
            ],
            buttons: [
                { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
            ],
        },
        green: {
            steps: [
                'I am here to help. Feel free to ask any questions.',
            ],
            buttons: [],
        },
    },
};

function generatePlan(category, riskLevel) {
    const tree = ACTION_TREES[category] || ACTION_TREES.general;
    const plan = tree[riskLevel] || tree.green;

    return {
        steps: [...plan.steps],
        buttons: [...plan.buttons],
    };
}

module.exports = { generatePlan, ACTION_TREES };
