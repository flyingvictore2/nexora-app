import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.groq = new Groq({ apiKey: config.get('GROQ_API_KEY', '') });
  }

  async chat(message: string, history: { role: 'user' | 'model'; content: string }[], profileId?: string) {
    // Fetch top-rated content for context
    const catalog = await this.prisma.content.findMany({
      take: 80,
      where: { isPublished: true },
      select: { title: true, type: true, genres: true, releaseYear: true },
      orderBy: { averageRating: 'desc' },
    });

    // Fetch user watch history for personalization
    let watchedTitles: string[] = [];
    if (profileId) {
      const watched = await this.prisma.watchHistory.findMany({
        where: { profileId },
        take: 20,
        orderBy: { watchedAt: 'desc' },
        include: { content: { select: { title: true } } },
      });
      watchedTitles = watched.map((w) => w.content.title);
    }

    const catalogSummary = catalog
      .map((c) => `- ${c.title} (${c.type}, ${c.releaseYear}, géneros: ${(c.genres ?? []).join(', ')})`)
      .join('\n');

    const systemPrompt = `Eres Nex, el asistente de inteligencia artificial de Nexora, una plataforma de streaming.
Tu personalidad es amigable, entusiasta del cine y las series, y siempre útil.

CATÁLOGO DISPONIBLE EN NEXORA:
${catalogSummary || 'Catálogo en actualización.'}

${watchedTitles.length > 0 ? `EL USUARIO HA VISTO RECIENTEMENTE: ${watchedTitles.join(', ')}` : ''}

TUS CAPACIDADES:
1. Recomendar películas y series del catálogo según gustos, estado de ánimo o géneros
2. Ayudar a encontrar contenido ("quiero algo de terror", "una comedia romántica")
3. Responder preguntas sobre películas y series en general
4. Sugerir qué ver según lo que el usuario ha disfrutado antes

REGLAS:
- Responde siempre en español
- Sé conciso pero útil (máximo 3-4 párrafos)
- Cuando recomiendes, menciona títulos concretos del catálogo si están disponibles
- Usa emojis con moderación
- Si el usuario pregunta algo sin relación con entretenimiento, redirige la conversación amablemente`;

    // Convert history (Gemini uses 'model', Groq uses 'assistant')
    const messages: ChatMessage[] = [
      ...history.map((msg) => ({
        role: (msg.role === 'model' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return { reply: completion.choices[0]?.message?.content ?? '' };
  }
}
