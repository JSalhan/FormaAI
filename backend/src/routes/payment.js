import express from 'express';
import Stripe from 'stripe';
import { authenticateJWT } from '../middleware/auth.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_API_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';

const getPriceId = (plan) => {
    if (plan === 'monthly') return process.env.STRIPE_MONTHLY_PLAN_ID;
    if (plan === 'yearly') return process.env.STRIPE_YEARLY_PLAN_ID;
    return null;
}

/**
 * @route   POST /api/payment/subscribe
 * @desc    Create a Stripe Checkout session for a subscription
 * @access  Private
 */
router.post('/subscribe', authenticateJWT, async (req, res) => {
    const { plan, success_url, cancel_url } = req.body;
    const priceId = getPriceId(plan);

    if (!priceId) {
        return res.status(400).json({ message: "Invalid plan specified." });
    }
    if (!success_url || !cancel_url) {
        return res.status(400).json({ message: "Success and cancel URLs are required."});
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                userId: user.id,
                plan: plan
            },
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe session creation error:", error);
        res.status(500).json({ message: "Error creating checkout session." });
    }
});


/**
 * @route   POST /api/payment/create-portal-session
 * @desc    Create a Stripe Customer Portal session to manage a subscription.
 * @access  Private
 */
router.post('/create-portal-session', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user.role !== 'pro' || !user.stripeCustomerId) {
            return res.status(403).json({ message: "User is not a pro subscriber or has no Stripe customer ID." });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${clientURL}/dashboard/profile`,
        });

        res.json({ url: portalSession.url });
    } catch (error) {
        console.error('Stripe Customer Portal Error:', error);
        res.status(500).json({ message: 'Error creating customer portal session.' });
    }
});


/**
 * @desc    Handles incoming webhooks from Stripe to update subscription status.
 */
export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { userId, plan } = session.metadata;

            const subscription = await stripe.subscriptions.retrieve(session.subscription);

            await User.findByIdAndUpdate(userId, {
                stripeCustomerId: session.customer,
                role: 'pro',
                subscriptionPlan: {
                    planId: plan,
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                },
            });
            console.log(`User ${userId} subscribed to ${plan} plan.`);
            break;
        }

        case 'customer.subscription.deleted':
        case 'invoice.payment_failed': {
            const subscription = event.data.object;
            const status = event.type === 'invoice.payment_failed' ? 'payment_failed' : 'canceled';
            
            const user = await User.findOne({ stripeCustomerId: subscription.customer });
            if (user) {
                user.role = 'free';
                user.subscriptionPlan.status = status;
                await user.save();
                console.log(`User ${user.id} subscription status updated to ${status}. Role set to 'free'.`);
            }
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};


export default router;