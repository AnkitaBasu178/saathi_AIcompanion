const helplines = require('../emergency/helplines');

// ── Multilingual Fallback Responses ───────────────────────────────
// Used when LLM is unavailable or pipeline throws an error.
// Each category has responses in all 4 supported languages.

const FALLBACKS = {
    'en-IN': {
        general: 'I\'m really glad you reached out. I\'m here for you, and whatever you\'re going through, your feelings are completely valid.\n\nPlease know you can always call Women Helpline 181 whenever you need to talk to someone.',
        red_risk: 'I hear you, and I want you to know you\'re not alone right now. Your safety is what matters most.\n\nPlease try to move to a safe location if you can. When you\'re ready, you can call 100 (Police) or 181 (Women Helpline) — they are available 24/7.\n\nI\'m right here with you.',
        health: 'I\'m glad you\'re reaching out about this — taking care of your health is so important, and asking questions is a great first step.\n\nA qualified medical professional can give you the best guidance. If it feels like an emergency, please call 108.\n\nI\'m here if you\'d like to talk more.',
        harassment: 'I\'m so sorry you\'re going through this. What you\'re experiencing is not okay, and it is absolutely not your fault.\n\nWhen you feel safe, try to document what happened. You can call 181 (Women Helpline) or 100 (Police) whenever you\'re ready.\n\nYou don\'t have to face this alone.',
        domestic_violence: 'I\'m so sorry you\'re going through this. You don\'t deserve this, and none of this is your fault.\n\nYour safety matters above everything. If you\'re in immediate danger, please call 100 (Police). For support, 181 (Women Helpline) is available 24/7.\n\nI\'m here whenever you need someone.',
        mental_distress: 'I\'m really glad you shared this with me. What you\'re feeling is real and valid, and it takes strength to reach out.\n\nYou are not alone. The iCall helpline at 9152987821 has trained counsellors (8 AM-10 PM).\n\nRemember — asking for help is courage, not weakness.',
        relationship_issues: 'Thank you for opening up about this. Relationships can be really complicated, and your feelings are completely valid.\n\nSpeaking with a professional counsellor could help. I\'m here if you\'d like to talk more.',
        education: 'That\'s a wonderful question! Understanding your body and your rights is empowering.\n\nLet me share what I know to help you understand this topic better.',
    },
    'hi-IN': {
        general: 'मैं बहुत खुश हूँ कि आपने संपर्क किया। मैं आपके लिए यहाँ हूँ, और आप जो भी महसूस कर रही हैं, वो पूरी तरह से सही है।\n\nआप कभी भी महिला हेल्पलाइन 181 पर कॉल कर सकती हैं।',
        red_risk: 'मैं आपकी बात सुन रही हूँ। आप अकेली नहीं हैं। अभी आपकी सुरक्षा सबसे ज़रूरी है।\n\nकृपया सुरक्षित जगह जाने की कोशिश करें। आप 100 (पुलिस) या 181 (महिला हेल्पलाइन) पर कॉल कर सकती हैं — ये 24/7 उपलब्ध हैं।\n\nमैं आपके साथ हूँ।',
        health: 'अच्छा किया कि आपने यह पूछा — अपने स्वास्थ्य का ध्यान रखना बहुत ज़रूरी है।\n\nकोई भी योग्य डॉक्टर आपको सही मार्गदर्शन दे सकते हैं। इमरजेंसी में 108 पर कॉल करें।\n\nमैं यहाँ हूँ अगर आप और बात करना चाहें।',
        harassment: 'मुझे बहुत दुख है कि आप इससे गुज़र रही हैं। यह बिल्कुल ठीक नहीं है, और इसमें आपकी कोई गलती नहीं है।\n\nजब आप सुरक्षित महसूस करें, तो जो हुआ उसे लिख लें। आप 181 या 100 पर कॉल कर सकती हैं।\n\nआपको अकेले नहीं लड़ना है।',
        domestic_violence: 'मुझे बहुत दुख है। आप यह deserve नहीं करतीं, और इसमें आपकी कोई गलती नहीं है।\n\nआपकी सुरक्षा सबसे पहले है। खतरे में 100 (पुलिस) पर कॉल करें। सहायता के लिए 181 पर कॉल करें।\n\nमैं आपके साथ हूँ।',
        mental_distress: 'मुझे खुशी है कि आपने यह साझा किया। आप जो महसूस कर रही हैं वो बिल्कुल सही है।\n\nआप अकेली नहीं हैं। iCall हेल्पलाइन 9152987821 पर सुबह 8 से रात 10 बजे तक काउंसलर उपलब्ध हैं।\n\nमदद माँगना हिम्मत है, कमज़ोरी नहीं।',
        relationship_issues: 'शुक्रिया कि आपने यह बताया। रिश्ते कभी-कभी बहुत मुश्किल होते हैं, और आपकी भावनाएँ बिल्कुल सही हैं।\n\nएक काउंसलर से बात करना मददगार हो सकता है।',
        education: 'बहुत अच्छा सवाल! अपने शरीर और अधिकारों को समझना बहुत ज़रूरी है।\n\nचलिए इस विषय को बेहतर समझते हैं।',
    },
    'te-IN': {
        general: 'మీరు సంప్రదించినందుకు చాలా సంతోషం. నేను మీకోసం ఇక్కడ ఉన్నాను, మీరు ఏమి అనుభవిస్తున్నా, మీ భావాలు పూర్తిగా సరైనవే.\n\nమీరు ఎప్పుడైనా మహిళా హెల్ప్‌లైన్ 181 కు కాల్ చేయవచ్చు.',
        red_risk: 'నేను మీ మాట వింటున్నాను. మీరు ఒంటరిగా లేరు. ఇప్పుడు మీ భద్రత అన్నింటికంటే ముఖ్యం.\n\nదయచేసి సురక్షిత ప్రదేశానికి వెళ్ళడానికి ప్రయత్నించండి. 100 (పోలీసులు) లేదా 181 (మహిళా హెల్ప్‌లైన్) కు కాల్ చేయండి.\n\nనేను మీతో ఉన్నాను.',
        health: 'మీరు ఈ విషయం గురించి అడగడం చాలా మంచిది. మీ ఆరోగ్యం చాలా ముఖ్యం.\n\nఒక వైద్యుడు మీకు సరైన సలహా ఇవ్వగలరు. అత్యవసర పరిస్థితిలో 108 కు కాల్ చేయండి.\n\nమీరు మరింత మాట్లాడాలనుకుంటే నేను ఇక్కడ ఉన్నాను.',
        harassment: 'మీరు ఇలాంటి పరిస్థితిలో ఉన్నందుకు చాలా బాధగా ఉంది. ఇది అస్సలు సరైనది కాదు, ఇది మీ తప్పు కాదు.\n\nమీరు సురక్షితంగా ఉన్నప్పుడు, జరిగింది రాసి ఉంచండి. 181 లేదా 100 కు కాల్ చేయండి.\n\nమీరు ఒంటరిగా ఎదుర్కోవలసిన పని లేదు.',
        domestic_violence: 'మీరు ఇలాంటి పరిస్థితిలో ఉన్నందుకు చాలా బాధగా ఉంది. మీరు దీనికి అర్హులు కాదు, ఇది మీ తప్పు కాదు.\n\nమీ భద్రత అన్నింటికంటే ముఖ్యం. ప్రమాదంలో 100 (పోలీసులు) కు కాల్ చేయండి. సహాయం కోసం 181 కు కాల్ చేయండి.\n\nనేను మీతో ఉన్నాను.',
        mental_distress: 'మీరు ఇది పంచుకున్నందుకు సంతోషం. మీరు అనుభవిస్తున్నది నిజమైనది మరియు సరైనదే.\n\nమీరు ఒంటరిగా లేరు. iCall హెల్ప్‌లైన్ 9152987821 ఉదయం 8 నుండి రాత్రి 10 వరకు అందుబాటులో ఉంది.\n\nసహాయం అడగడం ధైర్యం.',
        relationship_issues: 'మీరు ఇది చెప్పినందుకు ధన్యవాదాలు. సంబంధాలు కొన్నిసార్లు చాలా కష్టంగా ఉంటాయి, మీ భావాలు సరైనవే.\n\nఒక కౌన్సెలర్‌తో మాట్లాడడం సహాయకరంగా ఉంటుంది.',
        education: 'చాలా మంచి ప్రశ్న! మీ శరీరం మరియు హక్కులను అర్థం చేసుకోవడం చాలా ముఖ్యం.\n\nఈ అంశాన్ని బాగా అర్థం చేసుకుందాం.',
    },
    'raj-IN': {
        general: 'मैं घणी खुस हूँ कि थां बात करी। मैं थारे खातर यहाँ हूँ, थां जो भी महसूस कर रह्या हो वो बिल्कुल सही है।\n\nथां कद भी महिला हेल्पलाइन 181 पर कॉल कर सको।',
        red_risk: 'मैं थारी बात सुण रही हूँ। थां अकेला नी हो। अबे थारी सुरक्षा सबसूँ जरूरी है।\n\nकिरपा करने सुरक्षित जगहा जाओ। 100 (पुलिस) या 181 (महिला हेल्पलाइन) पर कॉल करो — ये 24 घंटे उपलब्ध है।\n\nमैं थारे साथ हूँ।',
        health: 'अच्छो कियो कि थां पूछ्यो — अपणी सेहत को ध्यान रखणो घणो जरूरी है।\n\nकोई भी अच्छो डॉक्टर थानै सही राह दिखा सकै। इमरजेंसी में 108 पर कॉल करो।\n\nमैं यहाँ हूँ, और बात करणी हो तो बोलो।',
        harassment: 'म्हानै घणो दुख है कि थां आ सब सह रह्या हो। यो बिल्कुल ठीक कोनी, अर इसमें थारी कोई गलती कोनी।\n\nजद थां सुरक्षित लागो, तो जो हुयो वो लिख लो। 181 या 100 पर कॉल कर सको।\n\nथानै अकेला नी लड़णो है।',
        domestic_violence: 'म्हानै घणो दुख है। थां यो deserve कोनी करो, अर इसमें थारी कोई गलती कोनी।\n\nथारी सुरक्षा सबसूँ पैली है। खतरे में 100 (पुलिस) पर कॉल करो। सहायता खातर 181 पर कॉल करो।\n\nमैं थारे साथ हूँ।',
        mental_distress: 'मैं खुस हूँ कि थां यो बात साझा करी। थां जो महसूस कर रह्या हो वो बिल्कुल सही है।\n\nथां अकेला नी हो। iCall हेल्पलाइन 9152987821 पर सुबे 8 सूँ रात 10 बजे ताईं काउंसलर मिल सकै।\n\nमदद माँगणो हिम्मत है, कमज़ोरी कोनी।',
        relationship_issues: 'शुक्रिया कि थां यो बतायो। रिश्ते कदे-कदे घणा मुश्किल होवै हैं, अर थारी भावनावां बिल्कुल सही है।\n\nएक काउंसलर सूँ बात करणो मददगार हो सकै।',
        education: 'घणो अच्छो सवाल! अपणी देह अर अधिकारां नै समझणो घणो जरूरी है।\n\nआओ इस विषय नै अच्छी तरहां समझां।',
    },
};

