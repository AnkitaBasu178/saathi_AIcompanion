const supportServices = [
    // ── Hospitals ──
    { name: 'AIIMS Hospital', type: 'hospital', location: { type: 'Point', coordinates: [77.2100, 28.5672] }, phone_number: '011-26588500', operating_hours: '24/7', verified_status: true, address: 'Sri Aurobindo Marg, Ansari Nagar', city: 'Delhi' },
    { name: 'Safdarjung Hospital', type: 'hospital', location: { type: 'Point', coordinates: [77.2090, 28.5685] }, phone_number: '011-26707437', operating_hours: '24/7', verified_status: true, address: 'Ansari Nagar West', city: 'Delhi' },
    { name: 'Ram Manohar Lohia Hospital', type: 'hospital', location: { type: 'Point', coordinates: [77.2050, 28.6263] }, phone_number: '011-23365525', operating_hours: '24/7', verified_status: true, address: 'Baba Kharak Singh Marg', city: 'Delhi' },
    { name: 'GTB Hospital', type: 'hospital', location: { type: 'Point', coordinates: [77.3050, 28.6840] }, phone_number: '011-22586262', operating_hours: '24/7', verified_status: true, address: 'University Road, Dilshad Garden', city: 'Delhi' },
    { name: 'Lok Nayak Hospital', type: 'hospital', location: { type: 'Point', coordinates: [77.2370, 28.6368] }, phone_number: '011-23232400', operating_hours: '24/7', verified_status: true, address: 'Jawaharlal Nehru Marg', city: 'Delhi' },

    // ── Police Stations ──
    { name: 'Connaught Place Police Station', type: 'police_station', location: { type: 'Point', coordinates: [77.2195, 28.6315] }, phone_number: '011-23741000', operating_hours: '24/7', verified_status: true, address: 'Connaught Place', city: 'Delhi' },
    { name: 'Hauz Khas Police Station', type: 'police_station', location: { type: 'Point', coordinates: [77.2035, 28.5494] }, phone_number: '011-26862740', operating_hours: '24/7', verified_status: true, address: 'Hauz Khas', city: 'Delhi' },
    { name: 'Saket Police Station', type: 'police_station', location: { type: 'Point', coordinates: [77.2167, 28.5245] }, phone_number: '011-26524000', operating_hours: '24/7', verified_status: true, address: 'Saket', city: 'Delhi' },
    { name: 'Dwarka Police Station', type: 'police_station', location: { type: 'Point', coordinates: [77.0720, 28.5733] }, phone_number: '011-28033100', operating_hours: '24/7', verified_status: true, address: 'Dwarka Sector 6', city: 'Delhi' },
    { name: 'Rohini Police Station', type: 'police_station', location: { type: 'Point', coordinates: [77.1140, 28.7120] }, phone_number: '011-27051000', operating_hours: '24/7', verified_status: true, address: 'Rohini Sector 3', city: 'Delhi' },

    // ── NGOs ──
    { name: 'Jagori — Women\'s Resource Centre', type: 'ngo', location: { type: 'Point', coordinates: [77.2532, 28.5534] }, phone_number: '011-26692700', operating_hours: '10:00 AM - 6:00 PM', verified_status: true, address: 'C-54 South Extension Part 2', city: 'Delhi' },
    { name: 'Shakti Shalini', type: 'ngo', location: { type: 'Point', coordinates: [77.2300, 28.5600] }, phone_number: '011-24373737', operating_hours: '10:00 AM - 5:00 PM', verified_status: true, address: 'Kalkaji', city: 'Delhi' },
    { name: 'Action India', type: 'ngo', location: { type: 'Point', coordinates: [77.2560, 28.5685] }, phone_number: '011-24624821', operating_hours: '9:00 AM - 5:00 PM', verified_status: true, address: 'Jangpura B', city: 'Delhi' },

    // ── Counsellors ──
    { name: 'Vandrevala Foundation Helpline', type: 'counsellor', location: { type: 'Point', coordinates: [77.2200, 28.6100] }, phone_number: '1860-2662-345', operating_hours: '24/7', verified_status: true, address: 'Phone-based service', city: 'Delhi' },
    { name: 'iCall Psychosocial Helpline', type: 'counsellor', location: { type: 'Point', coordinates: [77.2150, 28.6200] }, phone_number: '9152987821', operating_hours: '8:00 AM - 10:00 PM', verified_status: true, address: 'Phone-based service', city: 'Delhi' },
    { name: 'Snehi Counselling Centre', type: 'counsellor', location: { type: 'Point', coordinates: [77.2300, 28.6139] }, phone_number: '011-65978181', operating_hours: '2:00 PM - 10:00 PM', verified_status: true, address: 'Central Delhi', city: 'Delhi' },

    // ── Shelters ──
    { name: 'Short Stay Home for Women', type: 'shelter', location: { type: 'Point', coordinates: [77.2280, 28.6350] }, phone_number: '011-23378044', operating_hours: '24/7', verified_status: true, address: 'Near New Delhi Railway Station', city: 'Delhi' },
    { name: 'Nirmal Chhaya Complex', type: 'shelter', location: { type: 'Point', coordinates: [77.2320, 28.5700] }, phone_number: '011-26175520', operating_hours: '24/7', verified_status: true, address: 'Delhi Gate', city: 'Delhi' },
];

module.exports = supportServices;
