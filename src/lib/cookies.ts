const TOKEN_KEY = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function getToken(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(
        new RegExp('(?:^|; )' + TOKEN_KEY + '=([^;]*)'),
    )
    return match ? decodeURIComponent(match[1]) : null
}

export function setToken(token: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Lax; Secure`
}

export function removeToken(): void {
    if (typeof document === 'undefined') return
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`
}
