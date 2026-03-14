const HELPLINES = Object.freeze([
    { name: 'Women Helpline', number: '181', priority: 1, description: 'National Commission for Women emergency helpline' },
    { name: 'Police', number: '100', priority: 2, description: 'Emergency police services' },
    { name: 'Ambulance', number: '108', priority: 3, description: 'Emergency medical services' },
    { name: 'NCW WhatsApp', number: '7827170170', priority: 4, description: 'National Commission for Women direct line' },
]);

function getAll() {
    return HELPLINES;
}

function getAsButtons() {
    return HELPLINES.map((h) => ({
        label: `Call ${h.name} (${h.number})`,
        action: 'call',
        phone: h.number,
        number: h.number,
    }));
}

function getByName(name) {
    return HELPLINES.find((h) => h.name.toLowerCase().includes(name.toLowerCase()));
}

function getPrimary() {
    return HELPLINES[0]; // Women Helpline 181
}

module.exports = { getAll, getAsButtons, getByName, getPrimary, HELPLINES };
