import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WatchPartyService } from './watch-party.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/watch-party' })
export class WatchPartyGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Map socketId -> { userId, partyId }
  private connections = new Map<string, { userId: string; partyId: string }>();

  constructor(
    private service: WatchPartyService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private getUserId(client: Socket): string | null {
    try {
      const token = client.handshake.auth?.token ?? client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return null;
      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
      return payload.sub;
    } catch { return null; }
  }

  @SubscribeMessage('join-party')
  async handleJoin(@MessageBody() data: { partyId: string }, @ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    if (!userId) { client.emit('error', 'No autorizado'); return; }

    client.join(data.partyId);
    this.connections.set(client.id, { userId, partyId: data.partyId });

    const party = await this.service.getParty(data.partyId);
    client.emit('party-state', party);
    this.server.to(data.partyId).emit('member-joined', { userId });
  }

  @SubscribeMessage('playback-update')
  async handlePlayback(
    @MessageBody() data: { partyId: string; position: number; isPlaying: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    try {
      await this.service.updatePlayback(data.partyId, userId, data.position, data.isPlaying);
      // Broadcast to all OTHER members
      client.to(data.partyId).emit('playback-sync', {
        position: data.position,
        isPlaying: data.isPlaying,
      });
    } catch {}
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: { partyId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);
    if (!userId || !data.message?.trim()) return;

    const msg = await this.service.addMessage(data.partyId, userId, data.message.trim());
    this.server.to(data.partyId).emit('new-message', msg);
  }

  @SubscribeMessage('leave-party')
  handleLeave(@MessageBody() data: { partyId: string }, @ConnectedSocket() client: Socket) {
    const userId = this.getUserId(client);
    client.leave(data.partyId);
    this.connections.delete(client.id);
    this.server.to(data.partyId).emit('member-left', { userId });
  }

  handleDisconnect(client: Socket) {
    const conn = this.connections.get(client.id);
    if (conn) {
      this.server.to(conn.partyId).emit('member-left', { userId: conn.userId });
      this.connections.delete(client.id);
    }
  }
}
