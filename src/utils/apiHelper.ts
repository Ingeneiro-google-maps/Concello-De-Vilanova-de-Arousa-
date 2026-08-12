export async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(`Error de red al conectar con el servidor: ${netErr.message || 'Verifica tu conexión'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html') || text.trim().startsWith('The page')) {
      throw new Error(`El servidor devolvió una página HTML (Error ${res.status}). Asegúrate de configurar las variables de entorno en Vercel (DATABASE_URL) y la ruta API.`);
    }
    throw new Error(`Respuesta no válida del servidor (Estado ${res.status}): ${text.slice(0, 100)}`);
  }

  return await res.json();
}
