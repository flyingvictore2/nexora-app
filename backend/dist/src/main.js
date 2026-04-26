"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const compression = require("compression");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
BigInt.prototype.toJSON = function () { return Number(this); };
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
        logger: ['error', 'warn', 'log', 'debug'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 4000);
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(compression());
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Profile-Id'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const reflector = app.get(core_1.Reflector);
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(reflector), new transform_interceptor_1.TransformInterceptor(), new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Nexora API')
        .setDescription('Nexora Streaming Platform — Full REST API Documentation')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management')
        .addTag('Profiles', 'Profile management')
        .addTag('Content', 'Movies, series, anime')
        .addTag('Seasons', 'Season management')
        .addTag('Episodes', 'Episode management')
        .addTag('Subscriptions', 'Subscription plans')
        .addTag('Payments', 'Payment processing')
        .addTag('Watch History', 'Viewing history')
        .addTag('Ratings', 'Content ratings')
        .addTag('Favorites', 'Watchlist')
        .addTag('Recommendations', 'Content recommendations')
        .addTag('Admin', 'Admin panel endpoints')
        .addTag('Analytics', 'Platform analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(port);
    console.log(`\n🎬 Nexora Backend running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map