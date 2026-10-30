import { TokenService } from './token-service';
describe('TokenService', () => {
  const service = new TokenService();
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('persists a session under the shared auth key', () => {
    expect(service.getToken()).toBeNull();
    expect(service.saveToken('session')).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('session');
    expect(service.getToken()).toBe('session');
  });
  it.each(['', '   ', '\n'])('rejects blank tokens without replacing a session', (token) => {
    service.saveToken('existing');
    expect(service.saveToken(token)).toBe(false);
    expect(service.getToken()).toBe('existing');
  });
  it('reports storage write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });
    expect(service.saveToken('session')).toBe(false);
  });
});
