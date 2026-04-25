import { PrismaClient, ContentType, SubscriptionPlan, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Nexora database...\n');

  // ─── Plans ────────────────────────────────────────────────────────────────
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { planType: SubscriptionPlan.FREE },
      create: {
        name: 'Gratis',
        planType: SubscriptionPlan.FREE,
        price: 0,
        currency: 'USD',
        description: 'Acceso básico a contenido seleccionado',
        features: ['Contenido gratuito seleccionado', 'Calidad SD (480p)', '1 perfil', '1 dispositivo'],
        maxProfiles: 1,
        maxDevices: 1,
        videoQuality: 'SD',
        hasDownloads: false,
        trialDays: 0,
        isActive: true,
      },
      update: {},
    }),
    prisma.plan.upsert({
      where: { planType: SubscriptionPlan.PREMIUM },
      create: {
        name: 'Premium',
        planType: SubscriptionPlan.PREMIUM,
        price: 12.99,
        currency: 'USD',
        description: 'Todo el catálogo en alta definición',
        features: [
          'Todo el catálogo completo',
          'Calidad HD (1080p)',
          '4 perfiles',
          '2 dispositivos simultáneos',
          'Sin anuncios',
          'Descarga de contenido',
        ],
        maxProfiles: 4,
        maxDevices: 2,
        videoQuality: 'HD',
        hasDownloads: true,
        trialDays: 7,
        isActive: true,
      },
      update: {},
    }),
    prisma.plan.upsert({
      where: { planType: SubscriptionPlan.VIP },
      create: {
        name: 'VIP',
        planType: SubscriptionPlan.VIP,
        price: 19.99,
        currency: 'USD',
        description: 'La mejor experiencia posible en 4K',
        features: [
          'Todo el catálogo completo',
          'Calidad 4K Ultra HD + HDR',
          '4 perfiles',
          '4 dispositivos simultáneos',
          'Sin anuncios',
          'Descargas ilimitadas',
          'Acceso anticipado a estrenos',
          'Soporte prioritario',
        ],
        maxProfiles: 4,
        maxDevices: 4,
        videoQuality: '4K',
        hasDownloads: true,
        trialDays: 14,
        isActive: true,
      },
      update: {},
    }),
  ]);

  console.log(`✅ ${plans.length} plans seeded`);

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexora.com' },
    create: {
      email: 'admin@nexora.com',
      password: adminPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      profiles: {
        create: {
          name: 'Admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
          isDefault: true,
        },
      },
    },
    update: {},
  });

  // Give admin VIP subscription
  const vipPlan = plans.find((p) => p.planType === 'VIP')!;
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 10);
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    create: {
      userId: admin.id,
      planId: vipPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: end,
    },
    update: {},
  });

  console.log('✅ Admin user created: admin@nexora.com / Admin123!');

  // ─── Demo user ───────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('User123!', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nexora.com' },
    create: {
      email: 'demo@nexora.com',
      password: userPassword,
      role: Role.USER,
      isEmailVerified: true,
      profiles: {
        create: [
          {
            name: 'Demo',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
            isDefault: true,
          },
          {
            name: 'Kids',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kids',
            isKids: true,
          },
        ],
      },
    },
    update: {},
  });

  const premiumPlan = plans.find((p) => p.planType === 'PREMIUM')!;
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    create: {
      userId: demoUser.id,
      planId: premiumPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {},
  });

  console.log('✅ Demo user created: demo@nexora.com / User123!');

  // ─── Content ─────────────────────────────────────────────────────────────
  const movies = [
    {
      title: 'Origen de las Sombras',
      originalTitle: 'Shadow Origin',
      description: 'Un detective descubre que las sombras del mundo esconden secretos ancestrales que podrían cambiar la humanidad para siempre.',
      type: ContentType.MOVIE,
      posterUrl: 'https://picsum.photos/seed/movie1/500/750',
      bannerUrl: 'https://picsum.photos/seed/movie1b/1920/1080',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: 118,
      releaseYear: 2024,
      genres: ['Thriller', 'Misterio', 'Ciencia Ficción'],
      cast: ['Carlos Moreno', 'Ana García', 'Luis Pérez'],
      director: 'Elena Ruiz',
      country: 'España',
      language: 'es',
      maturityRating: 'PG-13',
      isFeatured: true,
      isTrending: true,
      isNew: true,
      isPublished: true,
      requiredPlan: SubscriptionPlan.FREE,
    },
    {
      title: 'El Último Horizonte',
      description: 'Una astronauta perdida en el espacio profundo lucha por regresar a casa antes de que se acabe el oxígeno.',
      type: ContentType.MOVIE,
      posterUrl: 'https://picsum.photos/seed/movie2/500/750',
      bannerUrl: 'https://picsum.photos/seed/movie2b/1920/1080',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 134,
      releaseYear: 2024,
      genres: ['Ciencia Ficción', 'Drama', 'Acción'],
      cast: ['María López', 'Pedro Sánchez'],
      director: 'Roberto García',
      country: 'México',
      language: 'es',
      maturityRating: 'PG',
      isFeatured: true,
      isTrending: false,
      isNew: true,
      isPublished: true,
      requiredPlan: SubscriptionPlan.PREMIUM,
    },
    {
      title: 'Noche Eterna',
      description: 'En una ciudad donde nunca amanece, una joven descubre que es la única capaz de restaurar la luz.',
      type: ContentType.MOVIE,
      posterUrl: 'https://picsum.photos/seed/movie3/500/750',
      bannerUrl: 'https://picsum.photos/seed/movie3b/1920/1080',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      duration: 105,
      releaseYear: 2023,
      genres: ['Fantasía', 'Aventura', 'Animación'],
      cast: ['Sofia Martínez', 'Juan Rodríguez'],
      director: 'Carmen Jiménez',
      country: 'Argentina',
      language: 'es',
      maturityRating: 'PG',
      isFeatured: false,
      isTrending: true,
      isNew: false,
      isPublished: true,
      requiredPlan: SubscriptionPlan.FREE,
    },
    {
      title: 'Código Rojo',
      description: 'Un hacker élite es contratado por el gobierno para detener un ataque cibernético que podría colapsar la economía mundial.',
      type: ContentType.MOVIE,
      posterUrl: 'https://picsum.photos/seed/movie4/500/750',
      bannerUrl: 'https://picsum.photos/seed/movie4b/1920/1080',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      duration: 122,
      releaseYear: 2024,
      genres: ['Acción', 'Tecnología', 'Thriller'],
      cast: ['Alejandro Vega', 'Paula Herrera'],
      director: 'Miguel Torres',
      country: 'Colombia',
      language: 'es',
      maturityRating: 'R',
      isFeatured: false,
      isTrending: true,
      isNew: true,
      isPublished: true,
      requiredPlan: SubscriptionPlan.PREMIUM,
    },
  ];

  const series = [
    {
      title: 'Los Olvidados',
      description: 'Un grupo de supervivientes construye una nueva civilización tras el colapso del mundo moderno. Drama épico de 3 temporadas.',
      type: ContentType.SERIES,
      posterUrl: 'https://picsum.photos/seed/series1/500/750',
      bannerUrl: 'https://picsum.photos/seed/series1b/1920/1080',
      releaseYear: 2023,
      genres: ['Drama', 'Post-apocalíptico', 'Supervivencia'],
      cast: ['Marcos Delgado', 'Valentina Cruz', 'Diego Morales'],
      director: 'Isabel Santos',
      country: 'España',
      language: 'es',
      maturityRating: 'TV-MA',
      isFeatured: true,
      isTrending: true,
      isNew: false,
      isPublished: true,
      requiredPlan: SubscriptionPlan.PREMIUM,
    },
    {
      title: 'Nexo Criminal',
      description: 'Una detective incorruptible infiltra el cartel más poderoso de América Latina. Basada en hechos reales.',
      type: ContentType.SERIES,
      posterUrl: 'https://picsum.photos/seed/series2/500/750',
      bannerUrl: 'https://picsum.photos/seed/series2b/1920/1080',
      releaseYear: 2024,
      genres: ['Crime', 'Drama', 'Thriller'],
      cast: ['Adriana Fuentes', 'Ramón Castillo'],
      director: 'Fernando Medina',
      country: 'México',
      language: 'es',
      maturityRating: 'TV-MA',
      isFeatured: false,
      isTrending: true,
      isNew: true,
      isPublished: true,
      requiredPlan: SubscriptionPlan.FREE,
    },
  ];

  const animes = [
    {
      title: 'Kage no Ken',
      originalTitle: 'Sombra del Filo',
      description: 'Un guerrero samurái que puede controlar las sombras busca vengar a su clan destruido por fuerzas oscuras.',
      type: ContentType.ANIME,
      posterUrl: 'https://picsum.photos/seed/anime1/500/750',
      bannerUrl: 'https://picsum.photos/seed/anime1b/1920/1080',
      releaseYear: 2024,
      genres: ['Anime', 'Acción', 'Samurai', 'Fantasía'],
      cast: ['Kenji Yamada', 'Sakura Tanaka'],
      director: 'Hiroshi Nakamura',
      studio: 'Shadow Studio',
      country: 'Japón',
      language: 'ja',
      maturityRating: 'TV-14',
      isFeatured: true,
      isTrending: true,
      isNew: true,
      isPublished: true,
      requiredPlan: SubscriptionPlan.FREE,
    },
    {
      title: 'Nexora Chronicles',
      description: 'En un futuro donde la tecnología y la magia coexisten, un joven programador descubre que sus líneas de código tienen poder mágico.',
      type: ContentType.ANIME,
      posterUrl: 'https://picsum.photos/seed/anime2/500/750',
      bannerUrl: 'https://picsum.photos/seed/anime2b/1920/1080',
      releaseYear: 2023,
      genres: ['Anime', 'Ciencia Ficción', 'Magia', 'Aventura'],
      cast: ['Yuki Sato', 'Hana Kimura'],
      director: 'Takeshi Honda',
      studio: 'Digital Magic Animation',
      country: 'Japón',
      language: 'ja',
      maturityRating: 'TV-PG',
      isFeatured: false,
      isTrending: true,
      isNew: false,
      isPublished: true,
      requiredPlan: SubscriptionPlan.PREMIUM,
    },
  ];

  // Create content
  const createdContent: any[] = [];
  for (const m of [...movies, ...series, ...animes]) {
    const existing = await prisma.content.findFirst({ where: { title: m.title } });
    if (!existing) {
      const c = await prisma.content.create({ data: m as any });
      createdContent.push(c);
    } else {
      createdContent.push(existing);
    }
  }

  console.log(`✅ ${createdContent.length} content items seeded`);

  // Add subtitles to first movie
  if (createdContent[0]) {
    await prisma.subtitle.upsert({
      where: { id: 'sub_es_movie1' },
      create: {
        id: 'sub_es_movie1',
        contentId: createdContent[0].id,
        language: 'es',
        label: 'Español',
        url: 'https://example.com/subs/movie1_es.vtt',
      },
      update: {},
    }).catch(() => {});
  }

  // Add seasons and episodes to series
  const seriesContent = createdContent.filter((c) => c.type === 'SERIES');
  const animeContent = createdContent.filter((c) => c.type === 'ANIME');

  for (const s of [...seriesContent, ...animeContent]) {
    const existingSeason = await prisma.season.findFirst({ where: { contentId: s.id, number: 1 } });
    if (!existingSeason) {
      const season = await prisma.season.create({
        data: {
          contentId: s.id,
          number: 1,
          title: 'Temporada 1',
          description: 'La primera temporada',
          releaseYear: s.releaseYear,
        },
      });

      // Create 3 episodes per season
      const episodeVideos = [
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      ];

      for (let i = 1; i <= 3; i++) {
        await prisma.episode.create({
          data: {
            seasonId: season.id,
            number: i,
            title: `Episodio ${i}`,
            description: `El episodio ${i} de la primera temporada.`,
            thumbnailUrl: `https://picsum.photos/seed/ep${i}/400/225`,
            videoUrl: episodeVideos[i - 1],
            duration: 42 + i * 3,
            isPublished: true,
            introStart: 30,
            introEnd: 90,
          },
        });
      }
    }
  }

  console.log('✅ Seasons and episodes seeded');
  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@nexora.com / Admin123!');
  console.log('   User:  demo@nexora.com  / User123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
