import { SessionSerializer } from './session.serializer';

describe('SessionSerializer', () => {
  it('should be defined', () => {
    const serializer = new SessionSerializer();
    expect(serializer).toBeDefined();
  });

  it('should serialize user', () => {
    const sub = '123';
    const serializer = new SessionSerializer();
    const user = { sub };
    const cb = (err, user) => {
      expect(err).toBe(null);
      expect(user.sub).toBe(sub);
    };
    serializer.serializeUser(user, cb);
  });

  it('should deserialize user', () => {
    const sub = '123';
    const serializer = new SessionSerializer();
    const payload = { sub };
    const cb = (err, payload) => {
      expect(err).toBe(null);
      expect(payload.sub).toBe(sub);
    };
    serializer.deserializeUser(payload, cb);
  });
});