// ── Demo Responses (English — translated on-the-fly by LLM) ────────
const DEMO_RESPONSES = {
    'period pain': {
        message: 'I\'m glad you\'re reaching out about this — taking care of your health is so important.\n\nPeriod pain (dysmenorrhea) is very common and usually manageable:\n\n• Apply a warm water bottle or heating pad\n• Gentle exercises like walking or yoga help\n• Stay hydrated and avoid caffeine\n• Over-the-counter pain relievers can help (consult a pharmacist)\n• If pain is severe, please consult a gynecologist\n\nI\'m here if you have more questions.',
        category: 'health',
        risk_level: 'green',
        confidence: 0.9,
    },
    'someone is following me': {
        message: 'I hear you. Being followed is frightening, and you\'re right to take it seriously.\n\nYour safety is most important right now:\n\n• Move to a crowded, well-lit public area immediately\n• Call someone you trust\n• Stay in a safe public space\n\nCall 100 (Police) or 181 (Women Helpline). You don\'t have to handle this alone.',
        category: 'harassment',
        risk_level: 'red',
        confidence: 0.95,
    },
    'i feel unsafe': {
        message: 'Your safety is the absolute priority right now. You\'re not alone.\n\n• Move to a crowded, well-lit area\n• Call someone you trust\n• Call 100 (Police) or 181 (Women Helpline)\n\nYou\'re doing the right thing by reaching out.',
        category: 'general',
        risk_level: 'red',
        confidence: 0.95,
    },
    'i am being harassed': {
        message: 'I\'m so sorry. This is not okay and not your fault.\n\n• Document what happened — dates, times, details\n• Move to a safe space\n• Consider reporting when ready\n\nCall NCW helpline 7827170170. You don\'t have to face this alone.',
        category: 'harassment',
        risk_level: 'yellow',
        confidence: 0.85,
    },
    'my husband beats me': {
        message: 'I\'m so sorry. You don\'t deserve this.\n\n• If in danger, move to a safe room or leave if possible\n• Call 181 (Women Helpline) — available 24/7\n• Reach out to someone you trust\n• Do not confront the abuser — your safety comes first\n\nYou\'re not alone in this.',
        category: 'domestic_violence',
        risk_level: 'red',
        confidence: 0.95,
    },
    'i am 16 and i think i might be pregnant': {
        message: 'I\'m glad you reached out. Feeling uncertain is completely understandable.\n\n• Confirm with a home test or doctor visit\n• Speak with a trusted adult — parent, guardian, or counsellor\n• A healthcare professional can explain your options\n• Your health and wellbeing come first\n\nYou are not alone in this.',
        category: 'health',
        risk_level: 'yellow',
        confidence: 0.9,
    },
};

