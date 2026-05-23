export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

const isProduction = import.meta.env.PROD;

export function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  let cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  if (isProduction) {
    cookieString += ';Secure';
  }
  document.cookie = cookieString;
}

export function removeCookie(name: string): void {
  let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  if (isProduction) {
    cookieString += ';Secure';
  }
  document.cookie = cookieString;
}

export function setCookieJSON<T>(name: string, value: T, days: number = 7): void {
  setCookie(name, JSON.stringify(value), days);
}

export function getCookieJSON<T>(name: string): T | null {
  const value = getCookie(name);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}