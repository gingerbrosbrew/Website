// /api/create-source.js

const omise = require('omise')({
    'secretKey': process.env.OMISE_SECRET_KEY,
    'omiseVersion': '2019-05-29'
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { type, amount, currency } = req.body;

        if (!type || !amount || !currency) {
            return res.status(400).json({ message: 'Missing required fields: type, amount, or currency.' });
        }

        // Step 1: Create the source using the secret key.
        const source = await omise.sources.create({
            type: type,
            amount: amount,
            currency: currency,
        });

        // Step 2: Immediately create a charge using the new source ID.
        // This makes the payment "active" in the Omise dashboard.
        await omise.charges.create({
            source: source.id,
            amount: source.amount,
            currency: source.currency,
            description: 'Order from Ginger Bros Website (QR Code)',
        });

        // Step 3: Return the source object to the client so it can display the QR code.
        res.status(200).json(source);

    } catch (error) {
        console.error('Omise source/charge creation error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during payment processing.' });
    }
}