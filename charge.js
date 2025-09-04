// /api/charge.js

// Initialize the Omise client with the secret key from environment variables
const omise = require('omise')({
    'secretKey': process.env.OMISE_SECRET_KEY,
    'omiseVersion': '2019-05-29'
});

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { token, source, amount, currency, items } = req.body;

        // Basic validation
       if ((!token && !source) || !amount || !currency) {
            return res.status(400).json({ message: 'Missing required fields: (token or source), amount, or currency.' });
        }

        // Create a charge with Omise
        const charge = await omise.charges.create({
            amount: amount, // e.g., 100000 for 1000.00 THB
            currency: currency, // e.g., 'thb'
            card: token, // The token from a card payment
            source: source, // The source from QR/Mobile Banking
            description: 'Order from Ginger Bros Website',
            metadata: {
                cart: JSON.stringify(items)
            }
        });

        // Respond with the charge result
        res.status(200).json(charge);

    } catch (error) {
        console.error('Omise charge error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during payment processing.' });
    }
}