/**
 * Get a safe fallback response in the user's language.
 * @param {string} message - User message
 * @param {Object} classification - { category, risk_level, confidence }
 * @param {string} language - Language code (e.g., 'hi-IN')
 * @returns {Object} Structured response
 */
function getSafeResponse(message, classification, language) {
    const langCode = language || 'en-IN';
    const risk = classification?.risk_level || 'green';
    const category = classification?.category || 'general';

    const langFallbacks = FALLBACKS[langCode] || FALLBACKS['en-IN'];

    let responseMessage;
    if (risk === 'red') {
        responseMessage = langFallbacks.red_risk;
    } else {
        responseMessage = langFallbacks[category] || langFallbacks.general;
    }

    return {
        message: responseMessage,
        category,
        risk_level: risk,
        confidence: classification?.confidence || 0.5,
        language: langCode,
        steps: [],
        buttons: helplines.getAsButtons(),
        resources: [],
        emergency: risk === 'red' ? { emergency: true } : null,
    };
}

function getDemoResponse(message) {
    const lower = message.toLowerCase().trim();
    if (DEMO_RESPONSES[lower]) return DEMO_RESPONSES[lower];
    for (const [key, response] of Object.entries(DEMO_RESPONSES)) {
        if (lower.includes(key) || key.includes(lower)) return response;
    }
    return null;
}

module.exports = { getSafeResponse, getDemoResponse, FALLBACKS, DEMO_RESPONSES };
