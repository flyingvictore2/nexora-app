import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.genAI = new GoogleGenerativeAI(config.get('GEMINI_API_KEY', ''));
  }

  async chat(message: string, history: ChatMessage[], profileId?: string) {
    // Fetch a sample of available content for context
    const content = await this.prisma.content.findMany({
      take: 80,
      where: { isPublished: true },
      select: { title: true, type: true, genres: true, releaseYear: true, description: true },
      orderBy: { averageRating: 'desc' },
    });

    // Fetch user watch history for personalization
    let watchedTitles: string[] = [];
    if (profileId) {
      const history = await this.prisma.watchHistory.findMany({
        where: { profileId },
        take: 20,
        orderBy: { watchedAt: 'desc' },
        include: { content: { select: { title: true, genres: true } } },
      });
      watchedTitles = history.map((h) => h.content.title);
    }

    const catalogSummary = content
      .map((c) => `- ${c.title} (${c.type}, ${c.releaseYear}, géneros: ${c.genres?.join(', ')})`)
      .join('\n');

    const systemPrompt = `Eres Nex, el asistente de inteligencia artificial de Nexora, una plataforma de streaming.
Tu personalidad es amigable, entusiasta del cine y las series, y siempre útil.

CATÁLOGO DISPONIBLE EN NEXORA:
${catalogSummary}

${watchedTitles.length > 0 ? `EL USUARIO HA VISTO RECIENTEMENTE: ${watchedTitles.join(', ')}` : ''}

TUS CAPACIDADES:
1. Recomendar películas y series del catálogo según gustos, estado de ánimo o géneros
2. Ayudar a encontrar contenido específico ("quiero algo de terror", "una comedia romántica")
3. Responder preguntas sobre películas y series en general
4. Dar información sobre géneros, directores, actores
5. Sugerir qué ver según lo que el usuario ha disfrutado antes

REGLAS IMPORTANTES:
- Responde siempre en español
- Sé conciso pero útil (máximo 3-4 párrafos)
- Cuando recomiendes contenido, menciona títulos concretos del catálogo si están disponibles
- Si no tienes algo en el catálogo, dilo y sugiere alternativas similares que sí estén
- Usa emojis con moderación para hacer la conversación más amena
- Si el usuario pregunta algo que no tiene relación con entretenimiento, redirige amablemente la conversación`;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert history to Gemini format
    const geminiHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    return { reply: result.response.text() };
  }
}
