// /api/create-source.js

// Check for the secret key at startup. This is a critical check.
if (!process.env.OMISE_SECRET_KEY) {
    console.error("FATAL: OMISE_SECRET_KEY environment variable is not set.");
} else {
    console.log("OMISE_SECRET_KEY is present.");
}

const omise = require('omise')({
    'secretKey': process.env.OMISE_SECRET_KEY,
    'omiseVersion': '2019-05-29'
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        console.log(`Received a ${req.method} request, but only POST is allowed.`);
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { type, amount, currency } = req.body;

        console.log('Received request to create source with body:', req.body);

        if (!type || !amount || !currency) {
            console.error('Validation failed: Missing required fields.');
            return res.status(400).json({ message: 'Missing required fields: type, amount, or currency.' });
        }

        // Step 1: Create the source using the secret key.
        console.log('Creating Omise source...');
        const source = await omise.sources.create({
            type: type,
            amount: amount,
            currency: currency,
        });
        console.log('Omise source created successfully:', source.id);

        // Step 2: Immediately create a charge using the new source ID.
        // This makes the payment "active" in the Omise dashboard.
        console.log('Creating Omise charge for source:', source.id);
        await omise.charges.create({
            source: source.id,
            amount: source.amount,
            currency: source.currency,
            description: 'Order from Ginger Bros Website (QR Code)',
        });
        console.log('Omise charge created successfully. Sending source object back to client.');

        // Step 3: Return the source object to the client so it can display the QR code.
        res.status(200).json(source);

    } catch (error) {
        console.error('!!! OMISE API ERROR !!!:', error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        res.status(500).json({ message: error.message || 'An error occurred during payment processing.' });
    }
}