"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const axios_1 = require("axios");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(config, prisma, notifications) {
        this.config = config;
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.stripe = new stripe_1.default(config.get('STRIPE_SECRET_KEY', 'sk_test_placeholder'), {
            apiVersion: '2023-10-16',
        });
    }
    async createCheckoutSession(userId, planId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan || !plan.stripePriceId)
            throw new common_1.BadRequestException('Plan not available for purchase');
        let stripeCustomerId;
        const existingSub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (existingSub?.stripeCustomerId) {
            stripeCustomerId = existingSub.stripeCustomerId;
        }
        else {
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId },
            });
            stripeCustomerId = customer.id;
        }
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const session = await this.stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: plan.stripePriceId, quantity: 1 }],
            success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/subscription/plans`,
            subscription_data: {
                trial_period_days: plan.trialDays > 0 ? plan.trialDays : undefined,
                metadata: { userId, planId },
            },
            metadata: { userId, planId },
        });
        return { sessionId: session.id, url: session.url };
    }
    async createPortalSession(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub?.stripeCustomerId)
            throw new common_1.BadRequestException('No active subscription found');
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const session = await this.stripe.billingPortal.sessions.create({
            customer: sub.stripeCustomerId,
            return_url: `${frontendUrl}/account/subscription`,
        });
        return { url: session.url };
    }
    async handleWebhook(payload, signature) {
        const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', '');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${err.message}`);
        }
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
        }
        return { received: true };
    }
    async handleCheckoutCompleted(session) {
        const { userId, planId } = session.metadata || {};
        if (!userId || !planId)
            return;
        const stripeSub = await this.stripe.subscriptions.retrieve(session.subscription);
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planId,
                status: stripeSub.trial_end ? 'TRIAL' : 'ACTIVE',
                stripeSubscriptionId: stripeSub.id,
                stripeCustomerId: session.customer,
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
                trialStart: stripeSub.trial_start ? new Date(stripeSub.trial_start * 1000) : null,
                trialEnd: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
            },
            update: {
                planId,
                status: stripeSub.trial_end ? 'TRIAL' : 'ACTIVE',
                stripeSubscriptionId: stripeSub.id,
                stripeCustomerId: session.customer,
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
        });
        if (session.amount_total) {
            await this.prisma.payment.create({
                data: {
                    userId,
                    amount: session.amount_total / 100,
                    currency: session.currency?.toUpperCase() || 'USD',
                    status: 'COMPLETED',
                    stripePaymentId: session.payment_intent,
                    description: `Subscription to ${plan?.name}`,
                },
            });
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user && plan) {
            await this.notifications.sendSubscriptionConfirmEmail(user.email, plan.name);
            await this.notifications.createInAppNotification(userId, `¡Plan ${plan.name} activado! ✅`, `Tu suscripción al plan ${plan.name} está activa. Disfruta de todo el contenido.`, 'subscription', { planId, planName: plan.name });
        }
    }
    async handleInvoicePaymentSucceeded(invoice) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (!sub)
            return;
        const stripeSub = await this.stripe.subscriptions.retrieve(invoice.subscription);
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: 'ACTIVE',
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
        });
        await this.prisma.payment.create({
            data: {
                userId: sub.userId,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'COMPLETED',
                stripeInvoiceId: invoice.id,
                description: 'Subscription renewal',
            },
        });
    }
    async handleInvoicePaymentFailed(invoice) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription },
        });
        if (!sub)
            return;
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'EXPIRED' },
        });
        await this.prisma.payment.create({
            data: {
                userId: sub.userId,
                amount: invoice.amount_due / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'FAILED',
                stripeInvoiceId: invoice.id,
                description: 'Subscription payment failed',
            },
        });
        await this.notifications.createInAppNotification(sub.userId, 'Pago fallido ⚠️', 'No hemos podido procesar el pago de tu suscripción. Actualiza tu método de pago.', 'payment');
    }
    async handleSubscriptionUpdated(stripeSub) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSub.id },
        });
        if (!sub)
            return;
        await this.prisma.subscription.update({
            where: { id: sub.id },
            data: {
                status: stripeSub.status === 'active' ? 'ACTIVE' : stripeSub.status === 'trialing' ? 'TRIAL' : 'CANCELLED',
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
        });
    }
    async handleSubscriptionDeleted(stripeSub) {
        const sub = await this.prisma.subscription.findFirst({
            where: { stripeSubscriptionId: stripeSub.id },
        });
        await this.prisma.subscription.updateMany({
            where: { stripeSubscriptionId: stripeSub.id },
            data: { status: 'CANCELLED' },
        });
        if (sub) {
            await this.notifications.createInAppNotification(sub.userId, 'Suscripción cancelada', 'Tu suscripción ha sido cancelada. Puedes renovarla en cualquier momento.', 'subscription');
        }
    }
    async getPaymentHistory(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.payment.count({ where: { userId } }),
        ]);
        return { payments, total, page, totalPages: Math.ceil(total / limit) };
    }
    async verifyStripeSession(sessionId, userId) {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== 'paid' && session.status !== 'complete') {
            throw new common_1.BadRequestException('Payment not completed');
        }
        const paymentIntentId = session.payment_intent;
        if (paymentIntentId) {
            const existing = await this.prisma.payment.findFirst({
                where: { stripePaymentId: paymentIntentId },
            });
            if (existing)
                return { alreadyProcessed: true };
        }
        const { userId: metaUserId, planId } = session.metadata || {};
        const resolvedUserId = metaUserId || userId;
        if (!planId)
            throw new common_1.BadRequestException('Missing plan info in session');
        const stripeSub = session.subscription
            ? await this.stripe.subscriptions.retrieve(session.subscription)
            : null;
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const now = new Date();
        const periodEnd = stripeSub
            ? new Date(stripeSub.current_period_end * 1000)
            : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        await this.prisma.subscription.upsert({
            where: { userId: resolvedUserId },
            create: {
                userId: resolvedUserId,
                planId,
                status: stripeSub?.trial_end ? 'TRIAL' : 'ACTIVE',
                stripeSubscriptionId: stripeSub?.id,
                stripeCustomerId: session.customer,
                currentPeriodStart: stripeSub ? new Date(stripeSub.current_period_start * 1000) : now,
                currentPeriodEnd: periodEnd,
                trialEnd: stripeSub?.trial_end ? new Date(stripeSub.trial_end * 1000) : null,
            },
            update: {
                planId,
                status: stripeSub?.trial_end ? 'TRIAL' : 'ACTIVE',
                stripeSubscriptionId: stripeSub?.id,
                stripeCustomerId: session.customer,
                currentPeriodStart: stripeSub ? new Date(stripeSub.current_period_start * 1000) : now,
                currentPeriodEnd: periodEnd,
            },
        });
        if (session.amount_total) {
            await this.prisma.payment.create({
                data: {
                    userId: resolvedUserId,
                    amount: session.amount_total / 100,
                    currency: session.currency?.toUpperCase() || 'USD',
                    status: 'COMPLETED',
                    stripePaymentId: paymentIntentId || sessionId,
                    description: `Stripe — ${plan.name}`,
                },
            });
        }
        const user = await this.prisma.user.findUnique({ where: { id: resolvedUserId } });
        if (user) {
            await this.notifications.sendSubscriptionConfirmEmail(user.email, plan.name);
            await this.notifications.createInAppNotification(resolvedUserId, `¡Plan ${plan.name} activado! ✅`, `Tu pago fue procesado correctamente. Tu suscripción ${plan.name} está activa.`, 'subscription');
        }
        return { success: true, planName: plan.name };
    }
    get paypalBase() {
        const sandbox = this.config.get('PAYPAL_MODE', 'sandbox') === 'sandbox';
        return sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    }
    async getPayPalAccessToken() {
        const clientId = this.config.get('PAYPAL_CLIENT_ID', '');
        const secret = this.config.get('PAYPAL_CLIENT_SECRET', '');
        if (!clientId || !secret)
            throw new common_1.BadRequestException('PayPal is not configured');
        const res = await axios_1.default.post(`${this.paypalBase}/v1/oauth2/token`, 'grant_type=client_credentials', {
            auth: { username: clientId, password: secret },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.data.access_token;
    }
    async createPayPalOrder(userId, planId) {
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        if (plan.price === 0)
            throw new common_1.BadRequestException('Free plan does not require payment');
        const token = await this.getPayPalAccessToken();
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const res = await axios_1.default.post(`${this.paypalBase}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: plan.price.toFixed(2),
                    },
                    description: `Nexora ${plan.name} — suscripción mensual`,
                    custom_id: `${userId}:${planId}`,
                },
            ],
            application_context: {
                brand_name: 'Nexora',
                landing_page: 'BILLING',
                user_action: 'PAY_NOW',
                return_url: `${frontendUrl}/subscription/success`,
                cancel_url: `${frontendUrl}/subscription/plans`,
            },
        }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        return { orderID: res.data.id };
    }
    async capturePayPalOrder(orderID, userId, planId) {
        const token = await this.getPayPalAccessToken();
        const res = await axios_1.default.post(`${this.paypalBase}/v2/checkout/orders/${orderID}/capture`, {}, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        const capture = res.data;
        if (capture.status !== 'COMPLETED') {
            throw new common_1.BadRequestException('PayPal payment not completed');
        }
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planId,
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
            update: {
                planId,
                status: 'ACTIVE',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
            },
        });
        const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0];
        await this.prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(captureUnit?.amount?.value || plan.price.toString()),
                currency: captureUnit?.amount?.currency_code || 'USD',
                status: 'COMPLETED',
                stripePaymentId: orderID,
                description: `PayPal — Nexora ${plan.name}`,
            },
        });
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.notifications.sendSubscriptionConfirmEmail(user.email, plan.name);
            await this.notifications.createInAppNotification(userId, `¡Plan ${plan.name} activado! ✅`, `Tu pago con PayPal fue procesado. Tu suscripción ${plan.name} está activa.`, 'subscription');
        }
        return { success: true, planName: plan.name };
    }
    async getRevenueStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const [totalRevenue, monthRevenue, yearRevenue, totalPayments] = await Promise.all([
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
                _sum: { amount: true },
            }),
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: startOfYear } },
                _sum: { amount: true },
            }),
            this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
        ]);
        return {
            total: totalRevenue._sum.amount || 0,
            thisMonth: monthRevenue._sum.amount || 0,
            thisYear: yearRevenue._sum.amount || 0,
            totalTransactions: totalPayments,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map