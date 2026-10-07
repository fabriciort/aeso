import 'server-only'

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly service: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

/** fetch with a timeout and a uniform error type. */
export async function fetchWithTimeout(
  service: string,
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 15000, ...rest } = init
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: { 'User-Agent': 'AESo/0.2 (+https://github.com/fabriciort/aeso)', ...rest.headers },
    })
    if (!res.ok) throw new UpstreamError(`${service} respondeu ${res.status}`, service, res.status)
    return res
  } catch (err) {
    if (err instanceof UpstreamError) throw err
    const aborted = err instanceof Error && err.name === 'AbortError'
    throw new UpstreamError(
      aborted ? `${service} não respondeu a tempo` : `Falha ao contatar ${service}`,
      service,
    )
  } finally {
    clearTimeout(timer)
  }
}

export const isMock = () => process.env.AESO_MOCK === '1'
